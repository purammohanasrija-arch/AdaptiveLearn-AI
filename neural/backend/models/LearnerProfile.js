import mongoose from 'mongoose';

const learnerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredLanguage: { type: String, default: 'English' },
  learningLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  preferredFormat: { type: String, enum: ['simplified', 'audio', 'visual', 'detailed', 'practice'], default: 'simplified' },
  textSize: { type: String, enum: ['normal', 'medium', 'large', 'xlarge'], default: 'large' },
  speechRate: { type: Number, default: 0.9, min: 0.5, max: 2.0 },
  explanationStyle: { type: String, enum: ['simple', 'standard', 'detailed'], default: 'simple' },
  quizDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  readingSpeed: { type: String, enum: ['slow', 'moderate', 'fast'], default: 'slow' },
  accessibilityPreferences: {
    dyslexicFont: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    lineSpacing: { type: String, enum: ['normal', 'relaxed', 'loose'], default: 'relaxed' },
    audioNarration: { type: Boolean, default: true },
    visualDiagrams: { type: Boolean, default: true },
    screenReaderOptimized: { type: Boolean, default: false },
  },
  baselineScore: { type: Number, default: 70 },
  onboardingCompleted: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

export const LearnerProfile = mongoose.model('LearnerProfile', learnerProfileSchema);
