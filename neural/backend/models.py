import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(32), default="student")  # 'student', 'teacher', 'admin'
    avatar = Column(String(16), default="🎓")
    age_range = Column(String(32), default="14-16")
    email_verified = Column(Boolean, default=True)
    profile_image = Column(String(512), default="")
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    progress_records = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    knowledge_gaps = relationship("KnowledgeGap", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return self.name

    @full_name.setter
    def full_name(self, value):
        self.name = value

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "fullName": self.name,
            "email": self.email,
            "role": self.role,
            "avatar": self.avatar,
            "profileImage": self.profile_image,
            "emailVerified": bool(self.email_verified),
            "ageRange": self.age_range,
            "profile": self.profile.to_dict() if self.profile else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    preferred_language = Column(String(32), default="English")
    learning_level = Column(String(32), default="beginner")  # beginner, intermediate, advanced
    preferred_format = Column(String(32), default="simplified")  # simplified, audio, visual, detailed, practice
    text_size = Column(String(32), default="large")  # normal, medium, large, xlarge
    speech_rate = Column(Float, default=0.9)
    explanation_style = Column(String(32), default="simple")
    quiz_difficulty = Column(String(32), default="easy")
    reading_speed = Column(String(32), default="moderate")
    accessibility_preferences_json = Column(Text, default="{}")
    disability_context = Column(Text, default="")
    baseline_score = Column(Float, default=70.0)
    streak_days = Column(Integer, default=1)
    daily_goal_minutes = Column(Integer, default=20)
    today_minutes_spent = Column(Integer, default=0)
    onboarding_completed = Column(Boolean, default=True)
    learning_dna_json = Column(Text, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

    @property
    def accessibility_preferences(self):
        try:
            return json.loads(self.accessibility_preferences_json or "{}")
        except Exception:
            return {}

    @accessibility_preferences.setter
    def accessibility_preferences(self, val):
        self.accessibility_preferences_json = json.dumps(val or {})

    @property
    def learning_dna(self):
        try:
            return json.loads(self.learning_dna_json or "{}")
        except Exception:
            return {}

    @learning_dna.setter
    def learning_dna(self, val):
        self.learning_dna_json = json.dumps(val or {})

    def to_dict(self):
        return {
            "userId": self.user_id,
            "preferredLanguage": self.preferred_language,
            "learningLevel": self.learning_level,
            "preferredFormat": self.preferred_format,
            "textSize": self.text_size,
            "speechRate": self.speech_rate,
            "explanationStyle": self.explanation_style,
            "quizDifficulty": self.quiz_difficulty,
            "readingSpeed": self.reading_speed,
            "accessibilityPreferences": self.accessibility_preferences,
            "disabilityContext": self.disability_context,
            "baselineScore": self.baseline_score,
            "streakDays": self.streak_days,
            "dailyGoalMinutes": self.daily_goal_minutes,
            "todayMinutesSpent": self.today_minutes_spent,
            "onboardingCompleted": self.onboarding_completed,
            "learningDna": self.learning_dna,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    subject = Column(String(128), nullable=False)
    topic = Column(String(128), nullable=False)
    difficulty = Column(String(32), default="easy")
    estimated_duration = Column(Integer, default=15)
    icon = Column(String(64), default="BookOpen")
    color = Column(String(32), default="#E11D48")
    original_content_json = Column(Text, nullable=False, default="{}")
    adapted_content_json = Column(Text, nullable=False, default="{}")
    quiz_json = Column(Text, nullable=False, default="[]")
    video_data_json = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def original_content(self):
        try:
            return json.loads(self.original_content_json or "{}")
        except Exception:
            return {}

    @original_content.setter
    def original_content(self, val):
        self.original_content_json = json.dumps(val or {})

    @property
    def adapted_content(self):
        try:
            return json.loads(self.adapted_content_json or "{}")
        except Exception:
            return {}

    @adapted_content.setter
    def adapted_content(self, val):
        self.adapted_content_json = json.dumps(val or {})

    @property
    def quiz(self):
        try:
            return json.loads(self.quiz_json or "[]")
        except Exception:
            return []

    @quiz.setter
    def quiz(self, val):
        self.quiz_json = json.dumps(val or [])

    @property
    def video_data(self):
        try:
            return json.loads(self.video_data_json or "{}")
        except Exception:
            return {}

    @video_data.setter
    def video_data(self, val):
        self.video_data_json = json.dumps(val or {})

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject": self.subject,
            "topic": self.topic,
            "difficulty": self.difficulty,
            "estimatedDuration": self.estimated_duration,
            "icon": self.icon,
            "color": self.color,
            "originalContent": self.original_content,
            "adaptedContent": self.adapted_content,
            "quiz": self.quiz,
            "videoData": self.video_data,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("lessons.id"), nullable=False, index=True)
    completion_percentage = Column(Float, default=0.0)
    mastery_score = Column(Float, default=0.0)
    status = Column(String(32), default="not_started")  # not_started, in_progress, completed
    time_spent_minutes = Column(Float, default=0.0)
    bookmarks_json = Column(Text, default="[]")
    notes_json = Column(Text, default="[]")
    last_accessed_format = Column(String(32), default="simplified")
    last_accessed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress_records")

    @property
    def bookmarks(self):
        try:
            return json.loads(self.bookmarks_json or "[]")
        except Exception:
            return []

    @bookmarks.setter
    def bookmarks(self, val):
        self.bookmarks_json = json.dumps(val or [])

    @property
    def notes(self):
        try:
            return json.loads(self.notes_json or "[]")
        except Exception:
            return []

    @notes.setter
    def notes(self, val):
        self.notes_json = json.dumps(val or [])

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "lessonId": self.lesson_id,
            "completionPercentage": self.completion_percentage,
            "masteryScore": self.mastery_score,
            "status": self.status,
            "timeSpentMinutes": self.time_spent_minutes,
            "bookmarks": self.bookmarks,
            "notes": self.notes,
            "lastAccessedFormat": self.last_accessed_format,
            "lastAccessedAt": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
        }

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("lessons.id"), nullable=False, index=True)
    quiz_id = Column(String(64), nullable=True)
    answers_json = Column(Text, default="[]")
    score = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    total_questions = Column(Integer, default=4)
    time_spent_seconds = Column(Integer, default=60)
    difficulty_level = Column(String(32), default="easy")
    attempted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")

    @property
    def answers(self):
        try:
            return json.loads(self.answers_json or "[]")
        except Exception:
            return []

    @answers.setter
    def answers(self, val):
        self.answers_json = json.dumps(val or [])

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "lessonId": self.lesson_id,
            "quizId": self.quiz_id,
            "answers": self.answers,
            "score": self.score,
            "accuracy": self.accuracy,
            "totalQuestions": self.total_questions,
            "timeSpentSeconds": self.time_spent_seconds,
            "difficultyLevel": self.difficulty_level,
            "attemptedAt": self.attempted_at.isoformat() if self.attempted_at else None,
        }

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String(64), primary_key=True, index=True)
    teacher_id = Column(String(64), nullable=False)
    student_ids_json = Column(Text, default="[]")
    lesson_id = Column(String(64), ForeignKey("lessons.id"), nullable=False)
    title = Column(String(256), nullable=False)
    instructions = Column(Text, default="")
    recommended_format = Column(String(32), default="simplified")
    due_date = Column(DateTime, nullable=False)
    status = Column(String(32), default="active")  # active, completed, overdue
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def student_ids(self):
        try:
            return json.loads(self.student_ids_json or "[]")
        except Exception:
            return []

    @student_ids.setter
    def student_ids(self, val):
        self.student_ids_json = json.dumps(val or [])

    def to_dict(self):
        return {
            "id": self.id,
            "teacherId": self.teacher_id,
            "studentIds": self.student_ids,
            "lessonId": self.lesson_id,
            "title": self.title,
            "instructions": self.instructions,
            "recommendedFormat": self.recommended_format,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class KnowledgeGap(Base):
    __tablename__ = "knowledge_gaps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    topic = Column(String(128), nullable=False)
    concept = Column(String(128), nullable=False)
    severity = Column(String(32), default="medium")  # high, medium, low
    misconception = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="knowledge_gaps")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "topic": self.topic,
            "concept": self.concept,
            "severity": self.severity,
            "misconception": self.misconception,
            "recommendedAction": self.recommended_action,
            "detectedAt": self.detected_at.isoformat() if self.detected_at else None,
        }

