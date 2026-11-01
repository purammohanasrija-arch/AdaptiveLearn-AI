import express from 'express';
import bcrypt from 'bcryptjs';
import { storageService } from '../services/storageService.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', preferredFormat, learningLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const existingUser = await storageService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await storageService.createUser({
      name,
      email,
      passwordHash,
      role,
      preferredFormat: preferredFormat || 'simplified',
      learningLevel: learningLevel || 'beginner',
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await storageService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If password provided and starts with bcrypt hash
    if (password && user.passwordHash && !user.passwordHash.startsWith('$2a$10$demoHash')) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const token = generateToken(user.id, user.role);
    res.json({
      message: 'Welcome back!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = req.user;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profile: user.profile,
    },
  });
});

// GET /api/auth/demo-users
router.get('/demo-users', async (req, res) => {
  const learners = [
    {
      id: 'user-student-a',
      name: 'Aarav Patel (Learner A)',
      email: 'aarav@student.adaptlearn.ai',
      role: 'student',
      avatar: '👦🏽',
      description: 'Dyslexia & ADHD: Prefers simplified text chunks, large text, and audio read-aloud support.',
    },
    {
      id: 'user-student-b',
      name: 'Maya Lin (Learner B)',
      email: 'maya@student.adaptlearn.ai',
      role: 'student',
      avatar: '👧🏻',
      description: 'Hearing Impairment: Prefers high-contrast visual infographics, flowcharts, and detailed explanations.',
    },
    {
      id: 'user-teacher-1',
      name: 'Dr. Elena Sharma (Teacher)',
      email: 'teacher@adaptlearn.ai',
      role: 'teacher',
      avatar: '👩🏻‍🏫',
      description: 'Special Education Director: Access to full student analytics, progress tracking, and lesson assignments.',
    },
  ];
  res.json({ demoUsers: learners });
});

export default router;
