import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes — requires valid JWT token.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id);

    if (!user && process.env.USE_MOCK_DB === 'true' && decoded.email) {
      // Container recycled: recreate the mock user dynamically with correct id and role
      user = await User.create({
        _id: decoded.id,
        name: decoded.name || 'Mock User',
        email: decoded.email,
        role: decoded.role || 'user',
        isVerified: true
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized — invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized — token expired' });
    }
    return res.status(500).json({ message: 'Auth error' });
  }
};

/**
 * Optional auth — attaches user if token is present, but doesn't block.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decoded.id);
      if (!user && process.env.USE_MOCK_DB === 'true' && decoded.email) {
        user = await User.create({
          _id: decoded.id,
          name: decoded.name || 'Mock User',
          email: decoded.email,
          role: decoded.role || 'user',
          isVerified: true
        });
      }
      req.user = user;
    }
  } catch {
    // Silently continue without auth
  }

  next();
};

/**
 * Admin-only middleware.
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden — admin access required' });
  }
  next();
};
