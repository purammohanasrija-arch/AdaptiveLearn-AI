import sys
import json
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("=== TESTING ADAPTIVE LEARNING ENGINE (PHASE 3 ENDPOINTS VIA TESTCLIENT) ===")

    # 1. Health check
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Health check failed: {resp.status_code} {resp.text}"
    print("[PASS] 0. /api/health:", resp.json().get("status"))

    # 2. POST /api/learner/profile
    resp = client.post("/api/learner/profile", json={
        "userId": "user-student-a",
        "preferredFormat": "audio_summary",
        "quizDifficulty": "beginner",
        "textSize": "large",
        "readingSpeed": "slow"
    }, headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Profile update failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 1. POST /api/learner/profile:", res.get("message"))
    print("       Ethical Standard:", res.get("ethicalStandard"))

    # 3. POST /api/learner/analyze
    resp = client.post("/api/learner/analyze", json={"userId": "user-student-a"}, headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Analyze learner failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 2. POST /api/learner/analyze:")
    print("       Pace:", res.get("learningPace"))
    print("       Knowledge Level:", res.get("currentKnowledgeLevel"))
    print("       Weak Topics:", res.get("weakTopics"))
    print("       Strong Topics:", res.get("strongTopics"))
    print("       Improvement Slope:", res.get("improvementSlope"))
    print("       Recommended Difficulty:", res.get("recommendedDifficulty"))

    # 4. POST /api/quiz/submit
    resp = client.post("/api/quiz/submit", json={
        "userId": "user-student-a",
        "lessonId": "lesson-1",
        "answers": [
            {"questionId": "q1", "selectedOption": 1},
            {"questionId": "q2", "selectedOption": 1},
            {"questionId": "q3", "selectedOption": 2}
        ],
        "timeSpentSeconds": 70
    }, headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Quiz submit failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 3. POST /api/quiz/submit:")
    print("       Score:", res.get("score"), "Accuracy:", res.get("accuracy"))
    print("       Recommended Next Difficulty:", res.get("difficultyEvaluation", {}).get("recommendedDifficulty"))
    print("       Evaluation Reason:", res.get("difficultyEvaluation", {}).get("reason"))

    # 5. GET /api/learner/progress
    resp = client.get("/api/learner/progress?userId=user-student-a", headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Progress get failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 4. GET /api/learner/progress:")
    print("       Overall Mastery:", res.get("overallMastery"))
    print("       Topic Performance Count:", len(res.get("topicPerformance", [])))
    print("       Improvement Graph points:", len(res.get("learningImprovementGraph", [])))

    # 6. GET /api/learner/recommendations
    resp = client.get("/api/learner/recommendations?userId=user-student-a", headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Recommendations get failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 5. GET /api/learner/recommendations:")
    print("       Total recommendations:", res.get("totalRecommendations"))
    for rec in res.get("recommendations", [])[:3]:
        print("       ->", rec.get("title"), f"({rec.get('type')}) - Priority:", rec.get("priority"))

    # 7. POST /api/content/adapt
    resp = client.post("/api/content/adapt", json={
        "topic": "Photosynthesis and Plant Metabolism",
        "text": "Photosynthesis is the biological process by which green plants transform light energy into chemical energy stored in glucose."
    })
    assert resp.status_code == 200, f"Content adapt failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 6. POST /api/content/adapt:")
    formats = list(res.get("formats", {}).keys())
    print("       8 Distinct Formats:", formats)
    assert len(formats) >= 8, f"Expected 8 formats, got {len(formats)}"
    for fmt_name in ["simpleEnglish", "detailed", "summary", "stepByStep", "keyPoints", "realWorldExamples", "flashcards", "practiceQuestions"]:
        assert fmt_name in res.get("formats", {}), f"Missing format {fmt_name}"

    # 8. GET /api/learner/knowledge-gaps
    resp = client.get("/api/learner/knowledge-gaps?userId=user-student-a", headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Knowledge gaps get failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 7. GET /api/learner/knowledge-gaps:")
    print("       Identified gaps:", [g.get("topic") for g in res.get("gaps", [])])
    print("       Prerequisites needed:", [p.get("prerequisite") for p in res.get("prerequisiteRecommendations", [])])

    # 9. GET /api/learner/revision-plan
    resp = client.get("/api/learner/revision-plan?userId=user-student-a", headers={"X-Demo-User-Id": "user-student-a"})
    assert resp.status_code == 200, f"Revision plan get failed: {resp.status_code} {resp.text}"
    res = resp.json()
    print("[PASS] 8. GET /api/learner/revision-plan:")
    print("       Scheduled Revisions:", len(res.get("scheduledRevisions", [])))
    print("       Spaced Repetition Algorithm:", res.get("algorithm"))

    print("\n[SUCCESS] ALL 8 REST ENDPOINTS VERIFIED AND PASSING 100%!")

if __name__ == "__main__":
    run_tests()
