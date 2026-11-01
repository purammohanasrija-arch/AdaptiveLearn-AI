import os
import sys
import unittest
import asyncio

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from routes.tutor_routes import (
    chat_with_ai_tutor,
    explain_concept,
    summarize_topic,
    transform_lesson_ten_formats,
    generate_lesson_flashcards,
    generate_visual_explanation,
    process_voice_interaction,
    upload_document_or_ask,
)

class TestPhase4ApiEndpoints(unittest.TestCase):

    def test_01_api_tutor_chat_all_modes(self):
        """Verify chat_with_ai_tutor works across all 5 teaching modes."""
        for mode in ["simple", "visual", "step_by_step", "practice", "revision"]:
            res = chat_with_ai_tutor({
                "messages": [{"role": "user", "content": "How does computer memory work?"}],
                "lessonContext": {"title": "CPU & Memory", "subject": "Computer Science"},
                "teachingMode": mode
            })
            self.assertEqual(res["teachingMode"], mode)
            self.assertIn("reply", res)
            self.assertGreater(len(res.get("suggestedFollowUps", [])), 0)

    def test_02_api_tutor_explain_modes(self):
        """Verify explain_concept for simple, analogy, detailed, step_by_step, and hints."""
        # 1. Analogy
        res_analogy = explain_concept({
            "topic": "Computer Architecture",
            "concept": "CPU vs RAM vs Storage",
            "mode": "analogy"
        })
        self.assertIn("kitchen", res_analogy["analogyStory"].lower())

        # 2. Socratic Hints
        res_hints = explain_concept({
            "topic": "Math Fractions",
            "concept": "Why find common denominator?",
            "mode": "hints"
        })
        self.assertIn("hints", res_hints)
        self.assertIn("tier1_clue", res_hints["hints"])

        # 3. Step-by-Step
        res_steps = explain_concept({
            "topic": "Photosynthesis",
            "mode": "step_by_step"
        })
        self.assertEqual(len(res_steps["steps"]), 4)

        # 4. Detailed
        res_detailed = explain_concept({
            "topic": "Microprocessors",
            "mode": "detailed"
        })
        self.assertIn("deepDive", res_detailed)

    def test_03_api_tutor_summarize(self):
        """Verify summarize_topic returns mnemonic and key points."""
        res = summarize_topic({
            "topic": "Photosynthesis and Solar Capture",
            "text": "Plants use light, water, and carbon dioxide to produce glucose and oxygen."
        })
        self.assertIn("keyPoints", res)
        self.assertIn("mnemonic", res)
        self.assertIn("oneLineTakeaway", res)

    def test_04_api_tutor_transform_ten_formats(self):
        """Verify transform_lesson_ten_formats outputs all 10 distinct formats."""
        res = transform_lesson_ten_formats({
            "topic": "Computer Hardware Architecture",
            "text": "The central processing unit executes instructions fetched from volatile RAM memory."
        })
        self.assertEqual(res["totalFormats"], 10)
        formats = res["formats"]
        expected = [
            "simpleEnglish", "detailedExplanation", "audioNarration",
            "visualExplanation", "stepByStep", "keyPointSummary",
            "flashcards", "interactiveQuiz", "realWorldExamples", "revisionNotes"
        ]
        for key in expected:
            self.assertIn(key, formats)

    def test_05_api_tutor_flashcards(self):
        """Verify generate_lesson_flashcards returns structured cards with difficulty."""
        res = generate_lesson_flashcards({
            "topic": "Fractions and Ratios",
            "content": "A fraction represents equal pieces of a whole."
        })
        self.assertIn("cards", res)
        self.assertGreaterEqual(len(res["cards"]), 2)
        self.assertIn("difficulty", res["cards"][0])

    def test_06_api_tutor_visualize(self):
        """Verify generate_visual_explanation outputs Mermaid code, table, and formula."""
        res = generate_visual_explanation({
            "topic": "Photosynthesis",
            "concept": "Solar energy conversion"
        })
        self.assertIn("mermaid", res)
        self.assertIn("graph", res["mermaid"])
        self.assertIn("comparisonTable", res)
        self.assertIn("latexFormula", res)

    def test_07_api_tutor_voice(self):
        """Verify process_voice_interaction classifies commands and returns speech payload."""
        res = process_voice_interaction({
            "transcript": "Please explain simply to me",
            "topic": "Algorithm Loops",
            "speakingRate": 0.85
        })
        self.assertEqual(res["action"], "simplify")
        self.assertIn("spokenResponse", res)
        self.assertEqual(res["speakingRate"], 0.85)

    def test_08_api_tutor_document_upload(self):
        """Verify upload_document_or_ask parses notes and provides grounded answers."""
        sample_text = (
            "Photosynthesis is a vital biological process. "
            "Light dependent reactions take place in the thylakoid membranes of chloroplasts, "
            "splitting water to produce ATP, NADPH, and oxygen gas as a byproduct."
        )
        res = upload_document_or_ask(
            file=None,
            rawText=sample_text,
            question="Where do light dependent reactions take place?",
            teachingMode="simple"
        )
        self.assertTrue(res["success"])
        self.assertGreater(res["wordCount"], 0)
        self.assertIn("thylakoid membranes", res["queryResult"]["answer"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
