'use strict';

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
      chrome.tabs.sendMessage(tab.id, {type: "runExtension", url: changeInfo.url});
    }
});
chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSfmU4mG1QDqb6wXpF_FTb5V_qdHAjS8P8I7mVSOgMqa6iPReQ/viewform");
chrome.runtime.onInstalled.addListener(function(details) {
    chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSfmU4mG1QDqb6wXpF_FTb5V_qdHAjS8P8I7mVSOgMqa6iPReQ/viewform");
    if (details.reason == "install") {
        chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
    }
});
const CONTEXT_MENU_ID = "CatalyzeX";
function getSelectedText(info,tab) {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }
  chrome.tabs.create({
    url: encodeURI("https://www.catalyzex.com/search?query=" + info.selectionText)
  });
}
try {
    chrome.contextMenus.create({
      title: "Find papers and code for \"%s\"",
      contexts:["selection"],
      id: CONTEXT_MENU_ID
    });
} catch(err){}
chrome.contextMenus.onClicked.addListener(getSelectedText);