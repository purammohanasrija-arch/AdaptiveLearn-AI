import os
import sys
import json
from datetime import datetime, timedelta

# Set UTF-8 encoding for standard output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
os.environ["LOKY_MAX_CPU_COUNT"] = "4"
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import (
    User,
    LearnerProfile,
    Lesson,
    LearningProgress,
    QuizAttempt,
    Assignment,
    KnowledgeGap,
    TeacherAlert,
)
from ai_engine import learning_dna_engine, gap_detector, teacher_alert_engine

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if lessons already exist
    existing_lessons = db.query(Lesson).count()
    if existing_lessons > 0:
        db.close()
        return

    print("[SEED] Seeding database from seed_data.json...")
    seed_path = os.path.join(os.path.dirname(__file__), "seed_data.json")
    
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        print("⚠️ seed_data.json not found, using empty seed.")
        data = {"lessons": [], "users": [], "assignments": []}

    # 1. Insert Lessons
    for l_data in data.get("lessons", []):
        lesson = Lesson(
            id=l_data["id"],
            title=l_data["title"],
            subject=l_data["subject"],
            topic=l_data.get("topic", l_data["title"]),
            difficulty=l_data.get("difficulty", "easy"),
            estimated_duration=l_data.get("estimatedDuration", 15),
            icon=l_data.get("icon", "BookOpen"),
            color=l_data.get("color", "#E11D48"),
            original_content=l_data.get("originalContent", {}),
            adapted_content=l_data.get("adaptedContent", {}),
            quiz=l_data.get("quiz", []),
            video_data=l_data.get("videoData", {}),
        )
        db.add(lesson)
    db.commit()

    # 2. Insert Users, Profiles, Progress, and Quiz Attempts
    for u_data in data.get("users", []):
        user = User(
            id=u_data["id"],
            name=u_data["name"],
            email=u_data["email"],
            password_hash=u_data.get("passwordHash", "hashedPassword123"),
            role=u_data.get("role", "student"),
            avatar=u_data.get("avatar", "🎓"),
            age_range=u_data.get("ageRange", "14-16"),
        )
        db.add(user)
        db.flush()

        prof = u_data.get("profile", {})
        # Compute real ML Learning DNA for student
        learning_dna = learning_dna_engine.compute_dna(prof, u_data.get("quizAttempts", []))

        profile = LearnerProfile(
            user_id=user.id,
            preferred_language=prof.get("preferredLanguage", "English"),
            learning_level=prof.get("learningLevel", "beginner"),
            preferred_format=prof.get("preferredFormat", "simplified"),
            text_size=prof.get("textSize", "large"),
            speech_rate=prof.get("speechRate", 0.9),
            explanation_style=prof.get("explanationStyle", "simple"),
            quiz_difficulty=prof.get("quizDifficulty", "easy"),
            reading_speed=prof.get("readingSpeed", "moderate"),
            accessibility_preferences=prof.get("accessibilityPreferences", {}),
            disability_context=prof.get("disabilityContext", ""),
            baseline_score=prof.get("baselineScore", 70.0),
            streak_days=prof.get("streakDays", 1),
            daily_goal_minutes=prof.get("dailyGoalMinutes", 20),
            today_minutes_spent=prof.get("todayMinutesSpent", 0),
            onboarding_completed=True,
            learning_dna=learning_dna,
        )
        db.add(profile)

        # Progress records
        for p_data in u_data.get("progress", []):
            prog = LearningProgress(
                user_id=user.id,
                lesson_id=p_data["lessonId"],
                completion_percentage=p_data.get("completionPercentage", 0),
                mastery_score=p_data.get("masteryScore", 0),
                status=p_data.get("status", "not_started"),
                time_spent_minutes=p_data.get("timeSpentMinutes", 0),
                bookmarks=p_data.get("bookmarks", []),
                notes=p_data.get("notes", []),
                last_accessed_format=p_data.get("lastAccessedFormat", "simplified"),
            )
            db.add(prog)

        # Quiz attempts
        for qa_data in u_data.get("quizAttempts", []):
            qa = QuizAttempt(
                id=qa_data["id"],
                user_id=user.id,
                lesson_id=qa_data["lessonId"],
                quiz_id=qa_data.get("quizId", "quiz-main"),
                answers=qa_data.get("answers", []),
                score=qa_data.get("score", 80),
                accuracy=qa_data.get("accuracy", 0.8),
                total_questions=qa_data.get("totalQuestions", 4),
                time_spent_seconds=qa_data.get("timeSpentSeconds", 100),
                difficulty_level=qa_data.get("difficultyLevel", "easy"),
            )
            db.add(qa)
    db.commit()

    # 3. Insert Assignments
    for a_data in data.get("assignments", []):
        due = datetime.utcnow() + timedelta(days=3)
        assignment = Assignment(
            id=a_data["id"],
            teacher_id=a_data["teacherId"],
            student_ids=a_data.get("studentIds", []),
            lesson_id=a_data["lessonId"],
            title=a_data["title"],
            instructions=a_data.get("instructions", ""),
            recommended_format=a_data.get("recommendedFormat", "simplified"),
            due_date=due,
            status=a_data.get("status", "active"),
        )
        db.add(assignment)
    db.commit()

    # 4. Generate Initial Knowledge Gaps & Teacher Alerts
    for u_data in data.get("users", []):
        if u_data.get("role") == "student":
            gaps = gap_detector.detect_gaps(u_data["id"], u_data.get("quizAttempts", []))
            for g in gaps:
                kg = KnowledgeGap(
                    user_id=g["userId"],
                    topic=g["topic"],
                    concept=g["concept"],
                    severity=g["severity"],
                    misconception=g["misconception"],
                    recommended_action=g["recommendedAction"],
                )
                db.add(kg)

            alerts = teacher_alert_engine.evaluate_student(u_data)
            for a in alerts:
                ta = TeacherAlert(
                    student_id=a["studentId"],
                    student_name=a["studentName"],
                    topic=a["topic"],
                    alert_type=a["alertType"],
                    urgency=a["urgency"],
                    reason=a["reason"],
                    recommended_intervention=a["recommendedIntervention"],
                )
                db.add(ta)
    db.commit()
    db.close()
    print("[SEED SUCCESS] Database successfully initialized and seeded with inclusive curriculum & student profiles!")

if __name__ == "__main__":
    seed_database()
