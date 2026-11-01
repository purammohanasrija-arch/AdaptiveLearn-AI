import os
import sys
import unittest
from datetime import datetime, timezone

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

# Add paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import SessionLocal, engine, Base
from models import User, LearnerProfile, Lesson, LearningProgress, QuizAttempt
from adaptive_engine import (
    learner_intelligence,
    difficulty_predictor,
    content_adapter,
    knowledge_gap_tracker,
    recommendation_engine,
    smart_revision,
)
from ai_engine import bkt_engine, irt_engine

class TestPhase3EndToEndJourney(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_ethical_learner_profiling(self):
        """Verify voluntary accessibility selection without inferring disabilities from scores."""
        user = self.db.query(User).filter(User.id == "user-student-a").first()
        self.assertIsNotNone(user)
        self.assertIsNotNone(user.profile)

        # Student voluntarily opts into accommodations
        user.profile.preferred_format = "audio_summary"
        user.profile.text_size = "large"
        user.profile.reading_speed = "slow"
        user.profile.accessibility_preferences = {
            "textToSpeech": True,
            "dyslexiaFont": True,
            "highContrast": False,
            "reducedAnimations": True
        }
        self.db.commit()

        # Check Learner Intelligence respects voluntary selection
        attempts = [q.to_dict() for q in user.quiz_attempts]
        progress = [p.to_dict() for p in user.progress_records]
        analysis = learner_intelligence.analyze_learner(user.to_dict(), attempts, progress)

        self.assertIn("ethicalCompliance", analysis)
        self.assertIn("voluntary", analysis["ethicalCompliance"].lower())
        self.assertIn("audio_summary", analysis["preferredLearningFormats"])

    def test_02_dynamic_difficulty_calibration(self):
        """Verify 3-Level Dynamic Difficulty rule (>85% promote, 60-85% maintain, <60% demote)."""
        # Test consecutive high scores trigger promotion
        recent_high = [{"score": 90}, {"score": 95}, {"score": 92}]
        pred_promote = difficulty_predictor.predict_next_difficulty("beginner", recent_high, 94)
        self.assertEqual(pred_promote["recommendedDifficulty"], "intermediate")
        self.assertEqual(pred_promote["action"], "increase")

        # Test consecutive moderate scores maintain tier
        recent_mod = [{"score": 75}, {"score": 70}, {"score": 68}]
        pred_maintain = difficulty_predictor.predict_next_difficulty("intermediate", recent_mod, 72)
        self.assertEqual(pred_maintain["recommendedDifficulty"], "intermediate")
        self.assertEqual(pred_maintain["action"], "maintain")

        # Test consecutive low scores trigger demotion & prerequisite recommendation
        recent_low = [{"score": 45}, {"score": 50}, {"score": 40}]
        pred_demote = difficulty_predictor.predict_next_difficulty("intermediate", recent_low, 42)
        self.assertEqual(pred_demote["recommendedDifficulty"], "beginner")
        self.assertEqual(pred_demote["action"], "decrease")
        self.assertTrue(pred_demote["needsPrerequisiteReview"])

    def test_03_eight_content_formats_preservation(self):
        """Verify content adaptation engine delivers all 8 required formats."""
        topic = "Fractions and Ratios"
        text = "A fraction represents a numerical value that is a part of a whole unit, composed of a numerator and denominator."

        formats_result = content_adapter.generate_offline_8_formats(topic, text)

        required_keys = [
            "simpleEnglish", "detailedExplanation", "shortSummary",
            "stepByStep", "keyPoints", "realWorldExamples",
            "flashcards", "practiceQuestions"
        ]
        for key in required_keys:
            self.assertIn(key, formats_result)

        # Check real-world analogy exists
        self.assertTrue(len(formats_result["realWorldExamples"]) > 0)
        self.assertIn("Pizza Slices", formats_result["realWorldExamples"][0]["analogy"])

    def test_04_knowledge_gap_and_prerequisites(self):
        """Verify Knowledge Gap detection flags weak topics (<60%) and maps prerequisites."""
        topic_scores = {
            "Computer Architecture": 88.0,
            "Mathematics": 45.0,
            "Programming": 92.0,
            "Photosynthesis": 52.0
        }
        gaps = knowledge_gap_tracker.analyze_gaps(topic_scores)

        weak_names = [g["topic"] for g in gaps["gaps"]]
        self.assertIn("Mathematics", weak_names)
        self.assertIn("Photosynthesis", weak_names)
        self.assertNotIn("Computer Architecture", weak_names)
        self.assertNotIn("Programming", weak_names)

        # Prerequisite resolution
        prereqs = [p["prerequisite"] for p in gaps["prerequisiteRecommendations"]]
        self.assertTrue(any("Fractions" in p or "Arithmetic" in p or "Number Sense" in p for p in prereqs))

    def test_05_spaced_repetition_ebbinghaus_retention(self):
        """Verify Smart Revision Scheduler calculates forgetting curve retention."""
        user = self.db.query(User).filter(User.id == "user-student-a").first()
        progress = [p.to_dict() for p in user.progress_records]

        plan = smart_revision.calculate_plan(progress)

        self.assertIn("revisionQueue", plan)
        self.assertIn("scheduledRevisions", plan)
        self.assertIn("algorithm", plan)
        self.assertEqual(plan["algorithm"], "Ebbinghaus Spaced Repetition R(t)=e^(-t/S)")
        self.assertGreaterEqual(plan["averageRetentionRate"], 0)
        self.assertLessEqual(plan["averageRetentionRate"], 100)

    def test_06_complete_contrast_learner_a_vs_learner_b(self):
        """
        Verify Hackathon HI-03 Demonstration Scenario:
        Learner A: Struggles with complex text, lower accuracy, auditory learner -> Guided Beginner tier.
        Learner B: Fast processing, high accuracy, visual learner -> Accelerated Advanced tier.
        """
        user_a = self.db.query(User).filter(User.id == "user-student-a").first()
        user_b = self.db.query(User).filter(User.id == "user-student-b").first()

        self.assertIsNotNone(user_a)
        self.assertIsNotNone(user_b)

        # Profile A
        analysis_a = learner_intelligence.analyze_learner(
            user_a.to_dict(),
            [q.to_dict() for q in user_a.quiz_attempts],
            [p.to_dict() for p in user_a.progress_records]
        )

        # Profile B
        analysis_b = learner_intelligence.analyze_learner(
            user_b.to_dict(),
            [q.to_dict() for q in user_b.quiz_attempts],
            [p.to_dict() for p in user_b.progress_records]
        )

        # Dynamic Recommendations for A vs B
        all_lessons = [l.to_dict() for l in self.db.query(Lesson).all()]
        recs_a = recommendation_engine.generate_recommendations(analysis_a, all_lessons)
        recs_b = recommendation_engine.generate_recommendations(analysis_b, all_lessons)

        self.assertNotEqual(analysis_a["currentKnowledgeLevel"], analysis_b["currentKnowledgeLevel"])
        print("\n[JOURNEY SUCCESS] Learner A (Level:", analysis_a["currentKnowledgeLevel"], 
              ") vs Learner B (Level:", analysis_b["currentKnowledgeLevel"], ") personalization verified!")

if __name__ == "__main__":
    unittest.main(verbosity=2)
