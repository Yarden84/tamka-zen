// Common selectors for related articles sections
const relatedArticleSelectors = [
    '.layoutItem.top-ad',
    '.authorAndDateContainer span',
    '.slotsContent',
    '.layoutItem.banner',
    '.layoutItem.taboola-general',
    '.layoutItem.connect-us-widget',
    '[class*="tbl-"]',
    'browsispot',
    '.SiteVerticalArticleSocialShare_Wrapper',
    '[id^="ads."]'
];

let isEnabled = false;

// Function to check if the page is a Ynet article
function isYnetArticle() {
    return window.location.href.includes('/article');
}

// Function to hide related articles
function hideRelatedArticles() {
    if (!isYnetArticle()) return;
    
    relatedArticleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = 'none';
        });
    });
}

// Function to show related articles
function showRelatedArticles() {
    if (!isYnetArticle()) return;
    
    relatedArticleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = '';
        });
    });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkYnetArticle") {
        sendResponse({isYnetArticle: isYnetArticle()});
        return true;
    }
    
    if (request.action === "toggleZenMode") {
        if (!isYnetArticle()) {
            sendResponse({message: "Zen mode is only available on Ynet articles"});
            return true;
        }
        
        isEnabled = !isEnabled;
        if (isEnabled) {
            hideRelatedArticles();
            sendResponse({message: "Zen mode activated - related articles hidden"});
        } else {
            showRelatedArticles();
            sendResponse({message: "Zen mode deactivated - related articles shown"});
        }
    }
    return true;
});

// Wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is a Ynet article
    if (isYnetArticle()) {
        // Get the current tab ID
        chrome.runtime.sendMessage({action: "getTabId"}, function(response) {
            const tabId = response.tabId;
            
            // Load saved state for this tab
            chrome.storage.local.get(['zenModeStates'], function(result) {
                const states = result.zenModeStates || {};
                isEnabled = states[tabId] || false;
                
                if (isEnabled) {
                    hideRelatedArticles();
                }
            });
        });
    }
    
    // Also check for dynamically loaded content
    const observer = new MutationObserver(function(mutations) {
        if (isEnabled) {
            hideRelatedArticles();
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}); 