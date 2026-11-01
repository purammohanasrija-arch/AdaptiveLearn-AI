import sys
import os
import unittest
import numpy as np

# Set UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend directory to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from adaptive_engine import (
    learner_intelligence,
    difficulty_predictor,
    content_adapter,
    knowledge_gap_tracker,
    recommendation_engine,
    smart_revision,
)

class TestAdaptiveLearningEngine(unittest.TestCase):

    def test_01_learner_intelligence_slope_and_pace(self):
        """Verify Learner Intelligence Engine computes linear regression slope, pacing, and mastery."""
        # Simulated student with improving performance
        user_dict = {
            "id": "test-student-improving",
            "name": "Alex Rivera",
            "profile": {
                "preferredFormat": "simplified",
                "textSize": "medium",
                "readingSpeed": "medium",
                "speechRate": 1.0,
                "quizDifficulty": "beginner",
                "baselineScore": 60.0,
                "accessibilityPreferences": {"highContrast": True}
            }
        }
        quiz_attempts = [
            {"score": 55, "accuracy": 0.55, "timeSpentSeconds": 140, "totalQuestions": 5},
            {"score": 70, "accuracy": 0.70, "timeSpentSeconds": 110, "totalQuestions": 5},
            {"score": 85, "accuracy": 0.85, "timeSpentSeconds": 90, "totalQuestions": 5},
            {"score": 90, "accuracy": 0.90, "timeSpentSeconds": 80, "totalQuestions": 5},
        ]
        progress_records = [
            {"lessonId": "l1", "subject": "Mathematics", "masteryScore": 88, "status": "completed", "timeSpentMinutes": 15},
            {"lessonId": "l2", "subject": "Physics", "masteryScore": 50, "status": "in_progress", "timeSpentMinutes": 20},
        ]

        result = learner_intelligence.analyze_learner(user_dict, quiz_attempts, progress_records)

        self.assertIn("learningPace", result)
        self.assertIn("improvementSlope", result)
        self.assertGreater(result["improvementSlope"], 0.0, "Improving student must have positive slope")
        self.assertEqual(result["currentKnowledgeLevel"], "Intermediate")
        self.assertEqual(result["recommendedDifficulty"], "intermediate")
        self.assertIn("ethicalCompliance", result)
        self.assertIn("voluntary", result["ethicalCompliance"].lower())

    def test_02_adaptive_difficulty_3_tiers(self):
        """Verify 3-Level dynamic difficulty adjustment (>85% up, 60-85% maintain, <60% down)."""
        # Rule 1: High accuracy (>85%) triggers upgrade
        recent_high = [{"score": 90}, {"score": 95}]
        res_upgrade = difficulty_predictor.predict_next_difficulty("beginner", recent_high, 92)
        self.assertEqual(res_upgrade["recommendedDifficulty"], "intermediate")
        self.assertEqual(res_upgrade["transition"], "promote")

        # Upgrade from intermediate to advanced
        res_adv = difficulty_predictor.predict_next_difficulty("intermediate", recent_high, 90)
        self.assertEqual(res_adv["recommendedDifficulty"], "advanced")
        self.assertEqual(res_adv["transition"], "promote")

        # Rule 2: Moderate accuracy (60-85%) maintains difficulty
        recent_mod = [{"score": 72}, {"score": 68}]
        res_maintain = difficulty_predictor.predict_next_difficulty("intermediate", recent_mod, 75)
        self.assertEqual(res_maintain["recommendedDifficulty"], "intermediate")
        self.assertEqual(res_maintain["transition"], "maintain")

        # Rule 3: Low accuracy (<60%) triggers downgrade
        recent_low = [{"score": 45}, {"score": 50}]
        res_down = difficulty_predictor.predict_next_difficulty("intermediate", recent_low, 48)
        self.assertEqual(res_down["recommendedDifficulty"], "beginner")
        self.assertEqual(res_down["transition"], "demote")

        # Rule 4: Repeated incorrect answers recommend prerequisite lessons
        res_repeated = difficulty_predictor.predict_next_difficulty("beginner", [{"score": 40}, {"score": 35}], 30)
        self.assertEqual(res_repeated["recommendedDifficulty"], "beginner")
        self.assertTrue(res_repeated["needsPrerequisiteReview"])

    def test_03_content_adaptation_8_distinct_formats(self):
        """Verify Content Adaptation Engine produces all 8 required formats while preserving learning objectives."""
        topic = "Computer Architecture and Microprocessors"
        text = "The Central Processing Unit executes arithmetic and logic instructions fetched from volatile RAM memory."

        adapted = content_adapter.generate_offline_8_formats(topic, text)

        expected_formats = [
            "simpleEnglish",
            "detailedExplanation",
            "shortSummary",
            "stepByStep",
            "keyPoints",
            "realWorldExamples",
            "flashcards",
            "practiceQuestions",
        ]
        for fmt in expected_formats:
            self.assertIn(fmt, adapted, f"Missing required format: {fmt}")

        # Check qualitative transformations
        self.assertIn("computer brain (CPU)", adapted["simpleEnglish"])
        self.assertGreater(len(adapted["shortSummary"]), 0)
        self.assertGreaterEqual(len(adapted["stepByStep"]), 3)
        self.assertGreaterEqual(len(adapted["keyPoints"]), 3)
        self.assertGreaterEqual(len(adapted["realWorldExamples"]), 1)
        self.assertGreaterEqual(len(adapted["flashcards"]), 2)
        self.assertGreaterEqual(len(adapted["practiceQuestions"]), 2)

    def test_04_knowledge_gap_detection_and_prerequisites(self):
        """Verify Knowledge Gap Detection flags weak topics and maps prerequisites."""
        topic_mastery = {
            "Mathematics": 85.0,
            "Physics": 45.0,
            "Programming": 92.0,
            "Chemistry": 55.0,
        }
        quiz_history = [
            {
                "answers": [
                    {"isCorrect": False, "questionId": "q-physics-1"},
                    {"isCorrect": False, "questionId": "q-physics-2"},
                ]
            }
        ]

        gaps = knowledge_gap_tracker.analyze_gaps(topic_mastery, quiz_history)

        gap_topics = [g["topic"] for g in gaps["gaps"]]
        self.assertIn("Physics", gap_topics)
        self.assertIn("Chemistry", gap_topics)
        self.assertNotIn("Mathematics", gap_topics)
        self.assertNotIn("Programming", gap_topics)

        # Check prerequisite recommendation
        prereq_topics = [p["weakTopic"] for p in gaps["prerequisiteRecommendations"]]
        self.assertIn("Physics", prereq_topics)

    def test_05_intelligent_recommendation_engine(self):
        """Verify Dynamic Recommendations adapt based on learner intelligence."""
        # Scenario: Learner has weak topics and needs revision
        analysis = {
            "currentKnowledgeLevel": "Beginner",
            "recommendedDifficulty": "beginner",
            "weakTopics": [{"topic": "Physics", "mastery": 45.0}],
            "strongTopics": [{"topic": "Programming", "mastery": 92.0}],
            "preferredLearningFormats": ["audio_summary"],
            "improvementSlope": -1.2,
        }
        lessons = [
            {"id": "l1", "title": "Intro to Motion", "subject": "Physics", "difficulty": "beginner"},
            {"id": "l2", "title": "Data Structures", "subject": "Programming", "difficulty": "intermediate"},
            {"id": "l3", "title": "Newtonian Mechanics", "subject": "Physics", "difficulty": "intermediate"},
        ]

        recs = recommendation_engine.generate_recommendations(analysis, lessons)
        self.assertGreater(len(recs), 0)

        # Should recommend remediation on Physics and revision
        rec_types = [r["type"] for r in recs]
        self.assertTrue("remediation" in rec_types or "multimodal" in rec_types)

    def test_06_smart_revision_scheduler_spaced_repetition(self):
        """Verify Spaced Repetition calculates retention decay and schedules intervals."""
        progress_records = [
            {
                "lessonId": "l-old",
                "subject": "Mathematics",
                "masteryScore": 85,
                "status": "completed",
                # Simulated as completed 14 days ago
                "updatedAt": "2026-10-15T12:00:00"
            },
            {
                "lessonId": "l-new",
                "subject": "Physics",
                "masteryScore": 90,
                "status": "completed",
                # Completed today
                "updatedAt": "2026-10-31T12:00:00"
            }
        ]
        completed_sessions = []

        plan = smart_revision.calculate_plan(progress_records, completed_sessions)
        self.assertIn("scheduledRevisions", plan)
        self.assertIn("retentionCurve", plan)
        self.assertEqual(plan["algorithm"], "Ebbinghaus Spaced Repetition R(t)=e^(-t/S)")

        # Older topic should have lower retention and higher revision urgency
        old_item = next((r for r in plan["scheduledRevisions"] if r["lessonId"] == "l-old"), None)
        self.assertIsNotNone(old_item)
        self.assertLess(old_item["estimatedRetention"], 85.0)

    def test_07_learner_a_vs_learner_b_comparison(self):
        """
        Verify the comprehensive Hackathon Test Scenario:
        Learner A: Low accuracy (45%), slower response times, auditory preference -> Engine calibrates to Beginner.
        Learner B: High accuracy (95%), fast response times, visual/advanced preference -> Engine calibrates to Advanced.
        """
        # Learner A (Auditory, needs scaffolding)
        learner_a_user = {
            "id": "user-student-a",
            "name": "Sarah Chen",
            "profile": {
                "preferredFormat": "audio",
                "quizDifficulty": "beginner",
                "baselineScore": 50.0,
                "accessibilityPreferences": {"textToSpeech": True, "audioDescriptions": True}
            }
        }
        learner_a_attempts = [
            {"score": 40, "accuracy": 0.40, "timeSpentSeconds": 150, "totalQuestions": 5},
            {"score": 45, "accuracy": 0.45, "timeSpentSeconds": 140, "totalQuestions": 5},
            {"score": 50, "accuracy": 0.50, "timeSpentSeconds": 130, "totalQuestions": 5},
        ]
        learner_a_progress = [
            {"lessonId": "l1", "subject": "Physics", "masteryScore": 45, "status": "in_progress", "timeSpentMinutes": 25},
        ]

        analysis_a = learner_intelligence.analyze_learner(learner_a_user, learner_a_attempts, learner_a_progress)
        self.assertEqual(analysis_a["currentKnowledgeLevel"], "Beginner")
        self.assertEqual(analysis_a["recommendedDifficulty"], "beginner")
        self.assertIn("Deliberate", analysis_a["learningPace"])

        # Learner B (Rapid, advanced, visual)
        learner_b_user = {
            "id": "user-student-b",
            "name": "Marcus Johnson",
            "profile": {
                "preferredFormat": "visual",
                "quizDifficulty": "advanced",
                "baselineScore": 90.0,
                "accessibilityPreferences": {"highContrast": True, "visualDiagrams": True}
            }
        }
        learner_b_attempts = [
            {"score": 95, "accuracy": 0.95, "timeSpentSeconds": 45, "totalQuestions": 5},
            {"score": 100, "accuracy": 1.00, "timeSpentSeconds": 40, "totalQuestions": 5},
            {"score": 90, "accuracy": 0.90, "timeSpentSeconds": 50, "totalQuestions": 5},
        ]
        learner_b_progress = [
            {"lessonId": "l1", "subject": "Physics", "masteryScore": 95, "status": "completed", "timeSpentMinutes": 12},
            {"lessonId": "l2", "subject": "Programming", "masteryScore": 98, "status": "completed", "timeSpentMinutes": 10},
        ]

        analysis_b = learner_intelligence.analyze_learner(learner_b_user, learner_b_attempts, learner_b_progress)
        self.assertEqual(analysis_b["currentKnowledgeLevel"], "Advanced")
        self.assertEqual(analysis_b["recommendedDifficulty"], "advanced")
        self.assertIn("Rapid", analysis_b["learningPace"])

        # Distinct pedagogical strategies
        self.assertNotEqual(analysis_a["personalizedLearningStrategy"], analysis_b["personalizedLearningStrategy"])
        print("\n[VERIFIED] Learner A vs Learner B comparison successfully demonstrates complete personalization!")

if __name__ == "__main__":
    unittest.main(verbosity=2)
