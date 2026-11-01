import os
import re
import math
import json
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

# ---------------------------------------------------------------------------
# 1. BAYESIAN KNOWLEDGE TRACING (BKT) ENGINE
# ---------------------------------------------------------------------------
class BayesianKnowledgeTracing:
    """
    Standard Bayesian Knowledge Tracing model for tracking student skill mastery.
    - P(L0): Initial probability student knows the skill (Prior)
    - P(T):  Probability student transitions from unlearned to learned (Transit)
    - P(G):  Probability student guesses correctly despite not knowing (Guess)
    - P(S):  Probability student slips and answers incorrectly despite knowing (Slip)
    """
    def __init__(self, p_l0=0.5, p_t=0.2, p_g=0.2, p_s=0.1):
        self.p_l0 = p_l0
        self.p_t = p_t
        self.p_g = p_g
        self.p_s = p_s

    def predict_correct(self, p_l: float) -> float:
        """Probability of correct answer given current knowledge state p_l."""
        return p_l * (1.0 - self.p_s) + (1.0 - p_l) * self.p_g

    def update(self, p_l_prev: float, is_correct: bool) -> float:
        """
        Bayesian update of latent knowledge given observation (correct/incorrect).
        Returns posterior P(L_t+1).
        """
        if is_correct:
            numerator = p_l_prev * (1.0 - self.p_s)
            denominator = numerator + (1.0 - p_l_prev) * self.p_g
        else:
            numerator = p_l_prev * self.p_s
            denominator = numerator + (1.0 - p_l_prev) * (1.0 - self.p_g)

        p_l_obs = numerator / max(denominator, 1e-9)
        # Transition step: learned in this opportunity
        p_l_next = p_l_obs + (1.0 - p_l_obs) * self.p_t
        return float(np.clip(p_l_next, 0.01, 0.99))

bkt_engine = BayesianKnowledgeTracing()

# ---------------------------------------------------------------------------
# 2. ITEM RESPONSE THEORY (IRT) & ELO DYNAMIC DIFFICULTY SWITCHER
# ---------------------------------------------------------------------------
class ItemResponseModel:
    """
    1-Parameter Logistic (Rasch) IRT model combined with Elo-style calibration.
    Dynamically adjusts student ability theta and question difficulty beta.
    """
    def __init__(self, k_factor=0.3):
        self.k_factor = k_factor
        self.difficulty_map = {
            "easy": -0.8,
            "medium": 0.0,
            "hard": 0.9,
        }

    def probability_correct(self, theta: float, beta: float) -> float:
        """P(correct | theta, beta) = 1 / (1 + exp(-1.7 * (theta - beta)))"""
        logit = 1.7 * (theta - beta)
        return float(1.0 / (1.0 + np.exp(-np.clip(logit, -10, 10))))

    def update_ability(self, theta: float, beta: float, actual: float) -> float:
        """
        Updates student ability estimate theta based on actual response (1 or 0).
        """
        expected = self.probability_correct(theta, beta)
        new_theta = theta + self.k_factor * (actual - expected)
        return float(np.clip(new_theta, -2.5, 2.5))

    def recommend_difficulty(self, theta: float) -> dict:
        """
        Recommends next question difficulty and scaffolding tier based on theta.
        """
        if theta > 0.6:
            level = "hard"
            tier = 3
            label = "Advanced Synthesis & Challenge"
            scaffolding = "Minimal hints, multi-step critical thinking"
        elif theta >= -0.3:
            level = "medium"
            tier = 2
            label = "Core Application & Synthesis"
            scaffolding = "Moderate hints, contextual analogies available"
        else:
            level = "easy"
            tier = 1
            label = "Foundational Scaffolding"
            scaffolding = "Rich visual/audio cues, step-by-step hints enabled"

        return {
            "level": level,
            "tier": tier,
            "label": label,
            "theta": round(theta, 3),
            "scaffolding": scaffolding,
        }

irt_engine = ItemResponseModel()

