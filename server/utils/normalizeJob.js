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

  return {
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
