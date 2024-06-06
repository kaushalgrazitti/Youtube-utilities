let videoId;
let dislikeCount;
let dislikeBtn;
let prevLink;

chrome.storage.local.set({adSkipperActive : false, showDislikesActive : false});

function toggleSkipBehaviour (condition) {
    if(condition)
        window.addEventListener("keydown", skip);
    else window.removeEventListener("keydown",skip);
}

function skip(e) {
    let video = document.querySelector(".ad-showing .html5-main-video");
    if (video && e.key === 'q') {
        video.currentTime = video.duration;
        document.querySelectorAll(".ytp-skip-ad-button, .ytp-ad-skip-button-modern").forEach(e => e.click());
    }
}

function toggleDislikeBehaviour (condition) {
   
    prevLink = window.location.href;
    
    if(condition){

        handleNavigate(1);
        handleClick();
        
        navigation.addEventListener("navigate",navigationEventHandlerFunctionMain);
    }
    else{
        let dislikeDiv = document.querySelector("#dislikeDiv");
        if(dislikeDiv)
            dislikeDiv.remove();
        dislikeBtn = document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next");
        dislikeBtn.style.gap = "0px";
        
        navigation.removeEventListener("navigate",navigationEventHandlerFunctionMain);
        document.removeEventListener("click",updateCount);
    }

}

function navigationEventHandlerFunctionMain(){

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
        dislikeCount+=arguments.length===2?1:0;
        if (arguments.length) {
            let intervalId = setInterval(() => {
                if (document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next")) {
                    dislikeBtn = document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next");
                    clearInterval(intervalId);
                    insertDislikes();
                }
            }, 0);
        }
        else {
            dislikeBtn = document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next");
            let intervalId = setInterval(() => {
                if (dislikeBtn != document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next")) {
                    dislikeBtn = document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next");
                    clearInterval(intervalId);
                    insertDislikes();
                }
            }, 0);
        }
    }
}

function formatDislike() {
                
    dislikeBtn.style.width = "auto";
    dislikeBtn.style.gap = "4px";

    if (dislikeCount > 999 && dislikeCount <= 9999)
        dislikeCount = Math.floor(dislikeCount / 100) / 10 + "K";
    
    else if (dislikeCount > 9999 && dislikeCount <= 999999)
        dislikeCount = Math.floor(dislikeCount / 1000) + "K";
    
    else if (dislikeCount > 999999 && dislikeCount <= 9999999)
        dislikeCount = Math.floor(dislikeCount / 100000) / 10 + "M";
    
    else if (dislikeCount > 9999999)
        dislikeCount = Math.floor(dislikeCount / 1000000) + "M";
    
}

function insertDislikes() {

    formatDislike();
    
    let dislikeDiv = document.querySelector("#dislikeDiv");
    if (dislikeDiv) {
        dislikeDiv.innerText = dislikeCount;
    }
    else {
        dislikeDiv = document.createElement("div");
        dislikeDiv.id = "dislikeDiv";
        dislikeDiv.innerText = dislikeCount;
        dislikeBtn.append(dislikeDiv);
    }
}

function handleClick(){
    let intervalId = setInterval(()=>{
        if(document.querySelector(".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper")){
            clearInterval(intervalId);
            document.addEventListener("click",updateCount());
        }
    },0);
}

function updateCount(){
    setTimeout(()=>{
        if(document.querySelector(".YtDislikeButtonViewModelHost .yt-spec-button-shape-next").getAttribute("aria-pressed")==='true'){
            handleNavigate(1,1);
        }
        else handleNavigate(1);
    },500);
    return updateCount;
}

chrome.storage.onChanged.addListener((changes, namespace)=>{
    if(namespace === "local"){
        if(changes.adSkipperActive)
            toggleSkipBehaviour(changes.adSkipperActive.newValue);
        
        if(changes.showDislikesActive)
            toggleDislikeBehaviour(changes.showDislikesActive.newValue);
    }
});