import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Lesson
from ai_engine import nlp_simplifier

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("")
def get_lessons(
    subject: str = Query(None),
    difficulty: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Lesson)
    if subject and subject != "All":
        query = query.filter(Lesson.subject.ilike(f"%{subject}%"))
    if difficulty and difficulty != "All":
        query = query.filter(Lesson.difficulty == difficulty.lower())
    if search:
        query = query.filter(Lesson.title.ilike(f"%{search}%") | Lesson.topic.ilike(f"%{search}%"))

    lessons = query.all()
    return {"lessons": [l.to_dict() for l in lessons], "total": len(lessons)}

@router.get("/{id}")
def get_lesson_by_id(id: str, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"lesson": lesson.to_dict()}

@router.post("")
def create_lesson(payload: dict, db: Session = Depends(get_db)):
    title = payload.get("title")
    subject = payload.get("subject", "General Science")
    topic = payload.get("topic", title)
    full_text = payload.get("fullText", "")

    if not title:
        raise HTTPException(status_code=400, detail="Lesson title is required.")

    # Automatically generate 5 Experiences through NLP Simplifier
    five_exp = nlp_simplifier.generate_five_experiences(topic, full_text or title)

    new_id = f"lesson-{uuid.uuid4().hex[:6]}"
    lesson = Lesson(
        id=new_id,
        title=title,
        subject=subject,
        topic=topic,
        difficulty=payload.get("difficulty", "easy"),
        estimated_duration=payload.get("estimatedDuration", 15),
        icon=payload.get("icon", "BookOpen"),
        color=payload.get("color", "#E11D48"),
        original_content={
            "summary": payload.get("summary", title),
            "fullText": full_text,
            "keyTakeaways": payload.get("keyTakeaways", ["Core concept foundational understanding."]),
        },
        adapted_content={
            "simplified": five_exp["experiences"]["simple_english"],
            "audio": five_exp["experiences"]["audio_narration"],
            "visual": five_exp["experiences"]["visual_explainer"],
            "detailed": {"deepDive": full_text},
            "steps": five_exp["experiences"]["step_by_step"],
        },
        quiz=payload.get("quiz", []),
        video_data=payload.get("videoData", {}),
    )
    db.add(lesson)
    db.commit()

    return {"success": True, "lesson": lesson.to_dict(), "message": "Lesson created with 5 automated adaptations."}

@router.post("/{id}/adapt")
def adapt_lesson(id: str, payload: dict, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    requested_format = payload.get("format", "simplified")
    profile = payload.get("profile", {})
    target_language = payload.get("targetLanguage", "English")

    full_text = lesson.original_content.get("fullText", "")
    five_exp = nlp_simplifier.generate_five_experiences(lesson.topic, full_text)

    adapted = lesson.adapted_content.get(requested_format)
    if not adapted:
        adapted = five_exp["experiences"].get(requested_format, five_exp["experiences"]["simple_english"])

    return {
        "success": True,
        "format": requested_format,
        "adaptedContent": adapted,
        "readabilityMetrics": five_exp["readabilityAfter"],
        "source": "python-adaptive-nlp-engine",
    }

