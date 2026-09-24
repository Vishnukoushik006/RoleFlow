const { extractSkillsFromText } = require('./resumeParser');

/**
 * Common skill alias groups for accurate fuzzy & semantic matching
 */
const SKILL_ALIAS_GROUPS = [
  ['java', 'core java', 'java se', 'java ee', 'j2ee'],
  ['javascript', 'js', 'ecmascript', 'es6', 'es6+'],
  ['typescript', 'ts'],
  ['python', 'python3', 'py'],
  ['react', 'react.js', 'reactjs'],
  ['react native', 'react-native'],
  ['next.js', 'nextjs', 'next'],
  ['vue.js', 'vue', 'vuejs'],
  ['angular', 'angularjs'],
  ['node.js', 'nodejs', 'node'],
  ['express', 'express.js', 'expressjs'],
  ['spring boot', 'springboot', 'spring framework', 'spring mvc', 'spring'],
  ['hibernate', 'jpa'],
  ['postgresql', 'postgres', 'psql'],
  ['mongodb', 'mongo'],
  ['mysql', 'my sql'],
  ['sql', 'relational database', 'rdbms'],
  ['redis', 'in-memory cache'],
  ['rest api', 'rest apis', 'restful', 'restful api', 'restful apis', 'rest'],
  ['graphql'],
  ['docker', 'containerization'],
  ['kubernetes', 'k8s'],
  ['aws', 'amazon web services'],
  ['gcp', 'google cloud', 'google cloud platform'],
  ['azure', 'microsoft azure'],
  ['git', 'github', 'gitlab', 'version control'],
  ['scikit-learn', 'sklearn', 'scikit learn'],
  ['machine learning', 'ml', 'statistical modeling'],
  ['deep learning', 'dl', 'neural networks'],
  ['data structures & algorithms', 'data structures and algorithms', 'data structures', 'algorithms', 'dsa'],
  ['mern stack', 'mern'],
  ['tailwind', 'tailwindcss'],
  ['html', 'html5'],
  ['css', 'css3', 'sass', 'scss'],
  ['c++', 'cpp'],
  ['c#', 'csharp', 'c-sharp'],
  ['golang', 'go', 'go language']
];

/**
 * Helper to check if two skill names match or are aliases
 */
const areSkillsEquivalent = (skillA, skillB) => {
  if (!skillA || !skillB) return false;
  const a = skillA.toLowerCase().trim();
  const b = skillB.toLowerCase().trim();

  if (a === b) return true;

  // Check alias groups
  for (const group of SKILL_ALIAS_GROUPS) {
    const hasA = group.some(item => a === item || a.includes(item) || item.includes(a));
    const hasB = group.some(item => b === item || b.includes(item) || item.includes(b));
    if (hasA && hasB) return true;
  }

  // Check substring containment if long enough
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) {
    return true;
  }

  return false;
};

/**
 * Intelligent Fallback Heuristic JD Parser
 */
const parseJobDescriptionFallback = (jdText) => {
  if (!jdText) return {};

  const skills = extractSkillsFromText(jdText);
  const lower = jdText.toLowerCase();

  // Extract Experience Requirements
  let experience = 'Not specified';
  const expMatch = jdText.match(/(\d+[\s-+]+(?:to|\-)?\s*\d*\+?\s*(?:years|yrs|year)(?:\s+of\s+experience)?)/i);
  if (expMatch) {
    experience = expMatch[1].trim();
  } else if (lower.includes('entry level') || lower.includes('intern') || lower.includes('graduate')) {
    experience = 'Entry Level / 0-1 Years';
  } else if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) {
    experience = 'Senior (5+ Years)';
  }

  // Extract Education
  let education = 'Bachelor’s degree in Computer Science or related field (or equivalent practical experience)';
  if (lower.includes('master') || lower.includes('phd') || lower.includes('doctorate')) {
    education = 'Master’s or PhD in Computer Science, Engineering, or related technical field';
  } else if (lower.includes('bachelor') || lower.includes('b.tech') || lower.includes('b.e.') || lower.includes('bs')) {
    education = 'Bachelor’s in CS / IT / Engineering or equivalent';
  }

  // Extract Job Type
  let jobType = 'Full-time';
  if (lower.includes('internship') || lower.includes('intern')) jobType = 'Internship';
  else if (lower.includes('contract')) jobType = 'Contract';
  else if (lower.includes('part-time')) jobType = 'Part-time';

  // Extract Location / Workplace
  let workplaceType = 'On-site';
  if (lower.includes('remote') || lower.includes('work from home')) workplaceType = 'Remote';
  else if (lower.includes('hybrid')) workplaceType = 'Hybrid';

  // Extract Key Responsibilities bullet points
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const responsibilities = [];
  let capturingResp = false;

  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (lLower.includes('responsibilities') || lLower.includes('what you will do') || lLower.includes('role description') || lLower.includes('duties')) {
      capturingResp = true;
      continue;
    }
    if (capturingResp) {
      if (lLower.includes('requirements') || lLower.includes('qualifications') || lLower.includes('what we look for') || lLower.includes('skills')) {
        capturingResp = false;
        break;
      }
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
        responsibilities.push(line.replace(/^[•\-*\d.]\s*/, ''));
      }
    }
  }

  if (responsibilities.length === 0) {
    responsibilities.push(
      'Design, build, test, and maintain robust, scalable applications and services.',
      'Collaborate with cross-functional engineering, product, and design teams to ship quality features.',
      'Write clean, maintainable, and well-tested code following best engineering practices.'
    );
  }

  return {
    skills,
    programmingLanguages: skills.filter(s => ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL'].includes(s)),
    frameworks: skills.filter(s => ['React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot', 'TailwindCSS'].includes(s)),
    experienceRequirements: experience,
    educationRequirements: education,
    workplaceType,
    jobType,
    responsibilities: responsibilities.slice(0, 6)
  };
};

