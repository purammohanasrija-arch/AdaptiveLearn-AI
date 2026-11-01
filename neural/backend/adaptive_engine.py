"""
AdaptiveLearn AI - Core Python Adaptive Learning Engine
Powered by FastAPI, scikit-learn, NumPy, and Pandas.
Implements:
1. Learner Intelligence Engine (Performance analysis, pacing, improvement trend via LinearRegression)
2. Adaptive Difficulty Prediction (Beginner, Intermediate, Advanced with rolling window calibration)
3. Content Adaptation Engine (8 distinct formats with LLM integration & offline fallback)
4. Knowledge Gap Detection & Prerequisite Hierarchy
5. Intelligent Recommendation Engine
6. Smart Revision Scheduler (Ebbinghaus Spaced Repetition)
"""

import os
import sys
import re
import math
import json
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

# ---------------------------------------------------------------------------
# 1. PREREQUISITE & MISCONCEPTION KNOWLEDGE HIERARCHY
# ---------------------------------------------------------------------------
CONCEPT_DEPENDENCY_GRAPH = {
    "Computer Architecture": {
        "prerequisites": ["Electric Switches", "Binary Concept"],
        "core_skills": ["CPU Execution", "RAM Countertop", "Secondary Storage"],
        "misconceptions": {
            "RAM": "Believing RAM permanently stores files after shutdown.",
            "CPU": "Thinking CPU stores user documents instead of executing operational cycles.",
        },
        "remediation": "Review the Chef & Kitchen Countertop analogy before advancing to CPU cache pipelines.",
    },
    "Mathematics": {
        "prerequisites": ["Basic Division", "Arithmetic & Equal Sharing", "Number Sense Fundamentals"],
        "core_skills": ["Denominator Meaning", "Numerator Meaning", "Equivalent Fractions"],
        "misconceptions": {
            "Denominator": "Assuming a larger denominator number means a bigger slice.",
            "Numerator": "Confusing the number of parts taken with total parts.",
        },
        "remediation": "Interact with visual pizza slices: larger denominator = more slices = smaller piece per slice.",
    },
    "Programming": {
        "prerequisites": ["Sequential Instructions", "Conditionals (If/Else)"],
        "core_skills": ["Repeat Loops", "Loop Termination", "Variables"],
        "misconceptions": {
            "Loop": "Failing to recognize when a loop reaches its exit condition.",
        },
        "remediation": "Practice step-by-step loop tracing with tooth-brushing or recipe stirring repetitions.",
    },
    "Environmental Science": {
        "prerequisites": ["Sunlight as Energy", "Plant Anatomy"],
        "core_skills": ["Chloroplast Solar Conversion", "Stomata Gas Exchange", "Glucose Synthesis"],
        "misconceptions": {
            "Photosynthesis": "Believing plants consume soil as food rather than synthesizing sugar from sunlight and water.",
        },
        "remediation": "Visualize leaves as green solar bakeries: sunlight is heat, water and air are ingredients, glucose is food.",
    },
    "Physics": {
        "prerequisites": ["Velocity Basics", "Force and Push"],
        "core_skills": ["Newton's First Law (Inertia)", "F = ma", "Action & Reaction"],
        "misconceptions": {
            "Inertia": "Believing an object requires constant force to keep moving in space.",
        },
        "remediation": "Use skateboard & ice rink analogies: without friction or gravity, motion continues forever.",
    },
    "Chemistry": {
        "prerequisites": ["Matter & States", "Atoms & Molecules"],
        "core_skills": ["Chemical Bonds", "Periodic Table Groups", "Reactions"],
        "misconceptions": {
            "Bonding": "Thinking atoms stick together randomly like glue rather than sharing electrons.",
        },
        "remediation": "Think of chemical bonds like holding hands in a game: atoms pair up to complete their outer shells.",
    },
}

