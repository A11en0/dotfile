///<reference path="../typings/index.d.ts"/>
chrome.runtime.sendMessage({ type: "getUid" }, function (response) {
    window.addEventListener("DOMContentLoaded", function () {
        if (response) {
            document.body.setAttribute("data-sb-uid", response.uid);
            document.body.setAttribute("data-sb-email", response.email);
        }
        document.body.setAttribute("data-sb-version", "1.3.19");
    });
});
var port = chrome.runtime.connect({ name: 'websiteBridge' });
var tokenPort = chrome.runtime.connect({ name: 'tokenBridge' });
tokenPort.onMessage.addListener(function (message) {
    window.postMessage({
        type: 'messageBridge',
        bridge: 'tokenBridge',
        content: message
    }, document.location.origin);
});
var lastMessage;
port.onMessage.addListener(function (message) {
    lastMessage = message;
    window.postMessage({
        type: 'messageBridge',
        bridge: 'websiteBridge',
        content: message
    }, document.location.origin);
});
window.addEventListener("message", function (event) {
    if (event.origin !== "https://sessionbox.io")
        return;
    if (event.data && event.data.type && event.data.type === 'postBridge') {
        if (event.data.bridge === 'websiteBridge') {
            port.postMessage(event.data.content);
        }
        else if (event.data.bridge === 'tokenBridge') {
            tokenPort.postMessage(event.data.content);
        }
    }
    else if (event.data && event.data.type && event.data.type === 'connectedBridge' && event.data.bridge === 'websiteBridge') {
        window.postMessage({
            type: 'messageBridge',
            bridge: 'websiteBridge',
            content: lastMessage
        }, document.location.origin);
    }
}, false);
