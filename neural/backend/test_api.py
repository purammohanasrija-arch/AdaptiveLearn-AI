import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
os.environ["LOKY_MAX_CPU_COUNT"] = "4"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("--- [TEST 1] HEALTH CHECK ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("PASS: Health check:", res.json()["engine"])

    print("--- [TEST 2] LESSONS API ---")
    res = client.get("/api/lessons")
    assert res.status_code == 200
    lessons = res.json()["lessons"]
    assert len(lessons) >= 4, f"Expected at least 4 lessons, got {len(lessons)}"
    print(f"PASS: Retrieved {len(lessons)} inclusive lessons. Sample: {lessons[0]['title']}")

    print("--- [TEST 3] ADAPT LESSON (5 EXPERIENCES) ---")
    res = client.post(f"/api/lessons/{lessons[0]['id']}/adapt", json={"format": "simplified"})
    assert res.status_code == 200
    data = res.json()
    assert "adaptedContent" in data
    print("PASS: Adapt lesson response source:", data.get("source"))

    print("--- [TEST 4] AI LEARNING DNA ---")
    res = client.get("/api/ai/learning-dna/user-student-a")
    assert res.status_code == 200
    dna = res.json()["learningDna"]
    print(f"PASS: Student A Archetype: {dna['archetype']} | Genome: {dna['genomeHash']}")
    print(f"PASS: DNA Radar dimensions: {len(dna['radarMetrics'])} metrics calculated")

    print("--- [TEST 5] ADAPTIVE QUIZ SUBMISSION (BKT + IRT) ---")
    quiz_payload = {
        "answers": [
            {"questionId": "q1-1", "selectedOption": 0},
            {"questionId": "q1-2", "selectedOption": 1},
        ],
        "timeSpentSeconds": 85,
        "userId": "user-student-a",
    }
    res = client.post(f"/api/quizzes/{lessons[0]['id']}/submit", json=quiz_payload)
    assert res.status_code == 200
    q_result = res.json()
    print(f"PASS: Quiz evaluated: Score={q_result['score']}%, Accuracy={q_result['accuracy']}")
    print(f"PASS: IRT Calibrated Next Tier: {q_result['adaptiveCalibration']['recommendedTier']} ({q_result['adaptiveCalibration']['tierLabel']})")
    print(f"PASS: BKT Mastery Probability: {q_result['adaptiveCalibration']['bktMasteryProbability']}")

    print("--- [TEST 6] PROGRESS SUMMARY & REVISION SCHEDULE ---")
    res = client.get("/api/progress/summary?userId=user-student-a")
    assert res.status_code == 200
    prog = res.json()
    print(f"PASS: Overall Mastery: {prog['summary']['overallMastery']}% | Completed: {prog['summary']['completedLessons']}")

    res = client.get("/api/ai/revision-schedule/user-student-a")
    assert res.status_code == 200
    rev = res.json()["revisionSchedule"]
    print(f"PASS: Spaced Repetition items evaluated: {len(rev)} items")

    print("--- [TEST 7] TEACHER DASHBOARD & INTERVENTION ALERTS ---")
    res = client.get("/api/teacher/dashboard")
    assert res.status_code == 200
    td = res.json()
    print(f"PASS: Teacher dashboard: {td['metrics']['totalStudents']} students | Cohort Mastery: {td['metrics']['averageMastery']}%")

    print("--- [TEST 8] AI TUTOR INTERACTIVE SOCRATIC CHAT ---")
    chat_payload = {
        "messages": [{"role": "user", "text": "What is RAM and how is it different from CPU?"}],
        "studentProfile": {"preferredFormat": "simplified"},
    }
    res = client.post("/api/ai/chat", json=chat_payload)
    assert res.status_code == 200
    chat_resp = res.json()
    print(f"PASS: AI Tutor Analogy: {chat_resp['analogy']}")
    print(f"PASS: AI Tutor Reply Snippet: {chat_resp['reply'][:110]}...")

    print("--- [TEST 9] ONE LESSON – FIVE EXPERIENCES GENERATOR ---")
    exp_payload = {
        "topic": "Photosynthesis",
        "text": "Plants use chlorophyll in chloroplasts to capture radiant sunlight, synthesizing glucose from carbon dioxide and water while liberating oxygen.",
    }
    res = client.post("/api/ai/one-lesson-five-experiences", json=exp_payload)
    assert res.status_code == 200
    exp_data = res.json()
    assert "experiences" in exp_data
    print(f"PASS: Generated 5 Experiences: {list(exp_data['experiences'].keys())}")
    print(f"PASS: Flesch Grade before: {exp_data['readabilityBefore']['gradeLevel']} -> after: {exp_data['readabilityAfter']['gradeLevel']}")

    print("\n=======================================================")
    print("ALL 9 BACKEND AI/ML SUITES PASSED FLAWLESSLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()