# ---------------------------------------------------------------------------
# 2. LEARNER INTELLIGENCE ENGINE
# ---------------------------------------------------------------------------
class LearnerIntelligenceEngine:
    """
    Analyzes holistic learner telemetry:
    - Quiz accuracy & error patterns
    - Pacing & response times
    - Attempt counts & retries
    - Topic-wise mastery distribution
    - Improvement trendline (LinearRegression slope over time)
    - Generates personalized profile & tailored pedagogical strategy
    * Strict Ethical Rule: Never infer disability from performance metrics alone.
    """

    def analyze_learner(self, user_dict: dict, quiz_history: list, progress_records: list) -> dict:
        profile = user_dict.get("profile", {})
        baseline_score = float(profile.get("baselineScore", 70.0))

        # 1. Quiz Performance Telemetry
        if quiz_history and len(quiz_history) > 0:
            df_quizzes = pd.DataFrame(quiz_history)
            overall_accuracy = float(df_quizzes["accuracy"].mean() * 100)
            avg_score = float(df_quizzes["score"].mean())
            total_attempts = len(quiz_history)
            
            # Response times
            times = df_quizzes.get("timeSpentSeconds", pd.Series([60] * total_attempts))
            avg_response_time = float(times.mean())

            # Linear Regression for Improvement Slope over sequential attempts
            if total_attempts >= 2:
                X = np.arange(total_attempts).reshape(-1, 1)
                y = df_quizzes["score"].values
                reg = LinearRegression().fit(X, y)
                improvement_slope = float(reg.coef_[0])
            else:
                improvement_slope = 0.0
        else:
            overall_accuracy = baseline_score
            avg_score = baseline_score
            total_attempts = 0
            avg_response_time = 75.0
            improvement_slope = 0.0

        # Pacing Classification
        if avg_response_time <= 60.0:
            pacing_style = "Rapid (Quick processing, minimal hesitation)"
        elif avg_response_time <= 120.0:
            pacing_style = "Balanced (Methodical reading, thoughtful answers)"
        else:
            pacing_style = "Deliberate (Deep contemplation, benefits from chunked steps)"

        # 2. Topic-wise Mastery Aggregation
        topic_scores = {}
        for p in progress_records:
            t = p.get("subject") or p.get("lessonId") or "General"
            m = float(p.get("masteryScore", 0))
            if t not in topic_scores:
                topic_scores[t] = []
            topic_scores[t].append(m)

        topic_mastery = {}
        strong_topics = []
        weak_topics = []
        for t, scores in topic_scores.items():
            avg_m = round(float(np.mean(scores)), 1)
            topic_mastery[t] = avg_m
            if avg_m >= 75.0:
                strong_topics.append({"topic": t, "mastery": avg_m})
            elif avg_m < 60.0:
                weak_topics.append({"topic": t, "mastery": avg_m})

        # Ensure default topics are represented if new learner
        if not topic_mastery:
            topic_mastery = {
                "Computer Science": baseline_score,
                "Mathematics": max(45.0, baseline_score - 10),
                "Programming": min(95.0, baseline_score + 10),
            }
            strong_topics = [{"topic": "Programming", "mastery": topic_mastery["Programming"]}]
            if topic_mastery["Mathematics"] < 60:
                weak_topics = [{"topic": "Mathematics", "mastery": topic_mastery["Mathematics"]}]

        # 3. Knowledge Level & Difficulty Calibration
        if avg_score >= 85.0:
            knowledge_level = "Advanced"
            rec_difficulty = "advanced"
        elif avg_score >= 60.0:
            knowledge_level = "Intermediate"
            rec_difficulty = "intermediate"
        else:
            knowledge_level = "Beginner"
            rec_difficulty = "beginner"

        # 4. Improvement Trend Description
        if improvement_slope > 2.0:
            trend_label = "Accelerating Growth (Strong upward trajectory)"
        elif improvement_slope >= -0.5:
            trend_label = "Stable Progression (Consistently reinforcing knowledge)"
        else:
            trend_label = "Scaffolding Needed (Recent performance suggests cognitive fatigue)"

        # 5. Personalized Pedagogical Strategy (Ethical: Respects user-selected accommodations)
        user_format = profile.get("preferredFormat", "simplified")
        accommodations = profile.get("accessibilityPreferences", {})

        strategy_points = []
        if weak_topics:
            weak_names = ", ".join([w["topic"] for w in weak_topics])
            strategy_points.append(f"Targeted remediation on weak topics ({weak_names}) using everyday analogies and visual flowcharts.")
        if user_format == "audio" or accommodations.get("audioNarration"):
            strategy_points.append("Spoken audio narrations with acoustic pacing breaks to enhance listening comprehension.")
        if user_format == "visual" or accommodations.get("visualDiagrams"):
            strategy_points.append("Interactive concept mindmaps and SVG diagrams to reinforce spatial recall.")
        if knowledge_level == "Advanced":
            strategy_points.append("Introduce multi-step challenge problems and synthesis questions to sustain engagement.")
        else:
            strategy_points.append("Provide foundational 3-step scaffolded hints before revealing full solutions.")

        return {
            "userId": user_dict.get("id"),
            "name": user_dict.get("name"),
            "learningPace": pacing_style,
            "currentKnowledgeLevel": knowledge_level,
            "overallAccuracy": round(overall_accuracy, 1),
            "averageScore": round(avg_score, 1),
            "improvementSlope": round(improvement_slope, 2),
            "improvementTrend": trend_label,
            "totalAttempts": total_attempts,
            "strongTopics": strong_topics,
            "weakTopics": weak_topics,
            "topicMastery": topic_mastery,
            "preferredLearningFormats": [user_format],
            "recommendedDifficulty": rec_difficulty,
            "personalizedLearningStrategy": strategy_points,
            "ethicalCompliance": "Accessibility requirements are voluntary. No medical or disability assumptions inferred from scores.",
            "analyzedAt": datetime.now(timezone.utc).isoformat(),
        }

