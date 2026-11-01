import express from 'express';
import { requireAuth, requireTeacher } from '../middleware/auth.js';
import { storageService } from '../services/storageService.js';

const router = express.Router();

// Middleware that allows teacher role or demo teacher header
const allowTeacherOrDemo = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const demoUserId = req.headers['x-demo-user-id'];

  if (!authHeader && !demoUserId) {
    // If neither is present, check query param demoTeacher
    if (req.query.demoTeacher === 'true') {
      const teacher = await storageService.getUserById('user-teacher-1');
      req.user = teacher;
      return next();
    }
    return res.status(401).json({ error: 'Teacher login or demo authentication required.' });
  }

  requireAuth(req, res, () => {
    if (req.user && (req.user.role === 'teacher' || req.user.id === 'user-teacher-1')) {
      return next();
    }
    return res.status(403).json({ error: 'Access denied: Teacher permissions required.' });
  });
};

// GET /api/teacher/dashboard
router.get('/dashboard', allowTeacherOrDemo, async (req, res) => {
  try {
    const dashboardData = await storageService.getTeacherDashboard();
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/students
router.get('/students', allowTeacherOrDemo, async (req, res) => {
  try {
    const dashboardData = await storageService.getTeacherDashboard();
    res.json({ students: dashboardData.students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/students/:id/progress
router.get('/students/:id/progress', allowTeacherOrDemo, async (req, res) => {
  try {
    const student = await storageService.getUserById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const lessons = await storageService.getLessons();
    const studentProgress = student.progress || [];
    const attempts = student.quizAttempts || [];

    const enrichedProgress = lessons.map((l) => {
      const p = studentProgress.find((prog) => prog.lessonId === l.id);
      return {
        lessonId: l.id,
        title: l.title,
        subject: l.subject,
        completionPercentage: p?.completionPercentage || 0,
        masteryScore: p?.masteryScore || 0,
        status: p?.status || 'not_started',
        timeSpentMinutes: p?.timeSpentMinutes || 0,
        lastAccessedFormat: p?.lastAccessedFormat || 'simplified',
      };
    });

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        profile: student.profile,
      },
      progress: enrichedProgress,
      quizAttempts: attempts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/assignments
router.post('/assignments', allowTeacherOrDemo, async (req, res) => {
  try {
    const { studentIds, lessonId, title, instructions, recommendedFormat, dueDate } = req.body;

    if (!lessonId || !title) {
      return res.status(400).json({ error: 'Lesson and assignment title are required.' });
    }

    const assignment = await storageService.createAssignment({
      teacherId: req.user?.id || 'user-teacher-1',
      studentIds: studentIds || ['user-student-a'],
      lessonId,
      title,
      instructions,
      recommendedFormat,
      dueDate,
    });

    res.status(201).json({
      message: 'Assignment created and distributed to students!',
      assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
