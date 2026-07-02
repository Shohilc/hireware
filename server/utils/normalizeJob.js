import { v4 as uuid } from 'uuid';
import slugify from 'slugify';

export function normalizeJob(raw) {
  let salaryStr = raw.salary;
  const descriptionText = raw.description || '';

  // If salary is missing or not disclosed, try extracting it from the job description
  if ((!salaryStr || salaryStr === 'Not Disclosed' || salaryStr.trim() === '') && descriptionText) {
    const extracted = extractSalaryFromDescription(descriptionText);
    if (extracted) {
      salaryStr = extracted;
    }
  }

  const baseJob = {
    title: raw.title?.trim() || 'Untitled Position',
    company: raw.company?.trim() || 'Unknown Company',
    location: raw.location?.trim() || 'India',
    type: inferJobType(raw),
    salary: parseSalary(salaryStr),
    description: descriptionText.trim(),
    requirements: raw.requirements || [],
    tags: extractTags(raw),
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    logo: raw.logo || null,
    postedAt: parseDate(raw.postedAt),
    remote: /remote/i.test(raw.location || '') || /remote/i.test(raw.title || ''),
    experience: raw.experience?.trim() || '',
    slug: slugify(
      `${raw.title}-${raw.company}-${uuid().slice(0, 6)}`,
      { lower: true, strict: true }
    ),
    isActive: true,
  };

  return fillMissingDetails(baseJob);
}

function inferJobType(raw) {
  if (raw.type) return raw.type;
  const text = `${raw.title} ${raw.description || ''}`.toLowerCase();
  if (/intern/i.test(text)) return 'Internship';
  if (/contract/i.test(text)) return 'Contract';
  if (/part[\s-]?time/i.test(text)) return 'Part-time';
  if (/remote/i.test(text)) return 'Remote';
  return 'Full-time';
}

function extractSalaryFromDescription(desc) {
  if (!desc || typeof desc !== 'string') return null;

  // Regex patterns to detect salary ranges in description
  const patterns = [
    // Lakhs/LPA range: e.g. "12 - 18 LPA", "8 to 12 Lakhs", "15-20lpa"
    {
      regex: /\b(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|lakhs?|lakh|Lakh)\b/i,
      multiplier: 100000,
      isUSD: false
    },
    // USD k range: e.g. "$80k - $120k", "60k to 90k USD"
    {
      regex: /(?:\$)?\s*(\d+(?:\.\d+)?)\s*k\s*(?:-|to)\s*(?:\$)?\s*(\d+(?:\.\d+)?)\s*k\b/i,
      multiplier: 1000,
      isUSD: true
    },
    // Currency range with contextual prefix: e.g. "Salary: Rs. 500,000 - 800,000", "Stipend: ₹15,000 - ₹20,000"
    {
      regex: /\b(?:salary|ctc|compensation|stipend|package)\b.*?(?:Rs\.?|₹|\$)\s*(\d+[\d,.]*)\s*(?:-|to)\s*(?:Rs\.?|₹|\$)?\s*(\d+[\d,.]*)\b/i,
      multiplier: 1,
      isUSD: false
    },
    // Generic currency hourly or monthly: e.g. "$50 - $75 per hour", "₹20,000 - ₹25,000 per month"
    {
      regex: /(?:\$|₹|\bRs\.?)\s*(\d+[\d,.]*)\s*(?:-|to)\s*(?:\$|₹|Rs\.?)?\s*(\d+[\d,.]*)\s*(?:per hour|\/hr|\/month|per month|yearly|per year|\/yr)\b/i,
      multiplier: 1,
      isUSD: false
    },
    // Simple numeric range with Lakhs/LPA: e.g. "offering 6 to 8 Lakhs"
    {
      regex: /\b(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|lakhs?)\b/i,
      multiplier: 100000,
      isUSD: false
    }
  ];

  for (const item of patterns) {
    const match = desc.match(item.regex);
    if (match) {
      const matchedStr = match[0];
      const isUSD = item.isUSD || /\$/i.test(matchedStr) || /usd/i.test(matchedStr);
      const isHourly = /hour|hr/i.test(matchedStr);
      const isMonthly = /stipend|month/i.test(matchedStr) || /stipend/i.test(desc.slice(Math.max(0, match.index - 50), match.index + 50));
      
      let min = parseFloat(match[1].replace(/,/g, '')) * item.multiplier;
      let max = parseFloat(match[2].replace(/,/g, '')) * item.multiplier;

      // Handle raw lakhs value checks if not pre-multiplied
      if (item.multiplier === 1 && !isHourly && !isMonthly) {
        if (min < 200) {
          min *= 100000;
          max *= 100000;
        }
      }

      let suffix = '';
      if (isHourly) suffix = ' per hour';
      else if (isMonthly) suffix = ' per month';

      const prefix = isUSD ? '$' : '₹';
      return `${prefix}${min} - ${prefix}${max}${suffix}`;
    }
  }
  return null;
}

