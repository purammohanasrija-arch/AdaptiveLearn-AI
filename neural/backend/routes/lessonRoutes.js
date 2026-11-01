import express from 'express';
import { storageService } from '../services/storageService.js';
import { aiAdaptationService } from '../services/aiAdaptationService.js';

const router = express.Router();

// GET /api/lessons
router.get('/', async (req, res) => {
  try {
    const { subject, difficulty, search } = req.query;
    let lessons = await storageService.getLessons();

    if (subject) {
      lessons = lessons.filter((l) => l.subject.toLowerCase() === subject.toLowerCase());
    }
    if (difficulty) {
      lessons = lessons.filter((l) => l.difficulty === difficulty);
    }
    if (search) {
      const q = search.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          l.topic.toLowerCase().includes(q)
      );
    }

    res.json({ lessons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lessons - Add any custom subject or lesson (User Accessible)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      subject,
      topic,
      difficulty = 'medium',
      estimatedDuration = 15,
      summary,
      fullText,
      embedUrl,
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and Subject are required to create a lesson.' });
    }

    // Generate full multi-format accessibility suite (simplified, detailed, audio, visual flowchart, practice quiz, and video)
    const generated = await aiAdaptationService.generateFullLessonContent({
      subject,
      title,
      summary,
      fullText,
      difficulty,
      embedUrl,
    });

    const newLesson = await storageService.createLesson({
      title,
      subject,
      topic: topic || title,
      difficulty,
      estimatedDuration,
      summary: summary || generated.simplified.summary,
      fullText: fullText || generated.detailed.deepDive,
      adaptedContent: {
        simplified: generated.simplified,
        detailed: generated.detailed,
        audio: generated.audio,
        visual: generated.visual,
        practice: generated.practice,
      },
      videoData: generated.videoData,
    });

    res.status(201).json({ lesson: newLesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lessons/:id
router.get('/:id', async (req, res) => {
  try {
    const lesson = await storageService.getLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }
    res.json({ lesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lessons/:id/adapt
router.post('/:id/adapt', async (req, res) => {
  try {
    const lesson = await storageService.getLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const { format = 'simplified', profile, targetLanguage = 'English' } = req.body;

    const adaptedContent = await aiAdaptationService.adaptLesson({
      lesson,
      profile: profile || {},
      mode: format,
      targetLanguage,
    });

    // Optionally cache adaptation on lesson
    await storageService.addAdaptedContentToLesson(lesson.id, format, adaptedContent);

    res.json({
      lessonId: lesson.id,
      format,
      adaptedContent,
    });
  } catch (error) {
    res.status(500).json({ error: 'Adaptation failed: ' + error.message });
  }
});

export default router;