class TeacherAlert(Base):
    __tablename__ = "teacher_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(64), nullable=False, index=True)
    student_name = Column(String(128), nullable=False)
    topic = Column(String(128), nullable=False)
    alert_type = Column(String(64), default="struggling_concept")  # struggling_concept, cognitive_overload, inactivity
    urgency = Column(String(32), default="medium")  # high, medium, low
    reason = Column(Text, nullable=False)
    recommended_intervention = Column(Text, nullable=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "studentName": self.student_name,
            "topic": self.topic,
            "alertType": self.alert_type,
            "urgency": self.urgency,
            "reason": self.reason,
            "recommendedIntervention": self.recommended_intervention,
            "resolved": self.resolved,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class RevisionSession(Base):
    __tablename__ = "revision_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("lessons.id"), nullable=False, index=True)
    topic = Column(String(128), nullable=False)
    retention_score_before = Column(Float, default=60.0)
    retention_score_after = Column(Float, default=85.0)
    interval_days = Column(Integer, default=3)
    completed_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "lessonId": self.lesson_id,
            "topic": self.topic,
            "retentionBefore": self.retention_score_before,
            "retentionAfter": self.retention_score_after,
            "intervalDays": self.interval_days,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
        }

class TeacherFeedback(Base):
    __tablename__ = "teacher_feedbacks"

    id = Column(String(64), primary_key=True, index=True)
    teacher_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    note = Column(Text, nullable=False)
    category = Column(String(32), default="guidance")  # guidance, praise, revision_reminder, accommodation
    priority = Column(String(32), default="normal")    # low, normal, urgent
    read_by_student = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "teacherId": self.teacher_id,
            "studentId": self.student_id,
            "note": self.note,
            "category": self.category,
            "priority": self.priority,
            "readByStudent": self.read_by_student,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

