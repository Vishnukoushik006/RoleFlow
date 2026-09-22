const { extractSkillsFromText } = require('./resumeParser');

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
    frameworks: skills.filter(s => ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot', 'TailwindCSS'].includes(s)),
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
  const combinedJDSkills = jdSkills.length > 0 ? jdSkills : extractSkillsFromText(jdText);
  const combinedResumeSkills = resumeSkills.length > 0 ? resumeSkills : extractSkillsFromText(resumeText);

  const matchedSkills = [];
  const missingSkills = [];

  const resumeSkillsLower = new Set(combinedResumeSkills.map(s => s.toLowerCase()));
  const resumeTextLower = resumeText.toLowerCase();

  combinedJDSkills.forEach(skill => {
    const sLower = skill.toLowerCase();
    if (resumeSkillsLower.has(sLower) || resumeTextLower.includes(sLower)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalRequired = combinedJDSkills.length || 1;
  const matchPercentage = Math.min(100, Math.round((matchedSkills.length / totalRequired) * 100));

  // Extract keywords
  const jdWords = jdText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freqMap = {};
  jdWords.forEach(w => { freqMap[w] = (freqMap[w] || 0) + 1; });
  const topKeywords = Object.entries(freqMap)
    .filter(([word]) => !['with', 'that', 'this', 'from', 'have', 'will', 'your', 'about', 'team', 'work'].includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  const keywordsFound = topKeywords.filter(k => resumeTextLower.includes(k));
  const keywordsNotFound = topKeywords.filter(k => !resumeTextLower.includes(k));

  return {
    matchPercentage,
    matchingSkills: Array.from(new Set(matchedSkills)),
    missingSkills: Array.from(new Set(missingSkills)),
    totalJobSkills: combinedJDSkills.length,
    keywordsFound,
    keywordsNotFound,
    recommendations: [
      missingSkills.length > 0 
        ? `Consider highlighting hands-on projects or coursework involving: ${missingSkills.slice(0, 3).join(', ')}.`
        : 'Strong alignment with listed requirements.',
      `Incorporate top keywords like "${keywordsNotFound.slice(0, 3).join('", "') || 'domain concepts'}" into your bullet points.`,
      'Quantify your accomplishments (e.g. % performance increase, latency reduced, users impacted).'
    ]
  };
};

/**
 * Main AI Service Entry points
 */
const parseJobDescription = async (jdText) => {
  // If GEMINI_API_KEY is configured in env, we can invoke Google Gemini
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
