import express from 'express';
import { analyzeMatch } from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Match analyzer requires token authentication
router.post('/', protect, analyzeMatch);

export default router;
