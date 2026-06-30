import express from 'express';
import { getProfile, updateProfile, updateAvatar } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, updateAvatar);

export default router;