# ---------------------------------------------------------------------------
# 3. AI LEARNING DNA CLUSTERING & PROFILING (scikit-learn)
# ---------------------------------------------------------------------------
class LearningDNAEngine:
    """
    Uses scikit-learn KMeans and PCA on 6D learner telemetry:
    [visual_pref, audio_pref, text_speed, cognitive_load_thresh, accuracy, pacing]
    """
    ARCHETYPES = [
        {
            "name": "Auditory Scaffolded Learner",
            "cluster_id": 0,
            "description": "Thrives with spoken narrations, chunked short texts, and structured pacing.",
            "traits": ["High auditory retention", "Prefers simplified sentences", "Benefits from audio read-aloud", "High empathy for calm pacing"],
            "best_formats": ["audio", "simplified", "practice"],
        },
        {
            "name": "High-Velocity Visual Explorer",
            "cluster_id": 1,
            "description": "Rapidly absorbs complex diagrams, concept flowcharts, and technical depth.",
            "traits": ["High visual pattern recognition", "Prefers diagrams & mindmaps", "Excels at hard quiz challenges", "Rapid reading pace"],
            "best_formats": ["visual", "detailed", "practice"],
        },
        {
            "name": "Screen-Reader Multi-Sensory Learner",
            "cluster_id": 2,
            "description": "Navigates seamlessly with audio descriptions, tactile focus, and high contrast.",
            "traits": ["Screen-reader optimized", "High auditory attention", "Clear descriptive structure", "Consistent keyboard focus"],
            "best_formats": ["audio", "simplified"],
        },
        {
            "name": "Reflective Step-by-Step Builder",
            "cluster_id": 3,
            "description": "Learns deeply by breaking complex processes down into micro-milestones.",
            "traits": ["Step-by-step logic", "Prefers procedural flowcharts", "Reflective pacing", "High accuracy on review"],
            "best_formats": ["steps", "simplified", "visual"],
        },
    ]

    def __init__(self):
        # Synthetic calibration cohort data for fitting KMeans & PCA
        np.random.seed(42)
        c0 = np.random.normal(loc=[0.2, 0.9, 0.3, 0.4, 0.75, 0.3], scale=0.08, size=(25, 6)) # Auditory Scaffolded
        c1 = np.random.normal(loc=[0.9, 0.2, 0.8, 0.8, 0.90, 0.8], scale=0.08, size=(25, 6)) # Visual Explorer
        c2 = np.random.normal(loc=[0.3, 0.95, 0.4, 0.6, 0.72, 0.5], scale=0.08, size=(25, 6)) # Multi-Sensory
        c3 = np.random.normal(loc=[0.6, 0.5, 0.5, 0.5, 0.82, 0.5], scale=0.08, size=(25, 6)) # Step-by-Step
        self.training_data = np.clip(np.vstack([c0, c1, c2, c3]), 0.0, 1.0)

        self.kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.kmeans.fit(self.training_data)

        self.pca = PCA(n_components=2, random_state=42)
        self.pca.fit(self.training_data)

    def extract_features(self, profile: dict, quiz_history: list = None) -> np.ndarray:
        """Extracts normalized 6D vector from learner profile & telemetry."""
        p_format = profile.get("preferredFormat", "simplified")
        vis_val = 0.9 if p_format == "visual" else (0.6 if profile.get("accessibilityPreferences", {}).get("visualDiagrams") else 0.3)
        aud_val = 0.9 if p_format == "audio" else (0.7 if profile.get("accessibilityPreferences", {}).get("audioNarration") else 0.2)
        
        speed = profile.get("readingSpeed", "moderate")
        speed_val = 0.85 if speed == "fast" else (0.35 if speed == "slow" else 0.6)

        level = profile.get("learningLevel", "beginner")
        cog_thresh = 0.85 if level == "advanced" else (0.6 if level == "intermediate" else 0.4)

        if quiz_history and len(quiz_history) > 0:
            accuracies = [q.get("accuracy", 0.7) for q in quiz_history]
            avg_acc = float(np.mean(accuracies))
        else:
            baseline = profile.get("baselineScore", 70)
            avg_acc = baseline / 100.0

        pacing_val = float(np.clip(profile.get("speechRate", 0.9) / 1.5, 0.2, 1.0))

        vec = np.array([vis_val, aud_val, speed_val, cog_thresh, avg_acc, pacing_val])
        return np.clip(vec, 0.0, 1.0).reshape(1, -1)

    def compute_dna(self, profile: dict, quiz_history: list = None) -> dict:
        """
        Computes the complete AI Learning DNA profile for a student:
        - Archetype & traits
        - 2D PCA projection coordinates (for DNA scatter chart)
        - 6-axis Radar chart scores (0-100)
        """
        feat = self.extract_features(profile, quiz_history)
        cluster_id = int(self.kmeans.predict(feat)[0])
        pca_coords = self.pca.transform(feat)[0]

        archetype = self.ARCHETYPES[cluster_id % len(self.ARCHETYPES)]

        # 6 Radar chart dimensions (0-100)
        v = feat[0]
        radar_metrics = [
            {"dimension": "Visual Processing", "score": int(round(v[0] * 100)), "fullMark": 100},
            {"dimension": "Auditory Processing", "score": int(round(v[1] * 100)), "fullMark": 100},
            {"dimension": "Reading Velocity", "score": int(round(v[2] * 100)), "fullMark": 100},
            {"dimension": "Cognitive Stamina", "score": int(round(v[3] * 100)), "fullMark": 100},
            {"dimension": "Concept Mastery", "score": int(round(v[4] * 100)), "fullMark": 100},
            {"dimension": "Pacing Adaptability", "score": int(round(v[5] * 100)), "fullMark": 100},
        ]

        return {
            "archetype": archetype["name"],
            "clusterId": cluster_id,
            "description": archetype["description"],
            "traits": archetype["traits"],
            "recommendedFormats": archetype["best_formats"],
            "pcaCoordinates": {"x": round(float(pca_coords[0]), 3), "y": round(float(pca_coords[1]), 3)},
            "radarMetrics": radar_metrics,
            "genomeHash": f"DNA-{cluster_id}{int(v[0]*10)}{int(v[1]*10)}{int(v[4]*10)}",
        }

