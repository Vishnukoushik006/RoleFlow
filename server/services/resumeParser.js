const fs = require('fs');
const path = require('path');

const TECH_SKILLS_DICTIONARY = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'SQL', 'HTML', 'CSS', 'Sass',
  // Frontend
  'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'Redux', 'Zustand', 'TailwindCSS', 'Bootstrap', 'Material-UI', 'Webpack', 'Vite',
  // Backend
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails', 'ASP.NET', 'Laravel', 'GraphQL', 'REST API', 'gRPC', 'WebSockets',
  // Databases & Caching
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'Supabase', 'Firebase', 'Prisma', 'Mongoose',
  // DevOps & Cloud
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 'Linux', 'Nginx',
  // AI, Data & ML
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'OpenAI', 'LangChain', 'NLP', 'Computer Vision', 'LLM',
  // Architecture & Concepts
  'Microservices', 'System Design', 'Agile', 'Scrum', 'TDD', 'CI/CD', 'Git', 'OOP', 'Data Structures', 'Algorithms'
];

/**
 * Extracts recognized technical skills from raw text
 */
const extractSkillsFromText = (text) => {
  if (!text || typeof text !== 'string') return [];
  const lowerText = text.toLowerCase();
  const matched = new Set();

  for (const skill of TECH_SKILLS_DICTIONARY) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Word boundary check
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(text)) {
      matched.add(skill);
    }
  }

  return Array.from(matched);
};

/**
 * Basic text extraction from file (supports txt/utf8 and extracts plain strings from buffers)
 */
const extractTextFromFile = (filePath, mimeType) => {
  try {
    if (!fs.existsSync(filePath)) return '';
    const buffer = fs.readFileSync(filePath);

    if (mimeType === 'text/plain') {
      return buffer.toString('utf8');
    }

    // Extract ASCII/UTF-8 readable string chunks from PDF / binary buffers
    const rawString = buffer.toString('binary');
    const cleanChunks = rawString
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ');

    return cleanChunks.substring(0, 50000);
  } catch (error) {
    console.error('Error reading file for text extraction:', error.message);
    return '';
  }
};

module.exports = {
  TECH_SKILLS_DICTIONARY,
  extractSkillsFromText,
  extractTextFromFile
};
