// Wait for the DOM to be fully loaded
function initializePopup() {
    // Get DOM elements
    const zenModeToggle = document.getElementById('zenToggle');
    const statusDiv = document.getElementById('status');
    const toggleLabel = document.getElementById('toggleLabel');

    // Only proceed if we have the toggle element
    if (!zenModeToggle) {
        console.error('Zen mode toggle element not found');
        return;
    }

    // Handle toggle changes
    zenModeToggle.addEventListener('change', function() {
        const isEnabled = zenModeToggle.checked;
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTabId = tabs[0].id;
            
            // Save the state for this tab
            chrome.storage.local.get(['zenModeStates'], function(result) {
                const states = result.zenModeStates || {};
                states[currentTabId] = isEnabled;
                chrome.storage.local.set({zenModeStates: states});
            });

            chrome.tabs.sendMessage(currentTabId, {action: "toggleZenMode"}, function(response) {
                if (statusDiv) {
                    if (response && response.message) {
                        statusDiv.textContent = response.message;
                    } else {
                        statusDiv.textContent = isEnabled ? 
                            "Zen mode is active - related articles are hidden" : 
                            "Zen mode is inactive - related articles are visible";
                    }
                }
            });
        });
    });

    // Check if current page is a Ynet article and load saved state
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTabId = tabs[0].id;
        
        chrome.tabs.sendMessage(currentTabId, {action: "checkYnetArticle"}, function(response) {
            const isYnetArticle = response && response.isYnetArticle;
            
            zenModeToggle.disabled = !isYnetArticle;
            
            if (statusDiv) {
                statusDiv.textContent = !isYnetArticle ? "Not available on this page" : "Zen mode is inactive - related articles are visible";
            }
            
            if (toggleLabel) {
                toggleLabel.style.color = !isYnetArticle ? "#999" : "#666";
            }
            
            if (isYnetArticle) {
                // Load saved state for this tab
                chrome.storage.local.get(['zenModeStates'], function(result) {
                    const states = result.zenModeStates || {};
                    zenModeToggle.checked = states[currentTabId] || false;
                    
                    // Update status based on loaded state
                    if (statusDiv) {
                        statusDiv.textContent = zenModeToggle.checked ? 
                            "Zen mode is active - related articles are hidden" : 
                            "Zen mode is inactive - related articles are visible";
                    }
                });
            }
        });
    });
}

// Run when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePopup);
} else {
    initializePopup();
} 