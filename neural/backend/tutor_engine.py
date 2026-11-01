"""
AdaptiveLearn AI - Multimodal Intelligent AI Tutor Engine
Phase 4: Conversational AI, Multimodal Learning Assistant, Document Doubt Solver,
Voice Assistant, Visual Explanation Generator, Flashcard Studio, and 5 Teaching Personalities.
"""

import os
import re
import json
import io
import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False


# ---------------------------------------------------------------------------
# 1. 5 DISTINCT TEACHING PERSONALITIES
# ---------------------------------------------------------------------------
TEACHING_PERSONALITIES = {
    "simple": {
        "name": "Simple Teacher",
        "avatar": "🌱",
        "badge": "Plain English & Analogies",
        "description": "Explains everything in simple, everyday language using familiar kitchen, sports, and nature analogies.",
        "tone": "Warm, patient, crystal-clear, short sentences, zero technical jargon.",
    },
    "visual": {
        "name": "Visual Teacher",
        "avatar": "🎨",
        "badge": "Flowcharts & Spatial Models",
        "description": "Emphasizes Mermaid flowcharts, ASCII concept diagrams, visual color cues, and spatial layouts.",
        "tone": "Descriptive, spatial, visual-first, structured diagrams, flowchart-oriented.",
    },
    "step_by_step": {
        "name": "Step-by-Step Teacher",
        "avatar": "🪜",
        "badge": "Sequential Micro-Steps",
        "description": "Teaches one bite-sized concept at a time in numbered chronological steps, verifying each before advancing.",
        "tone": "Methodical, structured, numbered, validating, pacing-aware.",
    },
    "practice": {
        "name": "Practice Coach",
        "avatar": "🎯",
        "badge": "Interactive Challenges & Socratic Hints",
        "description": "Focuses on challenge questions, exercises, and incremental hints without giving away the answer.",
        "tone": "Energizing, Socratic, inquisitive, encouraging, hint-first.",
    },
    "revision": {
        "name": "Revision Mentor",
        "avatar": "🧠",
        "badge": "Mnemonics & Memory Anchors",
        "description": "Focuses on spaced repetition summaries, memory pegs, acronyms, and high-yield review sheets.",
        "tone": "Concise, memorable, mnemonic-focused, high-yield.",
    },
}


# ---------------------------------------------------------------------------
# 2. SOCRATIC HINT GENERATION (Never reveals quiz answers immediately)
# ---------------------------------------------------------------------------
class SocraticHintEngine:
    """Provides 3 progressive tiers of hints before revealing answers."""

    @staticmethod
    def generate_hints(question: str, topic: str = "General", lesson_context: str = "") -> dict:
        q_lower = question.lower()
        if any(k in q_lower for k in ["cpu", "processor", "hardware", "ram", "memory", "storage"]):
            return {
                "tier1_clue": "Foundational Clue: Think of the head chef and kitchen countertop in a busy kitchen who reads recipe tickets and chops ingredients.",
                "tier2_guiding_question": "Guiding Question: Where do ingredients sit while being actively chopped versus where are bulk supplies stored?",
                "tier3_outline": "Structural Outline: Active work happens in RAM (countertop), while the CPU executes instructions fetched one by one.",
                "solution_revealed": False,
            }
        elif "fraction" in q_lower or "denominator" in q_lower or "math" in q_lower:
            return {
                "tier1_clue": "Foundational Clue: Think of a fresh pizza. The bottom number tells you how many equal slices the pizza was cut into.",
                "tier2_guiding_question": "Guiding Question: If you cut a pizza into 8 slices instead of 2, does each individual slice get bigger or smaller?",
                "tier3_outline": "Structural Outline: A larger denominator means smaller piece sizes. Before adding fractions, ensure the slices are the same size (Common Denominator).",
                "solution_revealed": False,
            }
        elif "photo" in q_lower or "plant" in q_lower or "leaf" in q_lower:
            return {
                "tier1_clue": "Foundational Clue: Plants are nature's solar-powered bakeries. They don't eat soil; they make their own sweet food.",
                "tier2_guiding_question": "Guiding Question: What three raw ingredients enter the leaf: what comes from the sky, what from rain, and what gas do leaves breathe in?",
                "tier3_outline": "Structural Outline: Sunlight + Water + CO2 enter chloroplasts. The outcome is glucose sugar for growth and oxygen released for us.",
                "solution_revealed": False,
            }
        elif "loop" in q_lower or "program" in q_lower or "code" in q_lower:
            return {
                "tier1_clue": "Foundational Clue: Think of brushing your teeth: you brush back and forth repeatedly until your timer dings.",
                "tier2_guiding_question": "Guiding Question: What condition tells the computer when to STOP repeating?",
                "tier3_outline": "Structural Outline: A loop has a start value, a repeat body, an update step, and a stopping boundary condition.",
                "solution_revealed": False,
            }
        else:
            return {
                "tier1_clue": f"Foundational Clue: Break '{question}' into its simplest fundamental building block.",
                "tier2_guiding_question": "Guiding Question: What input is transformed into the desired output in this scenario?",
                "tier3_outline": "Structural Outline: Review the core definition, apply the primary rule, and test with a simple case first.",
                "solution_revealed": False,
            }


