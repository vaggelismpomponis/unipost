// Background Service Worker for UTH SIS Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('UTH SIS Extension installed');
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractGradesFromPage') {
    // Extract grades from the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractGrades' }, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open
  }
  
  if (request.action === 'openSISPage') {
    // Open the SIS login page
    chrome.tabs.create({ url: 'https://sis.uth.gr/pls/studweb/studweb.login' });
    sendResponse({ success: true });
  }
  
  if (request.action === 'saveGrades') {
    // Save grades to storage
    chrome.storage.local.set({ 
      'uth_grades': request.grades,
      'last_updated': new Date().toISOString()
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getStoredGrades') {
    // Retrieve stored grades
    chrome.storage.local.get(['uth_grades', 'last_updated'], (result) => {
      sendResponse({
        success: true,
        grades: result.uth_grades || [],
        lastUpdated: result.last_updated
      });
    });
    return true;
  }
});

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      (tab.url?.includes('sis.uth.gr') || tab.url?.includes('sis-web.uth.gr'))) {
    
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => {
      // Content script might already be injected, ignore error
      console.log('Content script injection skipped:', err.message);
    });
  }
}); 