# =============================================================================
# PHASE 7 INNOVATION MODELS
# =============================================================================

class ExamPaper(Base):
    __tablename__ = "exam_papers"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    subject = Column(String(128), nullable=False)
    topic = Column(String(128), nullable=False)
    difficulty = Column(String(32), default="intermediate")  # beginner, intermediate, advanced, comprehensive
    time_limit_minutes = Column(Integer, default=20)
    questions_json = Column(Text, nullable=False, default="[]")
    created_by = Column(String(64), default="ai-generator")
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def questions(self):
        try:
            return json.loads(self.questions_json or "[]")
        except Exception:
            return []

    @questions.setter
    def questions(self, val):
        self.questions_json = json.dumps(val or [])

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject": self.subject,
            "topic": self.topic,
            "difficulty": self.difficulty,
            "timeLimitMinutes": self.time_limit_minutes,
            "questionCount": len(self.questions),
            "questions": self.questions,
            "createdBy": self.created_by,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class ExamSubmission(Base):
    __tablename__ = "exam_submissions"

    id = Column(String(64), primary_key=True, index=True)
    exam_id = Column(String(64), ForeignKey("exam_papers.id"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    answers_json = Column(Text, default="{}")
    score = Column(Float, nullable=False, default=0.0)
    accuracy = Column(Float, nullable=False, default=0.0)
    total_points = Column(Float, default=100.0)
    earned_points = Column(Float, default=0.0)
    time_spent_seconds = Column(Integer, default=300)
    evaluated_json = Column(Text, default="{}")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    @property
    def answers(self):
        try:
            return json.loads(self.answers_json or "{}")
        except Exception:
            return {}

    @answers.setter
    def answers(self, val):
        self.answers_json = json.dumps(val or {})

    @property
    def evaluation(self):
        try:
            return json.loads(self.evaluated_json or "{}")
        except Exception:
            return {}

    @evaluation.setter
    def evaluation(self, val):
        self.evaluated_json = json.dumps(val or {})

    def to_dict(self):
        return {
            "id": self.id,
            "examId": self.exam_id,
            "userId": self.user_id,
            "answers": self.answers,
            "score": self.score,
            "accuracy": self.accuracy,
            "totalPoints": self.total_points,
            "earnedPoints": self.earned_points,
            "timeSpentSeconds": self.time_spent_seconds,
            "evaluation": self.evaluation,
            "submittedAt": self.submitted_at.isoformat() if self.submitted_at else None,
        }

class GamificationProfile(Base):
    __tablename__ = "gamification_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    xp_points = Column(Integer, default=1250)
    level = Column(Integer, default=3)
    streak_days = Column(Integer, default=5)
    badges_json = Column(Text, default="[]")
    daily_challenge_json = Column(Text, default="{}")
    weekly_goal_minutes = Column(Integer, default=120)
    minutes_this_week = Column(Integer, default=75)
    leaderboard_opt_in = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def badges(self):
        try:
            return json.loads(self.badges_json or "[]")
        except Exception:
            return []

    @badges.setter
    def badges(self, val):
        self.badges_json = json.dumps(val or [])

    @property
    def daily_challenge(self):
        try:
            return json.loads(self.daily_challenge_json or "{}")
        except Exception:
            return {}

    @daily_challenge.setter
    def daily_challenge(self, val):
        self.daily_challenge_json = json.dumps(val or {})

    def to_dict(self):
        return {
            "userId": self.user_id,
            "xpPoints": self.xp_points,
            "level": self.level,
            "streakDays": self.streak_days,
            "badges": self.badges,
            "badgeCount": len(self.badges),
            "dailyChallenge": self.daily_challenge,
            "weeklyGoalMinutes": self.weekly_goal_minutes,
            "minutesThisWeek": self.minutes_this_week,
            "leaderboardOptIn": self.leaderboard_opt_in,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class LearningPathState(Base):
    __tablename__ = "learning_path_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    nodes_json = Column(Text, default="[]")
    current_node_id = Column(String(64), default="node-cs101")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def nodes(self):
        try:
            return json.loads(self.nodes_json or "[]")
        except Exception:
            return []

    @nodes.setter
    def nodes(self, val):
        self.nodes_json = json.dumps(val or [])

    def to_dict(self):
        return {
            "userId": self.user_id,
            "currentNodeId": self.current_node_id,
            "nodes": self.nodes,
            "totalNodes": len(self.nodes),
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class ResourceBookmark(Base):
    __tablename__ = "resource_bookmarks"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    resource_id = Column(String(64), nullable=False)
    title = Column(String(256), nullable=False)
    url = Column(String(512), nullable=False)
    resource_type = Column(String(64), default="simulation")  # video, simulation, worksheet, guide
    topic = Column(String(128), default="STEM")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "resourceId": self.resource_id,
            "title": self.title,
            "url": self.url,
            "resourceType": self.resource_type,
            "topic": self.topic,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class ParentConsent(Base):
    __tablename__ = "parent_consents"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    parent_name = Column(String(128), nullable=False)
    parent_email = Column(String(128), nullable=False)
    access_pin = Column(String(16), default="1234")
    consent_granted = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "parentName": self.parent_name,
            "parentEmail": self.parent_email,
            "accessPin": self.access_pin,
            "consentGranted": self.consent_granted,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

# =============================================================================
# PHASE 9 AUTHENTICATION & SECURITY MODELS
# =============================================================================

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(32), nullable=False, index=True)  # 'google', 'facebook'
    provider_user_id = Column(String(128), nullable=False, index=True)
    email = Column(String(128), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "provider": self.provider,
            "providerUserId": self.provider_user_id,
            "email": self.email,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(128), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "usedAt": self.used_at.isoformat() if self.used_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(128), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "usedAt": self.used_at.isoformat() if self.used_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), nullable=True, index=True)
    email = Column(String(128), nullable=False, index=True)
    otp_hash = Column(String(128), nullable=False)
    purpose = Column(String(32), default="login")  # 'login', 'verification', 'password_reset'
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "email": self.email,
            "purpose": self.purpose,
            "attempts": self.attempts,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "verifiedAt": self.verified_at.isoformat() if self.verified_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    refresh_token_hash = Column(String(128), nullable=False, index=True)
    ip_address = Column(String(64), default="127.0.0.1")
    user_agent = Column(String(512), default="Web Browser")
    device_name = Column(String(128), default="Desktop Device")
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "ipAddress": self.ip_address,
            "userAgent": self.user_agent,
            "deviceName": self.device_name,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "revokedAt": self.revoked_at.isoformat() if self.revoked_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "isActive": self.revoked_at is None and self.expires_at > datetime.utcnow(),
        }

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=True)
    event_type = Column(String(64), nullable=False, index=True)  # LOGIN_SUCCESS, LOGIN_FAILED, REGISTER, etc.
    ip_address = Column(String(64), default="127.0.0.1")
    user_agent = Column(String(512), default="Unknown")
    details = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        try:
            parsed_details = json.loads(self.details or "{}")
        except Exception:
            parsed_details = {}
        return {
            "id": self.id,
            "userId": self.user_id,
            "eventType": self.event_type,
            "ipAddress": self.ip_address,
            "userAgent": self.user_agent,
            "details": parsed_details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

class TwoFactorSetting(Base):
    __tablename__ = "two_factor_settings"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    enabled = Column(Boolean, default=False)
    encrypted_totp_secret = Column(String(256), nullable=True)
    backup_codes_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def backup_codes(self):
        try:
            return json.loads(self.backup_codes_json or "[]")
        except Exception:
            return []

    @backup_codes.setter
    def backup_codes(self, val):
        self.backup_codes_json = json.dumps(val or [])

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "enabled": self.enabled,
            "hasSecret": bool(self.encrypted_totp_secret),
            "backupCodesCount": len(self.backup_codes),
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


# =====================================================================
# PHASE 10: COMPLETE COURSE AND LESSON MANAGEMENT SYSTEM MODELS
# =====================================================================

class CourseCategory(Base):
    __tablename__ = "course_categories"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    thumbnail = Column(String(256), default="BookOpen")
    sequence_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    courses = relationship("Course", back_populates="category", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "thumbnail": self.thumbnail,
            "sequenceOrder": self.sequence_order,
            "courseCount": len(self.courses) if self.courses else 0,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(64), primary_key=True, index=True)
    category_id = Column(String(64), ForeignKey("course_categories.id"), nullable=False, index=True)
    title = Column(String(256), nullable=False, index=True)
    description = Column(Text, default="")
    difficulty = Column(String(32), default="Beginner")  # Beginner, Intermediate, Advanced
    instructor_id = Column(String(64), nullable=True)
    instructor_name = Column(String(128), default="Dr. Elena Sharma")
    instructor_title = Column(String(128), default="Senior AI & EdTech Specialist")
    thumbnail = Column(String(256), default="")
    icon = Column(String(64), default="BookOpen")
    color = Column(String(32), default="#E83B64")
    estimated_duration = Column(String(64), default="10 hours")
    rating = Column(Float, default=4.9)
    rating_count = Column(Integer, default=128)
    enrollment_count = Column(Integer, default=450)
    published = Column(Boolean, default=True)
    learning_outcomes_json = Column(Text, default="[]")
    prerequisites_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("CourseCategory", back_populates="courses")
    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.sequence_number")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    assessments = relationship("CourseAssessment", back_populates="course", cascade="all, delete-orphan")

    @property
    def learning_outcomes(self):
        try:
            return json.loads(self.learning_outcomes_json or "[]")
        except Exception:
            return []

    @learning_outcomes.setter
    def learning_outcomes(self, val):
        self.learning_outcomes_json = json.dumps(val or [])

    @property
    def prerequisites(self):
        try:
            return json.loads(self.prerequisites_json or "[]")
        except Exception:
            return []

    @prerequisites.setter
    def prerequisites(self, val):
        self.prerequisites_json = json.dumps(val or [])

    def to_dict(self, include_modules=False):
        total_lessons = sum(len(m.lessons) for m in self.modules) if self.modules else 0
        data = {
            "id": self.id,
            "categoryId": self.category_id,
            "categoryName": self.category.name if self.category else "",
            "title": self.title,
            "description": self.description,
            "difficulty": self.difficulty,
            "instructorId": self.instructor_id,
            "instructorName": self.instructor_name,
            "instructorTitle": self.instructor_title,
            "thumbnail": self.thumbnail,
            "icon": self.icon,
            "color": self.color,
            "estimatedDuration": self.estimated_duration,
            "rating": round(self.rating, 1),
            "ratingCount": self.rating_count,
            "enrollmentCount": self.enrollment_count,
            "published": bool(self.published),
            "learningOutcomes": self.learning_outcomes,
            "prerequisites": self.prerequisites,
            "moduleCount": len(self.modules) if self.modules else 0,
            "lessonCount": total_lessons,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_modules and self.modules:
            data["modules"] = [m.to_dict(include_lessons=True) for m in self.modules]
        return data


class CourseModule(Base):
    __tablename__ = "course_modules"

    id = Column(String(64), primary_key=True, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, default="")
    sequence_number = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("CourseLesson", back_populates="module", cascade="all, delete-orphan", order_by="CourseLesson.sequence_number")
    assessments = relationship("CourseAssessment", back_populates="module", cascade="all, delete-orphan")

    def to_dict(self, include_lessons=False):
        data = {
            "id": self.id,
            "courseId": self.course_id,
            "title": self.title,
            "description": self.description,
            "sequenceNumber": self.sequence_number,
            "lessonCount": len(self.lessons) if self.lessons else 0,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_lessons and self.lessons:
            data["lessons"] = [l.to_dict(lightweight=True) for l in self.lessons]
        return data


class CourseLesson(Base):
    __tablename__ = "course_lessons"

    id = Column(String(64), primary_key=True, index=True)
    module_id = Column(String(64), ForeignKey("course_modules.id"), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    content = Column(Text, default="")
    learning_objectives_json = Column(Text, default="[]")
    duration = Column(Integer, default=15)  # estimated minutes
    sequence_number = Column(Integer, default=1)
    
    # Rich educational & adaptation representations
    code_snippet = Column(Text, default="")
    diagram_mermaid = Column(Text, default="")
    simple_explanation = Column(Text, default="")
    detailed_explanation = Column(Text, default="")
    step_by_step_json = Column(Text, default="[]")
    real_world_example = Column(Text, default="")
    revision_notes = Column(Text, default="")
    audio_script = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    module = relationship("CourseModule", back_populates="lessons")
    resources = relationship("LessonResource", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("CourseLessonProgress", back_populates="lesson", cascade="all, delete-orphan")
    notes = relationship("StudentLessonNote", back_populates="lesson", cascade="all, delete-orphan")
    bookmarks = relationship("LessonBookmark", back_populates="lesson", cascade="all, delete-orphan")

    @property
    def learning_objectives(self):
        try:
            return json.loads(self.learning_objectives_json or "[]")
        except Exception:
            return []

    @learning_objectives.setter
    def learning_objectives(self, val):
        self.learning_objectives_json = json.dumps(val or [])

    @property
    def step_by_step(self):
        try:
            return json.loads(self.step_by_step_json or "[]")
        except Exception:
            return []

    @step_by_step.setter
    def step_by_step(self, val):
        self.step_by_step_json = json.dumps(val or [])

    def to_dict(self, lightweight=False):
        data = {
            "id": self.id,
            "moduleId": self.module_id,
            "title": self.title,
            "duration": self.duration,
            "sequenceNumber": self.sequence_number,
            "learningObjectives": self.learning_objectives,
        }
        if not lightweight:
            data.update({
                "content": self.content,
                "codeSnippet": self.code_snippet,
                "diagramMermaid": self.diagram_mermaid,
                "simpleExplanation": self.simple_explanation,
                "detailedExplanation": self.detailed_explanation,
                "stepByStep": self.step_by_step,
                "realWorldExample": self.real_world_example,
                "revisionNotes": self.revision_notes,
                "audioScript": self.audio_script,
                "resources": [r.to_dict() for r in self.resources] if self.resources else [],
                "createdAt": self.created_at.isoformat() if self.created_at else None,
            })
        return data


class LessonResource(Base):
    __tablename__ = "lesson_resources"

    id = Column(String(64), primary_key=True, index=True)
    lesson_id = Column(String(64), ForeignKey("course_lessons.id"), nullable=False, index=True)
    resource_type = Column(String(32), default="pdf")  # pdf, slides, video, code, link
    title = Column(String(256), nullable=False)
    resource_url = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("CourseLesson", back_populates="resources")

    def to_dict(self):
        return {
            "id": self.id,
            "lessonId": self.lesson_id,
            "resourceType": self.resource_type,
            "title": self.title,
            "resourceUrl": self.resource_url,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(32), default="active")  # active, completed, dropped
    last_accessed_lesson_id = Column(String(64), nullable=True)
    last_accessed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    course = relationship("Course", back_populates="enrollments")

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "courseId": self.course_id,
            "status": self.status,
            "lastAccessedLessonId": self.last_accessed_lesson_id,
            "enrolledAt": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "lastAccessedAt": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
        }


class CourseLessonProgress(Base):
    __tablename__ = "course_lesson_progress"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("course_lessons.id"), nullable=False, index=True)
    completion_status = Column(String(32), default="not_started")  # not_started, in_progress, completed
    completed_at = Column(DateTime, nullable=True)
    time_spent_minutes = Column(Float, default=0.0)
    last_accessed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lesson = relationship("CourseLesson", back_populates="progress_records")

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "lessonId": self.lesson_id,
            "completionStatus": self.completion_status,
            "timeSpentMinutes": self.time_spent_minutes,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "lastAccessedAt": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
        }


class CourseAssessment(Base):
    __tablename__ = "course_assessments"

    id = Column(String(64), primary_key=True, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    module_id = Column(String(64), ForeignKey("course_modules.id"), nullable=True, index=True)
    title = Column(String(256), nullable=False)
    assessment_type = Column(String(32), default="module_quiz")  # module_quiz, final_exam, lesson_quiz
    total_marks = Column(Integer, default=100)
    passing_percentage = Column(Float, default=70.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="assessments")
    module = relationship("CourseModule", back_populates="assessments")
    questions = relationship("CourseQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

    def to_dict(self, include_questions=False):
        data = {
            "id": self.id,
            "courseId": self.course_id,
            "moduleId": self.module_id,
            "title": self.title,
            "assessmentType": self.assessment_type,
            "totalMarks": self.total_marks,
            "passingPercentage": self.passing_percentage,
            "questionCount": len(self.questions) if self.questions else 0,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_questions and self.questions:
            data["questions"] = [q.to_dict() for q in self.questions]
        return data


class CourseQuestion(Base):
    __tablename__ = "course_questions"

    id = Column(String(64), primary_key=True, index=True)
    assessment_id = Column(String(64), ForeignKey("course_assessments.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    question_type = Column(String(32), default="multiple_choice")  # multiple_choice, true_false, fill_blank, short_answer, coding
    options_json = Column(Text, default="[]")
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, default="")
    hints_json = Column(Text, default="[]")
    points = Column(Integer, default=10)

    assessment = relationship("CourseAssessment", back_populates="questions")

    @property
    def options(self):
        try:
            return json.loads(self.options_json or "[]")
        except Exception:
            return []

    @options.setter
    def options(self, val):
        self.options_json = json.dumps(val or [])

    @property
    def hints(self):
        try:
            return json.loads(self.hints_json or "[]")
        except Exception:
            return []

    @hints.setter
    def hints(self, val):
        self.hints_json = json.dumps(val or [])

    def to_dict(self, hide_answer=False):
        data = {
            "id": self.id,
            "assessmentId": self.assessment_id,
            "question": self.question,
            "questionType": self.question_type,
            "options": self.options,
            "hints": self.hints,
            "points": self.points,
        }
        if not hide_answer:
            data["correctAnswer"] = self.correct_answer
            data["explanation"] = self.explanation
        return data


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(String(64), ForeignKey("course_assessments.id"), nullable=False, index=True)
    score = Column(Float, default=0.0)
    total_points = Column(Float, default=100.0)
    percentage = Column(Float, default=0.0)
    passed = Column(Boolean, default=False)
    answers_json = Column(Text, default="{}")
    attempted_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("CourseAssessment", back_populates="attempts")

    @property
    def answers(self):
        try:
            return json.loads(self.answers_json or "{}")
        except Exception:
            return {}

    @answers.setter
    def answers(self, val):
        self.answers_json = json.dumps(val or {})

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "assessmentId": self.assessment_id,
            "score": self.score,
            "totalPoints": self.total_points,
            "percentage": round(self.percentage, 1),
            "passed": bool(self.passed),
            "answers": self.answers,
            "attemptedAt": self.attempted_at.isoformat() if self.attempted_at else None,
        }


class CourseCertificate(Base):
    __tablename__ = "course_certificates"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    certificate_number = Column(String(64), unique=True, nullable=False, index=True)
    student_name = Column(String(128), nullable=False)
    course_title = Column(String(256), nullable=False)
    verification_hash = Column(String(128), nullable=False)
    grade = Column(String(16), default="A")
    score_percentage = Column(Float, default=95.0)
    issued_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "courseId": self.course_id,
            "certificateNumber": self.certificate_number,
            "studentName": self.student_name,
            "courseTitle": self.course_title,
            "verificationHash": self.verification_hash,
            "grade": self.grade,
            "scorePercentage": self.score_percentage,
            "issuedAt": self.issued_at.isoformat() if self.issued_at else None,
        }


class StudentLessonNote(Base):
    __tablename__ = "student_lesson_notes"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("course_lessons.id"), nullable=False, index=True)
    note_text = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lesson = relationship("CourseLesson", back_populates="notes")

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "lessonId": self.lesson_id,
            "noteText": self.note_text,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class LessonBookmark(Base):
    __tablename__ = "lesson_bookmarks"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(String(64), ForeignKey("course_lessons.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("CourseLesson", back_populates="bookmarks")

    def to_dict(self):
        return {
            "id": self.id,
            "studentId": self.student_id,
            "lessonId": self.lesson_id,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }




