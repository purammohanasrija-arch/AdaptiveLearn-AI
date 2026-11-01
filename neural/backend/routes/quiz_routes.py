import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Lesson, QuizAttempt, LearningProgress, User, KnowledgeGap
from routes.auth_routes import get_current_user_from_header
from ai_engine import bkt_engine, irt_engine, gap_detector

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/{id}/submit")
def submit_quiz(
    id: str,
    payload: dict,
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    target_user_id = user.id if user else payload.get("userId", "user-student-a")
    student = db.query(User).filter(User.id == target_user_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()

    answers = payload.get("answers", [])
    time_spent_seconds = payload.get("timeSpentSeconds", 90)

    # Evaluate answers against lesson quiz questions
    questions = lesson.quiz or []
    correct_count = 0
    evaluated_answers = []

    # BKT Knowledge State tracking
    current_progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == student.id,
        LearningProgress.lesson_id == lesson.id
    ).first()

    prior_knowledge = (current_progress.mastery_score / 100.0) if current_progress and current_progress.mastery_score else 0.5
    updated_knowledge = prior_knowledge

    # IRT Theta tracking
    profile = student.profile
    current_difficulty = profile.quiz_difficulty if profile else "easy"
    theta = 0.8 if current_difficulty == "hard" else (-0.5 if current_difficulty == "easy" else 0.0)

    for ans in answers:
        q_id = ans.get("questionId")
        q = next((item for item in questions if item.get("id") == q_id), None)
        is_correct = bool(q and q.get("correctAnswer") == ans.get("selectedOption"))
        if is_correct:
            correct_count += 1

        # BKT update for each question interaction
        updated_knowledge = bkt_engine.update(updated_knowledge, is_correct)

        # IRT Elo update
        beta = irt_engine.difficulty_map.get(q.get("difficulty", "easy") if q else "easy", 0.0)
        theta = irt_engine.update_ability(theta, beta, 1.0 if is_correct else 0.0)

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

    # Next difficulty calibration recommendation via IRT
    diff_rec = irt_engine.recommend_difficulty(theta)

    # Record Attempt
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
        difficulty_level=diff_rec["level"],
    )
    db.add(attempt)

    # Update Student's Learning Progress with new BKT mastery score
    new_mastery = int(round(updated_knowledge * 100))
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

    # Update profile quiz difficulty
    if profile:
        profile.quiz_difficulty = diff_rec["level"]

    # Check for newly surfaced Knowledge Gaps
    detected = gap_detector.detect_gaps(student.id, [attempt.to_dict()])
    for g in detected:
        kg = KnowledgeGap(
            user_id=g["userId"],
            topic=g["topic"],
            concept=g["concept"],
            severity=g["severity"],
            misconception=g["misconception"],
            recommended_action=g["recommendedAction"],
        )
        db.add(kg)

    db.commit()

    # Formulate supportive adaptive advice
    if score >= 85:
        advice = "Brilliant work! High concept mastery unlocked. Ready for advanced challenge questions!"
    elif score >= 60:
        advice = "Solid effort! Reviewing the interactive visual diagrams will help solidify your understanding."
    else:
        advice = "Learning is an inclusive journey! Let Aria explain this using an everyday analogy before retaking."

    return {
        "success": True,
        "score": score,
        "accuracy": accuracy,
        "correctCount": correct_count,
        "totalQuestions": total_q,
        "masteryScore": new_mastery,
        "nextStepAdvice": advice,
        "suggestedDifficulty": diff_rec["level"],
        "adaptiveCalibration": {
            "theta": diff_rec["theta"],
            "recommendedTier": diff_rec["tier"],
            "tierLabel": diff_rec["label"],
            "scaffolding": diff_rec["scaffolding"],
            "bktMasteryProbability": round(updated_knowledge, 3),
        },
        "answers": evaluated_answers,
    }

@router.get("/attempts")
def get_quiz_attempts(
    user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    target_id = user.id if user else "user-student-a"
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == target_id).all()
    return {"attempts": [a.to_dict() for a in attempts]}

