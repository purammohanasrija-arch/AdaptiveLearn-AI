import os
import sys
import unittest
import io
from datetime import datetime, timezone

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

# Add backend directory to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from tutor_engine import (
    tutor_engine,
    TEACHING_PERSONALITIES,
    SocraticHintEngine,
    DocumentDoubtSolver,
    VisualExplanationGenerator,
    FlashcardGenerator,
    TenFormatTransformer,
)

class TestTutorEnginePhase4(unittest.TestCase):

    def test_01_scenario_a_difficult_question_simplified(self):
        """Scenario A: A student asks a difficult question and receives a simplified plain-English explanation."""
        messages = [
            {"role": "user", "content": "Can you explain how the CPU executes machine instructions simply?"}
        ]
        context = {
            "title": "CPU & Hardware Architecture",
            "subject": "Computer Science",
            "summary": "The CPU is the central processing unit of a computer."
        }
        profile = {
            "name": "Aarav Patel",
            "preferredFormat": "simplified"
        }

        resp = tutor_engine.generate_chat_response(
            messages=messages,
            lesson_context=context,
            student_profile=profile,
            teaching_mode="simple"
        )

        self.assertIn("reply", resp)
        self.assertIn("bakery", resp["reply"].lower())
        self.assertIn("LEGO", resp["reply"])
        self.assertEqual(resp["teachingMode"], "simple")
        self.assertGreater(len(resp["suggestedFollowUps"]), 0)

    def test_02_scenario_b_voice_interaction(self):
        """Scenario B: Student interacts via voice command and receives phonetic TTS response."""
        from routes.tutor_routes import process_voice_interaction

        # Test "read lesson aloud" voice command
        voice_req = {
            "transcript": "Please read lesson aloud to me",
            "topic": "Photosynthesis",
            "speakingRate": 0.85
        }
        voice_res = process_voice_interaction(voice_req)

        self.assertEqual(voice_res["action"], "read_lesson")
        self.assertEqual(voice_res["commandIntent"], "trigger_audio_narration")
        self.assertIn("Photosynthesis", voice_res["spokenResponse"])
        self.assertEqual(voice_res["speakingRate"], 0.85)

        # Test "make it simpler" voice command
        voice_req2 = {
            "transcript": "Can you make it simpler?",
            "topic": "Computer Architecture",
            "speakingRate": 1.0
        }
        voice_res2 = process_voice_interaction(voice_req2)
        self.assertEqual(voice_res2["action"], "simplify")

    def test_03_scenario_c_pdf_document_doubt_solver(self):
        """Scenario C: Student uploads notes and asks grounded questions."""
        solver = DocumentDoubtSolver()

        sample_notes = (
            "Chapter 4: Microprocessor Pipelining and Cache Memory.\n\n"
            "The instruction execution cycle consists of four distinct phases: Fetch, Decode, Execute, and Writeback. "
            "To maximize speed, modern processors utilize on-die L1 and L2 cache memory. "
            "Cache memory reduces the average memory access time by storing copies of data from frequently used main memory locations.\n\n"
            "Chapter 5: Arithmetic Logic Units.\n\n"
            "The ALU performs fundamental integer addition, subtraction, and boolean operations."
        )

        # Ask question grounded in notes
        query = "What are the four phases of the instruction cycle?"
        res = solver.answer_document_query(query, sample_notes, teaching_mode="step_by_step")

        self.assertIn("answer", res)
        self.assertIn("Fetch, Decode, Execute", res["answer"])
        self.assertGreater(len(res["matchedParagraphs"]), 0)
        self.assertGreater(res["confidence"], 0.8)

    def test_04_scenario_d_ten_learning_formats_transformation(self):
        """Scenario D: Student converts one lesson into 10 distinct learning formats."""
        transformer = TenFormatTransformer()
        topic = "Photosynthesis & Solar Capture"
        text = "Plants use sunlight, water from soil, and carbon dioxide to synthesize glucose and release oxygen."

        res = transformer.transform_all_10(topic, text)

        self.assertEqual(res["totalFormats"], 10)
        formats = res["formats"]

        expected_keys = [
            "simpleEnglish",
            "detailedExplanation",
            "audioNarration",
            "visualExplanation",
            "stepByStep",
            "keyPointSummary",
            "flashcards",
            "interactiveQuiz",
            "realWorldExamples",
            "revisionNotes",
        ]
        for key in expected_keys:
            self.assertIn(key, formats, f"Missing format: {key}")

        # Verify qualitative multimodal properties
        self.assertIn("Pause", formats["audioNarration"])
        self.assertIn("graph", formats["visualExplanation"]["mermaid"])
        self.assertGreaterEqual(len(formats["flashcards"]), 2)
        self.assertGreaterEqual(len(formats["interactiveQuiz"]), 2)
        self.assertIn("mnemonic", formats["revisionNotes"])

    def test_05_scenario_e_flashcard_generator(self):
        """Scenario E: Student generates flashcards with active recall and difficulty rating."""
        gen = FlashcardGenerator()
        res = gen.generate_cards("Fractions and Division")

        self.assertIn("cards", res)
        self.assertGreaterEqual(len(res["cards"]), 2)

        card1 = res["cards"][0]
        self.assertIn("front", card1)
        self.assertIn("back", card1)
        self.assertIn("hint", card1)
        self.assertIn("difficulty", card1)
        self.assertIn(card1["difficulty"], ["easy", "medium", "hard"])

    def test_06_scenario_f_simple_teacher_vs_visual_teacher(self):
        """Scenario F: Switching from Simple Teacher to Visual Teacher genuinely changes teaching approach."""
        messages = [{"role": "user", "content": "How do plants convert sunlight?"}]
        context = {"title": "Photosynthesis", "subject": "Biology"}

        # 1. Simple Teacher response
        res_simple = tutor_engine.generate_chat_response(
            messages=messages,
            lesson_context=context,
            teaching_mode="simple"
        )

        # 2. Visual Teacher response
        res_visual = tutor_engine.generate_chat_response(
            messages=messages,
            lesson_context=context,
            teaching_mode="visual"
        )

        # Visual mode must provide Mermaid diagram markup
        self.assertIn("```mermaid", res_visual["reply"])
        self.assertIn("graph", res_visual["reply"])
        self.assertEqual(res_visual["teachingMode"], "visual")

        # Simple mode must emphasize plain words and analogies
        self.assertNotIn("```mermaid", res_simple["reply"])
        self.assertEqual(res_simple["teachingMode"], "simple")
        self.assertNotEqual(res_simple["reply"], res_visual["reply"])

    def test_07_socratic_hints_avoid_giving_direct_answers(self):
        """Verify Socratic Hints provide guidance without revealing final answers immediately."""
        hints = SocraticHintEngine.generate_hints("Why is RAM volatile?", "Computer Architecture")

        self.assertIn("tier1_clue", hints)
        self.assertIn("tier2_guiding_question", hints)
        self.assertIn("tier3_outline", hints)
        self.assertFalse(hints["solution_revealed"])
        self.assertIn("kitchen countertop", hints["tier1_clue"].lower())

if __name__ == "__main__":
    unittest.main(verbosity=2)

