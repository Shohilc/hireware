import mongoose from 'mongoose';
import { readJobs, writeJobs } from '../config/mockStore.js';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, index: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, default: 'yearly' },
    },
    description: String,
    requirements: [String],
    tags: [String],
    source: {
      type: String,
      enum: ['linkedin', 'naukri', 'indeed', 'internshala', 'glassdoor'],
      required: true,
    },
    sourceUrl: { type: String, unique: true },
    logo: String,
    postedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    applicants: { type: Number, default: 0 },
    slug: { type: String, unique: true },
    experience: String,
    remote: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text search index
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  tags: 'text',
});

// Compound index for filtered queries
jobSchema.index({ location: 1, type: 1, source: 1, postedAt: -1 });

const RealJobModel = mongoose.model('Job', jobSchema);

class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort(sortStr) {
    if (typeof sortStr === 'string') {
      if (sortStr.startsWith('-')) {
        const field = sortStr.substring(1);
        this.data.sort((a, b) => (b[field] > a[field] ? 1 : -1));
      } else {
        this.data.sort((a, b) => (a[sortStr] > b[sortStr] ? 1 : -1));
      }
    }
    return this;
  }
  skip(val) {
    this.data = this.data.slice(Number(val));
    return this;
  }
  limit(val) {
    this.data = this.data.slice(0, Number(val));
    return this;
  }
  lean() {
    return this;
  }
  then(resolve, reject) {
    return Promise.resolve(this.data).then(resolve, reject);
  }
}

