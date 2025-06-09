(async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let body = document.querySelector("body");
    let message = document.createElement("div");
    message.innerHTML = `Press <span>'Q'</span> to skip Ad.`;
    message.classList.add("messageStyling");

    if (tab.url.match(/^https:\/\/www\.youtube\.com\//)) {
        let toggler = [...document.querySelectorAll(".toggle-switch")];
        toggler.forEach(btn => btn.addEventListener("click", e => {
            let slider = btn.querySelector("div");
            slider.classList.toggle("slide-toggler");
        }));

        let [adSkipper, showDislikes] = toggler;

        chrome.storage.local.get("adSkipperActive", result => {
            if (result.adSkipperActive) {
                adSkipper.querySelector("div").classList.add("slide-toggler");
                body.appendChild(message);
            }
        });
        chrome.storage.local.get("showDislikesActive", result => {
            if (result.showDislikesActive)
                showDislikes.querySelector("div").classList.add("slide-toggler");
        });

        adSkipper.addEventListener("click", () => {
            chrome.storage.local.get("adSkipperActive", result => {
                let adSkipperActive = !result.adSkipperActive;
                chrome.storage.local.set({ adSkipperActive: adSkipperActive });
                if (adSkipperActive)
                    body.appendChild(message);
                else
                    body.removeChild(message);
            });
        });

        showDislikes.addEventListener("click", () => {
            chrome.storage.local.get("showDislikesActive", result => chrome.storage.local.set({ showDislikesActive: !result.showDislikesActive }));
        });

    }
    else {
        body.outerHTML = `
            <body class = "warning">
                <div class = "errorSignDiv">
                    <span>!</span>
                </div>
                <div class = "errorMessage">
                    Open Youtube for this extension to work!
                <div>
            </body>
        `;
    }
})();