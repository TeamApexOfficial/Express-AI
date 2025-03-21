document.addEventListener('DOMContentLoaded', () => {
    const onButton = document.getElementById('onButton');
    const offButton = document.getElementById('offButton');

    let isSpeaking = false;

    function updateButtonStates() {
        onButton.classList.remove('active');
        offButton.classList.remove('active');

        if (isSpeaking) {
            onButton.classList.add('active');
        } else if (isSpeaking === false && localStorage.getItem('tts_state') === 'off') {
            offButton.classList.add('active');
        }
    }

    updateButtonStates();

    onButton.addEventListener('click', () => {
        isSpeaking = true;
        localStorage.setItem('tts_state', 'on');
        updateButtonStates();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: startReading,
            });
        });
    });

    offButton.addEventListener('click', () => {
        isSpeaking = false;
        localStorage.setItem('tts_state', 'off');
        updateButtonStates();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: stopReading,
            });
        });
    });

    if (localStorage.getItem('tts_state') === 'on') {
        isSpeaking = true;
        updateButtonStates();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: startReading,
            });
        });
    }

    function startReading() {
        let utterance = null;
        const text = document.body.innerText;
        utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
        utterance.onend = () => {
            chrome.runtime.sendMessage({ action: "speechEnded" });
        };
        chrome.runtime.sendMessage({ action: "speechStarted", tabId: chrome.tabs.getCurrent().id });
    }

    function stopReading() {
        speechSynthesis.cancel();
        chrome.runtime.sendMessage({ action: "speechStopped" });
    }
});