learning_dna_engine = LearningDNAEngine()

# ---------------------------------------------------------------------------
# 4. NLP READABILITY & MULTI-FORMAT TRANSFORMATION ENGINE
# ---------------------------------------------------------------------------
class NLPReadabilitySimplifier:
    """
    Computes readability metrics (Flesch Reading Ease, Flesch-Kincaid Grade)
    and simplifies complex academic prose into accessible multi-format lessons.
    """
    SIMPLIFICATION_DICTIONARY = {
        r"\bmanipulates\b": "handles and works with",
        r"\bsemiconductor\b": "microscopic silicon switch",
        r"\btransistors\b": "tiny electronic switches",
        r"\barchitecture\b": "blueprint and layout",
        r"\bvolatile\b": "temporary (wipes clean when turned off)",
        r"\bnon-volatile\b": "permanent (stays saved forever)",
        r"\barithmetic\b": "math and counting",
        r"\bphotosynthesis\b": "how green plants use sunlight to make food",
        r"\bchloroplasts\b": "tiny green solar panels in plant leaves",
        r"\bchlorophyll\b": "green sunlight catcher",
        r"\bcarbohydrates\b": "energy-rich sugars",
        r"\bphotolysis\b": "splitting water with light energy",
        r"\biterations\b": "repeats",
        r"\bdeterministic\b": "always produces the exact same answer",
        r"\bdenominator\b": "bottom number showing total equal pieces",
        r"\bnumerator\b": "top number showing pieces you currently have",
    }

    def count_syllables(self, word: str) -> int:
        word = word.lower()
        if len(word) <= 3:
            return 1
        word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
        word = re.sub(r'^y', '', word)
        matches = re.findall(r'[aeiouy]{1,2}', word)
        return max(1, len(matches))

    def compute_readability(self, text: str) -> dict:
        words = re.findall(r'\b[A-Za-z]+\b', text)
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        
        total_words = max(1, len(words))
        total_sentences = max(1, len(sentences))
        total_syllables = sum(self.count_syllables(w) for w in words)

        # Flesch Reading Ease
        fre = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
        fre = round(float(np.clip(fre, 0, 100)), 1)

        # Flesch-Kincaid Grade Level
        fkgl = 0.39 * (total_words / total_sentences) + 11.8 * (total_syllables / total_words) - 15.59
        fkgl = max(1.0, round(float(fkgl), 1))

        if fre >= 80:
            level_desc = "Very Easy (Grade 4-5) - Accessible to all learners"
        elif fre >= 60:
            level_desc = "Standard (Grade 6-8) - Clear and conversational"
        elif fre >= 40:
            level_desc = "Fairly Difficult (High School) - Requires academic focus"
        else:
            level_desc = "Complex Academic - High cognitive load"

        return {
            "fleschReadingEase": fre,
            "gradeLevel": fkgl,
            "description": level_desc,
            "wordCount": total_words,
            "sentenceCount": total_sentences,
            "avgWordsPerSentence": round(total_words / total_sentences, 1),
        }

    def simplify_text(self, text: str) -> str:
        """Applies vocabulary substitutions and splits long sentences."""
        simplified = text
        for pattern, replacement in self.SIMPLIFICATION_DICTIONARY.items():
            simplified = re.sub(pattern, replacement, simplified, flags=re.IGNORECASE)
        return simplified

    def generate_five_experiences(self, topic: str, raw_text: str) -> dict:
        """
        Transforms any lesson text into the 'One Lesson – Five Experiences' format:
        1. Simple English (Scaffolded Plain English)
        2. Large-Text High-Contrast Chunked Reading
        3. Spoken Audio Narration with pronunciation hints & pauses
        4. Visual Explainer & Mindmap Diagram
        5. Step-by-Step Interactive Micro-Tasks
        """
        simplified_prose = self.simplify_text(raw_text)
        readability_raw = self.compute_readability(raw_text)
        readability_sim = self.compute_readability(simplified_prose)

        return {
            "topic": topic,
            "readabilityBefore": readability_raw,
            "readabilityAfter": readability_sim,
            "experiences": {
                "simple_english": {
                    "formatName": "Simple English Mode",
                    "badge": "Low Cognitive Load",
                    "summary": f"In simple terms: {simplified_prose[:180]}...",
                    "content": simplified_prose,
                    "targetGrade": "Grade 5-6",
                },
                "large_text": {
                    "formatName": "Large-Text Reading Mode",
                    "badge": "Dyslexia-Friendly Layout",
                    "suggestedTextSize": "xlarge",
                    "suggestedLineSpacing": "loose",
                    "chunks": [p.strip() for p in simplified_prose.split(".") if len(p.strip()) > 15],
                },
                "audio_narration": {
                    "formatName": "Audio Lesson with Text-to-Speech",
                    "badge": "Auditory First",
                    "narrationScript": f"Welcome! Today we are exploring {topic}. Take a deep breath. {simplified_prose}",
                    "pacingTips": "Recommended speed: 0.85x with relaxed acoustic pauses between sections.",
                    "pausePoints": [
                        {"sec": 0, "label": "Lesson Introduction"},
                        {"sec": 12, "label": "Core Analogy"},
                        {"sec": 30, "label": "Key Concept Takeaway"},
                    ],
                },
                "visual_explainer": {
                    "formatName": "Visual Diagrams & Metaphors",
                    "badge": "Visual / Spatial",
                    "analogy": "Interactive visual analogy connecting inputs, processing, and outputs.",
                    "conceptFlow": [
                        {"step": 1, "title": "Input", "desc": "Information or energy enters the system"},
                        {"step": 2, "title": "Core Engine", "desc": "Internal processing transforms data"},
                        {"step": 3, "title": "Safe Storage", "desc": "Saved for later use"},
                        {"step": 4, "title": "Result Output", "desc": "Delivers the finished result"},
                    ],
                },
                "step_by_step": {
                    "formatName": "Step-by-Step Guided Breakdown",
                    "badge": "Sequential Mastery",
                    "steps": [
                        {"stepNumber": 1, "action": "Observe", "text": "Notice the primary building block of this concept."},
                        {"stepNumber": 2, "action": "Connect", "text": "Relate it to an everyday object you already know."},
                        {"stepNumber": 3, "action": "Apply", "text": "Answer one micro-check to lock the idea in memory."},
                    ],
                },
            },
        }

