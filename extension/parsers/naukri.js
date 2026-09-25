/**
 * Naukri.com Job Parser
 */
function parseNaukriJob(document, locationHref) {
  const jobUrl = locationHref || window.location.href;

  // Strict check: Only parse on actual job listing pages
  // Example valid URLs: https://www.naukri.com/job-listings-software-engineer-...
  if (!jobUrl.includes('/job-listings-') && !jobUrl.includes('jobId=')) {
    return null;
  }

  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';

  const titleEl = document.querySelector(
    '.styles_jd-header-title__rZwM1, .jd-header-title, [class*="jd-header-title"]'
  );
  if (titleEl) {
    jobTitle = titleEl.innerText.trim();
  }

  const companyEl = document.querySelector(
    '.styles_jd-header-comp-name__MvqAI a, .styles_jd-header-comp-name__MvqAI, [class*="jd-header-comp-name"] a, [class*="jd-header-comp-name"]'
  );
  if (companyEl) {
    companyName = companyEl.innerText.replace(/Reviews?.*$/i, '').trim();
  }

  const locEl = document.querySelector(
    '.styles_jhc__loc___Oq4i a, .styles_jhc__loc___Oq4i, [class*="jhc__loc"]'
  );
  if (locEl) {
    location = locEl.innerText.trim();
  }

  const salEl = document.querySelector(
    '.styles_jhc__salary___OuDF span, .styles_jhc__salary___OuDF, [class*="jhc__salary"]'
  );
  if (salEl) {
    salary = salEl.innerText.trim();
  }

  const descEl = document.querySelector(
    '.styles_JDC__dang-inner-html__h0K4t, .job-desc, .dang-inner-html, .styles_job-desc-container__pv-gu, [class*="job-desc"]'
  );
  if (descEl) {
    jobDescription = descEl.innerText.substring(0, 6000).trim();
  }

  // Must have at least a legitimate job title and company name
  if (!jobTitle || !companyName || companyName.toLowerCase() === 'naukri') {
    return null;
  }

  return {
    jobTitle,
    companyName,
    location: location || 'India / Remote',
    jobUrl,
    source: 'Naukri',
    salary: salary || '',
    jobDescription: jobDescription || ''
  };
}

if (typeof window !== 'undefined') {
  window.parseNaukriJob = parseNaukriJob;
}
