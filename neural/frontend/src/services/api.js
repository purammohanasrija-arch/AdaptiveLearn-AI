const rawApiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
export const API_BASE = (() => {
  let url = (rawApiBase || '').trim();
  if (!url) return '/api';
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  if (url.startsWith('http') && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = `${url.replace(/\/+$/, '')}/api`;
  }
  return url;
})();

const getHeaders = (token, demoUserId) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (demoUserId) headers['X-Demo-User-Id'] = demoUserId;
  return headers;
};

export const api = {
  // Lessons
  async getLessons(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/lessons?${query}`);
    if (!res.ok) throw new Error('Failed to fetch lessons');
    return res.json();
  },

  async getLessonById(id) {
    const res = await fetch(`${API_BASE}/lessons/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async createLesson(lessonData) {
    const res = await fetch(`${API_BASE}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create lesson');
    }
    return res.json();
  },

  async adaptLesson(id, { format, profile, targetLanguage }) {
    const res = await fetch(`${API_BASE}/lessons/${id}/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, profile, targetLanguage }),
    });
    if (!res.ok) throw new Error('Failed to adapt lesson');
    return res.json();
  },

  // Quizzes
  async submitQuiz(lessonId, { answers, timeSpentSeconds, userId, token }) {
    const res = await fetch(`${API_BASE}/quizzes/${lessonId}/submit`, {
      method: 'POST',
      headers: getHeaders(token, userId),
      body: JSON.stringify({ answers, timeSpentSeconds, userId }),
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    return res.json();
  },

  async getQuizAttempts(token, userId) {
    const res = await fetch(`${API_BASE}/quizzes/attempts`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch quiz attempts');
    return res.json();
  },

  // Progress
  async updateProgress({ userId, lessonId, completionPercentage, timeSpentMinutes, lastAccessedFormat, bookmark, note, token }) {
    const res = await fetch(`${API_BASE}/progress/update`, {
      method: 'POST',
      headers: getHeaders(token, userId),
      body: JSON.stringify({
        userId,
        lessonId,
        completionPercentage,
        timeSpentMinutes,
        lastAccessedFormat,
        bookmark,
        note,
      }),
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  },

  async getProgressSummary(userId, token) {
    const res = await fetch(`${API_BASE}/progress/summary?userId=${userId || ''}`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch progress summary');
    return res.json();
  },

  // -------------------------------------------------------------------------
  // Phase 6 Teacher Dashboard & Analytics Endpoints
  // -------------------------------------------------------------------------
  async getTeacherDashboard(token) {
    const res = await fetch(`${API_BASE}/teacher/dashboard`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to fetch teacher dashboard');
    return res.json();
  },

  async getTeacherStudents(params = {}, token) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/teacher/students?${query}`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to fetch students list');
    return res.json();
  },

  async getStudentDetail(studentId, token) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to fetch student details');
    return res.json();
  },

  async getClassAnalytics(token) {
    const res = await fetch(`${API_BASE}/teacher/class-analytics`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to fetch class analytics');
    return res.json();
  },

  async getKnowledgeHeatmap(subject = 'all', token) {
    const res = await fetch(`${API_BASE}/teacher/knowledge-heatmap?subject=${encodeURIComponent(subject)}`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to fetch knowledge heatmap');
    return res.json();
  },

  async getTeacherInsights(token) {
    const res = await fetch(`${API_BASE}/teacher/insights`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  async sendStudentFeedback(studentId, note, category = 'guidance', priority = 'normal', token) {
    const res = await fetch(`${API_BASE}/teacher/feedback`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify({ studentId, note, category, priority }),
    });
    if (!res.ok) throw new Error('Failed to send teacher feedback');
    return res.json();
  },

  async getPerformanceReport(studentId = 'class', token) {
    const res = await fetch(`${API_BASE}/teacher/reports/${encodeURIComponent(studentId)}`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to generate performance report');
    return res.json();
  },

  async enrollStudent(studentData, token) {
    const res = await fetch(`${API_BASE}/teacher/students`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to enroll student');
    }
    return res.json();
  },

  async createAssignment(assignmentData, token) {
    const res = await fetch(`${API_BASE}/teacher/assignments`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(assignmentData),
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    return res.json();
  },

  async resolveTeacherAlert(alertId, token) {
    const res = await fetch(`${API_BASE}/teacher/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to resolve teacher alert');
    return res.json();
  },

  // AI Actions & Contextual Tutor
  async tutorChat({ messages, lessonContext, studentProfile }) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, lessonContext, studentProfile }),
    });
    if (!res.ok) throw new Error('AI Tutor chat failed');
    return res.json();
  },

  async explainDifferently({ text, subject, analogyType }) {
    const res = await fetch(`${API_BASE}/ai/explain-differently`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, subject, analogyType }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  async giveExample({ topic, concept }) {
    const res = await fetch(`${API_BASE}/ai/give-example`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, concept }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  async makeItEasier({ text, level }) {
    const res = await fetch(`${API_BASE}/ai/make-it-easier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, level }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  async explainDetailed({ text, subject }) {
    const res = await fetch(`${API_BASE}/ai/explain-detailed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, subject }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  async summarizeLesson({ text, subject }) {
    const res = await fetch(`${API_BASE}/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, subject }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  async breakIntoSteps({ text, subject }) {
    const res = await fetch(`${API_BASE}/ai/break-steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, subject }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  async generatePracticeQuestions({ topic, difficulty }) {
    const res = await fetch(`${API_BASE}/ai/generate-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty }),
    });
    if (!res.ok) throw new Error('AI action failed');
    return res.json();
  },

  // 10 Advanced Hackathon Features
  async getLearningDna(userId) {
    const res = await fetch(`${API_BASE}/ai/learning-dna/${userId || 'user-student-a'}`);
    if (!res.ok) throw new Error('Failed to fetch Learning DNA');
    return res.json();
  },

  async getKnowledgeGaps(userId) {
    const res = await fetch(`${API_BASE}/ai/knowledge-gaps/${userId || 'user-student-a'}`);
    if (!res.ok) throw new Error('Failed to fetch knowledge gaps');
    return res.json();
  },

  async getRevisionSchedule(userId) {
    const res = await fetch(`${API_BASE}/ai/revision-schedule/${userId || 'user-student-a'}`);
    if (!res.ok) throw new Error('Failed to fetch revision schedule');
    return res.json();
  },

  async getJourneyTimeline(userId) {
    const res = await fetch(`${API_BASE}/progress/journey-timeline/${userId || 'user-student-a'}`);
    if (!res.ok) throw new Error('Failed to fetch journey timeline');
    return res.json();
  },

  async getTeacherAlerts() {
    const res = await fetch(`${API_BASE}/teacher/alerts`);
    if (!res.ok) throw new Error('Failed to fetch teacher alerts');
    return res.json();
  },

  async resolveTeacherAlert(id) {
    const res = await fetch(`${API_BASE}/teacher/alerts/${id}/resolve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  async exportTeacherReport() {
    const res = await fetch(`${API_BASE}/teacher/reports/export`);
    if (!res.ok) throw new Error('Failed to export teacher report');
    return res.json();
  },

  async getOneLessonFiveExperiences(topic, text) {
    const res = await fetch(`${API_BASE}/ai/one-lesson-five-experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, text }),
    });
    if (!res.ok) throw new Error('Failed to generate 5 experiences');
    return res.json();
  },

  // Phase 3: Adaptive Learning Engine REST Endpoints
  async saveLearnerProfile(payload, token, userId) {
    const res = await fetch(`${API_BASE}/learner/profile`, {
      method: 'POST',
      headers: getHeaders(token, userId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update learner profile');
    return res.json();
  },

  async analyzeLearner(userId, token) {
    const res = await fetch(`${API_BASE}/learner/analyze`, {
      method: 'POST',
      headers: getHeaders(token, userId),
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to analyze learner intelligence');
    return res.json();
  },

  async submitAdaptiveQuiz(payload, token, userId) {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: getHeaders(token, userId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit adaptive quiz');
    return res.json();
  },

  async getLearnerProgress(userId, token) {
    const res = await fetch(`${API_BASE}/learner/progress?userId=${userId || 'user-student-a'}`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch learner progress');
    return res.json();
  },

  async getLearnerRecommendations(userId, token) {
    const res = await fetch(`${API_BASE}/learner/recommendations?userId=${userId || 'user-student-a'}`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch dynamic recommendations');
    return res.json();
  },

  async adaptContent8Formats(topic, text) {
    const res = await fetch(`${API_BASE}/content/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, text }),
    });
    if (!res.ok) throw new Error('Failed to adapt content into 8 formats');
    return res.json();
  },

  async getLearnerKnowledgeGaps(userId, token) {
    const res = await fetch(`${API_BASE}/learner/knowledge-gaps?userId=${userId || 'user-student-a'}`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch knowledge gaps');
    return res.json();
  },

  async getLearnerRevisionPlan(userId, token) {
    const res = await fetch(`${API_BASE}/learner/revision-plan?userId=${userId || 'user-student-a'}`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch revision plan');
    return res.json();
  },

  // Phase 4: Intelligent Multimodal AI Tutor Endpoints
  async tutorChat(payload, token, userId) {
    const res = await fetch(`${API_BASE}/tutor/chat`, {
      method: 'POST',
      headers: getHeaders(token, userId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to get AI Tutor response');
    return res.json();
  },

  async tutorExplain(payload) {
    const res = await fetch(`${API_BASE}/tutor/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate tailored explanation');
    return res.json();
  },

  async tutorSummarize(payload) {
    const res = await fetch(`${API_BASE}/tutor/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to summarize topic');
    return res.json();
  },

  async tutorTransform(payload) {
    const res = await fetch(`${API_BASE}/tutor/transform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to transform lesson into 10 formats');
    return res.json();
  },

  async tutorFlashcards(payload) {
    const res = await fetch(`${API_BASE}/tutor/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate flashcards');
    return res.json();
  },

  async tutorVisualize(payload) {
    const res = await fetch(`${API_BASE}/tutor/visualize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate visual explanation');
    return res.json();
  },

  async tutorVoice(payload) {
    const res = await fetch(`${API_BASE}/tutor/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to process voice command');
    return res.json();
  },

  async tutorUploadDocument(formData) {
    const res = await fetch(`${API_BASE}/tutor/document-upload`, {
      method: 'POST',
      body: formData, // fetch will set multipart boundary automatically
    });
    if (!res.ok) throw new Error('Failed to upload document or extract text');
    return res.json();
  },

  // -------------------------------------------------------------------------
  // Phase 5 Accessibility & Inclusive Learning Endpoints
  // -------------------------------------------------------------------------
  async saveAccessibilityProfile(data, token) {
    const res = await fetch(`${API_BASE}/accessibility/profile`, {
      method: 'POST',
      headers: getHeaders(token, data.userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save accessibility profile');
    return res.json();
  },

  async getAccessibilityProfile(userId, token) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/accessibility/profile${query}`, {
      headers: getHeaders(token, userId),
    });
    if (!res.ok) throw new Error('Failed to fetch accessibility profile');
    return res.json();
  },

  async updateAccessibilityPreferences(preferences, userId = 'user-student-a', token = null) {
    const res = await fetch(`${API_BASE}/accessibility/preferences`, {
      method: 'PUT',
      headers: getHeaders(token, userId),
      body: JSON.stringify({ userId, preferences }),
    });
    if (!res.ok) throw new Error('Failed to update accessibility preferences');
    return res.json();
  },

  async transformContentAccessible({ title, content, subject, targetAudience }) {
    const res = await fetch(`${API_BASE}/accessibility/transform-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, subject, targetAudience }),
    });
    if (!res.ok) throw new Error('Failed to transform content to accessible formats');
    return res.json();
  },

  async simplifyContentAccessible({ text, targetGrade = 5 }) {
    const res = await fetch(`${API_BASE}/accessibility/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetGrade }),
    });
    if (!res.ok) throw new Error('Failed to simplify content');
    return res.json();
  },

  async getAccessibilityResources() {
    const res = await fetch(`${API_BASE}/accessibility/resources`);
    if (!res.ok) throw new Error('Failed to load accessibility resources');
    return res.json();
  },

  // -------------------------------------------------------------------------
  // Phase 7 AI Innovation Features Endpoints
  // -------------------------------------------------------------------------

  // 1. AI Learning Twin
  async analyzeLearningTwin(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/learning-twin/analyze`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to analyze learning twin');
    return res.json();
  },

  async getLearningTwinProfile(studentId = 'user-student-a', token = null) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/learning-twin/profile${query}`, {
      headers: getHeaders(token, studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch learning twin profile');
    return res.json();
  },

  // 2. Predictive Learning Analytics
  async predictLearningProgress(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/predictions/learning-progress`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate learning predictions');
    return res.json();
  },

  // 3. Dynamic Learning Path
  async getLearningPath(studentId = 'user-student-a', token = null) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/learning-path${query}`, {
      headers: getHeaders(token, studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch personalized learning path');
    return res.json();
  },

  async updateLearningPath(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/learning-path/update`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update learning path');
    return res.json();
  },

  // 4. AI Exam Generator & Submission
  async generateExam(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/exams/generate`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate exam paper');
    return res.json();
  },

  async submitExam(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/exams/submit`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to evaluate exam submission');
    return res.json();
  },

  // 5. Multilingual AI Learning Engine
  async translateContent(payload = {}) {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to translate content');
    return res.json();
  },

  // 6. Gamification System & XP Engine
  async getGamificationProfile(studentId = 'user-student-a', token = null) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/gamification/profile${query}`, {
      headers: getHeaders(token, studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch gamification profile');
    return res.json();
  },

  async awardGamificationXP(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/gamification/award`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to award gamification XP');
    return res.json();
  },

  // 7. Resource Recommendations & Bookmarks
  async getResourceRecommendations(params = {}, token = null) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/resources/recommendations?${query}`, {
      headers: getHeaders(token, params.studentId || 'user-student-a'),
    });
    if (!res.ok) throw new Error('Failed to load recommended resources');
    return res.json();
  },

  async toggleResourceBookmark(payload = {}, token = null) {
    const res = await fetch(`${API_BASE}/resources/bookmark`, {
      method: 'POST',
      headers: getHeaders(token, payload.studentId || 'user-student-a'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return res.json();
  },

  // 8. Parent Learning Dashboard
  async getParentDashboard(studentId = 'user-student-a', accessPin = '1234', token = null) {
    const res = await fetch(`${API_BASE}/parent/dashboard?studentId=${encodeURIComponent(studentId)}&accessPin=${encodeURIComponent(accessPin)}`, {
      headers: getHeaders(token, studentId),
    });
    if (!res.ok) throw new Error('Failed to load parent dashboard');
    return res.json();
  },

  // 9. Learning Achievement Passport
  async getAchievementPassport(studentId = 'user-student-a', token = null) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/achievement-passport${query}`, {
      headers: getHeaders(token, studentId),
    });
    if (!res.ok) throw new Error('Failed to load achievement passport');
    return res.json();
  },

  // -------------------------------------------------------------------------
  // Phase 9 Secure Authentication & Account Security Endpoints
  // -------------------------------------------------------------------------
  async authRegister(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },

  async authLogin(payload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  async authLogout(token = null) {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return res.json();
  },

  async authRefresh(refreshToken) {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Token refresh failed');
    return data;
  },

  async authGetMe(token = null) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Authentication failed');
    return data;
  },

  async authGoogle() {
    const res = await fetch(`${API_BASE}/auth/google`);
    return res.json();
  },

  async authFacebook() {
    const res = await fetch(`${API_BASE}/auth/facebook`);
    return res.json();
  },

  async authVerifyEmail(token) {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Email verification failed');
    return data;
  },

  async authResendVerification(email) {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async authSendOTP(email, purpose = 'login') {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
    return data;
  },

  async authVerifyOTP(email, otp, purpose = 'login') {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Invalid OTP code');
    return data;
  },

  async authForgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async authResetPassword(token, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Password reset failed');
    return data;
  },

  async auth2FAEnable(token = null) {
    const res = await fetch(`${API_BASE}/auth/2fa/enable`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to initiate 2FA setup');
    return data;
  },

  async auth2FAVerify(code, token = null) {
    const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to verify 2FA code');
    return data;
  },

  async auth2FADisable(password = '', token = null) {
    const res = await fetch(`${API_BASE}/auth/2fa/disable`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to disable 2FA');
    return data;
  },

  async authGetSessions(token = null) {
    const res = await fetch(`${API_BASE}/auth/sessions`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async authRevokeSession(sessionId, token = null) {
    const res = await fetch(`${API_BASE}/auth/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return res.json();
  },

  async authGetSecurityLogs(token = null) {
    const res = await fetch(`${API_BASE}/auth/security-logs`, {
      headers: getHeaders(token),
    });
    return res.json();
  },

  async authChangePassword(currentPassword, newPassword, token = null) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to change password');
    return data;
  },

  // -------------------------------------------------------------------------
  // PHASE 10: COURSE AND LESSON MANAGEMENT SYSTEM APIS
  // -------------------------------------------------------------------------
  async getCourseCategories() {
    const res = await fetch(`${API_BASE}/courses/categories`);
    if (!res.ok) throw new Error('Failed to fetch course categories');
    return res.json();
  },

  async getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/courses?${query}`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async getCourseById(courseId, studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/courses/${encodeURIComponent(courseId)}?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/courses/${encodeURIComponent(courseId)}`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async getCourseModules(courseId, studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/courses/${encodeURIComponent(courseId)}/modules?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/courses/${encodeURIComponent(courseId)}/modules`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Failed to fetch course modules');
    return res.json();
  },

  async enrollInCourse(courseId, studentId = null, token = null) {
    const res = await fetch(`${API_BASE}/courses/${encodeURIComponent(courseId)}/enroll`, {
      method: 'POST',
      headers: getHeaders(token, studentId),
      body: JSON.stringify({ student_id: studentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Enrollment failed');
    return data;
  },

  async getMyCourses(studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/student/my-courses?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/student/my-courses`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Failed to fetch enrolled courses');
    return res.json();
  },

  async getCourseProgress(courseId, studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/student/course-progress/${encodeURIComponent(courseId)}?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/student/course-progress/${encodeURIComponent(courseId)}`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Failed to fetch course progress');
    return res.json();
  },

  async getCourseLesson(lessonId, studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/lessons/${encodeURIComponent(lessonId)}?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/lessons/${encodeURIComponent(lessonId)}`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Failed to fetch lesson content');
    return res.json();
  },

  async completeCourseLesson(lessonId, studentId = null, timeSpentMinutes = 15.0, token = null) {
    const res = await fetch(`${API_BASE}/lessons/${encodeURIComponent(lessonId)}/complete`, {
      method: 'POST',
      headers: getHeaders(token, studentId),
      body: JSON.stringify({ student_id: studentId, time_spent_minutes: timeSpentMinutes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to complete lesson');
    return data;
  },

  async toggleLessonBookmark(lessonId, studentId = null, token = null) {
    const res = await fetch(`${API_BASE}/lessons/${encodeURIComponent(lessonId)}/bookmark`, {
      method: 'POST',
      headers: getHeaders(token, studentId),
      body: JSON.stringify({ student_id: studentId }),
    });
    return res.json();
  },

  async getLessonNotes(lessonId, studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/lessons/${encodeURIComponent(lessonId)}/notes?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/lessons/${encodeURIComponent(lessonId)}/notes`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    return res.json();
  },

  async saveLessonNotes(lessonId, noteText, studentId = null, token = null) {
    const res = await fetch(`${API_BASE}/lessons/${encodeURIComponent(lessonId)}/notes`, {
      method: 'POST',
      headers: getHeaders(token, studentId),
      body: JSON.stringify({ note_text: noteText, student_id: studentId }),
    });
    return res.json();
  },

  async getCourseAssessment(assessmentId, hideAnswers = true) {
    const res = await fetch(`${API_BASE}/assessments/${encodeURIComponent(assessmentId)}?hide_answers=${hideAnswers}`);
    if (!res.ok) throw new Error('Failed to load assessment');
    return res.json();
  },

  async submitCourseAssessment(assessmentId, answers, studentId = null, token = null) {
    const res = await fetch(`${API_BASE}/assessments/${encodeURIComponent(assessmentId)}/submit`, {
      method: 'POST',
      headers: getHeaders(token, studentId),
      body: JSON.stringify({ answers, student_id: studentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Assessment submission failed');
    return data;
  },

  async getCourseCertificate(courseId, studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/courses/${encodeURIComponent(courseId)}/certificate?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/courses/${encodeURIComponent(courseId)}/certificate`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Certificate not available');
    return res.json();
  },

  async getCourseRecommendations(studentId = null, token = null) {
    const url = studentId
      ? `${API_BASE}/courses/recommendations?student_id=${encodeURIComponent(studentId)}`
      : `${API_BASE}/courses/recommendations`;
    const res = await fetch(url, { headers: getHeaders(token, studentId) });
    if (!res.ok) throw new Error('Failed to fetch course recommendations');
    return res.json();
  },

  // Teacher Course Management APIs
  async teacherCreateCourse(courseData, token = null) {
    const res = await fetch(`${API_BASE}/teacher/courses`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(courseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to create course');
    return data;
  },

  async teacherUpdateCourse(courseId, courseData, token = null) {
    const res = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(courseId)}`, {
      method: 'PUT',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(courseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to update course');
    return data;
  },

  async teacherDeleteCourse(courseId, token = null) {
    const res = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(courseId)}`, {
      method: 'DELETE',
      headers: getHeaders(token, 'user-teacher-1'),
    });
    return res.json();
  },

  async teacherCreateModule(courseId, moduleData, token = null) {
    const res = await fetch(`${API_BASE}/teacher/courses/${encodeURIComponent(courseId)}/modules`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(moduleData),
    });
    return res.json();
  },

  async teacherCreateLesson(moduleId, lessonData, token = null) {
    const res = await fetch(`${API_BASE}/teacher/modules/${encodeURIComponent(moduleId)}/lessons`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(lessonData),
    });
    return res.json();
  },

  async teacherUpdateLesson(lessonId, lessonData, token = null) {
    const res = await fetch(`${API_BASE}/teacher/lessons/${encodeURIComponent(lessonId)}`, {
      method: 'PUT',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(lessonData),
    });
    return res.json();
  },

  async teacherDeleteLesson(lessonId, token = null) {
    const res = await fetch(`${API_BASE}/teacher/lessons/${encodeURIComponent(lessonId)}`, {
      method: 'DELETE',
      headers: getHeaders(token, 'user-teacher-1'),
    });
    return res.json();
  },

  async teacherAddResource(lessonId, resourceData, token = null) {
    const res = await fetch(`${API_BASE}/teacher/lessons/${encodeURIComponent(lessonId)}/resources`, {
      method: 'POST',
      headers: getHeaders(token, 'user-teacher-1'),
      body: JSON.stringify(resourceData),
    });
    return res.json();
  },

  async teacherGetCoursesOverview(token = null) {
    const res = await fetch(`${API_BASE}/teacher/courses/overview`, {
      headers: getHeaders(token, 'user-teacher-1'),
    });
    if (!res.ok) throw new Error('Failed to load courses overview');
    return res.json();
  },
};
