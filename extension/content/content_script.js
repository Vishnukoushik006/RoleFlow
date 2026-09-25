/**
 * RoleFlow Content Script (Manifest V3)
 * - Automatic Auth Synchronization from RoleFlow Web App
 * - Smart Job Detection (Only activates on verified job detail pages)
 * - Interactive Confirmation Prompt (No unwanted silent tracking)
 * - 1-Click Floating Quick-Track Widget
 */

(function () {
  const currentHost = window.location.hostname.toLowerCase();
  const currentUrl = window.location.href;

  // Track recently saved URLs in memory to avoid duplicate requests
  const trackedUrlsThisSession = new Set();

  /* ─── 1. Automatic Auth-Sync from RoleFlow Web App ──────────────────────── */
  if (
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    window.location.port === '5173' ||
    window.location.port === '5001'
  ) {
    function syncAuthWithExtension() {
      try {
        const token = localStorage.getItem('roleflow_token');
        const userStr = localStorage.getItem('roleflow_user');
        let user = null;
        if (userStr) {
          try { user = JSON.parse(userStr); } catch (e) {}
        }

        if (token) {
          chrome.runtime.sendMessage({
            action: 'SYNC_AUTH',
            token: token,
            user: user,
            apiUrl: window.location.port === '5001' ? window.location.origin : 'http://localhost:5001'
          });
        }
      } catch (err) {
        // LocalStorage access may be restricted
      }
    }

    syncAuthWithExtension();

    window.addEventListener('storage', (e) => {
      if (e.key === 'roleflow_token' || e.key === 'roleflow_user') {
        syncAuthWithExtension();
      }
    });

    return;
  }

  /* ─── 2. Platform Job Data Extractor ────────────────────────────────────── */
  function extractCurrentPageJob() {
    const host = window.location.hostname.toLowerCase();
    const url = window.location.href;
    let jobData = null;

    try {
      if (host.includes('linkedin.com') && window.parseLinkedInJob) {
        jobData = window.parseLinkedInJob(document, url);
      } else if (host.includes('indeed.com') && window.parseIndeedJob) {
        jobData = window.parseIndeedJob(document, url);
      } else if (host.includes('naukri.com') && window.parseNaukriJob) {
        jobData = window.parseNaukriJob(document, url);
      } else if (host.includes('greenhouse.io') && window.parseGreenhouseJob) {
        jobData = window.parseGreenhouseJob(document, url);
      } else if (host.includes('lever.co') && window.parseLeverJob) {
        jobData = window.parseLeverJob(document, url);
      } else if (
        // Only run generic parser if page actually looks like a job posting
        document.querySelector('.job-description, #job-details, .job-details, [itemtype*="JobPosting"]') &&
        window.parseGenericJob
      ) {
        jobData = window.parseGenericJob(document, url);
      }
    } catch (err) {
      console.warn('[RoleFlow] Parser error:', err);
    }

    if (!jobData || !jobData.jobTitle || !jobData.companyName) {
      return null;
    }

    // Filter out obvious generic non-job placeholders
    const badTitles = [
      'find your dream job',
      'job search',
      'jobs in india',
      'search jobs',
      'home',
      'feed',
      'dashboard',
      'role',
      'job role'
    ];
    const badCompanies = ['naukri', 'linkedin', 'indeed', 'company', 'employer'];

    const tLower = jobData.jobTitle.toLowerCase();
    const cLower = jobData.companyName.toLowerCase();

    if (
      badTitles.some((bt) => tLower.includes(bt)) ||
      badCompanies.includes(cLower)
    ) {
      return null;
    }

    return jobData;
  }

  /* ─── 3. In-Page Notification Toast ─────────────────────────────────────── */
  function showRoleFlowToast(message, isSuccess = true, viewUrl = null) {
    const existing = document.getElementById('roleflow-inpage-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'roleflow-inpage-toast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999999;
        background: #161616;
        border: 1px solid ${isSuccess ? '#c8956c' : 'rgba(239, 68, 68, 0.4)'};
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.65);
        border-radius: 10px;
        padding: 14px 18px;
        color: #E2E8F0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 360px;
        animation: roleflowSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; color: #c8956c;">
            <span style="font-size: 10px;">●</span> RoleFlow
          </div>
          <span style="cursor: pointer; opacity: 0.6; font-size: 14px;" id="jt-toast-close">&times;</span>
        </div>
        <div style="font-weight: 600; font-size: 13px; color: ${isSuccess ? '#E2E8F0' : '#fca5a5'};">
          ${message}
        </div>
        ${viewUrl ? `
          <a href="${viewUrl}" target="_blank" style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
            color: #c8956c;
            font-size: 12px;
            font-weight: 500;
            text-decoration: underline;
          ">View in Dashboard &rarr;</a>
        ` : ''}
      </div>
      <style>
        @keyframes roleflowSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(toast);
    document.getElementById('jt-toast-close')?.addEventListener('click', () => toast.remove());
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 6000);
  }

  /* ─── 4. Explicit Job Capture Routine ───────────────────────────────────── */
  function executeTrackJob(jobData, status = 'Applied') {
    if (!jobData || !jobData.jobTitle || !jobData.companyName) return;

    const dedupeKey = `${jobData.companyName}__${jobData.jobTitle}`.toLowerCase();
    if (trackedUrlsThisSession.has(dedupeKey)) {
      showRoleFlowToast(`Already tracked: ${jobData.jobTitle} @ ${jobData.companyName}`);
      return;
    }

    trackedUrlsThisSession.add(dedupeKey);
    jobData.status = status;

    chrome.runtime.sendMessage(
      { action: 'AUTO_TRACK_JOB', data: jobData },
      (response) => {
        if (response && response.success) {
          showRoleFlowToast(
            `✓ Saved as ${status}: ${jobData.jobTitle} @ ${jobData.companyName}`,
            true,
            'http://localhost:5173/applications'
          );

          const floatBtn = document.getElementById('roleflow-floating-btn');
          if (floatBtn) {
            floatBtn.innerText = `✓ Tracked (${status})`;
            floatBtn.style.background = '#22c55e';
            floatBtn.style.borderColor = '#22c55e';
          }
        } else {
          const errMsg = response?.error || 'Could not track application';
          showRoleFlowToast(errMsg, false);
        }
      }
    );
  }

  /* ─── 5. Confirmation Prompt Banner (When Apply Click Detected) ─────────── */
  function promptTrackConfirmation(jobData) {
    const existing = document.getElementById('roleflow-prompt-modal');
    if (existing) return;

    const dedupeKey = `${jobData.companyName}__${jobData.jobTitle}`.toLowerCase();
    if (trackedUrlsThisSession.has(dedupeKey)) return;

    const promptEl = document.createElement('div');
    promptEl.id = 'roleflow-prompt-modal';
    promptEl.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999999;
        background: #18181b;
        border: 1px solid rgba(200, 149, 108, 0.5);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
        border-radius: 12px;
        padding: 16px 20px;
        color: #f4f4f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        max-width: 380px;
        animation: roleflowSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #c8956c; font-size: 12px;">
            <span>●</span> RoleFlow Job Capture
          </div>
          <button id="rf-prompt-close" style="background:none; border:none; color:#a1a1aa; cursor:pointer; font-size:16px;">&times;</button>
        </div>
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #fff;">
          Track this job?
        </div>
        <div style="font-size: 12.5px; color: #d4d4d8; margin-bottom: 12px; line-height: 1.4;">
          <strong>${jobData.jobTitle}</strong> at <strong>${jobData.companyName}</strong>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="rf-track-applied" style="
            flex: 1;
            background: #c8956c;
            color: #000;
            border: none;
            border-radius: 6px;
            padding: 7px 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          ">Track as Applied</button>
          <button id="rf-track-saved" style="
            flex: 1;
            background: rgba(255,255,255,0.08);
            color: #e4e4e7;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 6px;
            padding: 7px 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">Save for Later</button>
        </div>
      </div>
      <style>
        @keyframes roleflowSlideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(promptEl);

    document.getElementById('rf-prompt-close')?.addEventListener('click', () => promptEl.remove());
    document.getElementById('rf-track-applied')?.addEventListener('click', () => {
      promptEl.remove();
      executeTrackJob(jobData, 'Applied');
    });
    document.getElementById('rf-track-saved')?.addEventListener('click', () => {
      promptEl.remove();
      executeTrackJob(jobData, 'Saved');
    });

    // Auto-dismiss after 10 seconds if ignored
    setTimeout(() => { if (promptEl.parentNode) promptEl.remove(); }, 10000);
  }

  /* ─── 6. Detect Intentional "Apply" Actions ──────────────────────────────── */
  function isGenuineApplyButton(el) {
    if (!el) return false;
    const target = el.closest('button, a, input[type="submit"], input[type="button"], [role="button"]');
    if (!target) return false;

    const text = (target.innerText || target.value || target.getAttribute('aria-label') || '').toLowerCase().trim();
    const id = (target.id || '').toLowerCase();
    const className = (target.className || '').toString().toLowerCase();

    // NEVER trigger on search, filter, or navigation buttons
    const excludedKeywords = [
      'filter',
      'search',
      'save',
      'cancel',
      'edit',
      'coupon',
      'promo',
      'applied',
      'history',
      'terms',
      'register',
      'sign in',
      'login',
      'browse'
    ];
    if (excludedKeywords.some((w) => text.includes(w) || id.includes(w) || className.includes(w))) {
      return false;
    }

    // Strict positive match on application submission buttons
    const exactApplyPatterns = [
      /^easy apply$/i,
      /^apply now$/i,
      /^apply on company site$/i,
      /^apply to job$/i,
      /^submit application$/i,
      /^complete application$/i,
      /^send application$/i,
      /^apply$/i
    ];

    const isMatch = exactApplyPatterns.some((pattern) => pattern.test(text));
    const hasStrictClass = className.includes('jobs-apply-button') || className.includes('postings-btn');

    return isMatch || hasStrictClass;
  }

  // Intercept click on real apply button and prompt user
  document.addEventListener(
    'click',
    (e) => {
      if (isGenuineApplyButton(e.target)) {
        setTimeout(() => {
          const jobData = extractCurrentPageJob();
          if (jobData) {
            promptTrackConfirmation(jobData);
          }
        }, 400);
      }
    },
    true
  );

  /* ─── 7. Unobtrusive Floating Quick-Capture Badge ───────────────────────── */
  function injectFloatingQuickCapture() {
    // Only inject if this page is a genuine job posting with valid details
    const jobData = extractCurrentPageJob();
    if (!jobData || document.getElementById('roleflow-floating-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'roleflow-floating-widget';
    widget.innerHTML = `
      <div id="roleflow-floating-btn" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999998;
        background: #18181b;
        color: #E2E8F0;
        border: 1px solid rgba(200, 149, 108, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
        border-radius: 24px;
        padding: 8px 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        user-select: none;
        transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      ">
        <span style="color: #c8956c; font-size: 10px;">●</span>
        <span>RoleFlow</span>
        <span style="opacity: 0.3;">|</span>
        <span style="color: #c8956c;">⚡ 1-Click Track</span>
      </div>
    `;

    document.body.appendChild(widget);

    const btn = document.getElementById('roleflow-floating-btn');
    if (btn) {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.borderColor = '#c8956c';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.borderColor = 'rgba(200, 149, 108, 0.4)';
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.innerHTML = '<span style="color: #c8956c;">Tracking...</span>';
        executeTrackJob(jobData, 'Applied');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectFloatingQuickCapture, 1200));
  } else {
    setTimeout(injectFloatingQuickCapture, 1200);
  }

  /* ─── 8. Listen for explicit messages from extension popup ──────────────── */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_JOB_DETAILS') {
      const jobData = extractCurrentPageJob();
      sendResponse({ success: true, data: jobData });
    }
    return true;
  });
})();
