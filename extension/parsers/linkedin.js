/**
 * LinkedIn Job Parser
 */
function parseLinkedInJob(document, locationHref) {
  const jobUrl = locationHref || window.location.href;

  // Strict check: Only parse if on LinkedIn jobs view or job details page
  if (
    !jobUrl.includes('/jobs/') &&
    !document.querySelector('.jobs-details, .job-details-jobs-unified-top-card')
  ) {
    return null;
  }

  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';

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

  // Must have a real job title and company
  if (!jobTitle || !companyName || companyName.toLowerCase() === 'linkedin') {
    return null;
  }

  return {
    jobTitle,
    companyName,
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
