/**
 * JobTrack Extension Popup Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const authSection = document.getElementById('auth-section');
  const captureSection = document.getElementById('capture-section');
  const successSection = document.getElementById('success-section');
  const userBadge = document.getElementById('user-badge');
  const userNameEl = document.getElementById('user-name');
  const previewSource = document.getElementById('preview-source');
  const authError = document.getElementById('auth-error');

  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const manualTokenInput = document.getElementById('manual-token');
  const btnSaveToken = document.getElementById('btn-save-token');
  const btnLogout = document.getElementById('btn-logout');
  const btnReExtract = document.getElementById('btn-re-extract');
  const btnTrackAnother = document.getElementById('btn-track-another');
  const btnViewApp = document.getElementById('btn-view-app');

  const appForm = document.getElementById('application-form');
  const appJobTitle = document.getElementById('app-job-title');
  const appCompanyName = document.getElementById('app-company-name');
  const appLocation = document.getElementById('app-location');
  const appStatus = document.getElementById('app-status');
  const appSalary = document.getElementById('app-salary');
  const appResume = document.getElementById('app-resume');
  const appNotes = document.getElementById('app-notes');
  const appJobUrl = document.getElementById('app-job-url');
  const appJobDesc = document.getElementById('app-job-description');
  const appJobType = document.getElementById('app-job-type');
  const btnTrack = document.getElementById('btn-track');

  let currentCreatedAppId = null;

  // 1. Check Authentication Status
  async function checkAuth() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['token', 'user'], async (data) => {
        if (!data.token) {
          showAuthView();
          resolve(false);
          return;
        }

        try {
          // Verify token validity with backend
          const meResponse = await window.ExtensionApi.getMe();
          if (meResponse && meResponse.success) {
            chrome.storage.local.set({ user: meResponse.user });
            showCaptureView(meResponse.user);
            loadResumes();
            resolve(true);
          } else {
            showAuthView();
            resolve(false);
          }
        } catch (err) {
          console.warn('Auth verification failed:', err);
          showAuthView();
          resolve(false);
        }
      });
    });
  }

  function showAuthView() {
    authSection.classList.remove('hidden');
    captureSection.classList.add('hidden');
    successSection.classList.add('hidden');
    userBadge.classList.add('hidden');
    btnLogout.classList.add('hidden');
  }

  function showCaptureView(user) {
    authSection.classList.add('hidden');
    captureSection.classList.remove('hidden');
    successSection.classList.add('hidden');
    userBadge.classList.remove('hidden');
    btnLogout.classList.remove('hidden');
    if (user) {
      userNameEl.textContent = user.name.split(' ')[0] || user.name;
    }
  }

  // 2. Load User Resumes for Dropdown
  async function loadResumes() {
    try {
      const res = await window.ExtensionApi.getResumes();
      if (res && res.success && Array.isArray(res.data)) {
        appResume.innerHTML = '<option value="">-- No Resume Linked --</option>';
        res.data.forEach((resume) => {
          const opt = document.createElement('option');
          opt.value = resume._id;
          opt.textContent = `${resume.name}${resume.isDefault ? ' (Default)' : ''}`;
          if (resume.isDefault) opt.selected = true;
          appResume.appendChild(opt);
        });
      }
    } catch (e) {
      console.warn('Could not load resumes for popup:', e);
    }
  }

  // 3. Extract Job Information from Active Tab
  async function extractJobFromActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      const tab = tabs[0];

      // Try sending message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB_DETAILS' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.data) {
          // If content script wasn't injected yet, inject programmatically
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: [
                'parsers/generic.js',
                'parsers/linkedin.js',
                'parsers/indeed.js',
                'parsers/naukri.js',
                'parsers/greenhouse.js',
                'parsers/lever.js',
                'content/content_script.js'
              ]
            },
            () => {
              // Retry sending message after script injection
              chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB_DETAILS' }, (res2) => {
                if (res2 && res2.data) {
                  populateForm(res2.data);
                } else {
                  // Fallback to active tab title and URL
                  populateForm({
                    jobTitle: tab.title ? tab.title.split(/[-|–•]/)[0].trim() : 'Job Application',
                    companyName: '',
                    location: 'Remote',
                    jobUrl: tab.url,
                    source: 'Company Website',
                    salary: '',
                    jobDescription: ''
                  });
                }
              });
            }
          );
        } else {
          populateForm(response.data);
        }
      });
    });
  }

  function populateForm(data) {
    if (!data) return;
    appJobTitle.value = data.jobTitle || '';
    appCompanyName.value = data.companyName || '';
    appLocation.value = data.location || 'Remote';
    appSalary.value = data.salary || '';
    appJobUrl.value = data.jobUrl || '';
    appJobDesc.value = data.jobDescription || '';
    if (data.source) {
      previewSource.textContent = data.source;
    }
  }

  // 4. Handle Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    try {
      const res = await window.ExtensionApi.login(email, password);
      if (res && res.success) {
        chrome.storage.local.set({ token: res.token, user: res.user }, () => {
          showCaptureView(res.user);
          loadResumes();
          extractJobFromActiveTab();
        });
      }
    } catch (err) {
      authError.textContent = err.message || 'Login failed. Please check your credentials.';
      authError.classList.remove('hidden');
    }
  });

  // 5. Handle Manual Token Save
  btnSaveToken.addEventListener('click', () => {
    const token = manualTokenInput.value.trim();
    if (!token) return;
    chrome.storage.local.set({ token }, async () => {
      const isOk = await checkAuth();
      if (isOk) {
        extractJobFromActiveTab();
      } else {
        authError.textContent = 'Invalid token. Please check JobTrack settings.';
        authError.classList.remove('hidden');
      }
    });
  });

  // 6. Handle Track Application Submit
  appForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const jobTitle = appJobTitle.value.trim();
    const companyName = appCompanyName.value.trim();
    if (!jobTitle || !companyName) {
      alert('Job Title and Company Name are required.');
      return;
    }

    btnTrack.disabled = true;
    btnTrack.textContent = 'Saving Application...';

    const payload = {
      jobTitle,
      companyName,
      location: appLocation.value.trim() || 'Remote',
      status: appStatus.value,
      salary: appSalary.value.trim(),
      resumeUsed: appResume.value || undefined,
      notes: appNotes.value.trim(),
      jobUrl: appJobUrl.value || '',
      jobDescription: appJobDesc.value || '',
      source: previewSource.textContent || 'Company Website',
      jobType: appJobType.value || 'Full-time'
    };

    try {
      const res = await window.ExtensionApi.createApplication(payload);
      if (res && res.success) {
        currentCreatedAppId = res.data._id;
        document.getElementById('success-desc').textContent = 
          `${jobTitle} at ${companyName} tracked successfully in JobTrack.`;
        
        captureSection.classList.add('hidden');
        successSection.classList.remove('hidden');
      }
    } catch (err) {
      alert(`Error tracking application: ${err.message}`);
    } finally {
      btnTrack.disabled = false;
      btnTrack.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Track Application
      `;
    }
  });

  // 7. Track Another Button
  btnTrackAnother.addEventListener('click', () => {
    successSection.classList.add('hidden');
    captureSection.classList.remove('hidden');
    extractJobFromActiveTab();
  });

  // 8. Open App Detail in Web Dashboard
  btnViewApp.addEventListener('click', () => {
    const url = currentCreatedAppId
      ? `http://localhost:5173/applications/${currentCreatedAppId}`
      : 'http://localhost:5173/dashboard';
    chrome.tabs.create({ url });
  });

  // 9. Re-extract button
  btnReExtract.addEventListener('click', () => {
    extractJobFromActiveTab();
  });

  // 10. Logout
  btnLogout.addEventListener('click', () => {
    chrome.storage.local.remove(['token', 'user'], () => {
      showAuthView();
    });
  });

  // Initialize
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    extractJobFromActiveTab();
  }
});
