/**
 * Generic Job Parser
 * Leverages Schema.org JSON-LD structured data, OpenGraph tags, and heuristic DOM selectors
 */
function parseGenericJob(document, locationHref) {
  let jobTitle = '';
  let companyName = '';
  let location = '';
  let salary = '';
  let jobDescription = '';
  const jobUrl = locationHref || window.location.href;
  let source = 'Company Website';

  // 1. Attempt JSON-LD Structured Data Extraction
  try {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        const findJobPosting = (obj) => {
          if (!obj) return null;
          if (obj['@type'] === 'JobPosting') return obj;
          if (Array.isArray(obj['@graph'])) {
            return obj['@graph'].find(item => item['@type'] === 'JobPosting');
          }
          return null;
        };

        const jobPosting = findJobPosting(data);
        if (jobPosting) {
          jobTitle = jobPosting.title || jobTitle;
          if (jobPosting.hiringOrganization) {
            companyName = jobPosting.hiringOrganization.name || companyName;
          }
          if (jobPosting.jobLocation) {
            const locObj = Array.isArray(jobPosting.jobLocation) ? jobPosting.jobLocation[0] : jobPosting.jobLocation;
            if (locObj && locObj.address) {
              const addr = locObj.address;
              location = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(', ');
            }
          }
          if (jobPosting.baseSalary) {
            const sal = jobPosting.baseSalary.value;
            if (sal) {
              salary = typeof sal === 'object' ? `${sal.minValue || ''} - ${sal.maxValue || ''} ${jobPosting.baseSalary.currency || ''}`.trim() : String(sal);
            }
          }
          if (jobPosting.description) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = jobPosting.description;
            jobDescription = tempDiv.textContent.trim();
          }
          break;
        }
      } catch (e) {}
    }
  } catch (err) {}

  // 2. DOM Heuristic Fallbacks if JSON-LD missing
  if (!jobTitle) {
    const titleElem = document.querySelector(
      'h1[class*="title" i], h1[class*="job" i], h1[class*="role" i], [data-testid*="job-title" i], .job-title, .posting-headline h2, h1'
    );
    if (titleElem) {
      jobTitle = titleElem.innerText.trim();
    } else {
      jobTitle = document.title.split(/[-|–•]/)[0].trim();
    }
  }

  if (!companyName) {
    const companyElem = document.querySelector(
      '[class*="company" i], [class*="employer" i], [data-testid*="company" i], .company-name, .org'
    );
    if (companyElem) {
      companyName = companyElem.innerText.trim();
    } else {
      // Extract from hostname e.g., careers.stripe.com -> Stripe
      try {
        const hostname = new URL(jobUrl).hostname.replace(/^www\.|careers\.|jobs\./, '');
        companyName = hostname.split('.')[0];
        if (companyName) {
          companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
        }
      } catch (e) {
        companyName = '';
      }
    }
  }

  if (!location) {
    const locElem = document.querySelector(
      '[class*="location" i], [class*="workplace" i], [data-testid*="location" i], .job-location'
    );
    if (locElem) {
      location = locElem.innerText.trim();
    } else {
      location = 'Remote / Unspecified';
    }
  }

  if (!jobDescription) {
    const descElem = document.querySelector(
      '[class*="description" i], [class*="job-details" i], #job-description, .content, main, article'
    );
    if (descElem) {
      jobDescription = descElem.innerText.substring(0, 5000).trim();
    }
  }

  return {
    jobTitle: jobTitle || 'Software Professional',
    companyName: companyName || 'Company',
    location: location || 'Remote',
    jobUrl,
    source,
    salary: salary || '',
    jobDescription: jobDescription || ''
  };
}

// Make available in content script environment
if (typeof window !== 'undefined') {
  window.parseGenericJob = parseGenericJob;
}
