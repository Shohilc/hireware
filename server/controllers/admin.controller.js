import User from '../models/User.js';
import Job from '../models/Job.js';
import os from 'os';

export const getSystemDiagnostics = async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const systemInfo = {
      uptime: Math.round(process.uptime()),
      platform: os.platform(),
      totalMemory: Math.round(os.totalmem() / (1024 * 1024)), // MB
      freeMemory: Math.round(os.freemem() / (1024 * 1024)), // MB
      processMemory: Math.round(memory.rss / (1024 * 1024)), // MB
      dbMode: process.env.USE_MOCK_DB === 'true' ? 'Mock persistent files' : 'Live MongoDB Atlas',
      nodeVersion: process.version,
    };
    res.json(systemInfo);
  } catch (err) {
    next(err);
  }
};

export const getScraperMetrics = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true });
    
    // Group jobs by source
    const sourcesCount = {};
    jobs.forEach(job => {
      const src = job.source || 'unknown';
      sourcesCount[src] = (sourcesCount[src] || 0) + 1;
    });

    res.json({
      totalJobs: jobs.length,
      sources: Object.entries(sourcesCount).map(([name, count]) => ({ name, count })),
      lastScraped: jobs.reduce((latest, job) => {
        const d = new Date(job.createdAt);
        return d > latest ? d : latest;
      }, new Date(0)),
    });
  } catch (err) {
    next(err);
  }
};

export const getUsersList = async (req, res, next) => {
  try {
    const users = await User.find({});
    // Sanitize users to exclude password
    const sanitized = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      bookmarksCount: u.bookmarks?.length || 0,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
    }));
    res.json(sanitized);
  } catch (err) {
    next(err);
  }
};
