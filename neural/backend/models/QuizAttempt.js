import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  quizId: { type: String },
  answers: [{
    questionId: { type: String },
    selectedOption: { type: Number },
    isCorrect: { type: Boolean },
    attempts: { type: Number, default: 1 },
    hintUsed: { type: Boolean, default: false },
  }],
  score: { type: Number, required: true }, // e.g. 80
  accuracy: { type: Number, required: true }, // e.g. 0.8
  totalQuestions: { type: Number, default: 5 },
  timeSpentSeconds: { type: Number, default: 120 },
  attemptedAt: { type: Date, default: Date.now },
});

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