/**
 * Intelligent Fallback JD Summarizer
 */
const summarizeJobDescriptionFallback = (jdText) => {
  const parsed = parseJobDescriptionFallback(jdText);
  const words = jdText.split(/\s+/).slice(0, 75).join(' ');

  return {
    shortSummary: `${words}... The role focuses on delivering high-impact engineering solutions while working with technologies like ${parsed.skills.slice(0, 4).join(', ') || 'modern stacks'}.`,
    keyResponsibilities: parsed.responsibilities,
    importantSkills: parsed.skills.slice(0, 8),
    experienceRequired: parsed.experienceRequirements,
    educationRequired: parsed.educationRequirements
  };
};

/**
 * Resume to Job Matching Analysis
 */
const matchResumeWithJob = async (resumeSkills = [], resumeText = '', jdSkills = [], jdText = '') => {
  const extractedFromJD = jdText ? extractSkillsFromText(jdText) : [];
  const combinedJDSkills = Array.from(new Set([...(jdSkills || []), ...extractedFromJD]));

  const extractedFromResume = resumeText ? extractSkillsFromText(resumeText) : [];
  const combinedResumeSkills = Array.from(new Set([...(resumeSkills || []), ...extractedFromResume]));

  const matchedSkills = [];
  const missingSkills = [];

  const resumeTextLower = (resumeText || '').toLowerCase();

  // If no specific skills were parsed for JD, default to generic CS stack comparison
  const targetJDSkills = combinedJDSkills.length > 0 ? combinedJDSkills : ['Java', 'SQL', 'Data Structures & Algorithms', 'REST API', 'Git'];

  targetJDSkills.forEach(skill => {
    const sLower = skill.toLowerCase();
    
    // 1. Direct or alias match with resumeSkills
    const hasSkillMatch = combinedResumeSkills.some(rSkill => areSkillsEquivalent(skill, rSkill));

    // 2. Direct presence in resumeText
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const inText = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i').test(resumeTextLower);

    if (hasSkillMatch || inText) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalRequired = targetJDSkills.length || 1;
  const matchPercentage = Math.min(100, Math.round((matchedSkills.length / totalRequired) * 100));

  // Extract top keywords from JD
  const jdWords = (jdText || '').toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freqMap = {};
  jdWords.forEach(w => { freqMap[w] = (freqMap[w] || 0) + 1; });
  const topKeywords = Object.entries(freqMap)
    .filter(([word]) => !['with', 'that', 'this', 'from', 'have', 'will', 'your', 'about', 'team', 'work', 'experience', 'looking', 'build'].includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);

  const keywordsFound = topKeywords.filter(k => resumeTextLower.includes(k));
  const keywordsNotFound = topKeywords.filter(k => !resumeTextLower.includes(k));

  return {
    matchPercentage,
    matchingSkills: Array.from(new Set(matchedSkills)),
    missingSkills: Array.from(new Set(missingSkills)),
    totalJobSkills: targetJDSkills.length,
    keywordsFound,
    keywordsNotFound,
    recommendations: [
      missingSkills.length > 0 
        ? `Consider highlighting hands-on projects, coursework, or certifications in: ${missingSkills.slice(0, 3).join(', ')}.`
        : 'Strong alignment with the core technical requirements for this role.',
      keywordsNotFound.length > 0
        ? `Incorporate domain keywords like "${keywordsNotFound.slice(0, 3).join('", "')}" into your project descriptions.`
        : 'Resume contains great domain keyword density.',
      'Quantify your accomplishments (e.g., % latency reduction, query optimization, user base scaled).'
    ]
  };
};

/**
 * Main AI Service Entry points
 */
const parseJobDescription = async (jdText) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert technical recruiter. Analyze the following Job Description and return ONLY valid JSON with keys: skills (array of strings), programmingLanguages (array), frameworks (array), experienceRequirements (string), educationRequirements (string), workplaceType (Remote/Hybrid/Onsite), jobType (Full-time/Part-time/Contract/Internship), responsibilities (array of 4-6 concise bullet points). Job Description:\n${jdText}`
            }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await response.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent NLP fallback:', err.message);
    }
  }
  return parseJobDescriptionFallback(jdText);
};

const summarizeJobDescription = async (jdText) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Summarize this job description. Return JSON with keys: shortSummary (concise 2-3 sentence overview), keyResponsibilities (array), importantSkills (array), experienceRequired (string), educationRequired (string).\n\nJob Description:\n${jdText}`
            }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await response.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent NLP fallback:', err.message);
    }
  }
  return summarizeJobDescriptionFallback(jdText);
};

module.exports = {
  parseJobDescription,
  summarizeJobDescription,
  matchResumeWithJob
};
