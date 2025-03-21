let speakingTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "speechStarted") {
        speakingTabId = request.tabId;
    } else if (request.action === "speechEnded" || request.action === "speechStopped") {
        speakingTabId = null;
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (tabId === speakingTabId) {
        speechSynthesis.cancel();
        speakingTabId = null;
    }
});