nlp_simplifier = NLPReadabilitySimplifier()

# ---------------------------------------------------------------------------
# 5. SPACED REPETITION & EBBINGHAUS FORGETTING CURVE REVISION SCHEDULER
# ---------------------------------------------------------------------------
class SpacedRepetitionScheduler:
    """
    Ebbinghaus Forgetting Curve Model:
    R(t) = exp(-t / S)
    where:
    - R: memory retention probability
    - t: days elapsed since last review
    - S: memory stability (days), boosted by mastery score and repeat reviews
    """
    def __init__(self, target_retention=0.75):
        self.target_retention = target_retention

    def calculate_retention(self, days_elapsed: float, stability_days: float) -> float:
        return float(np.exp(-days_elapsed / max(stability_days, 0.5)))

    def calculate_next_review_interval(self, stability_days: float) -> int:
        """When retention drops to target (75%), schedule revision."""
        # R = exp(-t / S) => t = -S * ln(R)
        interval = -stability_days * np.log(self.target_retention)
        return max(1, int(round(interval)))

    def evaluate_topics_for_revision(self, progress_records: list) -> list:
        """
        Scans student's completed lessons, estimates current retention,
        and schedules review sessions.
        """
        now = datetime.utcnow()
        revision_items = []

        for p in progress_records:
            mastery = p.get("masteryScore", 0)
            if mastery == 0:
                continue

            last_accessed = p.get("lastAccessedAt")
            if isinstance(last_accessed, str):
                try:
                    dt = datetime.fromisoformat(last_accessed.replace("Z", "+00:00"))
                except Exception:
                    dt = now - timedelta(days=2)
            elif isinstance(last_accessed, datetime):
                dt = last_accessed
            else:
                dt = now - timedelta(days=2)

            days_elapsed = max(0.1, (now - dt.replace(tzinfo=None)).total_seconds() / 86400.0)
            stability = (mastery / 15.0) + 1.0  # Higher mastery => slower decay
            retention = self.calculate_retention(days_elapsed, stability)
            days_until_due = self.calculate_next_review_interval(stability) - int(days_elapsed)

            urgency = "high" if retention < 0.65 else ("medium" if retention < 0.80 else "low")

            revision_items.append({
                "lessonId": p.get("lessonId"),
                "masteryScore": mastery,
                "daysElapsed": round(days_elapsed, 1),
                "retentionPercentage": int(round(retention * 100)),
                "urgency": urgency,
                "daysUntilDue": days_until_due,
                "recommendedAction": "10-minute flashcard review" if retention >= 0.70 else "Review visual concept mindmap and retake quiz",
            })

        revision_items.sort(key=lambda x: x["retentionPercentage"])
        return revision_items

