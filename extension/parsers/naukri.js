/**
 * Naukri.com Job Parser
 */
function parseNaukriJob(document, locationHref) {
  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';
  const jobUrl = locationHref || window.location.href;

  const titleEl = document.querySelector(
    '.styles_jd-header-title__rZwM1, .jd-header-title, .job-title, h1'
  );
  if (titleEl) jobTitle = titleEl.innerText.trim();

  const companyEl = document.querySelector(
    '.styles_jd-header-comp-name__MvqAI a, .styles_jd-header-comp-name__MvqAI, .comp-name, .company-name'
  );
  if (companyEl) companyName = companyEl.innerText.trim();

  const locEl = document.querySelector(
    '.styles_jhc__loc___Oq4i a, .styles_jhc__loc___Oq4i, .loc, .location'
  );
  if (locEl) location = locEl.innerText.trim();

  const salEl = document.querySelector(
    '.styles_jhc__salary___OuDF span, .styles_jhc__salary___OuDF, .salary'
  );
  if (salEl) salary = salEl.innerText.trim();

  const descEl = document.querySelector(
    '.styles_JDC__dang-inner-html__h0K4t, .job-desc, .dang-inner-html, .styles_job-desc-container__pv-gu'
  );
  if (descEl) jobDescription = descEl.innerText.substring(0, 6000).trim();

  if (!jobTitle || !companyName) {
    const fallback = window.parseGenericJob ? window.parseGenericJob(document, locationHref) : {};
    jobTitle = jobTitle || fallback.jobTitle;
    companyName = companyName || fallback.companyName;
    location = location || fallback.location;
    salary = salary || fallback.salary;
    jobDescription = jobDescription || fallback.jobDescription;
  }

  return {
    jobTitle: jobTitle || 'Software Engineer',
    companyName: companyName || 'Company',
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
