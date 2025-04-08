// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
    console.log('Zen News extension installed');
});

// Example of a background event listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getData") {
        // Handle the request
        sendResponse({data: "Some data from background script"});
    }
    if (request.action === "getTabId") {
        sendResponse({tabId: sender.tab.id});
    }
    return true; // Required for async response
}); 