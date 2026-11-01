import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index 0-3
  hint: { type: String },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true }, // e.g., 'Computer Science', 'Mathematics', 'Programming', 'Environmental Science'
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  estimatedDuration: { type: Number, default: 15 }, // minutes
  icon: { type: String, default: 'BookOpen' },
  color: { type: String, default: '#E11D48' },
  originalContent: {
    summary: { type: String, required: true },
    fullText: { type: String, required: true },
    keyTakeaways: [{ type: String }],
  },
  adaptedContent: {
    simplified: {
      summary: { type: String },
      readingLevel: { type: String, default: 'Grade 4-6' },
      sections: [{
        heading: { type: String },
        bulletPoints: [{ type: String }],
        vocabulary: [{ word: String, definition: String }],
      }],
      takeaways: [{ type: String }],
    },
    audio: {
      script: { type: String },
      pausePoints: [{ timeSec: Number, label: String }],
      speechPacingTips: { type: String },
    },
    visual: {
      conceptCards: [{
        title: { type: String },
        description: { type: String },
        icon: { type: String },
        diagramType: { type: String },
        metaphor: { type: String },
      }],
      flowchart: [{ step: Number, action: String, detail: String }],
    },
    detailed: {
      deepDive: { type: String },
      historicalContext: { type: String },
      realWorldApplications: [{ type: String }],
      glossary: [{ term: String, definition: String }],
    },
    practice: {
      quickChecks: [{
        prompt: { type: String },
        guidance: { type: String },
        interactiveAnswer: { type: String },
      }],
    },
  },
  quiz: [quizQuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Lesson = mongoose.model('Lesson', lessonSchema);
