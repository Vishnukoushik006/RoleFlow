/**
 * Indeed Job Parser
 */
function parseIndeedJob(document, locationHref) {
  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';
  const jobUrl = locationHref || window.location.href;

  const titleEl = document.querySelector(
    '.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"], .jobsearch-JobComponent-title h1, h1'
  );
  if (titleEl) jobTitle = titleEl.innerText.trim();

  const companyEl = document.querySelector(
    '[data-company-name="true"], [data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader, .jobsearch-CompanyInfoContainer a'
  );
  if (companyEl) companyName = companyEl.innerText.trim();

  const locEl = document.querySelector(
    '[data-testid="inlineHeader-companyLocation"], [data-testid="jobsearch-JobInfoHeader-companyLocation"], .jobsearch-JobInfoHeader-companyLocation'
  );
  if (locEl) location = locEl.innerText.trim();

  const salEl = document.querySelector(
    '#salaryInfoAndJobType, [data-testid="jobsearch-JobInfoHeader-salary"], .jobsearch-JobMetadataHeader-item'
  );
  if (salEl) salary = salEl.innerText.trim();

  const descEl = document.querySelector(
    '#jobDescriptionText, .jobsearch-jobDescriptionText, #jobDescription'
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
    jobTitle: jobTitle || 'Job Role',
    companyName: companyName || 'Company',
    location: location || 'Remote',
    jobUrl,
    source: 'Indeed',
    salary: salary || '',
    jobDescription: jobDescription || ''
  };
}

if (typeof window !== 'undefined') {
  window.parseIndeedJob = parseIndeedJob;
}
