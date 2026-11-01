import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { storageService } from '../services/storageService.js';

const router = express.Router();

// GET /api/students/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await storageService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User profile not found.' });

    res.json({
      profile: user.profile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/students/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updatedUser = await storageService.updateUserProfile(req.user.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

    res.json({
      message: 'Learning preferences updated successfully!',
      profile: updatedUser.profile,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/students/progress
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const progress = await storageService.getStudentProgress(req.user.id);
    const recommendation = await storageService.getRecommendation(req.user.id);
    const attempts = await storageService.getStudentQuizAttempts(req.user.id);

    res.json({
      progress,
      recommendation,
      recentAttempts: attempts.slice(-5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