revision_scheduler = SpacedRepetitionScheduler()

# ---------------------------------------------------------------------------
# 6. AI KNOWLEDGE GAP DETECTOR
# ---------------------------------------------------------------------------
class KnowledgeGapDetector:
    """
    Analyzes quiz answer history to detect underlying cognitive misconceptions
    and missing prerequisites.
    """
    MISCONCEPTION_RULES = {
        "RAM": {
            "concept": "Volatile vs Persistent Memory",
            "misconception": "Confusing temporary memory (RAM) with permanent storage (SSD/HDD).",
            "remediation": "Think of RAM as your kitchen countertop: everything is cleared when you close the kitchen. Storage is the pantry where cans stay forever.",
        },
        "CPU": {
            "concept": "Central Processing Unit Role",
            "misconception": "Believing CPU stores files rather than executing operational instructions.",
            "remediation": "The CPU is the chef cooking the meal, not the refrigerator storing groceries.",
        },
        "Denominator": {
            "concept": "Fraction Structure",
            "misconception": "Believing larger denominator means a bigger slice.",
            "remediation": "More slices in the pizza means each slice gets smaller! D for Down and Divides.",
        },
        "Loop": {
            "concept": "Repetition & Termination Conditions",
            "misconception": "Struggling to track when a loop stops repeating.",
            "remediation": "A repeat loop is like stirring your drink 5 times: count each stir, then stop.",
        },
        "Photosynthesis": {
            "concept": "Light & Dark Reactions",
            "misconception": "Thinking plants breathe soil rather than taking carbon dioxide from the air and water from roots.",
            "remediation": "Sunlight is the stove energy, water and air are the ingredients, sugar is the cake!",
        },
    }

    def detect_gaps(self, user_id: str, quiz_attempts: list) -> list:
        gaps = []
        if not quiz_attempts:
            return gaps

        for attempt in quiz_attempts:
            answers = attempt.get("answers", [])
            for ans in answers:
                if not ans.get("isCorrect", False):
                    q_id = str(ans.get("questionId", ""))
                    # Check for keywords
                    for keyword, rule in self.MISCONCEPTION_RULES.items():
                        if keyword.lower() in q_id.lower() or keyword.lower() in str(ans.get("explanation", "")).lower():
                            gaps.append({
                                "userId": user_id,
                                "topic": keyword,
                                "concept": rule["concept"],
                                "severity": "high" if attempt.get("accuracy", 1.0) < 0.6 else "medium",
                                "misconception": rule["misconception"],
                                "recommendedAction": rule["remediation"],
                                "detectedAt": attempt.get("attemptedAt", datetime.utcnow().isoformat()),
                            })
                            break
        return gaps

