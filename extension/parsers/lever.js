/**
 * Lever.co Job Parser
 */
function parseLeverJob(document, locationHref) {
  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';
  const jobUrl = locationHref || window.location.href;

  const titleEl = document.querySelector('.posting-headline h2, .posting-headline, h2');
  if (titleEl) jobTitle = titleEl.innerText.trim();

  const companyEl = document.querySelector('.main-header-logo img, .main-header-logo, .posting-headline a');
  if (companyEl) {
    companyName = companyEl.alt || (companyEl.innerText ? companyEl.innerText.trim() : '');
  }

  const locEl = document.querySelector('.posting-categories .location, .posting-categories .workplaceTypes, .sort-by-time.posting-category');
  if (locEl) location = locEl.innerText.trim();

  const descEl = document.querySelector('.section-wrapper.page-full-width, .section.page-centered');
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
    source: 'Lever',
    salary: salary || '',
    jobDescription: jobDescription || ''
  };
}

if (typeof window !== 'undefined') {
  window.parseLeverJob = parseLeverJob;
}
