import { v4 as uuid } from 'uuid';
import slugify from 'slugify';

export function normalizeJob(raw) {
  return {
    title: raw.title?.trim() || 'Untitled Position',
    company: raw.company?.trim() || 'Unknown Company',
    location: raw.location?.trim() || 'India',
    type: inferJobType(raw),
    salary: parseSalary(raw.salary),
    description: raw.description?.trim() || '',
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

function parseSalary(str) {
  if (!str || typeof str !== 'string') return {};
  const nums = str.match(/[\d,.]+/g)?.map((n) => parseFloat(n.replace(/,/g, ''))) || [];
  if (nums.length === 0) return {};

  // Detect if values are in LPA format (< 200 likely means lakhs)
  let min = nums[0];
  let max = nums[1] || nums[0];
  if (min < 200) {
    min *= 100000;
    max *= 100000;
  }

  return {
    min,
    max,
    currency: /\$|usd/i.test(str) ? 'USD' : 'INR',
    period: /month|pm|per month/i.test(str) ? 'monthly' : 'yearly',
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