gap_detector = KnowledgeGapDetector()

# ---------------------------------------------------------------------------
# 7. TEACHER INTERVENTION ALERTS ENGINE
# ---------------------------------------------------------------------------
class TeacherAlertEngine:
    """
    Evaluates cohort health and surfaces empathetic, actionable alerts
    for students who may need additional scaffolding or differentiated intervention.
    """
    def evaluate_student(self, student_dict: dict) -> list:
        alerts = []
        s_id = student_dict.get("id")
        s_name = student_dict.get("name")
        quiz_attempts = student_dict.get("quizAttempts", [])
        progress = student_dict.get("progress", [])

        # Check consecutive low quiz accuracy
        if len(quiz_attempts) >= 2:
            recent_attempts = quiz_attempts[-2:]
            if all(a.get("accuracy", 1.0) < 0.70 for a in recent_attempts):
                alerts.append({
                    "studentId": s_id,
                    "studentName": s_name,
                    "topic": recent_attempts[-1].get("lessonId", "Recent Topic"),
                    "alertType": "struggling_concept",
                    "urgency": "high",
                    "reason": f"Student scored below 70% on 2 consecutive quiz checks (last score: {recent_attempts[-1].get('score', 0)}%).",
                    "recommendedIntervention": "Assign simplified audio lesson and schedule 5-minute peer coaching or teacher scaffolding.",
                })

        # Check cognitive overload / excessive time spent
        for a in quiz_attempts:
            if a.get("timeSpentSeconds", 0) > 240 and a.get("accuracy", 1.0) < 0.75:
                alerts.append({
                    "studentId": s_id,
                    "studentName": s_name,
                    "topic": a.get("lessonId", "Current Lesson"),
                    "alertType": "cognitive_overload",
                    "urgency": "medium",
                    "reason": f"Student spent over {int(a.get('timeSpentSeconds', 0)/60)} minutes struggling with high question reading density.",
                    "recommendedIntervention": "Enable large text, dyslexic font, and audio narration mode to reduce visual strain.",
                })
                break

        return alerts

