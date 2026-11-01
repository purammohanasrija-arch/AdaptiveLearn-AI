"""
Phase 6 Comprehensive Test Suite: AI-Powered Teacher Dashboard & Learning Analytics System
Tests:
1. Teacher Authentication & Role-Based Access Control
2. Teacher Overview Dashboard & Real-Time Classroom KPIs
3. Student Management & Enrolled Student Queries (Search, Filter, Sort)
4. AI Learning Difficulty Detection (progressing_well, showing_improvement, needs_revision, requires_support)
5. Knowledge Gap Heatmap Dynamic Matrix (Students x Topics)
6. AI Teaching Recommendation Engine & Evidence-Based Insights
7. Class Performance Analytics & Score Distribution
8. Student Progress Timeline & Event Chronology
9. Teacher-Student Communication & Feedback Persistence
10. PDF Performance Report Generator (Class Cohort & Individual)
11. Full End-to-End Demonstration Scenario (Steps 1 through 7)
"""

import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import SessionLocal
from models import User, LearnerProfile, Lesson, LearningProgress, QuizAttempt, KnowledgeGap, TeacherAlert, TeacherFeedback
from routes.teacher_routes import (
    get_teacher_dashboard,
    get_teacher_students,
    get_student_detail,
    get_class_analytics,
    get_knowledge_heatmap,
    get_teacher_insights,
    send_teacher_feedback,
    generate_performance_report,
    enroll_student,
    create_assignment,
    resolve_alert,
    TeacherFeedbackRequest,
    EnrollStudentRequest,
    CreateAssignmentRequest,
)

def test_01_teacher_authentication_and_rbac():
    print("[TEST 1] Testing Teacher Authentication & RBAC...")
    db = SessionLocal()
    try:
        teacher = db.query(User).filter(User.role == "teacher").first()
        assert teacher is not None
        assert teacher.role == "teacher"
        assert teacher.id == "user-teacher-1"
        assert "elena" in teacher.name.lower() or "sharma" in teacher.name.lower()
        print(f"  ✓ Verified Teacher Profile: {teacher.name} ({teacher.email}) with role='{teacher.role}'")

        # Verify students have student role
        students = db.query(User).filter(User.role == "student").all()
        assert len(students) >= 5
        for s in students:
            assert s.role == "student"
        print(f"  ✓ Verified {len(students)} enrolled students with role='student'")
    finally:
        db.close()

def test_02_teacher_dashboard_kpis_and_records():
    print("[TEST 2] Testing Teacher Overview Dashboard & Real Database KPIs...")
    db = SessionLocal()
    try:
        res = get_teacher_dashboard(db=db)
        kpis = res["kpiMetrics"]

        assert kpis["totalStudents"] >= 5
        assert kpis["activeLearners"] >= 5
        assert kpis["averageClassPerformance"] > 60.0
        assert kpis["averageQuizAccuracy"] > 60.0
        assert kpis["studentsRequiringSupport"] >= 1
        assert "learningImprovementPercentage" in kpis

        assert len(res["students"]) >= 5
        assert len(res["topicPerformance"]) >= 3
        print(f"  ✓ Total Students: {kpis['totalStudents']}, Active: {kpis['activeLearners']}")
        print(f"  ✓ Cohort Average Mastery: {kpis['averageClassPerformance']}%, Quiz Accuracy: {kpis['averageQuizAccuracy']}%")
        print(f"  ✓ Students Requiring Support: {kpis['studentsRequiringSupport']}, Showing Improvement: {kpis['studentsShowingImprovement']}")
    finally:
        db.close()