# ---------------------------------------------------------------------------
# 3. DOCUMENT & PDF DOUBT SOLVER
# ---------------------------------------------------------------------------
class DocumentDoubtSolver:
    """Extracts text from PDFs, text files, and images to answer grounded questions."""

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        if not PDF_SUPPORT:
            return "PDF processing library not available. Please paste text directly."
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            extracted_pages = []
            for i, page in enumerate(reader.pages[:20]): # Extract first 20 pages max
                text = page.extract_text()
                if text:
                    extracted_pages.append(f"--- Page {i+1} ---\n{text.strip()}")
            return "\n\n".join(extracted_pages) if extracted_pages else "No readable text found in PDF."
        except Exception as e:
            return f"Error extracting text from PDF: {str(e)}"

    def answer_document_query(self, query: str, document_text: str, teaching_mode: str = "simple") -> dict:
        """Searches document for relevant paragraphs and generates an educational explanation."""
        if not document_text or len(document_text.strip()) < 10:
            return {
                "answer": "No document text was provided. Please upload a PDF or paste notes first.",
                "matchedParagraphs": [],
                "confidence": 0.0,
            }

        # Simple semantic keyword overlap extraction
        query_words = set(re.findall(r"\w+", query.lower()))
        query_words -= {"what", "is", "the", "how", "does", "in", "and", "or", "to", "of", "a", "an", "can", "you", "explain"}

        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", document_text) if len(p.strip()) > 30]
        scored_paragraphs = []

        for p in paragraphs:
            p_words = set(re.findall(r"\w+", p.lower()))
            overlap = len(query_words.intersection(p_words))
            if overlap > 0:
                scored_paragraphs.append((overlap, p))

        scored_paragraphs.sort(key=lambda x: x[0], reverse=True)
        top_matches = [p for _, p in scored_paragraphs[:3]]

        if not top_matches:
            top_matches = paragraphs[:2] if paragraphs else [document_text[:400]]

        grounded_context = "\n\n".join(top_matches)

        # Apply teaching personality
        if teaching_mode == "simple":
            answer_text = (
                f"**Based directly on your uploaded notes:**\n\n"
                f"{top_matches[0]}\n\n"
                f"💡 **In Simple Words:** Think of this like everyday teamwork. "
                "The notes highlight that each piece performs its specific task safely without missing a step."
            )
        elif teaching_mode == "visual":
            answer_text = (
                f"**From your uploaded study notes:**\n\n"
                f"```mermaid\ngraph LR\n  DocTopic[\"📄 Note Topic\"] --> Extract[\"Key Concept\"]\n  Extract --> App[\"Application\"]\n```\n\n"
                f"**Extracted Paragraph:**\n> {top_matches[0][:260]}..."
            )
        elif teaching_mode == "step_by_step":
            answer_text = (
                f"**Here is what your uploaded document teaches, broken down step by step:**\n\n"
                f"1. **Primary Statement:** {top_matches[0][:140]}...\n"
                f"2. **Core Function:** It establishes the foundational rules for this topic.\n"
                f"3. **Practical Outcome:** You can apply this directly in your upcoming assessments."
            )
        elif teaching_mode == "practice":
            answer_text = (
                f"**Great question about your uploaded document!**\n\n"
                f"Your notes state:\n> *\"{top_matches[0][:180]}...\"*\n\n"
                f"🎯 **Quick Understanding Challenge:** Based on this excerpt, what do you think would happen if one step were omitted? (Try answering before I reveal the full rationale!)"
            )
        else: # revision
            answer_text = (
                f"**High-Yield Summary from your notes:**\n\n"
                f"• **Key Concept:** {top_matches[0][:120]}...\n"
                f"• **Memory Peg:** Connect this to your active lesson flashcards.\n"
                f"• **Exam Focus:** Review the bolded terms in this excerpt."
            )

        return {
            "query": query,
            "teachingMode": teaching_mode,
            "answer": answer_text,
            "matchedParagraphs": top_matches,
            "confidence": 0.92 if scored_paragraphs else 0.70,
            "documentWordCount": len(document_text.split()),
        }