const MockJobModel = {
  find: (filter = {}) => {
    let result = readJobs();

    // Automatically deactivate mock jobs older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let updated = false;
    result.forEach((j) => {
      if (j.isActive && new Date(j.postedAt) < thirtyDaysAgo) {
        j.isActive = false;
        updated = true;
      }
    });
    if (updated) {
      writeJobs(result);
    }

    if (filter.isActive !== undefined) result = result.filter((j) => j.isActive === filter.isActive);
    if (filter.location instanceof RegExp) {
      result = result.filter((j) => filter.location.test(j.location));
    } else if (filter.location) {
      result = result.filter((j) => j.location.toLowerCase().includes(filter.location.toLowerCase()));
    }
    if (filter.type) result = result.filter((j) => j.type === filter.type);
    if (filter.source) result = result.filter((j) => j.source === filter.source);
    if (filter.remote === true) result = result.filter((j) => j.remote === true);
    if (filter.experience instanceof RegExp) {
      result = result.filter((j) => filter.experience.test(j.experience));
    }

    if (filter.$text) {
      const searchVal = filter.$text.$search.toLowerCase();
      const searchWords = searchVal.split(/\s+/).filter(Boolean);
      
      const genericWords = [
        'developer', 'engineer', 'software', 'development', 'lead', 
        'senior', 'junior', 'systems', 'system', 'analyst', 'manager', 
        'intern', 'role', 'work', 'job', 'jobs'
      ];
      const specificWords = searchWords.filter(w => !genericWords.includes(w));

      // Filter first: must match exact phrase or any of the specific technical keywords
      result = result.filter((j) => {
        const titleL = j.title.toLowerCase();
        const descL = j.description.toLowerCase();
        const companyL = j.company.toLowerCase();
        const tagsL = j.tags.map(t => t.toLowerCase());

        // Check if it matches the exact phrase
        if (titleL.includes(searchVal) || descL.includes(searchVal) || companyL.includes(searchVal) || tagsL.some(t => t.includes(searchVal))) {
          return true;
        }

        // If we have specific technical keywords in the search query (like "react"),
        // the job MUST match at least one of these specific keywords to be included.
        if (specificWords.length > 0) {
          return specificWords.some(w =>
            titleL.includes(w) ||
            descL.includes(w) ||
            companyL.includes(w) ||
            tagsL.some(t => t.includes(w))
          );
        }

        // Otherwise fallback to matching any search word
        return searchWords.some(w =>
          titleL.includes(w) ||
          descL.includes(w) ||
          companyL.includes(w) ||
          tagsL.some(t => t.includes(w))
        );
      });

      // Score matching relevance
      result = result.map((j) => {
        let score = 0;
        if (j.title.toLowerCase().includes(searchVal)) score += 100;
        if (j.description.toLowerCase().includes(searchVal)) score += 20;

        searchWords.forEach((word) => {
          if (j.title.toLowerCase().includes(word)) score += 15;
          if (j.tags.some((t) => t.toLowerCase().includes(word))) score += 10;
          if (j.company.toLowerCase().includes(word)) score += 5;
          if (j.description.toLowerCase().includes(word)) score += 2;
        });
        return { ...j, _score: score };
      });

      // Sort by score descending
      result.sort((a, b) => b._score - a._score);
    }

    return new MockQuery(result);
  },
  updateMany: (query = {}, update = {}) => {
    const jobs = readJobs();
    let count = 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    jobs.forEach((j) => {
      if (j.isActive && new Date(j.postedAt) < thirtyDaysAgo) {
        j.isActive = false;
        count++;
      }
    });
    
    if (count > 0) {
      writeJobs(jobs);
    }
    return Promise.resolve({ modifiedCount: count });
  },
  countDocuments: (filter = {}) => {
    const result = MockJobModel.find(filter).data;
    return Promise.resolve(result.length);
  },
  findOneAndUpdate: (query = {}, update = {}, options = {}) => {
    const jobs = readJobs();
    let jobIdx = -1;

    if (query.slug) {
      jobIdx = jobs.findIndex((j) => j.slug === query.slug);
    } else if (query.sourceUrl) {
      jobIdx = jobs.findIndex((j) => j.sourceUrl === query.sourceUrl);
    } else if (query._id) {
      jobIdx = jobs.findIndex((j) => j._id === query._id);
    }

    if (jobIdx !== -1) {
      const job = jobs[jobIdx];
      if (update.$inc && update.$inc.views) {
        job.views = (job.views || 0) + update.$inc.views;
      }
      Object.entries(update).forEach(([k, v]) => {
        if (!k.startsWith('$')) job[k] = v;
      });
      writeJobs(jobs);
      return Promise.resolve(job);
    }

    if (options.upsert) {
      const newJob = {
        _id: 'mock-job-' + Math.random().toString(36).substr(2, 9),
        ...update,
        views: 0,
        applicants: 0,
        postedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      jobs.push(newJob);
      writeJobs(jobs);
      return Promise.resolve(newJob);
    }

    return Promise.resolve(null);
  },
  distinct: (field) => {
    const jobs = readJobs();
    const uniqueVals = Array.from(new Set(jobs.map((j) => j[field])));
    return Promise.resolve(uniqueVals);
  },
  aggregate: () => {
    const jobs = readJobs();
    const stats = {};
    jobs.forEach((j) => {
      stats[j.source] = (stats[j.source] || 0) + 1;
    });
    const result = Object.entries(stats).map(([_id, count]) => ({ _id, count }));
    return Promise.resolve(result);
  },
  findById: (id) => {
    const jobs = readJobs();
    const job = jobs.find((j) => j._id === id);
    return Promise.resolve(job);
  },
  deleteMany: () => {
    writeJobs([]);
    return Promise.resolve({ deletedCount: 0 });
  },
  insertMany: (jobsArray = []) => {
    const jobs = jobsArray.map((j) => ({
      _id: j._id || 'mock-job-' + Math.random().toString(36).substr(2, 9),
      views: 0,
      applicants: 0,
      postedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...j,
    }));
    writeJobs(jobs);
    return Promise.resolve(jobs);
  },
};

const JobDelegator = {
  find: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).find(...args),
  countDocuments: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).countDocuments(...args),
  findOneAndUpdate: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).findOneAndUpdate(...args),
  distinct: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).distinct(...args),
  aggregate: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).aggregate(...args),
  findById: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).findById(...args),
  deleteMany: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).deleteMany(...args),
  insertMany: (...args) => (process.env.USE_MOCK_DB === 'true' ? MockJobModel : RealJobModel).insertMany(...args),
};

export default JobDelegator;
