const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

/**
 * Structured Skill Pattern Definitions
 * Each skill has a canonical name and a tailored regex pattern to avoid false positives.
 */
const SKILL_DEFINITIONS = [
  // --- Programming Languages ---
  { name: 'Java', regex: /\bJava\b(?!\s*Script)/i },
  { name: 'JavaScript', regex: /\b(JavaScript|JS|ECMAScript|ES6\+?)\b/i },
  { name: 'TypeScript', regex: /\b(TypeScript|TS)\b/i },
  { name: 'Python', regex: /\bPython\b/i },
  { name: 'C++', regex: /\b(C\+\+|CPP)\b/i },
  { name: 'C#', regex: /\b(C#|C-sharp)\b/i },
  { name: 'C', regex: /\bC\b(?![+#a-zA-Z0-9])/ }, // Case-sensitive single letter C
  { name: 'Go', regex: /\b(Golang|Go\s+lang|Go\s*\(language\))\b/i },
  { name: 'Rust', regex: /\bRust\b/ },
  { name: 'Ruby', regex: /\bRuby\b/i },
  { name: 'PHP', regex: /\bPHP\b/i },
  { name: 'Swift', regex: /\bSwift\b/i },
  { name: 'Kotlin', regex: /\bKotlin\b/i },
  { name: 'Dart', regex: /\bDart\b/i },
  { name: 'Scala', regex: /\bScala\b/i },
  { name: 'R', regex: /\b(R\s+programming|R\s+language|\bR\b(?=\s*[,;/]|\s+(and|or|programming|studio)))\b/ },
  { name: 'SQL', regex: /\bSQL\b/i },
  { name: 'HTML', regex: /\bHTML5?\b/i },
  { name: 'CSS', regex: /\bCSS3?\b/i },
  { name: 'Sass', regex: /\b(Sass|SCSS)\b/i },
  { name: 'Bash / Shell', regex: /\b(Bash|Shell\s*Scripting|Zsh)\b/i },

  // --- Frontend Frameworks & Libraries ---
  { name: 'React', regex: /\b(React|React\.js|ReactJS)\b/i },
  { name: 'React Native', regex: /\bReact\s*Native\b/i },
  { name: 'Next.js', regex: /\b(Next\.js|NextJS|Next)\b/i },
  { name: 'Vue.js', regex: /\b(Vue|Vue\.js|VueJS)\b/i },
  { name: 'Angular', regex: /\b(Angular|AngularJS)\b/i },
  { name: 'Svelte', regex: /\b(Svelte|SvelteKit)\b/i },
  { name: 'Redux', regex: /\b(Redux|Redux\s*Toolkit)\b/i },
  { name: 'Zustand', regex: /\bZustand\b/i },
  { name: 'TailwindCSS', regex: /\b(Tailwind|TailwindCSS)\b/i },
  { name: 'Bootstrap', regex: /\bBootstrap\b/i },
  { name: 'Material-UI', regex: /\b(Material-UI|MUI)\b/i },
  { name: 'Vite', regex: /\bVite\b/i },
  { name: 'Webpack', regex: /\bWebpack\b/i },

  // --- Backend Frameworks & Runtimes ---
  { name: 'Node.js', regex: /\b(Node\.js|NodeJS|Node)\b/i },
  { name: 'Express', regex: /\b(Express|Express\.js|ExpressJS)\b/i },
  { name: 'NestJS', regex: /\b(NestJS|Nest\.js)\b/i },
  { name: 'Spring Boot', regex: /\b(Spring\s*Boot|Spring\s*Framework|Spring\s*MVC|Spring)\b/i },
  { name: 'Hibernate', regex: /\b(Hibernate|JPA)\b/i },
  { name: 'Django', regex: /\bDjango\b/i },
  { name: 'Flask', regex: /\bFlask\b/i },
  { name: 'FastAPI', regex: /\bFastAPI\b/i },
  { name: 'Ruby on Rails', regex: /\b(Ruby\s+on\s+Rails|Rails)\b/i },
  { name: 'ASP.NET', regex: /\b(ASP\.NET|\.NET\s*Core|\.NET)\b/i },
  { name: 'Laravel', regex: /\bLaravel\b/i },

  // --- APIs, Networking & Messaging ---
  { name: 'REST API', regex: /\b(REST\s*APIs?|RESTful(\s*APIs?)?|REST)\b/i },
  { name: 'GraphQL', regex: /\bGraphQL\b/i },
  { name: 'gRPC', regex: /\bgRPC\b/i },
  { name: 'WebSockets', regex: /\b(WebSockets?|Socket\.io)\b/i },
  { name: 'Kafka', regex: /\b(Apache\s*Kafka|Kafka)\b/i },
  { name: 'RabbitMQ', regex: /\bRabbitMQ\b/i },

  // --- Databases & ORMs ---
  { name: 'MongoDB', regex: /\b(MongoDB|Mongo)\b/i },
  { name: 'PostgreSQL', regex: /\b(PostgreSQL|Postgres)\b/i },
  { name: 'MySQL', regex: /\bMySQL\b/i },
  { name: 'SQLite', regex: /\bSQLite\b/i },
  { name: 'Redis', regex: /\bRedis\b/i },
  { name: 'Elasticsearch', regex: /\bElasticsearch\b/i },
  { name: 'DynamoDB', regex: /\bDynamoDB\b/i },
  { name: 'Cassandra', regex: /\bCassandra\b/i },
  { name: 'Oracle DB', regex: /\bOracle\s*(Database|DB)?\b/i },
  { name: 'Supabase', regex: /\bSupabase\b/i },
  { name: 'Firebase', regex: /\b(Firebase|Firestore)\b/i },
  { name: 'Prisma', regex: /\bPrisma\b/i },
  { name: 'Mongoose', regex: /\bMongoose\b/i },

  // --- DevOps, Cloud & Tools ---
  { name: 'AWS', regex: /\b(AWS|Amazon\s*Web\s*Services)\b/i },
  { name: 'Azure', regex: /\b(Microsoft\s*Azure|Azure)\b/i },
  { name: 'Google Cloud', regex: /\b(Google\s*Cloud(\s*Platform)?|GCP)\b/i },
  { name: 'Docker', regex: /\bDocker\b/i },
  { name: 'Kubernetes', regex: /\b(Kubernetes|K8s)\b/i },
  { name: 'CI/CD', regex: /\b(CI[\s/-]*CD|Continuous\s*Integration)\b/i },
  { name: 'GitHub Actions', regex: /\bGitHub\s*Actions\b/i },
  { name: 'Jenkins', regex: /\bJenkins\b/i },
  { name: 'Terraform', regex: /\bTerraform\b/i },
  { name: 'Linux', regex: /\b(Linux|Ubuntu|Debian|CentOS)\b/i },
  { name: 'Nginx', regex: /\bNginx\b/i },
  { name: 'Git', regex: /\b(Git|GitHub|GitLab|Bitbucket)\b/i },

  // --- AI, ML & Data Science ---
  { name: 'Machine Learning', regex: /\b(Machine\s*Learning|ML)\b/i },
  { name: 'Deep Learning', regex: /\bDeep\s*Learning\b/i },
  { name: 'PyTorch', regex: /\bPyTorch\b/i },
  { name: 'TensorFlow', regex: /\b(TensorFlow|Keras)\b/i },
  { name: 'Scikit-learn', regex: /\b(Scikit[\s-]*learn|Sklearn)\b/i },
  { name: 'Pandas', regex: /\bPandas\b/i },
  { name: 'NumPy', regex: /\bNumPy\b/i },
  { name: 'OpenCV', regex: /\bOpenCV\b/i },
  { name: 'NLP', regex: /\b(NLP|Natural\s*Language\s*Processing)\b/i },
  { name: 'Computer Vision', regex: /\bComputer\s*Vision\b/i },
  { name: 'LLM', regex: /\b(LLMs?|Large\s*Language\s*Models?)\b/i },
  { name: 'LangChain', regex: /\bLangChain\b/i },

  // --- CS Foundations & Stacks ---
  { name: 'Data Structures & Algorithms', regex: /\b(Data\s*Structures(\s*and|&)?\s*Algorithms|DSA|Data\s*Structures|Algorithms)\b/i },
  { name: 'System Design', regex: /\bSystem\s*Design\b/i },
  { name: 'Microservices', regex: /\bMicroservices?\b/i },
  { name: 'OOP', regex: /\b(Object[\s-]*Oriented(\s*Programming)?|OOP)\b/i },
  { name: 'Agile', regex: /\b(Agile|Scrum)\b/i },
  { name: 'MERN Stack', regex: /\bMERN(\s*Stack)?\b/i },
  { name: 'Full Stack Development', regex: /\bFull[\s-]*Stack(\s*Development|\s*Developer|\s*Web)?\b/i }
];

const TECH_SKILLS_DICTIONARY = SKILL_DEFINITIONS.map(s => s.name);

/**
 * Extracts recognized technical skills from raw text using precise regex patterns
 */
const extractSkillsFromText = (text) => {
  if (!text || typeof text !== 'string') return [];
  const matched = new Set();

  for (const def of SKILL_DEFINITIONS) {
    if (def.regex.test(text)) {
      matched.add(def.name);
    }
  }

  return Array.from(matched);
};

/**
 * Robust async text extraction from file (supports PDF, DOCX, TXT)
 */
const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (!fs.existsSync(filePath)) return '';

    // 1. Plain Text files
    if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
      return fs.readFileSync(filePath, 'utf8');
    }

    // 2. Word (.docx) files via mammoth
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filePath.endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        if (result && result.value && result.value.trim().length > 0) {
          return result.value;
        }
      } catch (err) {
        console.warn('Mammoth docx extraction warning:', err.message);
      }
    }

    // 3. PDF files via pdf-parse
    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      try {
        const pdfModule = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);

        // Handle pdf-parse v2 class structure
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: buffer });
          const parsed = await parser.getText();
          if (parser.destroy) await parser.destroy();
          if (parsed && parsed.text && parsed.text.trim().length > 0) {
            return parsed.text;
          }
        } else if (typeof pdfModule === 'function') {
          // Classic pdf-parse v1
          const data = await pdfModule(buffer);
          if (data && data.text && data.text.trim().length > 0) {
            return data.text;
          }
        }
      } catch (pdfErr) {
        console.warn('PDF parser warning:', pdfErr.message);
      }
    }

    // Fallback: Read as utf-8 or clean text buffer
    const buffer = fs.readFileSync(filePath);
    const rawString = buffer.toString('utf8');
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
  SKILL_DEFINITIONS,
  extractSkillsFromText,
  extractTextFromFile
};
