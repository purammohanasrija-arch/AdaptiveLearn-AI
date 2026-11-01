from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, LearningProgress, KnowledgeGap
from ai_engine import (
    ai_tutor,
    nlp_simplifier,
    learning_dna_engine,
    revision_scheduler,
    gap_detector,
)

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/chat")
def chat_with_tutor(payload: dict):
    messages = payload.get("messages", [])
    lesson_context = payload.get("lessonContext", {})
    student_profile = payload.get("studentProfile", {})

    last_user_message = ""
    for m in reversed(messages):
        if m.get("sender") == "user" or m.get("role") == "user":
            last_user_message = m.get("text") or m.get("content") or ""
            break

    if not last_user_message:
        last_user_message = "Can you help me understand this concept?"

    result = ai_tutor.answer_query(
        message=last_user_message,
        lesson_context=lesson_context,
        student_profile=student_profile,
    )
    return result

@router.post("/explain-differently")
def explain_differently(payload: dict):
    text = payload.get("text", "Central Processing Unit and Computer Memory Architecture")
    subject = payload.get("subject", "Computer Science")
    analogy_type = payload.get("analogyType", "daily_life")

    simplified = nlp_simplifier.simplify_text(text)
    readability = nlp_simplifier.compute_readability(simplified)

    return {
        "analogyTitle": "The Master Kitchen & Chef Analogy 👨‍🍳",
        "explanation": (
            f"Think of {subject} like running a vibrant family bakery! "
            f"Instead of getting caught in technical jargon: {simplified[:240]}. "
            "Every component has one specific job, and they all work together in harmony so nothing gets burned or dropped."
        ),
        "takeaway": "When you picture the physical helpers instead of abstract code, the concept clicks naturally!",
        "readability": readability,
    }

@router.post("/give-example")
def give_example(payload: dict):
    topic = payload.get("topic", "Algorithms & Loops")
    concept = payload.get("concept", "Repeating an action multiple times automatically")

    return {
        "exampleTitle": f"Everyday Real-World Example: {topic}",
        "scenario": (
            f"Imagine you are packing snack bags for 5 friends going on a nature hike. "
            f"Rather than writing down 'Pack an apple, pack a granola bar' 5 separate times, "
            f"you set up an algorithm loop: 'For each friend from 1 to 5: put 1 apple and 1 granola bar in their bag.' "
            f"That is all a repeat loop is: automating a repetitive task so humans don't have to!"
        ),
        "keyLesson": "Algorithms turn repetitive chores into smooth, automated recipes.",
    }

@router.post("/make-it-easier")
def make_it_easier(payload: dict):
    text = payload.get("text", "Photosynthesis photolysis of water in thylakoid membranes.")
    level = payload.get("level", "elementary")

    simplified = nlp_simplifier.simplify_text(text)
    readability = nlp_simplifier.compute_readability(simplified)

    return {
        "originalText": text,
        "simplifiedText": simplified,
        "readabilityMetrics": readability,
        "readingPointers": [
            "Sentences are shortened into bite-sized thoughts.",
            "Complex technical terms are paired with everyday words.",
            "High contrast and larger text options are ready when you need them.",
        ],
    }

@router.post("/explain-detailed")
def explain_detailed(payload: dict):
    text = payload.get("text", "Von Neumann Architecture")
    subject = payload.get("subject", "Computer Science")

    return {
        "title": f"Advanced Synthesis & Technical Deep-Dive: {subject}",
        "deepDive": (
            f"In professional computing systems, {text} relies on high-speed hardware pipelines. "
            "Data travels across serialized buses driven by quartz crystal clock signals measuring in gigahertz (GHz). "
            "Level 1 and Level 2 CPU caches sit directly on the microscopic silicon die to minimize latency, "
            "enabling billions of instruction cycles every single second."
        ),
        "technicalTakeaways": [
            "Cache memory hierarchy eliminates Von Neumann bottlenecks.",
            "Clock frequencies synchronize instruction pipelining.",
            "Instruction sets (x86, ARM, RISC-V) translate human logic into machine microcode.",
        ],
    }

