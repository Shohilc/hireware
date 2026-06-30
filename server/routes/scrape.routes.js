import express from 'express';
import { scrapeAll, scrapePlatform } from '../controllers/scrape.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { scrapeRateLimit } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/', protect, scrapeRateLimit, scrapeAll);
router.post('/:platform', protect, scrapeRateLimit, scrapePlatform);

export default router;