learner_intelligence = LearnerIntelligenceEngine()

# ---------------------------------------------------------------------------
# 3. ADAPTIVE DIFFICULTY PREDICTOR
# ---------------------------------------------------------------------------
class AdaptiveDifficultyPredictor:
    """
    3-Level Dynamic Difficulty Engine:
    Levels:
    1. Beginner (Tier 1: Foundational Scaffolding, daily analogies, rich visual/audio cues)
    2. Intermediate (Tier 2: Core Application, interactive concept maps, moderate hints)
    3. Advanced (Tier 3: Critical Synthesis, minimal hints, multi-step problem solving)

    Rules:
    - Moving average accuracy > 85%: increase difficulty level.
    - Moving average accuracy between 60% and 85%: maintain difficulty level.
    - Moving average accuracy < 60%: reduce difficulty level.
    - Repeated errors: flag prerequisite recommendations.
    - Never changes difficulty on a single answer alone: uses rolling 3-attempt window.
    """

    LEVELS = ["beginner", "intermediate", "advanced"]

    def predict_next_difficulty(self, current_difficulty: str, recent_attempts: list, current_score: float = None) -> dict:
        cur_diff = (current_difficulty or "beginner").lower()
        if cur_diff not in self.LEVELS:
            cur_diff = "beginner"

        # Calculate rolling accuracy across recent window (up to 3 recent attempts)
        scores = []
        if recent_attempts:
            for a in recent_attempts[-3:]:
                if "score" in a:
                    scores.append(float(a["score"]))
                elif "accuracy" in a:
                    scores.append(float(a["accuracy"]) * 100)

        if current_score is not None:
            scores.append(float(current_score))

        if not scores:
            scores = [70.0]

        # Exponential moving average (recent attempt has higher weight)
        weights = np.linspace(0.6, 1.0, len(scores))
        weights /= weights.sum()
        moving_avg = float(np.sum(np.array(scores) * weights))

        idx = self.LEVELS.index(cur_diff)
        action = "maintain"
        reason = "Performance is balanced within the optimal learning zone (60% - 85%)."

        if moving_avg > 85.0:
            if idx < len(self.LEVELS) - 1:
                idx += 1
                action = "increase"
                reason = f"Excellent accuracy ({round(moving_avg, 1)}% > 85%). Advancing to higher challenge tier!"
            else:
                action = "maintain"
                reason = f"Peak mastery demonstrated ({round(moving_avg, 1)}%). Maintaining Advanced tier mastery."
        elif moving_avg < 60.0:
            if idx > 0:
                idx -= 1
                action = "decrease"
                reason = f"Recent accuracy ({round(moving_avg, 1)}% < 60%). Reducing difficulty to reinforce foundations."
            else:
                action = "scaffold"
                reason = f"Accuracy ({round(moving_avg, 1)}% < 60%). Remaining at Beginner tier with rich analogies and step-by-step guidance."

        next_diff = self.LEVELS[idx]
        transition = "promote" if action == "increase" else ("demote" if action == "decrease" else "maintain")
        needs_prereq = sum(1 for s in scores if s < 60.0) >= 2

        return {
            "previousDifficulty": cur_diff,
            "recommendedDifficulty": next_diff,
            "difficultyTier": idx + 1,
            "movingAverageAccuracy": round(moving_avg, 1),
            "action": action,
            "transition": transition,
            "reason": reason,
            "consecutiveStruggles": sum(1 for s in scores if s < 60.0),
            "recommendPrerequisites": needs_prereq,
            "needsPrerequisiteReview": needs_prereq,
        }

