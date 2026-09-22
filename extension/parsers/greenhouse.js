/**
 * Greenhouse.io Job Parser
 */
function parseGreenhouseJob(document, locationHref) {
  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';
  const jobUrl = locationHref || window.location.href;

  const titleEl = document.querySelector('.app-title, h1.app-title, #header h1');
  if (titleEl) jobTitle = titleEl.innerText.trim();

  const companyEl = document.querySelector('.company-name, #header .company-name, .logo img');
  if (companyEl) {
    companyName = companyEl.innerText ? companyEl.innerText.replace(/at\s+/i, '').trim() : (companyEl.alt || '');
  }

  const locEl = document.querySelector('.location, #header .location');
  if (locEl) location = locEl.innerText.trim();

  const descEl = document.querySelector('#content, .body, #main');
  if (descEl) jobDescription = descEl.innerText.substring(0, 6000).trim();

  if (!jobTitle || !companyName) {
    const fallback = window.parseGenericJob ? window.parseGenericJob(document, locationHref) : {};
    jobTitle = jobTitle || fallback.jobTitle;
    companyName = companyName || fallback.companyName;
    location = location || fallback.location;
    jobDescription = jobDescription || fallback.jobDescription;
  }

  return {
    jobTitle: jobTitle || 'Role',
    companyName: companyName || 'Company',
    location: location || 'Remote',
    jobUrl,
    source: 'Greenhouse',
    salary: salary || '',
    jobDescription: jobDescription || ''
  };
}

if (typeof window !== 'undefined') {
  window.parseGreenhouseJob = parseGreenhouseJob;
}
