/**
 * RoleFlow Background Service Worker (Manifest V3)
 * Handles auto-tracking job submissions, token management, and badge updates
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[RoleFlow Extension] Installed and active.');
  
  // Default API URL
  chrome.storage.local.get(['apiUrl'], (result) => {
    if (!result.apiUrl) {
      chrome.storage.local.set({ apiUrl: 'https://roleflow-api.onrender.com' });
    }
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'AUTO_TRACK_JOB') {
    handleAutoTrack(message.data)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'SYNC_AUTH') {
    if (message.token) {
      chrome.storage.local.set({
        token: message.token,
        user: message.user || null,
        apiUrl: message.apiUrl || 'http://localhost:5001'
      }, () => {
        console.log('[RoleFlow] Auth synced from web app session');
        sendResponse({ success: true });
      });
    } else {
      chrome.storage.local.remove(['token', 'user'], () => {
        console.log('[RoleFlow] Auth cleared via web app logout');
        sendResponse({ success: true });
      });
    }
    return true;
  }

  if (message.action === 'SET_BADGE') {
    chrome.action.setBadgeText({ text: message.text || '' });
    chrome.action.setBadgeBackgroundColor({ color: message.color || '#c8956c' });
    sendResponse({ success: true });
    return true;
  }

  return true;
});

/**
 * Automatically send job application to the backend
 */
async function handleAutoTrack(jobData) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token', 'apiUrl'], async ({ token, apiUrl }) => {
      const endpoint = (apiUrl || 'http://localhost:5001').replace(/\/$/, '');

      if (!token) {
        console.warn('[RoleFlow] Auto-track skipped: User not logged in to RoleFlow');
        resolve({
          success: false,
          error: 'Please sign in to RoleFlow at http://localhost:5173 to enable automatic tracking.'
        });
        return;
      }

      try {
        const payload = {
          jobTitle: jobData.jobTitle || 'Role',
          companyName: jobData.companyName || 'Company',
          location: jobData.location || 'Remote',
          jobUrl: jobData.jobUrl || '',
          source: jobData.source || 'Other',
          salary: jobData.salary || '',
          status: jobData.status || 'Applied',
          jobDescription: jobData.jobDescription || '',
          notes: jobData.notes || 'Automatically captured on apply click by RoleFlow.'
        };

        const response = await fetch(`${endpoint}/api/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Flash temporary badge on extension icon
          chrome.action.setBadgeText({ text: '✓' });
          chrome.action.setBadgeBackgroundColor({ color: '#4aab7c' });
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
          }, 4000);

          resolve({
            success: true,
            application: data.data,
            message: `Captured ${payload.jobTitle} at ${payload.companyName}`
          });
        } else {
          // If already tracked or duplicate
          const errorMsg = data.message || `Server returned ${response.status}`;
          resolve({
            success: false,
            error: errorMsg
          });
        }
      } catch (err) {
        console.error('[RoleFlow] Auto-track request error:', err);
        resolve({
          success: false,
          error: 'Could not connect to RoleFlow server. Make sure it is running at ' + endpoint
        });
      }
    });
  });
}