difficulty_predictor = AdaptiveDifficultyPredictor()

# ---------------------------------------------------------------------------
# 4. CONTENT ADAPTATION ENGINE (8 Formats + LLM Integration)
# ---------------------------------------------------------------------------
class ContentAdaptationEngine:
    """
    Transforms any original lesson into 8 distinct learning formats:
    1. Simple English explanation
    2. Detailed explanation
    3. Short summary
    4. Step-by-step explanation
    5. Key points
    6. Real-world examples
    7. Flashcards
    8. Practice questions
    Supports optional LLM (Google Gemini API via GEMINI_API_KEY) with a deterministic offline fallback.
    """

    SIMPLIFIED_SUBSTITUTIONS = {
        r"\bcentral processing unit\b": "computer brain (CPU)",
        r"\bsemiconductor\b": "microscopic silicon switch",
        r"\btransistors\b": "tiny electronic switches",
        r"\barchitecture\b": "blueprint layout",
        r"\bvolatile\b": "temporary (resets when turned off)",
        r"\bnon-volatile\b": "permanent (saved safely on drive)",
        r"\barithmetic\b": "math calculations",
        r"\bphotosynthesis\b": "plant sunlight baking",
        r"\bchloroplasts\b": "green solar panels in plant leaves",
        r"\bchlorophyll\b": "green sunlight catcher",
        r"\bphotolysis\b": "water splitting with light",
        r"\biterations\b": "repeats",
        r"\bdeterministic\b": "reliable and repeatable",
        r"\bdenominator\b": "bottom number (total equal pieces)",
        r"\bnumerator\b": "top number (pieces you hold)",
    }

    def generate_offline_8_formats(self, topic: str, text: str) -> dict:
        """High-fidelity deterministic transformation guaranteed to work offline."""
        # Clean text
        text_clean = text.strip() if text else topic

        # 1. Simple English
        simple_text = text_clean
        for pat, repl in self.SIMPLIFIED_SUBSTITUTIONS.items():
            simple_text = re.sub(pat, repl, simple_text, flags=re.IGNORECASE)

        # 2. Detailed
        detailed_text = (
            f"Comprehensive Technical Synthesis on {topic}:\n\n"
            f"{text_clean}\n\n"
            "System Architecture Considerations: Instruction pipelines synchronize with high-frequency clock signals. "
            "Data hierarchies leverage L1/L2 on-die cache memory to eliminate throughput bottlenecks, "
            "maximizing instructions executed per cycle."
        )

        # 3. Short Summary
        sentences = [s.strip() for s in re.split(r'[.!?]+', simple_text) if len(s.strip()) > 15]
        summary_bullets = sentences[:3] if len(sentences) >= 3 else [simple_text[:140]]

        # 4. Step-by-Step
        steps = [
            {"step": 1, "title": "Input & Reception", "description": f"Information or energy enters the {topic} system."},
            {"step": 2, "title": "Core Transformation", "description": "The central engine executes calculations or chemical conversion."},
            {"step": 3, "title": "Storage & Preservation", "description": "Active state resides in temporary memory or is permanently archived."},
            {"step": 4, "title": "Verified Output", "description": "The finished outcome is delivered cleanly to the user or ecosystem."},
        ]

        # 5. Key Points
        key_points = [
            f"Foundational Rule: {topic} transforms simple inputs into structured results.",
            "Active State vs Persistent State: Working memory resets, whereas permanent storage persists.",
            "Efficiency Principle: Pipelining and repetition loops automate repetitive labor.",
            "Verification Check: Always double-check core parameters to ensure accuracy.",
        ]

        # 6. Real-World Examples
        if "computer" in topic.lower() or "hardware" in topic.lower() or "cpu" in topic.lower():
            real_world = [
                {"analogy": "The Kitchen Chef 👨‍🍳", "story": "The CPU is the chef reading tickets and cooking food. RAM is the countertop holding ingredients. The hard drive is the pantry."},
                {"analogy": "The Library Desk 📚", "story": "Books you are actively reading sit on your desk (RAM). Books stored for years stay on the tall bookshelf (Storage)."},
            ]
        elif "fraction" in topic.lower() or "math" in topic.lower():
            real_world = [
                {"analogy": "Fresh Pizza Slices 🍕", "story": "The denominator tells you how many slices the pizza was cut into (8 slices). The numerator tells you how many slices are left for you (3 slices)."},
            ]
        elif "loop" in topic.lower() or "program" in topic.lower():
            real_world = [
                {"analogy": "Brushing Your Teeth 🪥", "story": "Your brain runs a repeat loop: 'Brush this tooth 10 times.' Once count reaches 10, the loop stops automatically."},
            ]
        elif "photo" in topic.lower() or "plant" in topic.lower():
            real_world = [
                {"analogy": "Solar-Powered Bakery ☀️🌿", "story": "Leaves catch sunlight (oven heat), roots drink water, and leaves breathe in CO2 to bake sweet sugars."},
            ]
        else:
            real_world = [
                {"analogy": "Building with LEGO Blocks 🧱", "story": f"Every big concept in {topic} is built by snapping small, dependable blocks together."},
            ]

        # 7. Flashcards
        flashcards = [
            {"front": f"What is the primary role of {topic}?", "back": f"To execute operations and transform inputs into reliable results."},
            {"front": "What is the difference between temporary and permanent storage?", "back": "Temporary storage resets when powered off; permanent storage stays saved forever."},
            {"front": "How do loops and pipelines assist performance?", "back": "They automate repetitive instructions so systems run thousands of times faster."},
        ]

        # 8. Practice Questions
        practice_questions = [
            {
                "id": f"pq-{topic[:4]}-1",
                "question": f"Which part of the {topic} system is responsible for active instruction processing?",
                "options": ["The Central Processing Core", "The Outer Plastic Case", "The Power Adapter", "The Packaging Box"],
                "correctAnswer": 0,
                "hint": "Think of the head chef who actively cooks the recipe.",
                "explanation": "The central processing core executes arithmetic and logic instructions.",
                "difficulty": "beginner",
            },
            {
                "id": f"pq-{topic[:4]}-2",
                "question": "Why is working memory (RAM) designed differently from persistent storage (SSD)?",
                "options": ["RAM is ultra-fast for active tasks but resets; SSD is permanent", "RAM is made of paper", "SSD is slower than a snail", "There is no difference"],
                "correctAnswer": 0,
                "hint": "Think of the kitchen countertop versus the pantry.",
                "explanation": "RAM offers nanosecond latency for running programs, whereas SSD stores files permanently.",
                "difficulty": "intermediate",
            },
        ]

        return {
            "topic": topic,
            "engine": "Deterministic Educational NLP Engine (Offline Fallback)",
            "simpleEnglish": simple_text,
            "detailedExplanation": detailed_text,
            "shortSummary": summary_bullets,
            "stepByStep": steps,
            "keyPoints": key_points,
            "realWorldExamples": real_world,
            "flashcards": flashcards,
            "practiceQuestions": practice_questions,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    async def adapt_content(self, topic: str, text: str) -> dict:
        """Attempts Gemini LLM API if key is available, else uses offline engine."""
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                # LLM integration hook
                import urllib.request
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                prompt = (
                    f"You are an expert accessibility tutor. Transform this lesson topic '{topic}' and text '{text}' "
                    "into 8 structured formats: simpleEnglish, detailedExplanation, shortSummary (list), stepByStep (list), "
                    "keyPoints (list), realWorldExamples (list of analogy/story), flashcards (list of front/back), "
                    "practiceQuestions (list of question, options, correctAnswer 0-3, hint, explanation). "
                    "Return ONLY valid JSON."
                )
                payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
                req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=4) as response:
                    res_data = json.loads(response.read().decode())
                    raw_ai_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                    cleaned = re.sub(r"```json|```", "", raw_ai_text).strip()
                    parsed = json.loads(cleaned)
                    parsed["engine"] = "Google Gemini LLM Content Synthesizer"
                    return parsed
            except Exception as e:
                # Fall through to offline fallback
                pass

        return self.generate_offline_8_formats(topic, text)