# ---------------------------------------------------------------------------
# 4. VISUAL EXPLANATION & MERMAID DIAGRAM GENERATOR
# ---------------------------------------------------------------------------
class VisualExplanationGenerator:
    """Generates flowcharts, concept maps, comparison tables, and formulas."""

    def generate_diagram(self, topic: str, concept: str = "") -> dict:
        t_lower = topic.lower() + " " + concept.lower()

        if "photo" in t_lower or "plant" in t_lower:
            mermaid_code = (
                "graph TD\n"
                "  Sun[\"☀️ Sunlight Energy\"] --> Chloroplast[\"🌿 Chloroplasts in Leaves\"]\n"
                "  Water[\"💧 Water from Soil H2O\"] --> Chloroplast\n"
                "  CO2[\"💨 Carbon Dioxide CO2\"] --> Chloroplast\n"
                "  Chloroplast --> Reaction{\"⚡ Photosynthesis Reaction\"}\n"
                "  Reaction --> Glucose[\"🍬 Glucose Sugar (Food for Growth)\"]\n"
                "  Reaction --> Oxygen[\"🫁 Oxygen Gas O2 (Released to Air)\"]\n"
                "  classDef solar fill:#FFFBEB,stroke:#F59E0B,stroke-width:2px;\n"
                "  classDef bio fill:#ECFDF5,stroke:#10B981,stroke-width:2px;\n"
                "  class Sun,Reaction solar;\n"
                "  class Chloroplast,Glucose,Oxygen bio;"
            )
            table = [
                {"input": "Sunlight (Photons)", "source": "Sun in sky", "role": "Provides energy for chlorophyll excitation"},
                {"input": "Water (H2O)", "source": "Roots absorb from soil", "role": "Splits during photolysis to provide electrons"},
                {"input": "Carbon Dioxide (CO2)", "source": "Leaves breathe via stomata", "role": "Carbon backbone used to build glucose"},
                {"output": "Glucose (C6H12O6)", "destination": "Plant cells & fruits", "role": "Stores long-term chemical energy"},
                {"output": "Oxygen (O2)", "destination": "Atmosphere", "role": "Essential byproduct sustaining animal life"},
            ]
            formula = r"6\text{CO}_2 + 6\text{H}_2\text{O} + \text{Light Energy} \xrightarrow{\text{Chlorophyll}} \text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2"
            title = "Photosynthesis: Solar-Powered Biological Synthesis"

        elif "cpu" in t_lower or "computer" in t_lower or "hardware" in t_lower:
            mermaid_code = (
                "graph LR\n"
                "  Input[\"⌨️ Keyboard / Mouse\"] --> CPU[\"🧠 CPU Core\"]\n"
                "  subgraph CPU_Internal [\"CPU Architecture\"]\n"
                "    ALU[\"Math Engine (ALU)\"]\n"
                "    CU[\"Control Unit (Chef)\"]\n"
                "    Reg[\"Registers (Fast Hand)\"]\n"
                "  end\n"
                "  CPU --> L1Cache[\"⚡ Ultra-Fast L1/L2 Cache\"]\n"
                "  L1Cache --> RAM[\"🗄️ RAM Working Memory (Countertop)\"]\n"
                "  RAM --> Storage[\"💾 SSD / Hard Drive (Pantry)\"]\n"
                "  CPU --> Output[\"🖥️ Display Monitor / Speakers\"]\n"
                "  classDef chip fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px;\n"
                "  class CPU,L1Cache,RAM chip;"
            )
            table = [
                {"component": "CPU (Central Processing Unit)", "kitchenAnalogy": "The Head Chef 👨‍🍳", "speed": "Nanoseconds", "permanence": "Active computation only"},
                {"component": "L1 / L2 Cache", "kitchenAnalogy": "Chef's cutting board & spice rack", "speed": "Sub-nanosecond", "permanence": "Volatile (clears instantly)"},
                {"component": "RAM (System Memory)", "kitchenAnalogy": "Kitchen countertop 🪵", "speed": "Very Fast (~10ns)", "permanence": "Volatile (resets on power off)"},
                {"component": "SSD / Hard Disk", "kitchenAnalogy": "Pantry & Walk-in Cooler 🚪", "speed": "Moderate (~10ms)", "permanence": "Permanent (files stay saved)"},
            ]
            formula = r"\text{Execution Time} = \text{Instruction Count} \times \text{CPI} \times \text{Clock Cycle Time}"
            title = "Computer Hardware Architecture: Memory Hierarchy"

        elif "fraction" in t_lower or "math" in t_lower:
            mermaid_code = (
                "graph TD\n"
                "  Fraction[\"🍕 Fraction A/B\"]\n"
                "  Fraction --> Num[\"Top: Numerator (3 slices you hold)\"]\n"
                "  Fraction --> Den[\"Bottom: Denominator (8 total equal slices)\"]\n"
                "  Den --> Rule[\"Key Rule: Larger denominator = Smaller slice piece\"]\n"
                "  Num --> Calc[\"Addition: Find Common Denominator first!\"]\n"
                "  classDef math fill:#FDF2F8,stroke:#E11D48,stroke-width:2px;\n"
                "  class Fraction,Num,Den,Rule,Calc math;"
            )
            table = [
                {"fraction": "1/2", "decimal": "0.50", "percentage": "50%", "visualSlice": "Half of the entire pizza"},
                {"fraction": "1/4", "decimal": "0.25", "percentage": "25%", "visualSlice": "Quarter slice (cut in 4)"},
                {"fraction": "3/8", "decimal": "0.375", "percentage": "37.5%", "visualSlice": "Three slices out of 8 total"},
                {"fraction": "3/4", "decimal": "0.75", "percentage": "75%", "visualSlice": "Three quarters of the whole"},
            ]
            formula = r"\frac{a}{b} + \frac{c}{d} = \frac{a \cdot d + b \cdot c}{b \cdot d}"
            title = "Fraction Arithmetic & Denominator Alignment"

        elif "loop" in t_lower or "program" in t_lower:
            mermaid_code = (
                "graph TD\n"
                "  Start([\"🟢 Start Loop\"]) --> Init[\"Set counter = 0\"]\n"
                "  Init --> Condition{\"Is counter < 10?\"}\n"
                "  Condition -- \"Yes (True)\" --> Action[\"Execute Task: Stir soup\"]\n"
                "  Action --> Inc[\"Increment counter + 1\"]\n"
                "  Inc --> Condition\n"
                "  Condition -- \"No (False)\" --> End([\"🔴 Exit Loop & Continue\"]\n"
                "  classDef code fill:#F0FDF4,stroke:#16A34A,stroke-width:2px;\n"
                "  class Start,Init,Action,Inc code;"
            )
            table = [
                {"loopElement": "Initialization", "purpose": "Sets starting state before repeating", "example": "counter = 0"},
                {"loopElement": "Exit Condition", "purpose": "Checks if loop should continue running", "example": "counter < 10"},
                {"loopElement": "Body Execution", "purpose": "The actual repetitive task automated", "example": "print('Hello student!')"},
                {"loopElement": "Update / Increment", "purpose": "Advances counter so loop doesn't run forever", "example": "counter += 1"},
            ]
            formula = r"\mathcal{O}(n) \implies \text{Runtime scales linearly with iterations } n"
            title = "Algorithm Control Flow: The Repeat Loop"

        else:
            mermaid_code = (
                "graph TD\n"
                f"  Core[\"📘 {topic}\"] --> Concept1[\"Foundational Principle\"]\n"
                "  Core --> Concept2[\"Transformative Action\"]\n"
                "  Core --> Concept3[\"Practical Real-World Application\"]\n"
                "  Concept1 --> Eval[\"Verified Knowledge\"]\n"
                "  Concept2 --> Eval\n"
                "  Concept3 --> Eval\n"
                "  classDef gen fill:#FAF5FF,stroke:#9333EA,stroke-width:2px;\n"
                "  class Core,Concept1,Concept2,Concept3,Eval gen;"
            )
            table = [
                {"aspect": "Foundational Rule", "details": f"Every major principle in {topic} builds upon earlier simple steps."},
                {"aspect": "Transformation", "details": "Converts simple inputs into dependable outputs."},
                {"aspect": "Verification", "details": "Confirmed through step-by-step checks and practice questions."},
            ]
            formula = r"\text{Understanding} = \text{Analogy} + \text{Practice} + \text{Spaced Review}"
            title = f"Conceptual Knowledge Map: {topic}"

        return {
            "topic": topic,
            "title": title,
            "mermaid": mermaid_code,
            "comparisonTable": table,
            "latexFormula": formula,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }


