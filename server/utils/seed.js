import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import connectDB from '../config/db.js';
import { normalizeJob } from './normalizeJob.js';

dotenv.config();

const mockRawJobs = [
  {
    title: 'Senior React Developer',
    company: 'TechWave Solutions',
    location: 'Bangalore',
    salary: '18 - 25 LPA',
    description: 'Looking for a Senior React Developer with 5+ years of experience. Must have strong skills in React, Redux, Tailwind CSS, and TypeScript. Experience with Next.js is a plus.',
    requirements: [
      '5+ years of experience with React.js',
      'Strong proficiency in JavaScript and TypeScript',
      'Experience with state management (Redux, Zustand)',
      'Excellent styling skills using Tailwind CSS or CSS Modules'
    ],
    experience: '5-8 years',
    source: 'naukri',
    sourceUrl: 'https://www.naukri.com/job-listings-senior-react-developer-techwave-solutions-bangalore-5-to-8-years',
    type: 'Full-time',
    remote: false,
    postedAt: '2 days ago'
  },
  {
    title: 'Full Stack Engineer (Node.js & React)',
    company: 'CloudScale Inc',
    location: 'Remote',
    salary: '15 - 20 LPA',
    description: 'We are hiring a Full Stack Developer to build scaling cloud web applications. You will be working with React on the frontend and Node.js/Express on the backend, deploying on AWS.',
    requirements: [
      '3+ years of experience with MERN stack',
      'Experience building and documenting REST APIs',
      'Familiarity with AWS (S3, EC2, RDS)',
      'Experience with MongoDB and PostgreSQL'
    ],
    experience: '3-6 years',
    source: 'indeed',
    sourceUrl: 'https://in.indeed.com/viewjob?jk=full-stack-engineer-cloudscale-remote',
    type: 'Full-time',
    remote: true,
    postedAt: 'Just now'
  },
  {
    title: 'Frontend Developer Intern',
    company: 'NextGen Labs',
    location: 'Hyderabad',
    salary: '15000 - 25000 per month',
    description: 'Great learning opportunity for freshers! Learn modern frontend development using React, Next.js, and Tailwind CSS. Work closely with senior developers on production features.',
    requirements: [
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with React is highly preferred',
      'Good communication and eager to learn',
      'Available for a 6-month full-time internship'
    ],
    experience: 'Fresher',
    source: 'internshala',
    sourceUrl: 'https://internshala.com/internship/detail/frontend-developer-intern-in-hyderabad-at-nextgen-labs',
    type: 'Internship',
    remote: false,
    postedAt: 'today'
  },
  {
    title: 'DevOps & Cloud Engineer',
    company: 'Apex Systems',
    location: 'Pune',
    salary: '12 - 18 LPA',
    description: 'Apex Systems is looking for a DevOps engineer to automate our infrastructure pipelines. Experience with Docker, Kubernetes, Jenkins, and Terraform is required.',
    requirements: [
      'Experience with Docker containerization and Kubernetes orchestration',
      'Strong scripting skills (Bash, Python)',
      'CI/CD pipeline construction using Jenkins or GitHub Actions',
      'Infrastructure as Code using Terraform'
    ],
    experience: '3-5 years',
    source: 'naukri',
    sourceUrl: 'https://www.naukri.com/job-listings-devops-cloud-engineer-apex-systems-pune-3-to-5-years',
    type: 'Full-time',
    remote: false,
    postedAt: '4 days ago'
  },
  {
    title: 'Data Scientist',
    company: 'Inference AI',
    location: 'Mumbai',
    salary: '20 - 30 LPA',
    description: 'Join our AI team to build recommendation engines and predictive analytics systems. Knowledge of Python, PyTorch, SQL, and data wrangling is essential.',
    requirements: [
      'Solid programming skills in Python (Pandas, NumPy, Scikit-Learn)',
      'Experience building and deployment ML models in production',
      'Strong background in statistics and probability',
      'Familiarity with NLP techniques is a plus'
    ],
    experience: '2-4 years',
    source: 'indeed',
    sourceUrl: 'https://in.indeed.com/viewjob?jk=data-scientist-inference-ai-mumbai',
    type: 'Full-time',
    remote: false,
    postedAt: '1 week ago'
  }
];

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is missing!');
      process.exit(1);
    }

    console.log('🔄 Connecting to database for seeding...');
    await connectDB();

    console.log('🧹 Clearing existing jobs...');
    await Job.deleteMany({});
    console.log('✅ Cleaned database');

    console.log('🌱 Normalizing and seeding jobs...');
    const normalizedJobs = mockRawJobs.map(normalizeJob);
    
    await Job.insertMany(normalizedJobs);
    console.log(`✅ Successfully seeded ${normalizedJobs.length} mock jobs!`);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
