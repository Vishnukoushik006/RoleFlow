/**
 * LinkedIn Job Parser
 */
function parseLinkedInJob(document, locationHref) {
  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';
  const jobUrl = locationHref || window.location.href;

  // Title Selectors
  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title',
    '.topcard__title',
    '.jobs-unified-top-card__job-title',
    'h1.t-24',
    '.jobs-details__main-content h1'
  ];
  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      jobTitle = el.innerText.trim();
      break;
    }
  }

  // Company Name Selectors
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.ember-view.jobs-unified-top-card__company-name'
  ];
  for (const selector of companySelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      companyName = el.innerText.trim();
      break;
    }
  }

  // Location Selectors
  const locationSelectors = [
    '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
    '.topcard__flavor--bullet',
    '.jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__workplace-type'
  ];
  for (const selector of locationSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      location = el.innerText.trim();
      break;
    }
  }

  // Description Selectors
  const descSelectors = [
    '#job-details',
    '.jobs-description__content',
    '.jobs-box__html-content',
    '.description__text'
  ];
  for (const selector of descSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      jobDescription = el.innerText.substring(0, 6000).trim();
      break;
    }
  }

  // Fallback to generic if LinkedIn DOM altered
  if (!jobTitle || !companyName) {
    const fallback = window.parseGenericJob ? window.parseGenericJob(document, locationHref) : {};
    jobTitle = jobTitle || fallback.jobTitle;
    companyName = companyName || fallback.companyName;
    location = location || fallback.location;
    jobDescription = jobDescription || fallback.jobDescription;
  }

  return {
    jobTitle: jobTitle || 'Job Role',
    companyName: companyName || 'Company',
    location: location || 'Remote',
    jobUrl,
    source: 'LinkedIn',
    salary: salary || '',
    jobDescription: jobDescription || ''
  };
}

if (typeof window !== 'undefined') {
  window.parseLinkedInJob = parseLinkedInJob;
}
