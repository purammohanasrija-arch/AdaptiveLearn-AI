import io
import json
import base64
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User, Lesson
from routes.auth_routes import get_current_user_from_header
from tutor_engine import (
    tutor_engine,
    TEACHING_PERSONALITIES,
    SocraticHintEngine,
    DocumentDoubtSolver,
    VisualExplanationGenerator,
    FlashcardGenerator,
    TenFormatTransformer,
)

router = APIRouter(prefix="/api/tutor", tags=["Intelligent Multimodal AI Tutor"])

# ---------------------------------------------------------------------------
# 1. POST /api/tutor/chat
# ---------------------------------------------------------------------------
@router.post("/chat")
def chat_with_ai_tutor(payload: dict):
    messages = payload.get("messages", [])
    lesson_context = payload.get("lessonContext", {})
    student_profile = payload.get("studentProfile", {})
    teaching_mode = payload.get("teachingMode", "simple")

    response = tutor_engine.generate_chat_response(
        messages=messages,
        lesson_context=lesson_context,
        student_profile=student_profile,
        teaching_mode=teaching_mode,
    )
    return response

# ---------------------------------------------------------------------------
# 2. POST /api/tutor/explain
# ---------------------------------------------------------------------------
@router.post("/explain")
def explain_concept(payload: dict):
    topic = payload.get("topic", "Computer Architecture")
    concept = payload.get("concept", "Instruction Cycle & RAM Access")
    mode = payload.get("mode", "simple") # simple, detailed, step_by_step, analogy, hints

    if mode == "hints":
        hints = SocraticHintEngine.generate_hints(concept, topic)
        return {
            "topic": topic,
            "mode": "socratic_hints",
            "hints": hints,
            "pedagogicalGoal": "Guide the student through conceptual scaffolding without directly exposing test answers.",
        }

    # Generate tailored explanation
    if mode == "step_by_step":
        steps = [
            {"step": 1, "action": "Signal Input", "detail": f"The {topic} interface captures the initial user request."},
            {"step": 2, "action": "Processor Cycle", "detail": "Instructions are fetched and decoded by the processing logic."},
            {"step": 3, "action": "Working Memory Buffering", "detail": "Intermediate calculations are held in high-speed RAM."},
            {"step": 4, "action": "Permanent Save / Output", "detail": "Results are permanently written and rendered clearly."},
        ]
        return {
            "topic": topic,
            "mode": "step_by_step",
            "title": f"Step-by-Step Breakdown: {topic}",
            "steps": steps,
            "checkQuestion": "Which step holds temporary calculations before final output?",
        }
    elif mode == "analogy":
        return {
            "topic": topic,
            "mode": "analogy",
            "analogyTitle": "The Master Kitchen & Chef Analogy 👨‍🍳",
            "analogyStory": (
                f"Think of {topic} like a busy family restaurant kitchen! "
                "The CPU is the executive chef reading tickets and stirring the pots. "
                "RAM is the wide kitchen countertop holding chopped ingredients for the meal being cooked right now. "
                "Storage is the cold walk-in pantry downstairs holding flour and canned goods for the whole season. "
                "You would never leave perishable meals downstairs in the pantry while cooking!"
            ),
            "keyInsight": "Separating quick countertop work from bulk storage makes the entire kitchen run smoothly.",
        }
    elif mode == "detailed":
        return {
            "topic": topic,
            "mode": "detailed",
            "title": f"Technical Deep-Dive: {topic}",
            "deepDive": (
                f"In high-performance systems, {topic} leverages pipelined architectures and low-latency bus interconnects. "
                "Through spatial and temporal locality, on-die caches reduce pipeline stalls, "
                "maximizing instruction throughput per nanosecond clock cycle."
            ),
            "advancedMetrics": {"cycleTime": "~0.3ns", "cacheL1": "32KB per core", "throughput": "Super-scalar"},
        }
    else: # simple plain english
        return {
            "topic": topic,
            "mode": "simple",
            "title": f"Plain English Guide: {topic}",
            "explanation": (
                f"{topic} is built like a helpful team of everyday helpers. "
                "Instead of complex textbook jargon, picture snapping simple LEGO blocks together. "
                "Each block has one job, and when they connect in order, the whole machine works reliably."
            ),
            "takeaway": "When you picture physical helpers, every big concept makes natural sense.",
        }

# ---------------------------------------------------------------------------
# 3. POST /api/tutor/summarize
# ---------------------------------------------------------------------------
@router.post("/summarize")
def summarize_topic(payload: dict):
    topic = payload.get("topic", "General Curriculum Topic")
    text = payload.get("text", "")

    summary_bullets = [
        f"Core Principle: {topic} transforms simple inputs into structured, verified outcomes.",
        "Working vs Permanent Memory: Active state resets on power-off, while storage preserves files safely.",
        "Repetition Efficiency: Loops and automation free humans from tedious manual labor.",
        "Safety Rule: Always verify step-by-step logic before locking in answers.",
    ]

    return {
        "topic": topic,
        "executiveSummary": f"High-yield essential takeaways for {topic}.",
        "keyPoints": summary_bullets,
        "mnemonic": "F-A-S-T (Foundation, Action, Storage, Transfer)",
        "oneLineTakeaway": f"{topic} is a dependable transformation engine that makes complex tasks simple.",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }

# ---------------------------------------------------------------------------
# 4. POST /api/tutor/transform (10 Educational Formats)
# ---------------------------------------------------------------------------
@router.post("/transform")
def transform_lesson_ten_formats(payload: dict):
    topic = payload.get("topic", "Computer Hardware & Architecture")
    text = payload.get("text", "The central processing unit executes instructions fetched from volatile memory.")

    transformer = TenFormatTransformer()
    result = transformer.transform_all_10(topic, text)
    return result

# ---------------------------------------------------------------------------
# 5. POST /api/tutor/flashcards
# ---------------------------------------------------------------------------
@router.post("/flashcards")
def generate_lesson_flashcards(payload: dict):
    topic = payload.get("topic", "Computer Architecture")
    content = payload.get("content", "")

    gen = FlashcardGenerator()
    result = gen.generate_cards(topic, content)
    return result

# ---------------------------------------------------------------------------
# 6. POST /api/tutor/visualize
# ---------------------------------------------------------------------------
@router.post("/visualize")
def generate_visual_explanation(payload: dict):
    topic = payload.get("topic", "Photosynthesis")
    concept = payload.get("concept", "")

    gen = VisualExplanationGenerator()
    result = gen.generate_diagram(topic, concept)
    return result

# ---------------------------------------------------------------------------
# 7. POST /api/tutor/voice
# ---------------------------------------------------------------------------
@router.post("/voice")
def process_voice_interaction(payload: dict):
    transcript = payload.get("transcript", "").strip()
    current_topic = payload.get("topic", "General Curriculum")
    speaking_rate = float(payload.get("speakingRate", 1.0))

    t_lower = transcript.lower()

    # Voice Command Action Classifier
    action = "chat"
    command_intent = "conversational_query"

    if any(k in t_lower for k in ["read lesson", "read aloud", "speak lesson"]):
        action = "read_lesson"
        command_intent = "trigger_audio_narration"
        spoken_response = f"Reading your lesson on {current_topic} aloud now. Relax and listen to each concept."
    elif any(k in t_lower for k in ["make simpler", "explain simply", "simpler", "easy words"]):
        action = "simplify"
        command_intent = "switch_to_simple_teacher"
        spoken_response = f"Switching to Simple Teacher mode for {current_topic}. Here it is in everyday plain English: everything works like a dependable kitchen team."
    elif any(k in t_lower for k in ["quiz me", "test me", "practice", "questions"]):
        action = "quiz"
        command_intent = "start_practice_quiz"
        spoken_response = f"Starting your practice check on {current_topic}. Think carefully about each question before locking in your answer!"
    elif any(k in t_lower for k in ["summarize", "key points", "summary"]):
        action = "summarize"
        command_intent = "give_summary"
        spoken_response = f"Here is the high-yield summary for {current_topic}: Remember FAST. Foundation, Action, Storage, Transfer."
    elif any(k in t_lower for k in ["visualize", "show diagram", "flowchart"]):
        action = "visualize"
        command_intent = "render_visual_diagram"
        spoken_response = f"Opening the visual diagram and concept flowchart for {current_topic}."
    else:
        # Standard voice question
        spoken_response = f"I heard your question: {transcript}. Let's break down {current_topic} together so it clicks naturally."

    return {
        "transcript": transcript,
        "action": action,
        "commandIntent": command_intent,
        "speakingRate": speaking_rate,
        "spokenResponse": spoken_response,
        "speechSettings": {
            "rate": speaking_rate,
            "pitch": 1.0,
            "voiceTone": "Calm, supportive, and accessible",
        },
        "processedAt": datetime.now(timezone.utc).isoformat(),
    }

# ---------------------------------------------------------------------------
# 8. POST /api/tutor/document-upload (PDF / Text Doubt Solver)
# ---------------------------------------------------------------------------
@router.post("/document-upload")
def upload_document_or_ask(
    file: UploadFile = File(None),
    rawText: str = Form(None),
    question: str = Form(None),
    teachingMode: str = Form("simple"),
):
    solver = DocumentDoubtSolver()
    extracted_text = ""
    file_name = "pasted_notes.txt"

    if file and hasattr(file, "file"):
        file_name = getattr(file, "filename", "uploaded_document") or "uploaded_document"
        contents = file.file.read()
        if file_name.lower().endswith(".pdf"):
            extracted_text = solver.extract_text_from_pdf(contents)
        else:
            try:
                extracted_text = contents.decode("utf-8")
            except Exception:
                extracted_text = contents.decode("latin-1", errors="ignore")
    elif rawText and isinstance(rawText, str):
        extracted_text = rawText.strip()
    else:
        extracted_text = "No document provided."

    query = question if (question and isinstance(question, str)) else "Can you explain the main concepts in this document?"
    mode = teachingMode if (teachingMode and isinstance(teachingMode, str)) else "simple"
    result = solver.answer_document_query(query, extracted_text, teaching_mode=mode)

    return {
        "success": True,
        "fileName": file_name,
        "wordCount": len(extracted_text.split()),
        "extractedTextSnippet": extracted_text[:500] + ("..." if len(extracted_text) > 500 else ""),
        "fullExtractedText": extracted_text,
        "queryResult": result,
    }
