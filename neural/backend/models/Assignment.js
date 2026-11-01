import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  instructions: { type: String },
  recommendedFormat: { type: String, default: 'simplified' },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'overdue'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export const Assignment = mongoose.model('Assignment', assignmentSchema);
