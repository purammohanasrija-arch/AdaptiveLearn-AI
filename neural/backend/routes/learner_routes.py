import uuid
from datetime import datetime
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from database import get_db
from models import (
    User,
    LearnerProfile,
    Lesson,
    LearningProgress,
    QuizAttempt,
    KnowledgeGap,
    RevisionSession,
)
from routes.auth_routes import get_current_user_from_header
from adaptive_engine import (
    learner_intelligence,
    difficulty_predictor,
    content_adapter,
    knowledge_gap_tracker,
    recommendation_engine,
    smart_revision,
)
from ai_engine import bkt_engine, irt_engine

router = APIRouter(tags=["Learner Intelligence & Adaptive Engine"])

# Helper to resolve user
def resolve_student(user_id: str, header_user: User, db: Session) -> User:
    target_id = user_id or (header_user.id if header_user else "user-student-a")
    student = db.query(User).filter(User.id == target_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()
    return student

# ---------------------------------------------------------------------------
# 1. POST /api/learner/profile
# ---------------------------------------------------------------------------
@router.post("/api/learner/profile")
def save_learner_profile(
    payload: dict,
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    student = resolve_student(payload.get("userId"), user, db)
    profile = student.profile
    if not profile:
        profile = LearnerProfile(user_id=student.id)
        db.add(profile)

    if "preferredFormat" in payload:
        profile.preferred_format = payload["preferredFormat"]
    if "textSize" in payload:
        profile.text_size = payload["textSize"]
    if "readingSpeed" in payload:
        profile.reading_speed = payload["readingSpeed"]
    if "speechRate" in payload:
        profile.speech_rate = float(payload["speechRate"])
    if "explanationStyle" in payload:
        profile.explanation_style = payload["explanationStyle"]
    if "quizDifficulty" in payload:
        profile.quiz_difficulty = payload["quizDifficulty"]
    if "learningLevel" in payload:
        profile.learning_level = payload["learningLevel"]
    if "disabilityContext" in payload:
        profile.disability_context = payload["disabilityContext"]
    if "accessibilityPreferences" in payload:
        profile.accessibility_preferences = payload["accessibilityPreferences"]
    if "baselineScore" in payload:
        profile.baseline_score = float(payload["baselineScore"])

    db.commit()
    return {
        "success": True,
        "message": "Learner profile successfully updated with voluntarily chosen accommodations.",
        "profile": profile.to_dict(),
        "ethicalStandard": "Never infer disability from performance. Preferences are voluntarily chosen.",
    }

# ---------------------------------------------------------------------------
# 2. POST /api/learner/analyze
# ---------------------------------------------------------------------------
@router.post("/api/learner/analyze")
def analyze_learner_intelligence(
    payload: dict = None,
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    req_uid = payload.get("userId") if payload else None
    student = resolve_student(req_uid, user, db)

    quiz_attempts = [q.to_dict() for q in student.quiz_attempts]
    
    # Enrich progress records with lesson subject if needed
    progress_records = []
    for p in student.progress_records:
        p_dict = p.to_dict()
        l = db.query(Lesson).filter(Lesson.id == p.lesson_id).first()
        p_dict["subject"] = l.subject if l else "General"
        progress_records.append(p_dict)

    analysis = learner_intelligence.analyze_learner(student.to_dict(), quiz_attempts, progress_records)
    return analysis

# ---------------------------------------------------------------------------
# 3. POST /api/quiz/submit
# ---------------------------------------------------------------------------
@router.post("/api/quiz/submit")
def submit_adaptive_quiz(
    payload: dict,
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    student = resolve_student(payload.get("userId"), user, db)
    lesson_id = payload.get("lessonId", "lesson-1")
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found.")

    answers = payload.get("answers", [])
    time_spent_seconds = payload.get("timeSpentSeconds", 75)

    # 1. Answer evaluation
    questions = lesson.quiz or []
    correct_count = 0
    evaluated_answers = []

    for ans in answers:
        q_id = ans.get("questionId")
        q = next((item for item in questions if item.get("id") == q_id), None)
        is_correct = bool(q and q.get("correctAnswer") == ans.get("selectedOption"))
        if is_correct:
            correct_count += 1
        evaluated_answers.append({
            "questionId": q_id,
            "selectedOption": ans.get("selectedOption"),
            "isCorrect": is_correct,
            "correctAnswer": q.get("correctAnswer") if q else 0,
            "explanation": q.get("explanation") if q else "Review the lesson core concepts.",
            "hint": q.get("hint") if q else "",
        })

    total_q = max(1, len(questions) or len(evaluated_answers))
    score = int(round((correct_count / total_q) * 100))
    accuracy = round(float(correct_count / total_q), 2)

    # 2. Dynamic Difficulty Adjustment (3-Level Beginner / Intermediate / Advanced)
    profile = student.profile
    cur_difficulty = profile.quiz_difficulty if profile else "beginner"
    recent_attempts = [q.to_dict() for q in student.quiz_attempts]
    diff_eval = difficulty_predictor.predict_next_difficulty(cur_difficulty, recent_attempts, score)

    # 3. Bayesian Knowledge Tracing & IRT update
    current_progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == student.id,
        LearningProgress.lesson_id == lesson.id
    ).first()

    prior_knowledge = (current_progress.mastery_score / 100.0) if current_progress and current_progress.mastery_score else 0.5
    updated_knowledge = bkt_engine.update(prior_knowledge, accuracy >= 0.70)
    new_mastery = int(round(updated_knowledge * 100))

    # 4. Save QuizAttempt to SQLite
    attempt_id = f"qa-{uuid.uuid4().hex[:8]}"
    attempt = QuizAttempt(
        id=attempt_id,
        user_id=student.id,
        lesson_id=lesson.id,
        quiz_id=f"quiz-{lesson.id}",
        answers=evaluated_answers,
        score=score,
        accuracy=accuracy,
        total_questions=total_q,
        time_spent_seconds=time_spent_seconds,
        difficulty_level=diff_eval["recommendedDifficulty"],
    )
    db.add(attempt)

    # 5. Update LearningProgress
    if not current_progress:
        current_progress = LearningProgress(
            user_id=student.id,
            lesson_id=lesson.id,
            completion_percentage=100.0 if score >= 70 else 75.0,
            mastery_score=new_mastery,
            status="completed" if score >= 70 else "in_progress",
            time_spent_minutes=round(time_spent_seconds / 60.0, 1),
            last_accessed_format=profile.preferred_format if profile else "simplified",
        )
        db.add(current_progress)
    else:
        current_progress.mastery_score = max(current_progress.mastery_score, new_mastery)
        current_progress.completion_percentage = 100.0 if score >= 70 else max(current_progress.completion_percentage, 75.0)
        if score >= 70:
            current_progress.status = "completed"
        current_progress.time_spent_minutes += round(time_spent_seconds / 60.0, 1)

    # Update profile difficulty level
    if profile:
        profile.quiz_difficulty = diff_eval["recommendedDifficulty"]

    db.commit()

    return {
        "success": True,
        "score": score,
        "accuracy": accuracy,
        "correctCount": correct_count,
        "totalQuestions": total_q,
        "masteryScore": new_mastery,
        "difficultyEvaluation": diff_eval,
        "bktMasteryProbability": round(updated_knowledge, 3),
        "answers": evaluated_answers,
    }

# ---------------------------------------------------------------------------
# 4. GET /api/learner/progress
# ---------------------------------------------------------------------------
@router.get("/api/learner/progress")
def get_learner_progress(
    userId: str = Query(None),
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    student = resolve_student(userId, user, db)
    progress_records = student.progress_records
    attempts = student.quiz_attempts
    all_lessons = db.query(Lesson).all()

    # Topic-wise performance aggregation
    topic_map = {}
    for p in progress_records:
        l = next((item for item in all_lessons if item.id == p.lesson_id), None)
        subj = l.subject if l else "General"
        if subj not in topic_map:
            topic_map[subj] = []
        topic_map[subj].append(p.mastery_score)

    topic_performance = []
    for subj, scores in topic_map.items():
        topic_performance.append({
            "topic": subj,
            "masteryScore": int(round(np.mean(scores))) if scores else 70,
            "lessonsTracked": len(scores),
        })

    # Sequential improvement graph points
    improvement_graph = []
    for idx, a in enumerate(attempts):
        improvement_graph.append({
            "attemptIndex": idx + 1,
            "score": a.score,
            "accuracy": a.accuracy,
            "difficulty": a.difficulty_level,
            "date": a.attempted_at.strftime("%b %d, %H:%M") if a.attempted_at else f"Attempt {idx+1}",
        })

    # Overall mastery
    all_scores = [p.mastery_score for p in progress_records if p.mastery_score > 0]
    overall_mastery = int(round(np.mean(all_scores))) if all_scores else (student.profile.baseline_score if student.profile else 70)

    return {
        "userId": student.id,
        "studentName": student.name,
        "overallMastery": overall_mastery,
        "completedLessonsCount": sum(1 for p in progress_records if p.status == "completed"),
        "totalTimeMinutes": int(round(sum(p.time_spent_minutes for p in progress_records))),
        "currentDifficultyTier": student.profile.quiz_difficulty if student.profile else "beginner",
        "topicPerformance": topic_performance,
        "learningImprovementGraph": improvement_graph,
        "activeAccommodations": student.profile.accessibility_preferences if student.profile else {},
    }

# ---------------------------------------------------------------------------
# 5. GET /api/learner/recommendations
# ---------------------------------------------------------------------------
@router.get("/api/learner/recommendations")
def get_learner_recommendations(
    userId: str = Query(None),
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    student = resolve_student(userId, user, db)
    quiz_attempts = [q.to_dict() for q in student.quiz_attempts]
    progress_records = [p.to_dict() for p in student.progress_records]
    all_lessons = [l.to_dict() for l in db.query(Lesson).all()]

    analysis = learner_intelligence.analyze_learner(student.to_dict(), quiz_attempts, progress_records)
    recs = recommendation_engine.generate_recommendations(analysis, all_lessons)

    return {
        "userId": student.id,
        "currentLevel": analysis.get("currentKnowledgeLevel"),
        "totalRecommendations": len(recs),
        "recommendations": recs,
    }

# ---------------------------------------------------------------------------
# 6. POST /api/content/adapt
# ---------------------------------------------------------------------------
@router.post("/api/content/adapt")
async def adapt_content_multi_format(payload: dict):
    topic = payload.get("topic", "Computer Architecture & Hardware")
    text = payload.get("text", "The central processing unit executes instructions fetched from memory.")

    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required.")

    adapted_result = await content_adapter.adapt_content(topic, text)
    return adapted_result

# ---------------------------------------------------------------------------
# 7. GET /api/learner/knowledge-gaps
# ---------------------------------------------------------------------------
@router.get("/api/learner/knowledge-gaps")
def get_learner_knowledge_gaps(
    userId: str = Query(None),
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    student = resolve_student(userId, user, db)
    progress_records = student.progress_records
    all_lessons = db.query(Lesson).all()

    # Calculate topic mastery
    topic_map = {}
    for p in progress_records:
        l = next((item for item in all_lessons if item.id == p.lesson_id), None)
        subj = l.subject if l else "General"
        if subj not in topic_map:
            topic_map[subj] = []
        topic_map[subj].append(p.mastery_score)

    topic_mastery = {}
    for subj, scores in topic_map.items():
        topic_mastery[subj] = round(float(np.mean(scores)), 1) if scores else 60.0

    # Ensure diverse topics represented for realistic gap detection
    if not topic_mastery:
        topic_mastery = {
            "Computer Science": 85.0,
            "Mathematics": 48.0,
            "Programming": 92.0,
            "Environmental Science": 55.0,
        }

    quiz_attempts = [q.to_dict() for q in student.quiz_attempts]
    gaps_result = knowledge_gap_tracker.analyze_gaps(topic_mastery, quiz_attempts)
    gaps_result["userId"] = student.id
    return gaps_result

# ---------------------------------------------------------------------------
# 8. GET /api/learner/revision-plan
# ---------------------------------------------------------------------------
@router.get("/api/learner/revision-plan")
def get_learner_revision_plan(
    userId: str = Query(None),
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    student = resolve_student(userId, user, db)
    progress_records = [p.to_dict() for p in student.progress_records]
    completed_sessions = [s.to_dict() for s in db.query(RevisionSession).filter(RevisionSession.user_id == student.id).all()]

    plan = smart_revision.calculate_plan(progress_records, completed_sessions)
    plan["userId"] = student.id
    return plan
