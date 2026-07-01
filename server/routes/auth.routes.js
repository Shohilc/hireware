import express from 'express';
import passport from 'passport';
import { register, login, googleCallback, getMe, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

// Google OAuth (only if configured, or mock mode fallback)
router.get('/google', async (req, res, next) => {
  const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID &&
                             process.env.GOOGLE_CLIENT_SECRET &&
                             process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';

  if (process.env.USE_MOCK_DB === 'true' && !isGoogleConfigured) {
    try {
      let user = await User.findOne({ googleId: 'mock-google-id-123' });
      if (!user) {
        user = await User.create({
          name: 'Google Test User',
          email: 'google.test@hirewave.com',
          googleId: 'mock-google-id-123',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          isVerified: true,
        });
      }
      const token = jwt.sign(
        { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        }, 
        process.env.JWT_SECRET, 
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
      );
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (err) {
      return next(err);
    }
  }

  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id') {
    return res.status(501).json({ message: 'Google OAuth is not configured' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

export default router;