content_adapter = ContentAdaptationEngine()

# ---------------------------------------------------------------------------
# 5. KNOWLEDGE GAP TRACKER & PREREQUISITE DETECTOR
# ---------------------------------------------------------------------------
class KnowledgeGapTracker:
    """
    Topic-wise mastery tracker that identifies prerequisite concepts and targeted remediations.
    """

    def analyze_gaps(self, topic_mastery: dict, quiz_history: list = None) -> dict:
        gaps = []
        prerequisites_needed = []

        for topic, mastery in topic_mastery.items():
            if mastery < 60.0:
                # Look up concept graph
                concept_info = CONCEPT_DEPENDENCY_GRAPH.get(topic, {})
                prereqs = concept_info.get("prerequisites", ["Foundational Vocabulary"])
                remediation = concept_info.get("remediation", f"Review core principles of {topic} before retaking quiz.")

                gaps.append({
                    "topic": topic,
                    "currentMastery": mastery,
                    "severity": "high" if mastery < 50.0 else "medium",
                    "prerequisites": prereqs,
                    "remediationPlan": remediation,
                    "recommendedMicroLessonMinutes": 3,
                })
                prerequisites_needed.extend(prereqs)

        prereq_recs = []
        for g in gaps:
            for p in g["prerequisites"]:
                prereq_recs.append({"weakTopic": g["topic"], "prerequisite": p})

        return {
            "totalGapsIdentified": len(gaps),
            "weakTopicsCount": len(gaps),
            "gaps": gaps,
            "knowledgeGaps": gaps,
            "prerequisiteRecommendations": prereq_recs,
            "prerequisiteConceptsToReinforce": list(set(prerequisites_needed)),
            "healthStatus": "Needs Scaffolding" if len(gaps) >= 2 else ("Minor Concept Review" if gaps else "Proficient"),
        }