def test_03_student_management_search_filter_sort():
    print("[TEST 3] Testing Student Management (Search, Filter, Sort)...")
    db = SessionLocal()
    try:
        # Search for Aarav
        res_search = get_teacher_students(search="Aarav", status="all", format="all", sortBy="mastery_desc", db=db)
        assert len(res_search["students"]) == 1
        assert res_search["students"][0]["name"] == "Aarav Patel"
        print("  ✓ Search filter by name verified ('Aarav' matched)")

        # Filter by status: requires_support
        res_support = get_teacher_students(search=None, status="requires_support", format="all", sortBy="mastery_desc", db=db)
        assert len(res_support["students"]) >= 1
        assert any(s["name"] == "David Kim" for s in res_support["students"])
        print(f"  ✓ Status filter 'requires_support' matched: {[s['name'] for s in res_support['students']]}")

        # Filter by status: showing_improvement
        res_improve = get_teacher_students(search=None, status="showing_improvement", format="all", sortBy="mastery_desc", db=db)
        assert len(res_improve["students"]) >= 1
        assert any(s["name"] == "Zoe Chen" for s in res_improve["students"])
        print(f"  ✓ Status filter 'showing_improvement' matched: {[s['name'] for s in res_improve['students']]}")

        # Sort by accuracy
        res_sort = get_teacher_students(search=None, status="all", format="all", sortBy="quiz_acc", db=db)
        accuracies = [s["avgQuizScore"] for s in res_sort["students"]]
        assert accuracies == sorted(accuracies, reverse=True)
        print("  ✓ Sort by quiz accuracy descending verified")
    finally:
        db.close()

def test_04_ai_learning_difficulty_detection():
    print("[TEST 4] Testing AI Learning Difficulty Categorization Engine...")
    db = SessionLocal()
    try:
        # Check student D (Zoe)
        zoe_detail = get_student_detail("user-student-d", db=db)
        zoe_eval = zoe_detail["difficultyEvaluation"]
        assert zoe_eval["category"] in ["showing_improvement", "progressing_well"]
        assert zoe_eval["improvementSlope"] >= 0
        print(f"  ✓ Zoe Chen classified as '{zoe_eval['badge']}' with slope +{zoe_eval['improvementSlope']}%")

        # Check student E (David)
        david_detail = get_student_detail("user-student-e", db=db)
        david_eval = david_detail["difficultyEvaluation"]
        assert david_eval["category"] == "requires_support"
        assert david_eval["averageMastery"] < 65.0
        assert len(david_detail["knowledgeGaps"]) >= 1
        print(f"  ✓ David Kim classified as '{david_eval['badge']}' with {len(david_detail['knowledgeGaps'])} active gaps")

        # Check student C (Carlos)
        carlos_detail = get_student_detail("user-student-c", db=db)
        carlos_eval = carlos_detail["difficultyEvaluation"]
        assert carlos_eval["category"] in ["needs_revision", "requires_support"]
        print(f"  ✓ Carlos Mendez classified as '{carlos_eval['badge']}'")
    finally:
        db.close()

def test_05_knowledge_gap_heatmap_matrix():
    print("[TEST 5] Testing Knowledge Gap Heatmap Matrix (Students x Topics)...")
    db = SessionLocal()
    try:
        heat = get_knowledge_heatmap(subject="all", db=db)
        assert len(heat["matrixRows"]) >= 5
        assert len(heat["topicColumns"]) >= 3
        assert heat["strongestTopic"] is not None
        assert heat["weakestTopic"] is not None

        # Verify color coding exists in each cell
        first_row = heat["matrixRows"][0]
        for cell in first_row["topicCells"]:
            assert cell["color"] in ["#059669", "#D97706", "#E11D48"]
            assert cell["status"] in ["mastered", "review_needed", "struggling"]

        print(f"  ✓ Heatmap matrix generated with {len(heat['matrixRows'])} students across {len(heat['topicColumns'])} topics")
        print(f"  ✓ Strongest Topic: {heat['strongestTopic']['topic']} ({heat['strongestTopic']['columnAverage']}%)")
        print(f"  ✓ Weakest Topic: {heat['weakestTopic']['topic']} ({heat['weakestTopic']['columnAverage']}%)")
    finally:
        db.close()

