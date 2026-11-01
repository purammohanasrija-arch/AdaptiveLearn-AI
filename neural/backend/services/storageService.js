import { initialLessons, demoUsers, initialAssignments } from '../seedData.js';
import { getIsMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { LearnerProfile } from '../models/LearnerProfile.js';
import { Lesson } from '../models/Lesson.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { LearningProgress } from '../models/LearningProgress.js';
import { Assignment } from '../models/Assignment.js';

// In-Memory Data Cache (initialized with deep clones of seedData)
let memoryLessons = JSON.parse(JSON.stringify(initialLessons));
let memoryUsers = JSON.parse(JSON.stringify(demoUsers));
let memoryAssignments = JSON.parse(JSON.stringify(initialAssignments));

export const storageService = {
  // Lessons
  async getLessons() {
    return memoryLessons;
  },

  async getLessonById(id) {
    return memoryLessons.find((l) => l.id === id || l._id === id) || null;
  },

  async addAdaptedContentToLesson(lessonId, formatKey, newContent) {
    const lesson = await this.getLessonById(lessonId);
    if (!lesson) return null;
    if (!lesson.adaptedContent) lesson.adaptedContent = {};
    lesson.adaptedContent[formatKey] = newContent;
    return lesson;
  },

  async createLesson(lessonData) {
    const slug = (lessonData.title || 'custom-topic')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newId = `lesson-${slug}-${Date.now().toString().slice(-4)}`;

    const newLesson = {
      id: newId,
      _id: newId,
      title: lessonData.title,
      subject: lessonData.subject,
      topic: lessonData.topic || lessonData.title,
      difficulty: lessonData.difficulty || 'medium',
      estimatedDuration: Number(lessonData.estimatedDuration) || 15,
      originalContent: {
        title: lessonData.title,
        fullText: lessonData.fullText || lessonData.summary || `${lessonData.title} covers essential core concepts in ${lessonData.subject}.`,
        summary: lessonData.summary || `An accessible overview of ${lessonData.title} in ${lessonData.subject}.`,
      },
      adaptedContent: lessonData.adaptedContent,
      videoData: lessonData.videoData,
      createdAt: new Date().toISOString(),
    };

    memoryLessons.push(newLesson);

    if (getIsMongoConnected()) {
      try {
        await Lesson.create(newLesson);
      } catch (e) {
        console.warn('Mongo create lesson fallback:', e.message);
      }
    }

    return newLesson;
  },

  // Users & Auth
  async getUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    return memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id) {
    return memoryUsers.find((u) => u.id === id || u._id === id) || null;
  },

  async createUser(userData) {
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'student',
      avatar: userData.role === 'teacher' ? '👩🏻‍🏫' : '🎓',
      profile: {
        preferredLanguage: userData.preferredLanguage || 'English',
        learningLevel: userData.learningLevel || 'beginner',
        preferredFormat: userData.preferredFormat || 'simplified',
        textSize: userData.textSize || 'large',
        speechRate: 0.9,
        explanationStyle: userData.explanationStyle || 'simple',
        quizDifficulty: 'easy',
        readingSpeed: 'moderate',
        accessibilityPreferences: {
          dyslexicFont: false,
          highContrast: false,
          reducedMotion: false,
          lineSpacing: 'relaxed',
          audioNarration: true,
          visualDiagrams: true,
          screenReaderOptimized: false,
          ...(userData.accessibilityPreferences || {}),
        },
        baselineScore: 70,
        streakDays: 1,
        dailyGoalMinutes: 20,
        todayMinutesSpent: 0,
      },
      progress: [],
      quizAttempts: [],
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async updateUserProfile(userId, profileUpdates) {
    const user = await this.getUserById(userId);
    if (!user) return null;
    user.profile = {
      ...user.profile,
      ...profileUpdates,
      accessibilityPreferences: {
        ...(user.profile?.accessibilityPreferences || {}),
        ...(profileUpdates.accessibilityPreferences || {}),
      },
    };
    return user;
  },

  // Progress & Adaptive Mastery Score
  async getStudentProgress(userId) {
    const user = await this.getUserById(userId);
    if (!user) return [];
    return user.progress || [];
  },

  async updateProgress(userId, lessonId, updates) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    if (!user.progress) user.progress = [];
    let progressItem = user.progress.find((p) => p.lessonId === lessonId);

    if (!progressItem) {
      progressItem = {
        lessonId,
        completionPercentage: 0,
        masteryScore: 0,
        status: 'in_progress',
        timeSpentMinutes: 0,
        lastAccessedFormat: 'simplified',
        bookmarks: [],
        notes: [],
        lastAccessedAt: new Date().toISOString(),
      };
      user.progress.push(progressItem);
    }

    if (updates.completionPercentage !== undefined) {
      progressItem.completionPercentage = Math.min(100, Math.max(0, updates.completionPercentage));
      if (progressItem.completionPercentage >= 100) {
        progressItem.status = 'completed';
      } else if (progressItem.completionPercentage > 0) {
        progressItem.status = 'in_progress';
      }
    }

    if (updates.timeSpentMinutes !== undefined) {
      progressItem.timeSpentMinutes = (progressItem.timeSpentMinutes || 0) + updates.timeSpentMinutes;
      if (user.profile) {
        user.profile.todayMinutesSpent = (user.profile.todayMinutesSpent || 0) + updates.timeSpentMinutes;
      }
    }

    if (updates.lastAccessedFormat) {
      progressItem.lastAccessedFormat = updates.lastAccessedFormat;
    }

    if (updates.bookmark) {
      if (!progressItem.bookmarks) progressItem.bookmarks = [];
      progressItem.bookmarks.push({
        ...updates.bookmark,
        createdAt: new Date().toISOString(),
      });
    }

    if (updates.note) {
      if (!progressItem.notes) progressItem.notes = [];
      progressItem.notes.push({
        id: `note-${Date.now()}`,
        text: updates.note,
        createdAt: new Date().toISOString(),
      });
    }

    // Recalculate mastery score
    // Mastery Score = 70% * Recent Quiz Accuracy + 30% * Lesson Completion Percentage
    const recentAttempt = (user.quizAttempts || [])
      .filter((qa) => qa.lessonId === lessonId)
      .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))[0];

    const quizScore = recentAttempt ? recentAttempt.score : progressItem.masteryScore || 60;
    const completion = progressItem.completionPercentage || 0;
    progressItem.masteryScore = Math.round(0.7 * quizScore + 0.3 * completion);
    progressItem.lastAccessedAt = new Date().toISOString();

    return progressItem;
  },

  // Quizzes
  async recordQuizAttempt(userId, lessonId, attemptData) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    if (!user.quizAttempts) user.quizAttempts = [];

    const newAttempt = {
      id: `qa-${Date.now()}`,
      userId,
      lessonId,
      answers: attemptData.answers || [],
      score: attemptData.score, // e.g. 80
      accuracy: attemptData.accuracy, // 0.8
      totalQuestions: attemptData.totalQuestions || attemptData.answers?.length || 4,
      timeSpentSeconds: attemptData.timeSpentSeconds || 60,
      attemptedAt: new Date().toISOString(),
    };

    user.quizAttempts.push(newAttempt);

    // Update progress with new mastery score
    await this.updateProgress(userId, lessonId, {
      completionPercentage: 100, // Completing the quiz completes the lesson
    });

    return newAttempt;
  },

  async getStudentQuizAttempts(userId) {
    const user = await this.getUserById(userId);
    return user?.quizAttempts || [];
  },

  // Recommendation Engine
  async getRecommendation(userId) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const progressList = user.progress || [];
    const lessons = await this.getLessons();

    // Check for any incomplete lesson
    const incompleteProgress = progressList.find((p) => p.status === 'in_progress');
    if (incompleteProgress) {
      const lesson = lessons.find((l) => l.id === incompleteProgress.lessonId);
      let advice = 'Continue your journey with guided review.';
      if (incompleteProgress.masteryScore < 50) {
        advice = 'We recommend switching to the Simplified or Visual format with extra guided practice.';
      } else if (incompleteProgress.masteryScore < 80) {
        advice = 'You are making steady progress! Review with practice examples before the next quiz.';
      } else {
        advice = 'Great mastery! Wrap up this lesson or challenge yourself with the Detailed tab.';
      }
      return {
        lessonId: incompleteProgress.lessonId,
        lessonTitle: lesson?.title || 'Current Lesson',
        action: 'continue',
        advice,
        masteryScore: incompleteProgress.masteryScore,
      };
    }

    // Otherwise find the first not-started lesson
    const completedIds = progressList.filter((p) => p.status === 'completed').map((p) => p.lessonId);
    const nextLesson = lessons.find((l) => !completedIds.includes(l.id)) || lessons[0];

    return {
      lessonId: nextLesson.id,
      lessonTitle: nextLesson.title,
      action: 'start',
      advice: 'Start this new adventure! Your preferred adaptive format is already prepared for you.',
      masteryScore: 0,
    };
  },

  // Teacher Analytics
  async getTeacherDashboard() {
    const students = memoryUsers.filter((u) => u.role === 'student');
    const totalStudents = students.length;

    let totalMastery = 0;
    let totalQuizzes = 0;
    let totalCompletedLessons = 0;
    let totalAssignedLessons = 0;

    const studentSummaries = students.map((s) => {
      const attempts = s.quizAttempts || [];
      const progress = s.progress || [];

      const avgQuizScore = attempts.length > 0
        ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
        : 70;

      const completed = progress.filter((p) => p.status === 'completed').length;
      const inProgress = progress.filter((p) => p.status === 'in_progress').length;
      const avgMastery = progress.length > 0
        ? Math.round(progress.reduce((acc, p) => acc + (p.masteryScore || 0), 0) / progress.length)
        : 70;

      totalMastery += avgMastery;
      totalQuizzes += attempts.length;
      totalCompletedLessons += completed;
      totalAssignedLessons += (progress.length || 1);

      // Support indicator (positive & constructive framing)
      const needsSupport = avgMastery < 70 || inProgress > 2;
      const supportReason = avgMastery < 70
        ? 'May benefit from additional visual examples and simplified reading pacing.'
        : inProgress > 2
        ? 'Has several active lessons; could benefit from guided pacing assistance.'
        : 'Progressing smoothly across chosen adaptive formats.';

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        preferredFormat: s.profile?.preferredFormat || 'simplified',
        learningLevel: s.profile?.learningLevel || 'beginner',
        textSize: s.profile?.textSize || 'normal',
        avgQuizScore,
        avgMastery,
        completedLessons: completed,
        inProgressLessons: inProgress,
        totalTimeSpentMinutes: progress.reduce((acc, p) => acc + (p.timeSpentMinutes || 0), 0),
        disabilityContext: s.profile?.disabilityContext || 'Self-paced personalized learner',
        needsSupport,
        supportReason,
        streakDays: s.profile?.streakDays || 1,
      };
    });

    const averageMastery = totalStudents > 0 ? Math.round(totalMastery / totalStudents) : 0;
    const completionRate = totalAssignedLessons > 0 ? Math.round((totalCompletedLessons / totalAssignedLessons) * 100) : 0;

    return {
      metrics: {
        totalStudents,
        activeLearners: students.filter((s) => (s.profile?.streakDays || 0) > 0).length,
        averageMastery,
        completionRate: Math.min(100, completionRate),
        totalQuizAttempts: totalQuizzes,
      },
      students: studentSummaries,
      topicPerformance: [
        { topic: 'Computer Science', averageScore: 86, completionRate: 90 },
        { topic: 'Mathematics', averageScore: 81, completionRate: 85 },
        { topic: 'Programming', averageScore: 74, completionRate: 65 },
        { topic: 'Environmental Science', averageScore: 78, completionRate: 70 },
      ],
      supportAlerts: studentSummaries.filter((s) => s.needsSupport),
      assignments: memoryAssignments,
    };
  },

  async createAssignment(assignmentData) {
    const newAssignment = {
      id: `assign-${Date.now()}`,
      teacherId: assignmentData.teacherId || 'user-teacher-1',
      studentIds: assignmentData.studentIds || [],
      lessonId: assignmentData.lessonId,
      title: assignmentData.title,
      instructions: assignmentData.instructions || '',
      recommendedFormat: assignmentData.recommendedFormat || 'simplified',
      dueDate: assignmentData.dueDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    memoryAssignments.push(newAssignment);
    return newAssignment;
  },
};
