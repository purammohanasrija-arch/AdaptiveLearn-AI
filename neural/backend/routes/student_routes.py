from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User, LearnerProfile
from routes.auth_routes import get_current_user_from_header
from ai_engine import learning_dna_engine

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/profile")
def get_profile(user: User = Depends(get_current_user_from_header)):
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"profile": user.profile.to_dict() if user.profile else {}}

@router.put("/profile")
def update_profile(payload: dict, user: User = Depends(get_current_user_from_header), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)

    if "preferredFormat" in payload:
        profile.preferred_format = payload["preferredFormat"]
    if "textSize" in payload:
        profile.text_size = payload["textSize"]
    if "speechRate" in payload:
        profile.speech_rate = float(payload["speechRate"])
    if "explanationStyle" in payload:
        profile.explanation_style = payload["explanationStyle"]
    if "quizDifficulty" in payload:
        profile.quiz_difficulty = payload["quizDifficulty"]
    if "readingSpeed" in payload:
        profile.reading_speed = payload["readingSpeed"]
    if "learningLevel" in payload:
        profile.learning_level = payload["learningLevel"]
    if "disabilityContext" in payload:
        profile.disability_context = payload["disabilityContext"]
    if "accessibilityPreferences" in payload:
        profile.accessibility_preferences = payload["accessibilityPreferences"]

    # Recompute updated Learning DNA
    quiz_history = [q.to_dict() for q in user.quiz_attempts]
    profile.learning_dna = learning_dna_engine.compute_dna(profile.to_dict(), quiz_history)

    db.commit()
    return {
        "success": True,
        "message": "Preferences updated successfully",
        "profile": profile.to_dict(),
    }

@router.post("/onboarding")
def complete_onboarding(payload: dict, user: User = Depends(get_current_user_from_header), db: Session = Depends(get_db)):
    if not user:
        user = db.query(User).filter(User.id == "user-student-a").first()

    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)

    answers = payload.get("answers", {})
    # Update profile based on initial assessment
    if "preferredFormat" in answers:
        profile.preferred_format = answers["preferredFormat"]
    if "textSize" in answers:
        profile.text_size = answers["textSize"]
    if "readingSpeed" in answers:
        profile.reading_speed = answers["readingSpeed"]
    if "accessibilityPreferences" in payload:
        profile.accessibility_preferences = payload["accessibilityPreferences"]
    if "baselineScore" in payload:
        profile.baseline_score = float(payload["baselineScore"])

    profile.onboarding_completed = True
    profile.learning_dna = learning_dna_engine.compute_dna(profile.to_dict())

    db.commit()
    return {
        "success": True,
        "message": "Onboarding assessment completed! Your AI Learning DNA has been synthesized.",
        "profile": profile.to_dict(),
        "learningDna": profile.learning_dna,
    }

