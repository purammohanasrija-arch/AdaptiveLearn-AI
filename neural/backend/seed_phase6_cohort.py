"""
Seed script for Phase 6 Testing Scenario:
- 1 Teacher: Dr. Elena Sharma (user-teacher-1)
- 1 Class: Inclusive STEM Cohort 2026
- 5 Sample Students across different learning trajectories:
  1. Aarav Patel (user-student-a) - High Mastery, Progressing Well
  2. Maya Lin (user-student-b) - Auditory-First, Progressing Well
  3. Carlos Mendez (user-student-c) - Strong in Programming, Needs Revision in Math Fractions
  4. Zoe Chen (user-student-d) - Steady Improver, Showing Improvement (+18% slope)
  5. David Kim (user-student-e) - Low Mastery in Algebra/Loops, Requires Additional Support
- 4 Core STEM Subjects:
  - Computer Science (lesson-1)
  - Mathematics (lesson-2)
  - Programming (lesson-3)
  - Environmental Science (lesson-4)
"""

import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import engine, SessionLocal, Base
from models import (
    User,
    LearnerProfile,
    Lesson,
    LearningProgress,
    QuizAttempt,
    KnowledgeGap,
    TeacherAlert,
    TeacherFeedback,
    Assignment,
)

def ensure_phase6_cohort():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    # 1. Ensure Teacher
    teacher = db.query(User).filter(User.id == "user-teacher-1").first()
    if not teacher:
        teacher = User(
            id="user-teacher-1",
            name="Dr. Elena Sharma",
            email="elena.sharma@school.edu",
            password_hash="teacherPass123",
            role="teacher",
            avatar="👩‍🏫",
            age_range="30+",
        )
        db.add(teacher)
        db.commit()

    # 2. Student D: Zoe Chen (Showing Improvement)
    zoe = db.query(User).filter(User.id == "user-student-d").first()
    if not zoe:
        zoe = User(
            id="user-student-d",
            name="Zoe Chen",
            email="zoe.chen@student.adaptlearn.ai",
            password_hash="studentPass123",
            role="student",
            avatar="👧",
            age_range="14-16",
        )
        db.add(zoe)
        db.flush()

        zoe_prof = LearnerProfile(
            user_id="user-student-d",
            preferred_language="English",
            learning_level="intermediate",
            preferred_format="simplified",
            text_size="large",
            speech_rate=0.9,
            explanation_style="simple",
            quiz_difficulty="medium",
            reading_speed="moderate",
            accessibility_preferences={
                "needs": ["cognitive", "reading"],
                "cognitiveMode": True,
                "focusMode": True,
                "assessmentTimeMultiplier": 1.5,
                "readingRuler": True,
            },
            disability_context="ADHD / Sensory Overload (prefers one-concept-at-a-time focus mode)",
            baseline_score=60.0,
            streak_days=5,
            daily_goal_minutes=25,
            today_minutes_spent=20,
            onboarding_completed=True,
            learning_dna_json='{"archetype": "Curious Momentum Builder", "dimensions": {"visual": 65, "auditory": 60, "kinesthetic": 85, "pace": 60, "mastery": 78}}',
        )
        db.add(zoe_prof)

        # Progress for Zoe
        p1 = LearningProgress(
            user_id="user-student-d",
            lesson_id="lesson-1",
            status="completed",
            completion_percentage=100,
            mastery_score=82.0,
            time_spent_minutes=22.0,
            last_accessed_format="simplified",
        )
        p2 = LearningProgress(
            user_id="user-student-d",
            lesson_id="lesson-2",
            status="completed",
            completion_percentage=100,
            mastery_score=72.0,
            time_spent_minutes=28.0,
            last_accessed_format="simplified",
        )
        p3 = LearningProgress(
            user_id="user-student-d",
            lesson_id="lesson-3",
            status="completed",
            completion_percentage=100,
            mastery_score=78.0,
            time_spent_minutes=25.0,
            last_accessed_format="step_by_step",
        )
        p4 = LearningProgress(
            user_id="user-student-d",
            lesson_id="lesson-4",
            status="completed",
            completion_percentage=100,
            mastery_score=88.0,
            time_spent_minutes=19.0,
            last_accessed_format="simplified",
        )
        db.add_all([p1, p2, p3, p4])

        # Quiz attempts with upward trend
        q1 = QuizAttempt(
            id=f"attempt-{uuid.uuid4().hex[:8]}",
            user_id="user-student-d",
            lesson_id="lesson-1",
            score=70.0,
            accuracy=70.0,
            total_questions=3,
            time_spent_seconds=120,
            difficulty_level="easy",
            answers_json='{"0": 0, "1": 1, "2": 0}',
            attempted_at=now - timedelta(days=8),
        )
        q2 = QuizAttempt(
            id=f"attempt-{uuid.uuid4().hex[:8]}",
            user_id="user-student-d",
            lesson_id="lesson-2",
            score=75.0,
            accuracy=75.0,
            total_questions=3,
            time_spent_seconds=110,
            difficulty_level="medium",
            answers_json='{"0": 0, "1": 0, "2": 1}',
            attempted_at=now - timedelta(days=4),
        )
        q3 = QuizAttempt(
            id=f"attempt-{uuid.uuid4().hex[:8]}",
            user_id="user-student-d",
            lesson_id="lesson-4",
            score=90.0,
            accuracy=90.0,
            total_questions=3,
            time_spent_seconds=95,
            difficulty_level="medium",
            answers_json='{"0": 0, "1": 0, "2": 0}',
            attempted_at=now - timedelta(days=1),
        )
        db.add_all([q1, q2, q3])
        db.commit()

    # 3. Student E: David Kim (Requires Additional Support)
    david = db.query(User).filter(User.id == "user-student-e").first()
    if not david:
        david = User(
            id="user-student-e",
            name="David Kim",
            email="david.kim@student.adaptlearn.ai",
            password_hash="studentPass123",
            role="student",
            avatar="👦🏻",
            age_range="14-16",
        )
        db.add(david)
        db.flush()

        david_prof = LearnerProfile(
            user_id="user-student-e",
            preferred_language="English",
            learning_level="beginner",
            preferred_format="step_by_step",
            text_size="large",
            speech_rate=0.8,
            explanation_style="simple",
            quiz_difficulty="easy",
            reading_speed="slow",
            accessibility_preferences={
                "needs": ["cognitive", "motor"],
                "assessmentTimeMultiplier": 2.0,
                "motorMode": True,
                "focusMode": True,
            },
            disability_context="Motor & Cognitive Fatigue (requires double quiz time & simplified steps)",
            baseline_score=48.0,
            streak_days=2,
            daily_goal_minutes=15,
            today_minutes_spent=12,
            onboarding_completed=True,
            learning_dna_json='{"archetype": "Careful Step-by-Step Explorer", "dimensions": {"visual": 45, "auditory": 50, "kinesthetic": 40, "pace": 40, "mastery": 52}}',
        )
        db.add(david_prof)

        # Progress for David
        dp1 = LearningProgress(
            user_id="user-student-e",
            lesson_id="lesson-1",
            status="completed",
            completion_percentage=100,
            mastery_score=68.0,
            time_spent_minutes=35.0,
            last_accessed_format="step_by_step",
        )
        dp2 = LearningProgress(
            user_id="user-student-e",
            lesson_id="lesson-2",
            status="in_progress",
            completion_percentage=50,
            mastery_score=45.0,
            time_spent_minutes=42.0,
            last_accessed_format="step_by_step",
        )
        dp3 = LearningProgress(
            user_id="user-student-e",
            lesson_id="lesson-3",
            status="in_progress",
            completion_percentage=35,
            mastery_score=42.0,
            time_spent_minutes=30.0,
            last_accessed_format="step_by_step",
        )
        db.add_all([dp1, dp2, dp3])

        # Quiz attempts with low accuracy
        dq1 = QuizAttempt(
            id=f"attempt-{uuid.uuid4().hex[:8]}",
            user_id="user-student-e",
            lesson_id="lesson-2",
            score=33.3,
            accuracy=33.3,
            total_questions=3,
            time_spent_seconds=240,
            difficulty_level="easy",
            answers_json='{"0": 1, "1": 1, "2": 0}',
            attempted_at=now - timedelta(days=3),
        )
        dq2 = QuizAttempt(
            id=f"attempt-{uuid.uuid4().hex[:8]}",
            user_id="user-student-e",
            lesson_id="lesson-3",
            score=40.0,
            accuracy=40.0,
            total_questions=3,
            time_spent_seconds=220,
            difficulty_level="easy",
            answers_json='{"0": 1, "1": 0, "2": 2}',
            attempted_at=now - timedelta(days=1),
        )
        db.add_all([dq1, dq2])

        # Knowledge Gaps for David
        gap1 = KnowledgeGap(
            user_id="user-student-e",
            topic="Fractions and Denominator Division",
            concept="Denominator Normalization",
            severity="high",
            misconception="Confuses numerator and denominator in fractions division",
            recommended_action="Review pizza slice visual analogy before attempting next fraction quiz.",
        )
        gap2 = KnowledgeGap(
            user_id="user-student-e",
            topic="Programming Loops & Termination",
            concept="While Loop Condition",
            severity="high",
            misconception="Cannot identify loop stop condition, leading to infinite loop confusion",
            recommended_action="Use step-by-step counter simulation with visual blocks.",
        )
        db.add_all([gap1, gap2])

        # Teacher alert for David
        alert1 = TeacherAlert(
            student_id="user-student-e",
            student_name="David Kim",
            topic="Basic Mathematics & Programming Loops",
            alert_type="struggling_concept",
            urgency="high",
            reason="Scored under 50% across two consecutive lessons with 3+ repeated incorrect answers.",
            recommended_intervention="Assign foundational step-by-step revision exercises and schedule 10-minute check-in.",
            resolved=False,
            created_at=now - timedelta(hours=6),
        )
        db.add(alert1)
        db.commit()

    # 4. Carlos Mendez (Needs Revision in Math)
    carlos_gap = db.query(KnowledgeGap).filter(KnowledgeGap.user_id == "user-student-c").first()
    if not carlos_gap:
        c_gap = KnowledgeGap(
            user_id="user-student-c",
            topic="Fractions and Visual Ratios",
            concept="Visual Ratio Equivalence",
            severity="medium",
            misconception="Equates unequal fractional parts without normalizing denominators",
            recommended_action="Assign 5-question visual ratio revision module.",
        )
        db.add(c_gap)
        c_alert = TeacherAlert(
            student_id="user-student-c",
            student_name="Carlos Mendez",
            topic="Fractions and Visual Ratios",
            alert_type="struggling_concept",
            urgency="medium",
            reason="Math quiz accuracy dropped below 60% on fractions module.",
            recommended_intervention="Recommend visual pizza diagram mode and assign beginner revision quiz.",
            resolved=False,
            created_at=now - timedelta(days=2),
        )
        db.add(c_alert)
        db.commit()

    # 5. Seed initial teacher feedback
    fb1 = db.query(TeacherFeedback).filter(TeacherFeedback.student_id == "user-student-a").first()
    if not fb1:
        f1 = TeacherFeedback(
            id="fb-001",
            teacher_id="user-teacher-1",
            student_id="user-student-a",
            note="Outstanding work on computer hardware architecture! Your score was in the top 5% of the class.",
            category="praise",
            priority="normal",
            read_by_student=True,
            created_at=now - timedelta(days=2),
        )
        f2 = TeacherFeedback(
            id="fb-002",
            teacher_id="user-teacher-1",
            student_id="user-student-c",
            note="Take a look at the visual fraction strips lesson before tomorrow's review quiz. You've got this!",
            category="revision_reminder",
            priority="normal",
            read_by_student=False,
            created_at=now - timedelta(days=1),
        )
        f3 = TeacherFeedback(
            id="fb-003",
            teacher_id="user-teacher-1",
            student_id="user-student-e",
            note="I've enabled 2x extra assessment time and step-by-step cards for your profile. Let me know if you need a quick chat.",
            category="accommodation",
            priority="urgent",
            read_by_student=False,
            created_at=now - timedelta(hours=4),
        )
        db.add_all([f1, f2, f3])
        db.commit()

    print(f"[COHORT SEEDED] 5 Sample students confirmed in database: Aarav, Maya, Carlos, Zoe, David.")
    db.close()

if __name__ == "__main__":
    ensure_phase6_cohort()