# ---------------------------------------------------------------------------
# 5. FLASHCARD GENERATOR WORKSPACE
# ---------------------------------------------------------------------------
class FlashcardGenerator:
    """Generates structured flip-cards from lessons and tracks active recall."""

    def generate_cards(self, topic: str, content: str = "") -> dict:
        t_lower = topic.lower()
        cards = []

        if "computer" in t_lower or "hardware" in t_lower or "cpu" in t_lower:
            cards = [
                {
                    "id": "fc-cpu-1",
                    "front": "What is the primary role of the Central Processing Unit (CPU)?",
                    "back": "The CPU is the 'computer brain' that executes arithmetic, logic, and control instructions fetched from memory.",
                    "hint": "Think of the master chef reading recipes.",
                    "difficulty": "easy",
                    "category": "Hardware Core",
                },
                {
                    "id": "fc-cpu-2",
                    "front": "Why is RAM called 'volatile' memory?",
                    "back": "Because RAM resets and loses all its stored data as soon as the computer is turned off. Permanent files stay safe on the SSD.",
                    "hint": "Think of what happens to a kitchen countertop when you clean it at the end of the day.",
                    "difficulty": "medium",
                    "category": "Memory Systems",
                },
                {
                    "id": "fc-cpu-3",
                    "front": "What is the purpose of L1 and L2 CPU Cache?",
                    "back": "Cache provides ultra-fast temporary storage right on the CPU chip to prevent the processor from waiting for slower RAM memory.",
                    "hint": "Think of spices placed right next to the chef's hand.",
                    "difficulty": "hard",
                    "category": "Pipelines & Caches",
                },
            ]
        elif "fraction" in t_lower or "math" in t_lower:
            cards = [
                {
                    "id": "fc-math-1",
                    "front": "What does the DENOMINATOR (bottom number) represent in a fraction?",
                    "back": "The denominator tells you the TOTAL NUMBER of equal parts or slices the whole unit has been divided into.",
                    "hint": "D is for Down = Denominator.",
                    "difficulty": "easy",
                    "category": "Fractions",
                },
                {
                    "id": "fc-math-2",
                    "front": "If the denominator number increases (e.g. 1/2 to 1/8), does each slice get bigger or smaller?",
                    "back": "Each slice gets SMALLER! Dividing a pizza among 8 people means much smaller slices than dividing it among 2 people.",
                    "hint": "More people sharing one pizza = smaller piece per person.",
                    "difficulty": "medium",
                    "category": "Fractions",
                },
                {
                    "id": "fc-math-3",
                    "front": "Why must you find a Common Denominator before adding two fractions?",
                    "back": "Because you can only add pieces that are the exact same size! Aligning the denominator ensures fair slice comparisons.",
                    "hint": "You cannot add large pizza slices to tiny pizza bites without cutting them equally first.",
                    "difficulty": "hard",
                    "category": "Operations",
                },
            ]
        elif "photo" in t_lower or "plant" in t_lower:
            cards = [
                {
                    "id": "fc-bio-1",
                    "front": "What are the three main INPUTS required for photosynthesis?",
                    "back": "Sunlight (energy), Water (H2O from roots), and Carbon Dioxide (CO2 from air).",
                    "hint": "Sun, Rain, and Air.",
                    "difficulty": "easy",
                    "category": "Plant Biology",
                },
                {
                    "id": "fc-bio-2",
                    "front": "What are the two primary OUTPUTS produced by photosynthesis?",
                    "back": "Glucose sugar (chemical food for plant growth) and Oxygen (O2 released into the air).",
                    "hint": "Sweet fuel for the plant, fresh air for humans.",
                    "difficulty": "medium",
                    "category": "Plant Biology",
                },
                {
                    "id": "fc-bio-3",
                    "front": "In which plant cell organelle does photosynthesis take place?",
                    "back": "Inside Chloroplasts, which contain the green pigment chlorophyll that captures light photons.",
                    "hint": "The green solar panels of the leaf.",
                    "difficulty": "medium",
                    "category": "Cell Biology",
                },
            ]
        else:
            cards = [
                {
                    "id": f"fc-{topic[:4]}-1",
                    "front": f"What is the core definition of {topic}?",
                    "back": f"{topic} is a structured educational system that converts fundamental inputs into verified results.",
                    "hint": "Think of the foundational rule.",
                    "difficulty": "easy",
                    "category": "Core Concept",
                },
                {
                    "id": f"fc-{topic[:4]}-2",
                    "front": f"How does {topic} connect to practical everyday life?",
                    "back": "It automates repetitive labor and gives humans reliable tools to solve complex challenges.",
                    "hint": "Think of everyday tools.",
                    "difficulty": "medium",
                    "category": "Applications",
                },
            ]

        return {
            "topic": topic,
            "totalCards": len(cards),
            "cards": cards,
            "masteryGoal": "Review hard cards every 24 hours until marked easy.",
        }