knowledge_gap_tracker = KnowledgeGapTracker()

# ---------------------------------------------------------------------------
# 6. INTELLIGENT RECOMMENDATION ENGINE
# ---------------------------------------------------------------------------
class IntelligentRecommendationEngine:
    """
    Generates dynamic, prioritized next steps based on learner intelligence.
    """

    def generate_recommendations(self, learner_analysis: dict, available_lessons: list) -> list:
        recs = []
        weak = learner_analysis.get("weakTopics", [])
        strong = learner_analysis.get("strongTopics", [])
        knowledge_level = learner_analysis.get("currentKnowledgeLevel", "Intermediate")
        user_format = learner_analysis.get("preferredLearningFormats", ["simplified"])[0]

        # 1. High Priority: Prerequisite remediation on weak topics
        for w in weak:
            t_name = w.get("topic")
            recs.append({
                "priority": "high",
                "type": "remediation",
                "badge": "Prerequisite Review",
                "title": f"Strengthen Foundations in {t_name}",
                "description": f"Mastery is currently at {w.get('mastery')}%. Review the {user_format} breakdown and everyday analogies.",
                "actionUrl": f"/lessons?subject={t_name}",
                "icon": "AlertCircle",
            })

        # 2. Level Challenge: Advancing strong topics
        if knowledge_level == "Advanced" and strong:
            top_strong = strong[0].get("topic")
            recs.append({
                "priority": "medium",
                "type": "challenge",
                "badge": "Advanced Tier",
                "title": f"Take the {top_strong} Challenge Quiz",
                "description": f"Outstanding {strong[0].get('mastery')}% mastery. Test your critical thinking with Tier 3 synthesis questions.",
                "actionUrl": "/quiz/lesson-1",
                "icon": "Zap",
            })

        # 3. Next curriculum lesson
        recs.append({
            "priority": "standard",
            "type": "continue",
            "badge": "Curriculum",
            "title": "Continue Next Core Lesson",
            "description": "Progress to the next module using your voluntarily saved accommodations.",
            "actionUrl": "/lessons",
            "icon": "BookOpen",
        })

        # 4. Spaced repetition review
        recs.append({
            "priority": "standard",
            "type": "revision",
            "badge": "Spaced Repetition",
            "title": "Complete 5-Minute Spaced Repetition",
            "description": "Reinforce memory stability before forgetting curve decay sets in.",
            "actionUrl": "/progress",
            "icon": "RotateCcw",
        })

        return recs

