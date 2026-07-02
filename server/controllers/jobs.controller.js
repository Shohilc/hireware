import Job from '../models/Job.js';
import User from '../models/User.js';
import { runAllScrapers } from '../scrapers/index.js';
import { fillMissingDetails } from '../utils/normalizeJob.js';

export const getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      type,
      source,
      remote,
      sort = '-postedAt',
      experience,
    } = req.query;

    const filter = { isActive: true };
    if (location) filter.location = new RegExp(location, 'i');
    if (type) filter.type = type;
    if (source) filter.source = source;
    if (remote === 'true') filter.remote = true;
    if (experience) filter.experience = new RegExp(experience, 'i');

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(filter),
    ]);

    // If user is logged in, mark bookmarked jobs
    let bookmarkedIds = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select('bookmarks');
      bookmarkedIds = user?.bookmarks?.map((id) => id.toString()) || [];
    }

    const jobsWithBookmark = jobs.map((job) => {
      const filled = fillMissingDetails(job);
      return {
        ...filled,
        isBookmarked: bookmarkedIds.includes(job._id.toString()),
      };
    });

    res.json({
      jobs: jobsWithBookmark,
      total,
      pages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (err) {
    next(err);
  }
};

export const searchJobs = async (req, res, next) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      location,
      type,
      source,
      remote,
      experience,
    } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ jobs: [], total: 0, pages: 0 });
    }

    const filter = { $text: { $search: q }, isActive: true };
    if (location) filter.location = new RegExp(location, 'i');
    if (type) filter.type = type;
    if (source) filter.source = source;
    if (remote === 'true') filter.remote = true;
    if (experience) filter.experience = new RegExp(experience, 'i');

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(filter),
    ]);

    const jobsWithDetails = jobs.map((j) => fillMissingDetails(j));

    res.json({
      jobs: jobsWithDetails,
      total,
      pages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (err) {
    next(err);
  }
};

export const getJobBySlug = async (req, res, next) => {
  try {
    let job = await Job.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job = fillMissingDetails(job);

    // Check if bookmarked by current user
    if (req.user) {
      const user = await User.findById(req.user.id).select('bookmarks');
      job.isBookmarked = user?.bookmarks?.some(
        (id) => id.toString() === job._id.toString()
      );
    }

    res.json(job);
  } catch (err) {
    next(err);
  }
};

export const bookmarkJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.id;

    // Verify job exists
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === jobId
    );

    if (isBookmarked) {
      user.bookmarks.pull(jobId);
    } else {
      user.bookmarks.push(jobId);
    }

    await user.save();

    res.json({
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      match: { isActive: true },
      options: { sort: { postedAt: -1 } },
    });

    res.json(user.bookmarks || []);
  } catch (err) {
    next(err);
  }
};

export const triggerScrape = async (req, res, next) => {
  try {
    const { query = 'software engineer', location = 'Bangalore' } = req.body;
    const jobs = await runAllScrapers(query, location);
    res.json({
      scraped: jobs.length,
      message: `Scrape complete: ${jobs.length} jobs found for "${query}" in ${location}`,
    });
  } catch (err) {
    next(err);
  }
};

export const getJobStats = async (req, res, next) => {
  try {
    const [totalJobs, totalCompanies, sourceStats] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Job.distinct('company').then((c) => c.length),
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalJobs,
      totalCompanies,
      sources: sourceStats,
      platforms: sourceStats.length,
    });
  } catch (err) {
    next(err);
  }
};
