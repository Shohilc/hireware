import express from 'express';
import {
  getSystemDiagnostics,
  getScraperMetrics,
  getUsersList,
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin endpoints are protected and restricted to administrators
router.use(protect);
router.use(adminOnly);

router.get('/diagnostics', getSystemDiagnostics);
router.get('/scrapers', getScraperMetrics);
router.get('/users', getUsersList);

export default router;
