import express from 'express';
import { aiAdaptationService } from '../services/aiAdaptationService.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages, lessonContext, studentProfile } = req.body;
    const result = await aiAdaptationService.tutorChat({
      messages: messages || [],
      lessonContext: lessonContext || {},
      studentProfile: studentProfile || {},
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/explain-differently
router.post('/explain-differently', async (req, res) => {
  try {
    const { text, subject, analogyType } = req.body;
    const result = await aiAdaptationService.explainDifferently({
      text: text || 'Central Processing Unit and Computer Memory Architecture',
      subject: subject || 'Computer Science',
      analogyType,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/give-example
router.post('/give-example', async (req, res) => {
  try {
    const { topic, concept } = req.body;
    const result = await aiAdaptationService.giveExample({
      topic: topic || 'Loops and Repetition',
      concept: concept || 'Repeating an action multiple times automatically',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/make-it-easier
router.post('/make-it-easier', async (req, res) => {
  try {
    const { text, level } = req.body;
    const result = await aiAdaptationService.makeItEasier({
      text: text || 'Photosynthesis photolysis of water in thylakoid membranes.',
      level: level || 'elementary',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/explain-detailed
router.post('/explain-detailed', async (req, res) => {
  try {
    const { text, subject } = req.body;
    const result = await aiAdaptationService.explainDetailed({
      text: text || 'Processor pipeline architecture and clock gating',
      subject: subject || 'Computer Architecture',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { text, subject } = req.body;
    const result = await aiAdaptationService.summarizeLesson({
      text: text || '',
      subject: subject || 'General Science',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/break-steps
router.post('/break-steps', async (req, res) => {
  try {
    const { text, subject } = req.body;
    const result = await aiAdaptationService.breakIntoSteps({
      text: text || '',
      subject: subject || 'Algorithmic logic',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/generate-practice
router.post('/generate-practice', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const result = await aiAdaptationService.generatePracticeQuestions({
      topic: topic || 'Computer Hardware & Architecture',
      difficulty: difficulty || 'easy',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