teacher_alert_engine = TeacherAlertEngine()

# ---------------------------------------------------------------------------
# 8. INTERACTIVE SOCRATIC AI TUTOR (Aria)
# ---------------------------------------------------------------------------
class AITutorAssistant:
    """
    Context-aware Socratic tutor: explains concepts gently, uses daily life analogies,
    gives hints without revealing answers, and adapts to learner accessibility needs.
    """
    def answer_query(self, message: str, lesson_context: dict = None, student_profile: dict = None) -> dict:
        msg_lower = message.lower()
        pref_format = student_profile.get("preferredFormat", "simplified") if student_profile else "simplified"

        # Check topic context
        if "cpu" in msg_lower or "hardware" in msg_lower or "processor" in msg_lower:
            reply = (
                "Great question! Think of the CPU like the master chef in a bustling restaurant kitchen 👨‍🍳. "
                "Just like a chef reads order tickets and cooks food step-by-step, the CPU reads program instructions "
                "and does all the calculations. It doesn't store the groceries (that's the pantry/storage!), but it works super fast!"
            )
            hint = "Remember: CPU = Chief Processing Unit / Chef."
            analogy = "Kitchen Chef cooking meals."
        elif "ram" in msg_lower or "memory" in msg_lower:
            reply = (
                "RAM is like your kitchen countertop! When you are working on homework or playing a game, "
                "you spread your books and tools on the countertop. It's super fast to reach. "
                "But when you turn the power off at night, the countertop gets wiped completely clean!"
            )
            hint = "RAM is fast and temporary; storage (SSD) is permanent."
            analogy = "Kitchen countertop vs pantry."
        elif "fraction" in msg_lower or "ratio" in msg_lower:
            reply = (
                "Picture a delicious, fresh pizza cut into 8 equal slices 🍕. "
                "The bottom number (Denominator) tells you how many slices exist in total. "
                "The top number (Numerator) tells you how many slices you get to eat! "
                "So 3/8 means you have 3 slices out of 8."
            )
            hint = "D for Down = Denominator."
            analogy = "Pizza slices."
        elif "loop" in msg_lower or "algorithm" in msg_lower:
            reply = (
                "Imagine you are brushing your teeth 🪥. Your parent tells you: 'Brush this tooth 10 times.' "
                "Instead of listing 'brush, brush, brush...' 10 times in your head, your brain uses a repeat loop! "
                "An algorithm is just a clear recipe of steps that computer follows."
            )
            hint = "Loops repeat until a goal is met."
            analogy = "Following a cake recipe."
        elif "photosynthesis" in msg_lower or "plant" in msg_lower:
            reply = (
                "Plants are like solar-powered bakeries 🌿☀️. "
                "They catch golden sunlight with their green leaves (chlorophyll), drink water through their roots, "
                "and breathe in carbon dioxide. Then they bake sweet sugars for food and release fresh oxygen for us to breathe!"
            )
            hint = "Sunlight + Water + CO2 => Sugar + Oxygen."
            analogy = "Solar-powered leaf bakery."
        else:
            reply = (
                "I'm right here with you! Let's take this one step at a time. "
                "Whenever a concept feels big or complicated, we can break it down into smaller, friendly pieces. "
                f"Would you like me to show a simple visual diagram, give an everyday analogy, or guide you through a gentle practice question?"
            )
            hint = "You can ask for simple analogies, audio explanations, or practice hints anytime."
            analogy = "Everyday life examples."

        return {
            "reply": reply,
            "hint": hint,
            "analogy": analogy,
            "adaptedFor": pref_format,
            "suggestedFollowUps": [
                "Can you give me an example?",
                "Can you make this even simpler?",
                "Show me a step-by-step breakdown",
                "Give me a quick practice question",
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }

ai_tutor = AITutorAssistant()