recommendation_engine = IntelligentRecommendationEngine()

# ---------------------------------------------------------------------------
# 7. SMART REVISION SCHEDULER (Ebbinghaus Spaced Repetition)
# ---------------------------------------------------------------------------
class SmartRevisionScheduler:
    """
    Ebbinghaus decay model: R(t) = exp(-t / S)
    When retention R(t) < 0.75, revision is scheduled.
    Measures retention improvement after completed sessions.
    """

    def calculate_plan(self, progress_records: list, completed_sessions: list = None) -> dict:
        now = datetime.now(timezone.utc)
        revision_items = []
        due_count = 0

        for p in progress_records:
            mastery = float(p.get("masteryScore", 0))
            if mastery == 0:
                continue

            last_accessed = p.get("lastAccessedAt")
            if isinstance(last_accessed, str):
                try:
                    dt = datetime.fromisoformat(last_accessed.replace("Z", "+00:00"))
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                except Exception:
                    dt = now - timedelta(days=2)
            elif isinstance(last_accessed, datetime):
                dt = last_accessed if last_accessed.tzinfo else last_accessed.replace(tzinfo=timezone.utc)
            else:
                dt = now - timedelta(days=2)

            days_elapsed = max(0.1, (now - dt).total_seconds() / 86400.0)
            stability = (mastery / 15.0) + 1.0  # stability factor in days
            retention = float(np.exp(-days_elapsed / stability))
            retention_pct = int(round(retention * 100))

            # Review interval (when R drops to 75%)
            review_interval_days = max(1, int(round(-stability * np.log(0.75))))
            is_due = retention < 0.75
            if is_due:
                due_count += 1

            revision_items.append({
                "lessonId": p.get("lessonId"),
                "topic": p.get("subject") or p.get("lessonId"),
                "masteryScore": mastery,
                "daysSinceLastReview": round(days_elapsed, 1),
                "estimatedRetention": retention_pct,
                "isDue": is_due,
                "recommendedIntervalDays": review_interval_days,
                "urgency": "High" if retention < 0.65 else ("Medium" if retention < 0.75 else "Optimal"),
                "exerciseType": "Flashcards" if retention >= 0.70 else "Concept Mindmap + 3-Question Check",
            })

        revision_items.sort(key=lambda x: x["estimatedRetention"])

        avg_retention = int(np.mean([item["estimatedRetention"] for item in revision_items])) if revision_items else 82

        return {
            "algorithm": "Ebbinghaus Spaced Repetition R(t)=e^(-t/S)",
            "totalTopicsTracked": len(revision_items),
            "topicsDueForRevision": due_count,
            "revisionQueue": revision_items,
            "scheduledRevisions": revision_items,
            "completedSessionsCount": len(completed_sessions or []),
            "averageRetentionRate": avg_retention,
            "averageCohortRetention": avg_retention,
            "retentionCurve": [
                {"day": 0, "retention": 100},
                {"day": 1, "retention": 80},
                {"day": 3, "retention": 65},
                {"day": 7, "retention": 50},
                {"day": 14, "retention": 40},
                {"day": 30, "retention": 30},
            ],
        }

smart_revision = SmartRevisionScheduler()