function parseSalary(str) {
  if (!str || typeof str !== 'string') return {};
  const nums = str.match(/[\d,.]+/g)?.map((n) => parseFloat(n.replace(/,/g, ''))) || [];
  if (nums.length === 0) return {};

  const isHourly = /hour|hr/i.test(str);
  const isMonthly = /month|pm/i.test(str);

  // Detect if values are in LPA format (< 200 likely means lakhs)
  let min = nums[0];
  let max = nums[1] || nums[0];
  if (min < 200 && !isHourly && !isMonthly) {
    min *= 100000;
    max *= 100000;
  }

  return {
    min,
    max,
    currency: /\$|usd/i.test(str) ? 'USD' : 'INR',
    period: isHourly ? 'hourly' : (isMonthly ? 'monthly' : 'yearly'),
  };
}

function parseDate(str) {
  if (!str) return new Date();
  if (/just now|today|few hours/i.test(str)) return new Date();
  const daysMatch = str.match(/(\d+)\s*day/i);
  if (daysMatch) {
    return new Date(Date.now() - parseInt(daysMatch[1]) * 86400000);
  }
  const hoursMatch = str.match(/(\d+)\s*hour/i);
  if (hoursMatch) {
    return new Date(Date.now() - parseInt(hoursMatch[1]) * 3600000);
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function extractTags(raw) {
  const tags = new Set();
  const text = `${raw.title} ${raw.description || ''}`.toLowerCase();

  const techKeywords = [
    'react', 'node', 'python', 'java', 'javascript', 'typescript',
    'angular', 'vue', 'django', 'flask', 'spring', 'aws', 'docker',
    'kubernetes', 'mongodb', 'postgresql', 'mysql', 'redis', 'graphql',
    'rest', 'api', 'machine learning', 'ai', 'data science', 'devops',
    'ci/cd', 'agile', 'scrum', 'figma', 'ui/ux', 'html', 'css',
    'tailwind', 'next.js', 'express', 'golang', 'rust', 'swift',
    'kotlin', 'flutter', 'react native', '.net', 'c#', 'php', 'laravel',
  ];

  techKeywords.forEach((kw) => {
    if (text.includes(kw)) tags.add(kw);
  });

  return Array.from(tags).slice(0, 10);
}

export function fillMissingDetails(job) {
  if (!job) return job;

  const title = job.title || 'Software Engineer';
  const description = job.description || '';
  const requirements = job.requirements || [];

  if (description.trim() && requirements.length > 0) {
    return job;
  }

  const tags = job.tags || [];
  const tagsText = tags.join(' ').toLowerCase() + ' ' + title.toLowerCase();

  let generatedDesc = '';
  let generatedReqs = [];

  if (/full[\s-]?stack/i.test(title) || /fullstack/i.test(title)) {
    generatedDesc = "We are seeking a versatile Full Stack Developer to bridge frontend user interfaces with backend databases and services. In this role, you will design end-to-end applications, implement secure and performant APIs, and ensure overall usability, scalability, and responsive designs.";
    generatedReqs = [
      "Experience with modern full-stack web architectures (e.g. React/Node, MERN, or similar frameworks).",
      "Familiarity with building client-side SPAs and database schema modeling (SQL or NoSQL).",
      "Knowledge of backend RESTful API development and security best practices.",
      "Competency in version control systems (Git) and automated deployment workflows."
    ];
  } else if (/frontend|react|angular|vue|ui|web developer|designer/i.test(tagsText)) {
    generatedDesc = "We are looking for a skilled Frontend Engineer to join our product development team. You will be responsible for creating high-quality web interfaces, optimizing user experiences, and translating design wireframes into clean, performant, and responsive front-end components.";
    generatedReqs = [
      "Proficiency in modern JavaScript/TypeScript and frameworks (especially React.js, Angular, or Vue).",
      "Solid understanding of HTML5, CSS3, responsive layout patterns, and modern style sheets (e.g., Tailwind CSS).",
      "Experience with build tools, package managers, and integrating client applications with REST APIs.",
      "Strong debugging abilities, performance tuning, and cross-browser compatibility testing."
    ];
  } else if (/backend|node|java|python|django|go|golang|php|c#/i.test(tagsText)) {
    generatedDesc = "We are looking for a Backend Developer to engineer and optimize server-side architectures, handle databases, and build scalable APIs. You will collaborate with front-end engineers to deliver end-to-end integrations and robust systems.";
    generatedReqs = [
      "Strong backend development experience using Node.js, Express, Python/Django, Java, or Go.",
      "Proficiency in database technologies (MongoDB, PostgreSQL, MySQL) and query optimization.",
      "Familiarity with design patterns, microservices architectures, and API security (JWT, OAuth).",
      "Familiarity with server deployment, containerization (Docker), and cloud services (AWS, GCP)."
    ];
  } else if (/devops|cloud|aws|kubernetes|docker|sre/i.test(tagsText)) {
    generatedDesc = "We are looking for a DevOps Engineer to manage, scale, and maintain our cloud infrastructure and deployment pipelines. You will focus on high availability, security, and automated continuous delivery (CI/CD) workflows.";
    generatedReqs = [
      "Hands-on experience with cloud providers (AWS, Google Cloud, or Microsoft Azure).",
      "Strong knowledge of containerization (Docker) and orchestration tools (Kubernetes).",
      "Experience writing Infrastructure as Code (Terraform) and setting up CI/CD automation pipelines.",
      "Solid system administration, networking, and scripting skills (Bash, Python, or Go)."
    ];
  } else if (/ai|ml|machine|learning|data|science|python|model/i.test(tagsText)) {
    generatedDesc = "We are seeking a Data Scientist / ML Engineer to design, train, and deploy predictive models and data architectures. You will transform complex data inputs into actionable insights, helping drive smart product intelligence.";
    generatedReqs = [
      "Proficiency in Python and machine learning libraries (TensorFlow, PyTorch, Scikit-learn, Pandas).",
      "Experience with data preprocessing, statistical analysis, and model optimization/evaluation.",
      "Familiarity with database technologies (SQL, NoSQL) and big data pipelines.",
      "Knowledge of containerizing models and deploying them in cloud environment endpoints."
    ];
  } else if (/cyber|security|pentest|network/i.test(tagsText)) {
    generatedDesc = "We are hiring a Cybersecurity Analyst to protect our network assets, perform vulnerability assessments, and secure codebases against threats. You will ensure compliance and design robust defensive measures.";
    generatedReqs = [
      "Knowledge of web application security principles, OWASP Top 10, and penetration testing methodologies.",
      "Familiarity with network protocols, firewalls, and security information event logging tools.",
      "Understanding of cryptography, access control, and identity management protocols.",
      "Relevant security certifications (Security+, CEH, or CISSP) are highly valued."
    ];
  } else {
    generatedDesc = `We are seeking a talented ${title} to join our organization. You will collaborate with cross-functional teams to execute project goals, implement high-quality solutions, and drive successful project outcomes in a fast-paced environment.`;
    generatedReqs = [
      `Strong professional experience and domain knowledge matching the ${title} role.`,
      "Excellent analytical thinking, structured design skills, and critical problem-solving.",
      "Effective communication skills and collaborative team spirit.",
      "Proven track record of taking ownership, learning new technologies, and delivering results."
    ];
  }

  return {
    ...job,
    description: description.trim() || generatedDesc,
    requirements: (requirements && requirements.length > 0) ? requirements : generatedReqs,
  };
}
