import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { storageService } from '../services/storageService.js';

const router = express.Router();

// POST /api/progress/update
router.post('/update', async (req, res) => {
  try {
    const { userId, lessonId, completionPercentage, timeSpentMinutes, lastAccessedFormat, bookmark, note } = req.body;
    const targetUserId = req.user?.id || userId || 'user-student-a';

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    const updatedProgress = await storageService.updateProgress(targetUserId, lessonId, {
      completionPercentage,
      timeSpentMinutes,
      lastAccessedFormat,
      bookmark,
      note,
    });

    res.json({
      message: 'Progress recorded',
      progress: updatedProgress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/progress/summary
router.get('/summary', async (req, res) => {
  try {
    const targetUserId = req.user?.id || req.query.userId || 'user-student-a';
    const user = await storageService.getUserById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = user.progress || [];
    const lessons = await storageService.getLessons();

    const completedCount = progress.filter((p) => p.status === 'completed').length;
    const inProgressCount = progress.filter((p) => p.status === 'in_progress').length;

    const overallMastery = progress.length > 0
      ? Math.round(progress.reduce((acc, p) => acc + (p.masteryScore || 0), 0) / progress.length)
      : 70;

    const recommendation = await storageService.getRecommendation(targetUserId);

    res.json({
      summary: {
        userId: user.id,
        userName: user.name,
        completedLessons: completedCount,
        inProgressLessons: inProgressCount,
        totalLessons: lessons.length,
        overallMastery,
        streakDays: user.profile?.streakDays || 1,
        dailyGoalMinutes: user.profile?.dailyGoalMinutes || 20,
        todayMinutesSpent: user.profile?.todayMinutesSpent || 0,
      },
      recommendation,
      progressList: progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
