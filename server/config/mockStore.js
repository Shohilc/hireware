import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, use /tmp for writable storage; locally use the config directory
const STORAGE_DIR = process.env.VERCEL ? '/tmp' : __dirname;
const JOBS_FILE = path.join(STORAGE_DIR, 'mockJobs.json');
const USERS_FILE = path.join(STORAGE_DIR, 'mockUsers.json');
const APPLICATIONS_FILE = path.join(STORAGE_DIR, 'mockApplications.json');

// Initial Mock Job database
const initialJobs = [
  {
    _id: 'mock-job-1',
    title: 'Senior React Developer',
    company: 'TechWave Solutions',
    location: 'Bangalore',
    type: 'Full-time',
    salary: { min: 1800000, max: 2500000, currency: 'INR', period: 'yearly' },
    description: 'Looking for a Senior React Developer with 5+ years of experience. Must have strong skills in React, Redux, Tailwind CSS, and TypeScript. Experience with Next.js is a plus.',
    requirements: [
      '5+ years of experience with React.js',
      'Strong proficiency in JavaScript and TypeScript',
      'Experience with state management (Redux, Zustand)',
      'Excellent styling skills using Tailwind CSS'
    ],
    tags: ['react', 'javascript', 'typescript', 'tailwind', 'redux'],
    source: 'naukri',
    sourceUrl: 'https://www.naukri.com/react-developer-jobs-in-bangalore',
    logo: null,
    postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isActive: true,
    views: 12,
    applicants: 4,
    slug: 'senior-react-developer-techwave-solutions-mock1',
    experience: '5-8 years',
    remote: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'mock-job-2',
    title: 'Full Stack Engineer (Node.js & React)',
    company: 'CloudScale Inc',
    location: 'Remote',
    type: 'Full-time',
    salary: { min: 1500000, max: 2000000, currency: 'INR', period: 'yearly' },
    description: 'We are hiring a Full Stack Developer to build scaling cloud web applications. You will be working with React on the frontend and Node.js/Express on the backend, deploying on AWS.',
    requirements: [
      '3+ years of experience with MERN stack',
      'Experience building and documenting REST APIs',
      'Familiarity with AWS (S3, EC2, RDS)',
      'Experience with MongoDB and PostgreSQL'
    ],
    tags: ['react', 'node', 'express', 'mongodb', 'aws', 'api'],
    source: 'indeed',
    sourceUrl: 'https://in.indeed.com/jobs?q=Full+Stack+Engineer&l=Remote',
    logo: null,
    postedAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true,
    views: 45,
    applicants: 15,
    slug: 'full-stack-engineer-node-react-cloudscale-mock2',
    experience: '3-6 years',
    remote: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'mock-job-3',
    title: 'Frontend Developer Intern',
    company: 'NextGen Labs',
    location: 'Hyderabad',
    type: 'Internship',
    salary: { min: 15000, max: 25000, currency: 'INR', period: 'monthly' },
    description: 'Great learning opportunity for freshers! Learn modern frontend development using React, Next.js, and Tailwind CSS. Work closely with senior developers on production features.',
    requirements: [
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with React is highly preferred',
      'Good communication and eager to learn',
      'Available for a 6-month full-time internship'
    ],
    tags: ['react', 'html', 'css', 'javascript', 'tailwind', 'next.js'],
    source: 'internshala',
    sourceUrl: 'https://internshala.com/jobs/frontend-developer-jobs-in-hyderabad',
    logo: null,
    postedAt: new Date().toISOString(),
    isActive: true,
    views: 5,
    applicants: 1,
    slug: 'frontend-developer-intern-nextgen-labs-mock3',
    experience: 'Fresher',
    remote: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'mock-job-4',
    title: 'DevOps & Cloud Engineer',
    company: 'Apex Systems',
    location: 'Pune',
    type: 'Full-time',
    salary: { min: 1200000, max: 1800000, currency: 'INR', period: 'yearly' },
    description: 'Apex Systems is looking for a DevOps engineer to automate our infrastructure pipelines. Experience with Docker, Kubernetes, Jenkins, and Terraform is required.',
    requirements: [
      'Experience with Docker containerization and Kubernetes orchestration',
      'Strong scripting skills (Bash, Python)',
      'CI/CD pipeline construction using Jenkins or GitHub Actions',
      'Infrastructure as Code using Terraform'
    ],
    tags: ['devops', 'aws', 'docker', 'kubernetes', 'ci/cd', 'python'],
    source: 'naukri',
    sourceUrl: 'https://www.naukri.com/devops-engineer-jobs-in-pune',
    logo: null,
    postedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    isActive: true,
    views: 8,
    applicants: 2,
    slug: 'devops-cloud-engineer-apex-systems-mock4',
    experience: '3-5 years',
    remote: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'mock-job-5',
    title: 'Data Scientist',
    company: 'Inference AI',
    location: 'Mumbai',
    type: 'Full-time',
    salary: { min: 2000000, max: 3000000, currency: 'INR', period: 'yearly' },
    description: 'Join our AI team to build recommendation engines and predictive analytics systems. Knowledge of Python, PyTorch, SQL, and data wrangling is essential.',
    requirements: [
      'Solid programming skills in Python (Pandas, NumPy, Scikit-Learn)',
      'Experience building and deployment ML models in production',
      'Strong background in statistics and probability',
      'Familiarity with NLP techniques is a plus'
    ],
    tags: ['python', 'ai', 'machine learning', 'data science', 'sql'],
    source: 'indeed',
    sourceUrl: 'https://in.indeed.com/jobs?q=Data+Scientist&l=Mumbai',
    logo: null,
    postedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    isActive: true,
    views: 18,
    applicants: 3,
    slug: 'data-scientist-inference-ai-mock5',
    experience: '2-4 years',
    remote: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed initial files if they do not exist
const initStore = async () => {
  if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(initialJobs, null, 2));
  }
  const users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) : [];
  const hasDemo = users.some((u) => u.email === 'demo@hirewave.com');
  const hasAdmin = users.some((u) => u.email === 'admin@hirewave.com');
  let updated = false;

  if (!hasDemo) {
    const hashedPassword = await bcrypt.hash('demo123', 12);
    users.push({
      _id: 'mock-user-demo',
      name: 'Demo User',
      email: 'demo@hirewave.com',
      password: hashedPassword,
      avatar: null,
      bookmarks: [],
      profile: {
        skills: ['React', 'Node.js', 'Express', 'MongoDB'],
        experience: '2 years',
        location: 'Bangalore, India',
        bio: 'Full stack developer exploring modern search and scraping pipelines.'
      },
      role: 'user',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    updated = true;
  }

  if (!hasAdmin) {
    const adminPassword = await bcrypt.hash('admin123', 12);
    users.push({
      _id: 'mock-user-admin',
      name: 'Admin User',
      email: 'admin@hirewave.com',
      password: adminPassword,
      avatar: null,
      bookmarks: [],
      profile: { skills: [], experience: '', location: '', resume: '', bio: '' },
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    updated = true;
  }

  if (updated || !fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([], null, 2));
  }
};

await initStore();

export const readJobs = () => {
  try {
    return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
  } catch {
    return [...initialJobs];
  }
};

export const writeJobs = (jobs) => {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
};

export const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

export const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const readApplications = () => {
  try {
    return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

export const writeApplications = (apps) => {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2));
};

// Compatibility getters for models
export const mockJobs = readJobs();
export const mockUsers = readUsers();

export const mockComparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

export const mockHashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};
