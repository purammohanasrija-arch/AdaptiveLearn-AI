import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  masteryScore: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  timeSpentMinutes: { type: Number, default: 0 },
  bookmarks: [{
    sectionId: { type: String },
    title: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  notes: [{
    id: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  lastAccessedFormat: { type: String, default: 'simplified' },
  lastAccessedAt: { type: Date, default: Date.now },
});

export const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