# ---------------------------------------------------------------------------
# 6. ONE LESSON – 10 MULTIMODAL LEARNING FORMATS
# ---------------------------------------------------------------------------
class TenFormatTransformer:
    """Transforms a single educational lesson into 10 distinct accessible formats."""

    def transform_all_10(self, topic: str, original_text: str = "") -> dict:
        text = original_text.strip() if original_text else f"Comprehensive lesson overview for {topic}."

        visual_gen = VisualExplanationGenerator()
        diagram_data = visual_gen.generate_diagram(topic)

        flash_gen = FlashcardGenerator()
        flashcards_data = flash_gen.generate_cards(topic)

        # 1. Simple English
        simple = (
            f"Here is {topic} explained in simple, friendly English:\n\n"
            "Imagine everyday teamwork where each helper has one clear job. "
            "Nothing is rushed, and complicated words are replaced with things you already touch and know. "
            f"At its core: {text[:220]}."
        )

        # 2. Detailed Explanation
        detailed = (
            f"### Advanced Academic Synthesis: {topic}\n\n"
            f"{text}\n\n"
            "**Systemic Analysis & Principles:**\n"
            "Modern scientific frameworks analyze this topic across three coupled dimensions: "
            "input calibration, operational transformation, and verified state preservation. "
            "Through deterministic feedback loops, systemic stability is maintained over repeated execution cycles."
        )

        # 3. Audio Narration Script (with phonetic breaks and spoken pacing cues)
        audio_script = (
            f"[Calm pacing] Welcome to your audio lesson on {topic}. "
            "[Pause 1s] Take a relaxed breath. "
            f"Today we are exploring how {topic} works in the real world. "
            "[Pause 1s] "
            f"{text[:180]}. "
            "[Pause 2s] "
            "Remember: great learners build mastery one thought at a time."
        )

        # 4. Visual Explanation
        visual = {
            "title": diagram_data["title"],
            "mermaid": diagram_data["mermaid"],
            "comparisonTable": diagram_data["comparisonTable"],
            "formula": diagram_data["latexFormula"],
        }

        # 5. Step-by-Step Breakdown
        step_by_step = [
            {"step": 1, "title": "Initial Input & Arrival", "description": f"Raw information or energy enters the {topic} environment."},
            {"step": 2, "title": "Active Transformation", "description": "The central processing core executes logic operations or chemical synthesis."},
            {"step": 3, "title": "Temporary Buffering", "description": "Active state resides safely in ultra-fast working memory."},
            {"step": 4, "title": "Long-Term Archival & Output", "description": "The completed result is saved to persistent storage and delivered clearly."},
        ]

        # 6. Key-Point Summary
        key_points = [
            f"Foundational Rule: {topic} transforms simple inputs into structured outcomes.",
            "Memory Hierarchy: Working state resets when turned off, but permanent files remain safe.",
            "Efficiency Principle: Repetition loops and pipelines automate repetitive chores.",
            "Verification Check: Always double-check core parameters to ensure accuracy.",
        ]

        # 7. Flashcards
        cards = flashcards_data["cards"]

        # 8. Interactive Quiz
        quiz = [
            {
                "id": f"q-{topic[:4]}-1",
                "question": f"What is the primary function of {topic}?",
                "options": [
                    "To execute operations and transform inputs into reliable results",
                    "To collect dust on a bookshelf",
                    "To turn everything into plastic",
                    "To erase all files permanently"
                ],
                "correctAnswer": 0,
                "hint": "Think of the primary rule of this lesson.",
                "explanation": f"{topic} is built specifically to process inputs and yield dependable results.",
            },
            {
                "id": f"q-{topic[:4]}-2",
                "question": "Why is working memory separated from permanent storage?",
                "options": [
                    "Working memory offers ultra-fast speed for active tasks, while permanent storage preserves files forever",
                    "There is no difference between them",
                    "Working memory is made of glass",
                    "Permanent storage only lasts 5 minutes"
                ],
                "correctAnswer": 0,
                "hint": "Think of the kitchen countertop versus the pantry.",
                "explanation": "Separating fast working state from permanent archives optimizes both speed and data safety.",
            },
        ]

        # 9. Real-World Examples
        real_world = [
            {"analogy": "The Kitchen Countertop 👨‍🍳", "story": "Active tools sit on your counter; supplies for next year stay in the pantry."},
            {"analogy": "The Daily Routine 🪥", "story": "Repeating an action 10 times until clean is the exact same logic computers use in loops."},
        ]

        # 10. High-Yield Revision Notes & Mnemonics
        revision_notes = {
            "mnemonic": "F-A-S-T: Foundation, Action, Storage, Transfer",
            "oneLiner": f"{topic} is a reliable transformation engine from inputs to outputs.",
            "highYieldBulletPoints": [
                "Always look for the primary inputs before diagnosing the output.",
                "Keep temporary scratchpads separate from permanent records.",
                "Use analogies whenever abstract jargon feels heavy.",
            ],
            "nextReviewDays": 3,
        }

        return {
            "topic": topic,
            "totalFormats": 10,
            "formats": {
                "simpleEnglish": simple,
                "detailedExplanation": detailed,
                "audioNarration": audio_script,
                "visualExplanation": visual,
                "stepByStep": step_by_step,
                "keyPointSummary": key_points,
                "flashcards": cards,
                "interactiveQuiz": quiz,
                "realWorldExamples": real_world,
                "revisionNotes": revision_notes,
            },
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }


