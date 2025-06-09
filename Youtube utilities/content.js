let videoId;
let dislikeCount;
let dislikeBtn;
let prevLink;
let handleNavigateIntervalId;
let handleClickIntervalId;

chrome.storage.local.set({ adSkipperActive: false, showDislikesActive: false });

function toggleSkipBehaviour(condition) {
    if (condition)
        window.addEventListener("keydown", skip);
    else window.removeEventListener("keydown", skip);
}

function skip(e) {

    let video = document.querySelector(".ad-showing .html5-main-video");

    if (video && e.key === 'q') {

        const skipBtnList = document.querySelectorAll(".ytp-skip-ad-button, .ytp-ad-skip-button-modern");

        if (skipBtnList.length)

            skipBtnList.forEach(element => element.click());

        if (video) {
            try {
                video.currentTime = video.duration;
            }
            catch (e) { }
        }

    }
}

function toggleDislikeBehaviour(condition) {

    prevLink = window.location.href;

    if (condition) {
        handleNavigate(1);
        navigation.addEventListener("navigate", navigationEventHandlerFunctionMain);
    }
    else {
        let dislikeDiv = document.querySelector("#dislikeDiv");
        if (dislikeDiv)
            dislikeDiv.remove();
        dislikeBtn = document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this']");

        if (dislikeBtn)
            dislikeBtn.style.gap = "0px";

        clearInterval(handleNavigateIntervalId);
        clearInterval(handleClickIntervalId);

        navigation.removeEventListener("navigate", navigationEventHandlerFunctionMain);
        document.removeEventListener("click", updateCount);
    }

}

function navigationEventHandlerFunctionMain() {

    let wasMiniplayerActive = document.querySelector("ytd-miniplayer").hasAttribute("active");
    // document.querySelector("ytd-miniplayer").active not working and giving undefined everytime even though working fine in browser.

    setTimeout(() => {
        let currLink = window.location.href;
        if (prevLink != currLink) {
            if
                (
                (
                    wasMiniplayerActive &&
                    currLink.match(/[?&]v=([^&]+)/) &&
                    currLink.match(/[?&]v=([^&]+)/)[1] ===
                    document.querySelector("ytd-watch-flexy").getAttribute("video-id")
                )
            )
                handleNavigate(1);
            else handleNavigate();
            prevLink = currLink;
        }
    }, 0);
}

async function handleNavigate() {
    videoId = window.location.href.match(/[?&]v=([^&]+)/);
    if (videoId) {
        let URL = `https://returnyoutubedislikeapi.com/votes?videoId=${videoId[1]}`;
        dislikeCount = (await (await fetch(URL)).json()).dislikes;
        if (arguments.length) {
            handleNavigateIntervalId = setInterval(() => {
                if (document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this']")) {
                    dislikeBtn = document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this']");
                    clearInterval(handleNavigateIntervalId);
                    insertDislikes();
                }
            }, 0);
        }
        else {
            dislikeBtn = document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this']");
            handleNavigateIntervalId = setInterval(() => {
                if (dislikeBtn != document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this']")) {
                    dislikeBtn = document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this']");
                    clearInterval(handleNavigateIntervalId);
                    insertDislikes();
                }
            }, 0);
        }
    }
    videoId = window.location.href.match("(?<=shorts/)[^/?]+");
    if (videoId) {
        let URL = `https://returnyoutubedislikeapi.com/votes?videoId=${videoId[0]}`;
    }
}

function formatDislikeBtn() {
    dislikeBtn.style.width = "auto";
    dislikeBtn.style.gap = "4px";
}

function formatDislikeCount(count) {

    if (count <= 999)
        return count;

    if (count > 999 && count <= 9999)
        return Math.floor(count / 100) / 10 + "K";

    if (count > 9999 && count <= 999999)
        return Math.floor(count / 1000) + "K";

    if (count > 999999 && count <= 9999999)
        return Math.floor(count / 100000) / 10 + "M";

    return Math.floor(count / 1000000) + "M";
}

function formatDislike(count) {
    formatDislikeBtn();
    return formatDislikeCount(count);
}

function insertDislikes() {
    if (document.querySelector("#dislikeDiv") == null) {
        dislikeDiv = document.createElement("div");
        dislikeDiv.id = "dislikeDiv";
        dislikeBtn.append(dislikeDiv);
        handleUpdateCount();
    }
}

function handleUpdateCount() {
    handleClickIntervalId = setInterval(() => {
        if (
            document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this'] .yt-spec-touch-feedback-shape > .yt-spec-touch-feedback-shape__fill")
            &&
            document.querySelectorAll(".yt-spec-button-shape-next[title = 'I like this'] .yt-spec-touch-feedback-shape > .yt-spec-touch-feedback-shape__fill, " + 
                ".yt-spec-button-shape-next[title = 'Unlike'] .yt-spec-touch-feedback-shape > .yt-spec-touch-feedback-shape__fill"
            ).length > 0
        ) {
            clearInterval(handleClickIntervalId);
            document.querySelector(".yt-spec-button-shape-next[title = 'I dislike this'] .yt-spec-touch-feedback-shape > .yt-spec-touch-feedback-shape__fill")
                .addEventListener("click", updateCount());
            document.querySelectorAll(".yt-spec-button-shape-next[title = 'I like this'] .yt-spec-touch-feedback-shape > .yt-spec-touch-feedback-shape__fill, " + 
                ".yt-spec-button-shape-next[title = 'Unlike'] .yt-spec-touch-feedback-shape > .yt-spec-touch-feedback-shape__fill"
            )[0]?.addEventListener("click", updateCount);
        }
    }, 0);
}

function updateCount() {
    setTimeout(() =>{
        const dislikeDiv = document.querySelector("#dislikeDiv");
        if (dislikeDiv && dislikeBtn) {
            dislikeDiv.innerText = formatDislike(dislikeCount + (dislikeBtn.getAttribute("aria-pressed") == 'true' ? 1 : 0));
        }
    }, 0);

    return updateCount;
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
        if (changes.adSkipperActive)
            toggleSkipBehaviour(changes.adSkipperActive.newValue);

        if (changes.showDislikesActive)
            toggleDislikeBehaviour(changes.showDislikesActive.newValue);
    }
});