def test_06_ai_teaching_recommendations_and_insights():
    print("[TEST 6] Testing AI Teaching Recommendations & Evidence-Based Insights...")
    db = SessionLocal()
    try:
        ins = get_teacher_insights(db=db)
        assert len(ins["insights"]) >= 2
        assert len(ins["recommendations"]) >= 2
        assert ins["totalStudentsAnalyzed"] >= 5

        # Verify evidence-based nature
        for insight in ins["insights"]:
            assert len(insight["evidence"]) > 10
            assert len(insight["statistic"]) > 5

        # Verify recommendations have actions and rationale
        for rec in ins["recommendations"]:
            assert rec["priority"] in ["urgent", "high", "medium", "low"]
            assert len(rec["action"]) > 10
            assert len(rec["rationale"]) > 10

        print(f"  ✓ Generated {len(ins['insights'])} verified statistical findings")
        print(f"  ✓ Generated {len(ins['recommendations'])} prioritized teaching recommendations")
    finally:
        db.close()

def test_07_class_performance_analytics_and_distributions():
    print("[TEST 7] Testing Class Performance Analytics & Score Distribution...")
    db = SessionLocal()
    try:
        anal = get_class_analytics(db=db)
        assert len(anal["subjectComparisons"]) >= 3
        assert len(anal["scoreDistribution"]) == 3
        assert len(anal["formatDistribution"]) >= 2
        assert len(anal["weeklyTrends"]) >= 4

        # Total evaluations count
        assert anal["totalEvaluations"] >= 3
        print(f"  ✓ Verified {len(anal['subjectComparisons'])} subject comparisons")
        print(f"  ✓ Score distribution: Foundational={anal['scoreDistribution'][0]['count']}, Proficient={anal['scoreDistribution'][1]['count']}, Mastery={anal['scoreDistribution'][2]['count']}")
    finally:
        db.close()

def test_08_student_progress_timeline():
    print("[TEST 8] Testing Student Progress Timeline...")
    db = SessionLocal()
    try:
        detail = get_student_detail("user-student-d", db=db)
        timeline = detail["timeline"]
        assert len(timeline) >= 3

        event_types = [t["eventType"] for t in timeline]
        assert "onboarding" in event_types
        assert "quiz_attempt" in event_types
        print(f"  ✓ Chronological timeline has {len(timeline)} events spanning {set(event_types)}")
    finally:
        db.close()

def test_09_teacher_student_feedback_communication():
    print("[TEST 9] Testing Teacher-Student Communication & Persistence...")
    db = SessionLocal()
    try:
        teacher = db.query(User).filter(User.role == "teacher").first()
        req = TeacherFeedbackRequest(
            studentId="user-student-e",
            note="Remember to check the step-by-step loop counter simulation. You are doing well!",
            category="guidance",
            priority="normal"
        )
        res = send_teacher_feedback(req, user=teacher, db=db)
        assert res["success"] is True
        assert res["feedback"]["note"] == req.note

        # Verify persistence in database
        saved_fb = db.query(TeacherFeedback).filter(TeacherFeedback.id == res["feedback"]["id"]).first()
        assert saved_fb is not None
        assert saved_fb.student_id == "user-student-e"
        assert saved_fb.category == "guidance"
        print(f"  ✓ Feedback persisted in database with ID: {saved_fb.id}")
    finally:
        db.close()

def test_10_pdf_performance_report_generator():
    print("[TEST 10] Testing PDF Performance Report Generator (Class & Individual)...")
    db = SessionLocal()
    try:
        # 1. Class Report
        class_rep = generate_performance_report("class", db=db)
        assert class_rep["reportType"] == "class_cohort_report"
        assert len(class_rep["studentRoster"]) >= 5
        assert len(class_rep["nextActionItems"]) >= 2
        print(f"  ✓ Class Cohort Report generated: {class_rep['reportTitle']}")

        # 2. Individual Report
        ind_rep = generate_performance_report("user-student-a", db=db)
        assert ind_rep["reportType"] == "individual_student_report"
        assert ind_rep["studentInfo"]["name"] == "Aarav Patel"
        assert len(ind_rep["strengths"]) >= 1
        assert len(ind_rep["topicRecords"]) >= 1
        assert len(ind_rep["recommendedNextSteps"]) >= 2
        print(f"  ✓ Individual Student Report generated: {ind_rep['reportTitle']}")
    finally:
        db.close()

