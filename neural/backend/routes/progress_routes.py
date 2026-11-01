from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import LearningProgress, User, Lesson, QuizAttempt
from routes.auth_routes import get_current_user_from_header

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.post("/update")
def update_progress(
    payload: dict,
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    target_user_id = user.id if user else payload.get("userId", "user-student-a")
    lesson_id = payload.get("lessonId")
    completion = float(payload.get("completionPercentage", 0))
    time_spent = float(payload.get("timeSpentMinutes", 0))
    format_accessed = payload.get("lastAccessedFormat", "simplified")

    if not lesson_id:
        raise HTTPException(status_code=400, detail="lessonId is required")

    progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == target_user_id,
        LearningProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = LearningProgress(
            user_id=target_user_id,
            lesson_id=lesson_id,
            completion_percentage=completion,
            mastery_score=min(100.0, completion * 0.9),
            status="completed" if completion >= 100 else ("in_progress" if completion > 0 else "not_started"),
            time_spent_minutes=time_spent,
            last_accessed_format=format_accessed,
        )
        db.add(progress)
    else:
        progress.completion_percentage = max(progress.completion_percentage, completion)
        if completion >= 100:
            progress.status = "completed"
        elif progress.completion_percentage > 0 and progress.status == "not_started":
            progress.status = "in_progress"
        progress.time_spent_minutes += time_spent
        progress.last_accessed_format = format_accessed
        progress.last_accessed_at = datetime.utcnow()

    # Bookmarks and notes handling
    if "bookmark" in payload and payload["bookmark"]:
        current_bms = progress.bookmarks or []
        current_bms.append(payload["bookmark"])
        progress.bookmarks = current_bms

    if "note" in payload and payload["note"]:
        current_notes = progress.notes or []
        current_notes.append(payload["note"])
        progress.notes = current_notes

    db.commit()
    return {"success": True, "progress": progress.to_dict()}

@router.get("/summary")
def get_progress_summary(
    userId: str = Query(None),
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    target_id = userId or (user.id if user else "user-student-a")
    student = db.query(User).filter(User.id == target_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()

    progress_records = db.query(LearningProgress).filter(LearningProgress.user_id == student.id).all()
    all_lessons = db.query(Lesson).all()

    completed_count = sum(1 for p in progress_records if p.status == "completed")
    in_progress_count = sum(1 for p in progress_records if p.status == "in_progress")
    total_time = sum(p.time_spent_minutes for p in progress_records)

    mastery_scores = [p.mastery_score for p in progress_records if p.mastery_score > 0]
    avg_mastery = int(round(sum(mastery_scores) / len(mastery_scores))) if mastery_scores else (student.profile.baseline_score if student.profile else 75)

    # Subject breakdown
    subject_map = {}
    for p in progress_records:
        l = next((item for item in all_lessons if item.id == p.lesson_id), None)
        subj = l.subject if l else "General"
        if subj not in subject_map:
            subject_map[subj] = {"scores": [], "count": 0}
        subject_map[subj]["scores"].append(p.mastery_score)
        subject_map[subj]["count"] += 1

    subject_breakdown = []
    for subj, data in subject_map.items():
        avg_s = int(round(sum(data["scores"]) / len(data["scores"]))) if data["scores"] else 70
        subject_breakdown.append({
            "subject": subj,
            "masteryScore": avg_s,
            "lessonsEnrolled": data["count"],
        })

    # AI Recommendation
    unstarted = [l for l in all_lessons if not any(p.lesson_id == l.id and p.status == "completed" for p in progress_records)]
    if unstarted:
        rec_lesson = unstarted[0]
        rec_action = "start"
        advice = f"Begin exploring {rec_lesson.title} using your personalized accommodations."
    elif all_lessons:
        rec_lesson = all_lessons[0]
        rec_action = "review"
        advice = f"Great pace! Review {rec_lesson.title} to lock in long-term memory."
    else:
        rec_lesson = None
        rec_action = "explore"
        advice = "Continue exploring inclusive learning modules."

    # Radar chart metrics from Learning DNA
    profile = student.profile
    dna = profile.learning_dna if profile else {}
    radar_data = dna.get("radarMetrics", [
        {"dimension": "Visual Processing", "score": 85, "fullMark": 100},
        {"dimension": "Auditory Processing", "score": 80, "fullMark": 100},
        {"dimension": "Reading Velocity", "score": 75, "fullMark": 100},
        {"dimension": "Cognitive Stamina", "score": 78, "fullMark": 100},
        {"dimension": "Concept Mastery", "score": avg_mastery, "fullMark": 100},
        {"dimension": "Pacing Adaptability", "score": 82, "fullMark": 100},
    ])

    return {
        "summary": {
            "overallMastery": avg_mastery,
            "completedLessons": completed_count,
            "inProgressLessons": in_progress_count,
            "totalLessons": len(all_lessons),
            "totalTimeMinutes": int(round(total_time)),
            "streakDays": profile.streak_days if profile else 4,
            "dailyGoalMinutes": profile.daily_goal_minutes if profile else 20,
            "todayMinutesSpent": profile.today_minutes_spent if profile else 16,
        },
        "subjects": subject_breakdown,
        "recommendation": {
            "lessonId": rec_lesson.id if rec_lesson else "lesson-1",
            "lessonTitle": rec_lesson.title if rec_lesson else "Introduction to Computers",
            "action": rec_action,
            "advice": advice,
        },
        "radarData": radar_data,
        "progressList": [p.to_dict() for p in progress_records],
    }

@router.get("/journey-timeline/{user_id}")
def get_journey_timeline(user_id: str, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()

    progress_records = db.query(LearningProgress).filter(LearningProgress.user_id == student.id).all()
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == student.id).order_by(QuizAttempt.attempted_at.asc()).all()

    timeline = []
    # Initial milestone
    timeline.append({
        "date": "Day 1",
        "title": "Onboarding & Inclusive Profiling",
        "type": "milestone",
        "badge": "AI Learning DNA",
        "description": f"Registered personalized accommodations: {student.profile.disability_context if student.profile else 'Custom accommodations configured'}.",
    })

    for a in attempts:
        lesson = db.query(Lesson).filter(Lesson.id == a.lesson_id).first()
        timeline.append({
            "date": a.attempted_at.strftime("%b %d, %H:%M") if a.attempted_at else "Recent",
            "title": f"Quiz: {lesson.title if lesson else 'Concept Check'}",
            "type": "quiz",
            "badge": f"{a.score}% Score",
            "description": f"Answered {int(a.accuracy * a.total_questions)}/{a.total_questions} questions correctly in {a.time_spent_seconds}s at {a.difficulty_level.capitalize()} tier.",
        })

    for p in progress_records:
        if p.status == "completed":
            lesson = db.query(Lesson).filter(Lesson.id == p.lesson_id).first()
            timeline.append({
                "date": p.last_accessed_at.strftime("%b %d") if p.last_accessed_at else "Recently",
                "title": f"Mastery Achieved: {lesson.title if lesson else p.lesson_id}",
                "type": "completion",
                "badge": f"{int(p.mastery_score)}% Mastery",
                "description": f"Completed using {p.last_accessed_format.capitalize()} mode over {int(p.time_spent_minutes)} minutes.",
            })

    return {"timeline": timeline}