@router.post("/summarize")
def summarize_lesson(payload: dict):
    text = payload.get("text", "")
    subject = payload.get("subject", "General")

    return {
        "summary": "Key highlights synthesized for rapid review:",
        "keyPoints": [
            "Every complex topic is built from 2-3 simple foundational building blocks.",
            "Active practice and personal analogies accelerate retention by 40%.",
            "Whenever you feel stuck, use voice navigation or step-by-step mode.",
        ],
    }

@router.post("/break-steps")
def break_into_steps(payload: dict):
    text = payload.get("text", "Learning complex concepts")
    subject = payload.get("subject", "General")

    return {
        "processTitle": f"Step-by-Step Breakdown for {subject}",
        "steps": [
            {"stepNumber": 1, "title": "Understand the Goal", "description": "Identify what outcome we want to achieve."},
            {"stepNumber": 2, "title": "Gather Ingredients", "description": "Collect the basic vocabulary or numbers needed."},
            {"stepNumber": 3, "title": "Execute One Action", "description": "Do the first calculation or step carefully."},
            {"stepNumber": 4, "title": "Verify & Celebrate", "description": "Double check the result and celebrate the milestone!"},
        ],
    }

@router.post("/generate-practice")
def generate_practice_questions(payload: dict):
    topic = payload.get("topic", "Computer Hardware")
    difficulty = payload.get("difficulty", "easy")

    questions = [
        {
            "id": f"pq-{topic[:4]}-1",
            "question": f"Which part of the system acts like the central brain or master chef in {topic}?",
            "options": ["The Central Processing Unit (CPU)", "The Mouse Pad", "The Power Cord", "The Plastic Case"],
            "correctAnswer": 0,
            "hint": "Think of the worker that cooks recipes and calculates instructions.",
            "explanation": "The CPU does all the active computing and decision-making!",
        },
        {
            "id": f"pq-{topic[:4]}-2",
            "question": "What happens to data stored on your RAM when the power turns off completely?",
            "options": ["It stays saved forever", "It is wiped clean like a cleared countertop", "It prints out on paper", "It turns into audio"],
            "correctAnswer": 1,
            "hint": "RAM is temporary volatile storage.",
            "explanation": "RAM only holds data while power is on; persistent storage holds files permanently.",
        },
    ]

    return {"topic": topic, "difficulty": difficulty, "questions": questions}

@router.get("/learning-dna/{user_id}")
def get_learning_dna(user_id: str, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()

    prof = student.profile
    quiz_attempts = [q.to_dict() for q in student.quiz_attempts]
    dna = learning_dna_engine.compute_dna(prof.to_dict() if prof else {}, quiz_attempts)
    return {"learningDna": dna}

@router.get("/knowledge-gaps/{user_id}")
def get_knowledge_gaps(user_id: str, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()

    gaps = db.query(KnowledgeGap).filter(KnowledgeGap.user_id == student.id).all()
    if not gaps:
        # Detect on the fly from student attempts
        detected = gap_detector.detect_gaps(student.id, [q.to_dict() for q in student.quiz_attempts])
        return {"gaps": detected}
    return {"gaps": [g.to_dict() for g in gaps]}

@router.get("/revision-schedule/{user_id}")
def get_revision_schedule(user_id: str, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        student = db.query(User).filter(User.id == "user-student-a").first()

    progress_records = [p.to_dict() for p in student.progress_records]
    schedule = revision_scheduler.evaluate_topics_for_revision(progress_records)
    return {"revisionSchedule": schedule}

@router.post("/one-lesson-five-experiences")
def one_lesson_five_experiences(payload: dict):
    topic = payload.get("topic", "Computer Hardware & Architecture")
    raw_text = payload.get("text", "The central processing unit executes instructions fetched from random access memory.")
    result = nlp_simplifier.generate_five_experiences(topic, raw_text)
    return result