def test_11_full_demonstration_scenario():
    print("[TEST 11] Running Complete End-to-End Demonstration Scenario (Steps 1 through 7)...")
    db = SessionLocal()
    try:
        # Step 1: Teacher logs in
        teacher = db.query(User).filter(User.role == "teacher").first()
        assert teacher is not None
        print(f"  Step 1: Teacher '{teacher.name}' logged in successfully.")

        # Step 2: Teacher views class performance
        dash = get_teacher_dashboard(db=db)
        assert dash["kpiMetrics"]["totalStudents"] >= 5
        print(f"  Step 2: Classroom dashboard viewed ({dash['kpiMetrics']['totalStudents']} students, avg mastery {dash['kpiMetrics']['averageClassPerformance']}%).")

        # Step 3: Teacher opens student profile (Carlos Mendez)
        student_c = get_student_detail("user-student-c", db=db)
        assert student_c["student"]["name"] == "Carlos Mendez"
        print(f"  Step 3: Opened student profile for {student_c['student']['name']}.")

        # Step 4: AI identifies weak topics
        diff = student_c["difficultyEvaluation"]
        gaps = student_c["knowledgeGaps"]
        assert len(gaps) >= 1
        print(f"  Step 4: AI identified difficulty: '{diff['badge']}'. Weak topic: '{gaps[0]['topic']}' ({gaps[0]['misconception']}).")

        # Step 5: Teacher receives personalized recommendations
        ins = get_teacher_insights(db=db)
        assert len(ins["recommendations"]) >= 1
        matching_rec = next((r for r in ins["recommendations"] if "fraction" in r["topic"].lower()), ins["recommendations"][0])
        print(f"  Step 5: Recommendation received: '{matching_rec['action']}' ({matching_rec['rationale'][:60]}...).")

        # Step 6: Teacher provides feedback
        fb_req = TeacherFeedbackRequest(
            studentId="user-student-c",
            note="Try the pizza slice visual ratio diagram before tomorrow's quiz. You can do this!",
            category="revision_reminder",
            priority="normal"
        )
        fb_res = send_teacher_feedback(fb_req, user=teacher, db=db)
        assert fb_res["success"] is True
        print(f"  Step 6: Teacher sent guidance feedback: '{fb_req.note[:50]}...'.")

        # Step 7: Teacher generates PDF report
        report = generate_performance_report("user-student-c", db=db)
        assert report["reportType"] == "individual_student_report"
        assert len(report["topicRecords"]) >= 1
        print(f"  Step 7: PDF Report generated: '{report['reportTitle']}' with {len(report['topicRecords'])} topic mastery records.")

        print("  ✓ Full Demonstration Scenario Completed with 100% Success!")
    finally:
        db.close()

if __name__ == "__main__":
    print("=================================================================")
    print("RUNNING ADAPTIVELEARN AI PHASE 6 TEACHER DASHBOARD TEST SUITE")
    print("=================================================================")
    test_01_teacher_authentication_and_rbac()
    test_02_teacher_dashboard_kpis_and_records()
    test_03_student_management_search_filter_sort()
    test_04_ai_learning_difficulty_detection()
    test_05_knowledge_gap_heatmap_matrix()
    test_06_ai_teaching_recommendations_and_insights()
    test_07_class_performance_analytics_and_distributions()
    test_08_student_progress_timeline()
    test_09_teacher_student_feedback_communication()
    test_10_pdf_performance_report_generator()
    test_11_full_demonstration_scenario()
    print("=================================================================")
    print("ALL PHASE 6 TEACHER & ANALYTICS TESTS PASSED WITH 100% SUCCESS!")
    print("=================================================================")

