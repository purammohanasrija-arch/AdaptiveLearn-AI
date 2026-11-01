import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { storageService } from '../services/storageService.js';

const router = express.Router();

// POST /api/quizzes/:id/submit
// :id is lessonId
router.post('/:id/submit', async (req, res) => {
  try {
    const lessonId = req.params.id;
    const { answers, timeSpentSeconds = 60, userId } = req.body;

    const targetUserId = req.user?.id || userId || 'user-student-a';
    const lesson = await storageService.getLessonById(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Evaluate answers
    const questions = lesson.quiz || [];
    let correctCount = 0;
    const evaluatedAnswers = (answers || []).map((ans) => {
      const q = questions.find((item) => item.id === ans.questionId);
      const isCorrect = q ? q.correctAnswer === ans.selectedOption : false;
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect,
        correctAnswer: q?.correctAnswer,
        explanation: q?.explanation,
      };
    });

    const totalQuestions = questions.length || evaluatedAnswers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const accuracy = Number((correctCount / totalQuestions).toFixed(2));

    const attempt = await storageService.recordQuizAttempt(targetUserId, lessonId, {
      answers: evaluatedAnswers,
      score,
      accuracy,
      totalQuestions,
      timeSpentSeconds,
    });

    // Determine adaptive next recommendation
    let nextStepAdvice = '';
    let suggestedDifficulty = 'easy';

    if (score >= 80) {
      nextStepAdvice = 'Outstanding performance! You have demonstrated high mastery. Ready for the next topic!';
      suggestedDifficulty = 'medium';
    } else if (score >= 50) {
      nextStepAdvice = 'Good effort! Review the visual diagrams or practice questions to strengthen key areas.';
      suggestedDifficulty = 'easy';
    } else {
      nextStepAdvice = 'Learning is a journey! We recommend checking the Simplified or Audio explanation before re-taking the quiz.';
      suggestedDifficulty = 'easy';
    }

    res.json({
      message: 'Quiz evaluated successfully',
      attempt,
      summary: {
        score,
        accuracy,
        correctCount,
        totalQuestions,
        nextStepAdvice,
        suggestedDifficulty,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quizzes/attempts
router.get('/attempts', requireAuth, async (req, res) => {
  try {
    const attempts = await storageService.getStudentQuizAttempts(req.user.id);
    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
