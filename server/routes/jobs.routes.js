import express from 'express';
import {
  getJobs,
  getJobBySlug,
  searchJobs,
  triggerScrape,
  bookmarkJob,
  getBookmarks,
  getJobStats,
} from '../controllers/jobs.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { scrapeRateLimit } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/search', searchJobs);
router.get('/stats', getJobStats);
router.get('/bookmarks', protect, getBookmarks);
router.get('/:slug', optionalAuth, getJobBySlug);
router.post('/scrape', protect, scrapeRateLimit, triggerScrape);
router.post('/scrape-public', triggerScrape);
router.post('/:id/bookmark', protect, bookmarkJob);

export default router;
