import jwt from 'jsonwebtoken';
import { storageService } from '../services/storageService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'adaptlearn-ai-secure-jwt-secret-key-2026';

export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In demo mode, if client provides an X-Demo-User-Id header, allow testing seamlessly
      const demoUserId = req.headers['x-demo-user-id'];
      if (demoUserId) {
        const demoUser = await storageService.getUserById(demoUserId);
        if (demoUser) {
          req.user = demoUser;
          return next();
        }
      }
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storageService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

export const requireTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher authorization required to access this resource.' });
  }
  next();
};