# ---------------------------------------------------------------------------
# 7. MULTI-TURN CONVERSATIONAL TUTOR ENGINE
# ---------------------------------------------------------------------------
class ConversationalTutorEngine:
    """Multi-turn tutor with context awareness, teaching personalities, and Socratic hints."""

    def __init__(self):
        self.doc_solver = DocumentDoubtSolver()
        self.visual_gen = VisualExplanationGenerator()
        self.flash_gen = FlashcardGenerator()
        self.transformer = TenFormatTransformer()

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        lesson_context: Dict[str, Any] = None,
        student_profile: Dict[str, Any] = None,
        teaching_mode: str = "simple",
    ) -> Dict[str, Any]:
        """Generates dynamic pedagogical response matching the student profile and personality."""
        lesson_context = lesson_context or {}
        student_profile = student_profile or {}
        mode = teaching_mode if teaching_mode in TEACHING_PERSONALITIES else "simple"
        personality = TEACHING_PERSONALITIES[mode]

        # Extract last user query
        user_query = ""
        for m in reversed(messages):
            if m.get("role") == "user" or m.get("sender") == "user":
                user_query = m.get("content") or m.get("text") or ""
                break

        if not user_query:
            user_query = "Can you help me understand this lesson?"

        lesson_title = lesson_context.get("title", "General Curriculum")
        lesson_subject = lesson_context.get("subject", "Science & Technology")
        student_name = student_profile.get("name", "Student")
        preferred_format = student_profile.get("preferredFormat", "simplified")

        q_lower = user_query.lower()

        # Check for Socratic Hint request
        if any(w in q_lower for w in ["hint", "give me a hint", "stuck on this question", "clue"]):
            hints = SocraticHintEngine.generate_hints(user_query, lesson_subject, lesson_title)
            reply = (
                f"### 💡 Socratic Hint ({personality['name']})\n\n"
                f"{hints['tier1_clue']}\n\n"
                f"**{hints['tier2_guiding_question']}**\n\n"
                f"> 🧩 *Try working through this clue first. Reply with your thought, and I will confirm if you are on the right track!*"
            )
            suggested = ["Give me the next hint", "I think the answer is...", "Explain the clue simply"]

        # Check for Simplified request
        elif any(w in q_lower for w in ["simply", "simple", "easier", "plain english", "explain simply"]):
            reply = (
                f"### 🌱 Simple English Explanation\n\n"
                f"Hello {student_name}! Let's make **{lesson_title}** super clear and friendly.\n\n"
                f"Imagine you are running a friendly weekend bakery with your family. "
                "Instead of worrying about complicated textbooks: **every single helper has one clear job.** "
                "One person reads the recipe ticket, one person measures the flour on the counter, "
                "and ingredients are kept safely in the pantry.\n\n"
                "**The Big Idea:** Big concepts are just simple daily helpers snapping together like LEGO bricks!"
            )
            suggested = ["Give me an everyday example", "Break it into 3 steps", "Test my understanding"]

        # Check for Example request
        elif any(w in q_lower for w in ["example", "real world", "real-world", "analogy"]):
            reply = (
                f"### 🍕 Real-World Everyday Application\n\n"
                f"Here is a concrete real-world scenario for **{lesson_title}**:\n\n"
                f"**The Smart Grocery Shopper Analogy:**\n"
                "When you go to the store with a shopping list:\n"
                "1. **Your Eyes & Brain (CPU):** Reads each line on the paper.\n"
                "2. **Your Hand Basket (RAM):** Holds the 3 items you are actively buying right now.\n"
                "3. **Your Home Cupboard (Storage):** Keeps 20 boxes of cereal safe for next month.\n\n"
                "You would never try to carry all 20 boxes in your hands while walking the aisles! "
                "That is why systems use ultra-fast working memory."
            )
            suggested = ["Explain step by step", "Why is RAM volatile?", "Test my understanding"]

        # Check for Step-by-Step request
        elif any(w in q_lower for w in ["step by step", "step-by-step", "break down", "steps"]):
            reply = (
                f"### 🪜 Step-by-Step Breakdown ({personality['name']})\n\n"
                f"Let's walk through **{lesson_title}** in 4 calm, sequential steps:\n\n"
                f"1. **Step 1: The Input:** A signal, question, or ingredient enters the system.\n"
                f"2. **Step 2: Processing:** The central engine evaluates the instructions using arithmetic and logic.\n"
                f"3. **Step 3: Temporary Scratchpad:** Intermediate numbers sit on the countertop (RAM) so nothing is lost.\n"
                f"4. **Step 4: Delivery:** The final outcome is safely displayed or saved permanently.\n\n"
                f"✨ **Check-In:** Does Step 2 make sense before we move forward?"
            )
            suggested = ["Yes, continue!", "Explain Step 2 again", "Give me a practice problem"]

        # Check for Summary request
        elif any(w in q_lower for w in ["summarize", "summary", "key points", "overview"]):
            reply = (
                f"### 🧠 High-Yield Summary: {lesson_title}\n\n"
                f"Here are the **3 golden rules** to remember for your revision:\n\n"
                f"• **Rule 1:** Structure over memory: Every big system breaks into Input $\\rightarrow$ Process $\\rightarrow$ Output.\n"
                f"• **Rule 2:** Active work is fast and temporary; storage is permanent and safe.\n"
                f"• **Rule 3:** Repetition loops automate chores so humans can focus on creative problem solving.\n\n"
                f"🎯 **Spaced Repetition Tip:** Review these 3 points in 24 hours to lock them into long-term recall."
            )
            suggested = ["Test my understanding", "Create flashcards", "Explain this simply"]

        # Check for Quiz / Practice request
        elif any(w in q_lower for w in ["quiz", "test me", "practice", "questions", "check understanding"]):
            reply = (
                f"### 🎯 Practice Challenge ({personality['name']})\n\n"
                f"Here is a quick check question for **{lesson_title}**:\n\n"
                f"**Question:** Why does a computer keep an active program in RAM instead of reading directly from the hard drive every millisecond?\n\n"
                f"A) RAM is made of shiny gold\n"
                f"B) RAM delivers instructions thousands of times faster with nanosecond speed\n"
                f"C) Hard drives only work on weekends\n"
                f"D) There is no speed difference\n\n"
                f"👉 *Reply with your chosen letter (A, B, C, or D) and I will give you immediate feedback!*"
            )
            suggested = ["I pick B", "I need a hint first", "Explain RAM speed"]

        # Personality-Specific Responses
        elif mode == "visual":
            diag = self.visual_gen.generate_diagram(lesson_title)
            reply = (
                f"### 🎨 Visual Concept Map: {lesson_title}\n\n"
                f"```mermaid\n{diag['mermaid']}\n```\n\n"
                f"**Spatial Understanding:**\n"
                f"Notice how the visual flow travels directly from the inputs on the left into the processing hub, "
                f"then routes outcomes into permanent memory and display outputs.\n\n"
                f"📊 **Formula Anchor:** `{diag['latexFormula']}`"
            )
            suggested = ["Show comparison table", "Explain step by step", "Give me an example"]

        elif mode == "practice":
            reply = (
                f"### 🎯 Practice Coach Mode\n\n"
                f"Welcome, {student_name}! In Practice Coach mode, we build mastery by doing.\n\n"
                f"Let's tackle **{lesson_title}**. Before I explain anything, think about this:\n"
                f"*If you were building this system from scratch, what is the very first component you would turn on?*\n\n"
                f"Take a guess or ask for a hint!"
            )
            suggested = ["Give me a hint", "Explain the concept first", "Quiz me on this"]

        elif mode == "revision":
            reply = (
                f"### 🧠 Revision Mentor Mode\n\n"
                f"**High-Yield Recall Pegs for {lesson_title}:**\n\n"
                f"• **Mnemonic:** Remember **F-A-S-T** (Foundation, Action, Storage, Transfer).\n"
                f"• **Core Equation:** `Outcome = Input + Process`.\n"
                f"• **Common Trap:** Don't confuse temporary working RAM with permanent hard disk storage!\n\n"
                f"Would you like me to generate 3 flashcards or test your recall?"
            )
            suggested = ["Generate flashcards", "Test my recall", "Summarize this topic"]

        elif mode == "step_by_step":
            reply = (
                f"### 🪜 Step-by-Step Mode\n\n"
                f"Let's examine **{lesson_title}** chronologically:\n\n"
                f"**Phase 1: Reception.** Raw parameters enter the system.\n"
                f"**Phase 2: Execution.** Active cycles transform the state.\n"
                f"**Phase 3: Verification.** Output signals are checked for correctness.\n\n"
                f"Reply with **'Next'** to drill into Phase 1!"
            )
            suggested = ["Next", "Explain Phase 1", "Give me an analogy"]

        else: # Simple Teacher default
            reply = (
                f"### 🌱 Simple Teacher Mode\n\n"
                f"Hello {student_name}! I am happy to help you with **{lesson_title}**.\n\n"
                f"Here is what you need to know in plain English: {lesson_context.get('summary', 'Everything works like a dependable team.')}\n\n"
                f"What part would you like to explore together?"
            )
            suggested = ["Explain this simply", "Give me an example", "Explain step by step", "Test my understanding"]

        return {
            "reply": reply,
            "teachingMode": mode,
            "personality": personality,
            "suggestedFollowUps": suggested,
            "lessonContext": lesson_context,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


tutor_engine = ConversationalTutorEngine()
