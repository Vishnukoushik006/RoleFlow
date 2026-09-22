/**
 * JobTrack Content Script (Manifest V3)
 * - Automatic Auth Synchronization from JobTrack Web App
 * - Automatic 1-Click Job Capture when "Apply" or "Easy Apply" button is clicked
 * - In-Page Notification Toast & Quick Track Floating Widget
 */

(function () {
  const currentHost = window.location.hostname.toLowerCase();
  const currentUrl = window.location.href;

  // Track recently saved URLs in memory to avoid duplicate rapid requests
  const trackedUrlsThisSession = new Set();

  /* ─── 1. Automatic Auth-Sync from JobTrack Web App ──────────────────────── */
  if (
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    window.location.port === '5173' ||
    window.location.port === '5001'
  ) {
    function syncAuthWithExtension() {
      try {
        const token = localStorage.getItem('jobtrack_token');
        const userStr = localStorage.getItem('jobtrack_user');
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

    // Sync on page load
    syncAuthWithExtension();

    // Listen for login/logout events on the web app
    window.addEventListener('storage', (e) => {
      if (e.key === 'jobtrack_token' || e.key === 'jobtrack_user') {
        syncAuthWithExtension();
      }
    });

    // Don't inject job tracking widgets on the JobTrack web app itself
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
      } else if (window.parseGenericJob) {
        jobData = window.parseGenericJob(document, url);
      }
    } catch (err) {
      console.warn('[JobTrack] Parser error, falling back to generic:', err);
      if (window.parseGenericJob) {
        jobData = window.parseGenericJob(document, url);
      }
    }

    return jobData;
  }

  /* ─── 3. In-Page Notification Toast ─────────────────────────────────────── */
  function showJobTrackToast(message, isSuccess = true, viewUrl = null) {
    // Remove existing toast if any
    const existing = document.getElementById('jobtrack-inpage-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'jobtrack-inpage-toast';
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
        color: #edebe6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 360px;
        animation: jobtrackSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; color: #c8956c;">
            <span style="font-size: 10px;">●</span> JobTrack Auto-Capture
          </div>
          <span style="cursor: pointer; opacity: 0.6; font-size: 14px;" id="jt-toast-close">&times;</span>
        </div>
        <div style="font-weight: 600; font-size: 13.5px; color: ${isSuccess ? '#edebe6' : '#fca5a5'};">
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
        @keyframes jobtrackSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(toast);

    document.getElementById('jt-toast-close')?.addEventListener('click', () => {
      toast.remove();
    });

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 6000);
  }

  /* ─── 4. Automatic Job Capture Routine ──────────────────────────────────── */
  function autoCaptureJob(status = 'Applied') {
    const jobData = extractCurrentPageJob();

    if (!jobData || (!jobData.jobTitle && !jobData.companyName)) {
      return;
    }

    // Skip placeholder names
    if (jobData.jobTitle === 'Job Role' && jobData.companyName === 'Company') {
      return;
    }

    const dedupeKey = `${jobData.companyName}__${jobData.jobTitle}`.toLowerCase();
    if (trackedUrlsThisSession.has(dedupeKey)) {
      console.log('[JobTrack] Job already captured in this session:', dedupeKey);
      return;
    }

    trackedUrlsThisSession.add(dedupeKey);
    jobData.status = status;

    console.log('[JobTrack] Auto-capturing job:', jobData.jobTitle, 'at', jobData.companyName);

    chrome.runtime.sendMessage(
      { action: 'AUTO_TRACK_JOB', data: jobData },
      (response) => {
        if (response && response.success) {
          showJobTrackToast(
            `✓ Tracked as ${status}: ${jobData.jobTitle} @ ${jobData.companyName}`,
            true,
            'http://localhost:5173/applications'
          );

          // Update floating button if visible
          const floatBtn = document.getElementById('jobtrack-floating-btn');
          if (floatBtn) {
            floatBtn.innerText = `✓ Tracked as ${status}`;
            floatBtn.style.background = '#4aab7c';
          }
        } else {
          const errMsg = response?.error || 'Could not track application';
          // Only show error toast if it's an actionable message
          if (errMsg.includes('sign in') || errMsg.includes('connect')) {
            showJobTrackToast(errMsg, false);
          } else {
            console.warn('[JobTrack] Auto-track status:', errMsg);
          }
        }
      }
    );
  }

  /* ─── 5. Detect Clicks on "Apply" Buttons ────────────────────────────────── */
  function isApplyElement(el) {
    if (!el) return false;
    const target = el.closest('button, a, input[type="submit"], input[type="button"], [role="button"]');
    if (!target) return false;

    const text = (target.innerText || target.value || target.getAttribute('aria-label') || '').toLowerCase().trim();
    const id = (target.id || '').toLowerCase();
    const className = (target.className || '').toString().toLowerCase();

    // Check words
    const applyKeywords = [
      'easy apply',
      'apply now',
      'apply on company',
      'apply with resume',
      'apply to job',
      'submit application',
      'complete application',
      'send application',
      'apply'
    ];

    const hasApplyText = applyKeywords.some((kw) => text === kw || text.startsWith(kw) || text.includes(kw));
    const hasApplyClass = className.includes('apply-button') ||
      className.includes('jobs-apply-button') ||
      className.includes('postings-btn') ||
      className.includes('ia-applybutton') ||
      className.includes('applybtn');
    const hasApplyId = id.includes('submit_app') || id.includes('apply') || id.includes('btn-submit');

    return hasApplyText || hasApplyClass || hasApplyId;
  }

  // Intercept click on any apply button
  document.addEventListener(
    'click',
    (e) => {
      if (isApplyElement(e.target)) {
        console.log('[JobTrack] Detected Apply button click!');
        // Allow a 300ms breather for dynamic DOM elements to populate
        setTimeout(() => {
          autoCaptureJob('Applied');
        }, 300);
      }
    },
    true
  );

  // Intercept form submissions on Greenhouse, Lever, etc.
  document.addEventListener(
    'submit',
    (e) => {
      const form = e.target;
      const formId = (form.id || '').toLowerCase();
      const formAction = (form.action || '').toLowerCase();

      if (formId.includes('application') || formId.includes('apply') || formAction.includes('apply') || formAction.includes('greenhouse') || formAction.includes('lever')) {
        console.log('[JobTrack] Detected Application Form Submission!');
        autoCaptureJob('Applied');
      }
    },
    true
  );

  /* ─── 6. Unobtrusive Floating Quick-Capture Badge ───────────────────────── */
  function injectFloatingQuickCapture() {
    // Only inject on likely job pages
    const isJobPage =
      currentHost.includes('linkedin.com') ||
      currentHost.includes('indeed.com') ||
      currentHost.includes('naukri.com') ||
      currentHost.includes('greenhouse.io') ||
      currentHost.includes('lever.co') ||
      document.querySelector('meta[property="og:type"][content="article"]') ||
      document.querySelector('.job-description, #job-details, .job-details');

    if (!isJobPage || document.getElementById('jobtrack-floating-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'jobtrack-floating-widget';
    widget.innerHTML = `
      <div id="jobtrack-floating-btn" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999998;
        background: #161616;
        color: #edebe6;
        border: 1px solid rgba(200, 149, 108, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
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
        <span>JobTrack</span>
        <span style="opacity: 0.4;">|</span>
        <span style="color: #c8956c;">⚡ 1-Click Track</span>
      </div>
    `;

    document.body.appendChild(widget);

    const btn = document.getElementById('jobtrack-floating-btn');
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
        btn.innerHTML = '<span style="color: #c8956c;">Capturing...</span>';
        autoCaptureJob('Applied');
      });
    }
  }

  // Inject floating quick-track button once page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingQuickCapture);
  } else {
    setTimeout(injectFloatingQuickCapture, 1200);
  }

  /* ─── 7. Listen for explicit messages from extension popup ──────────────── */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_JOB_DETAILS') {
      const jobData = extractCurrentPageJob();
      sendResponse({ success: true, data: jobData });
    }
    return true;
  });
})();
