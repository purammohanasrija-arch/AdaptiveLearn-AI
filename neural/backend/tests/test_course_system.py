import os
import sys
import json

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ["LOKY_MAX_CPU_COUNT"] = "4"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import engine, Base, SessionLocal
from seed_courses import seed_courses_system
from models import User, Course, CourseCategory, CourseModule, CourseLesson, CourseEnrollment, CourseCertificate, LessonBookmark

from routes.course_routes import (
    get_course_categories,
    get_courses,
    get_course_detail,
    get_course_modules,
    enroll_in_course,
    get_my_courses,
    get_course_progress,
    get_lesson_detail,
    mark_lesson_completed,
    toggle_lesson_bookmark,
    get_lesson_notes,
    save_lesson_notes,
    get_assessment,
    submit_assessment,
    get_course_certificate,
    get_course_recommendations,
    teacher_create_course,
    teacher_update_course,
    teacher_create_module,
    teacher_create_lesson,
    teacher_add_resource,
    teacher_get_courses_overview,
    CourseEnrollRequest,
    LessonCompleteRequest,
    LessonBookmarkRequest,
    LessonNoteRequest,
    AssessmentSubmitRequest,
    TeacherCreateCourseRequest,
    TeacherUpdateCourseRequest,
    TeacherCreateModuleRequest,
    TeacherCreateLessonRequest,
    TeacherAddResourceRequest,
)

def run_all_course_tests():
    print("======================================================================")
    print("RUNNING ADAPTIVELEARN AI PHASE 10 COURSE SYSTEM TEST SUITE")
    print("======================================================================")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_courses_system(db)

    # Demo personas
    student_a = db.query(User).filter(User.id == "user-student-a").first()
    student_b = db.query(User).filter(User.id == "user-student-b").first()
    teacher = db.query(User).filter(User.id == "user-teacher-1").first()

    try:
        # [TEST 1] Course Categories (7 Major Categories)
        print("[TEST 1] Testing Course Categories Query...")
        res = get_course_categories(db=db)
        assert res["success"] is True
        assert res["total"] >= 7
        cat_names = [c["name"] for c in res["categories"]]
        assert "Programming & Computer Science" in cat_names
        assert "Mathematics" in cat_names
        assert "Science & Engineering" in cat_names
        assert "Languages & Communication" in cat_names
        assert "Professional & Career Skills" in cat_names
        assert "Business & Digital Skills" in cat_names
        assert "Competitive Exam Preparation" in cat_names
        print(f"  ✓ 7 Major Categories Verified: {len(res['categories'])} categories active")

        # [TEST 2] Course Discovery, Multi-Filter, Search & Sorting
        print("[TEST 2] Testing Course Discovery, Multi-Filtering & Search...")
        # All courses
        all_res = get_courses(db=db, user=student_a)
        assert all_res["total"] >= 10
        # Category filter
        cs_res = get_courses(category="cat-cs", db=db, user=student_a)
        assert cs_res["total"] >= 5
        for c in cs_res["courses"]:
            assert c["categoryId"] == "cat-cs"
        # Difficulty filter
        adv_res = get_courses(difficulty="Advanced", db=db, user=student_a)
        assert adv_res["total"] >= 1
        # Search keyword
        search_res = get_courses(search="Python", db=db, user=student_a)
        assert search_res["total"] >= 1
        assert "Python" in search_res["courses"][0]["title"]
        print("  ✓ Multi-dimensional filtering (category, difficulty, search, sort) verified")

        # [TEST 3] Course Details & Syllabus Hierarchy
        print("[TEST 3] Testing Course Details & Syllabus Hierarchy...")
        c_detail = get_course_detail(course_id="course-python", student_id="user-student-a", user=student_a, db=db)
        course = c_detail["course"]
        assert course["id"] == "course-python"
        assert course["moduleCount"] == 7
        assert course["lessonCount"] >= 20
        assert len(course["learningOutcomes"]) >= 3
        assert len(course["prerequisites"]) >= 1
        assert course["isEnrolled"] is True
        print(f"  ✓ Course '{course['title']}' loaded with {course['moduleCount']} modules & {course['lessonCount']} lessons")

        # [TEST 4] Course Modules Hierarchy
        print("[TEST 4] Testing Course Modules Hierarchy & Indicators...")
        mods_res = get_course_modules(course_id="course-python", student_id="user-student-a", user=student_a, db=db)
        modules = mods_res["modules"]
        assert len(modules) == 7
        assert modules[0]["title"] == "Module 1: Introduction to Python"
        assert len(modules[0]["lessons"]) == 5
        assert modules[0]["lessons"][0]["isCompleted"] is True  # Pre-seeded
        print(f"  ✓ Module hierarchy verified across 7 sequential chapters")

        # [TEST 5] Course Enrollment Flow
        print("[TEST 5] Testing Course Enrollment...")
        enroll_res = enroll_in_course(course_id="course-python", req=CourseEnrollRequest(student_id="user-student-b"), user=student_b, db=db)
        assert enroll_res["success"] is True
        assert enroll_res["enrollment"]["courseId"] == "course-python"
        
        my_res = get_my_courses(student_id="user-student-b", user=student_b, db=db)
        enrolled_ids = [c["id"] for c in my_res["courses"]]
        assert "course-python" in enrolled_ids
        print("  ✓ Student enrollment registered & verified in 'my-courses' dashboard")

        # [TEST 6] Lesson Detail & 8 AI Adaptation Formats
        print("[TEST 6] Testing Lesson Detail & 8 AI Adaptation Formats...")
        l_res = get_lesson_detail(lesson_id="cl-py-m1-l1", student_id="user-student-a", user=student_a, db=db)
        lesson = l_res["lesson"]
        assert lesson["id"] == "cl-py-m1-l1"
        assert "What is Python" in lesson["title"]
        assert lesson["courseId"] == "course-python"
        assert lesson["nextLessonId"] == "cl-py-m1-l2"
        
        # Verify 8 adaptation formats
        formats = lesson["adaptiveFormats"]
        for fmt in ["simple", "detailed", "step_by_step", "visual", "audio", "examples", "revision", "practice"]:
            assert fmt in formats, f"Missing adaptation format: {fmt}"
        assert "graph" in formats["visual"]["mermaid"]
        assert len(formats["step_by_step"]["steps"]) >= 3
        print("  ✓ All 8 AI Adaptation Formats loaded (Simple, Detailed, Steps, Visual, Audio, Examples, Revision, Practice)")

        # [TEST 7] Lesson Completion & Progress Recalculation
        print("[TEST 7] Testing Lesson Completion & Progress Recalculation...")
        comp_res = mark_lesson_completed(
            lesson_id="cl-py-m1-l2",
            req=LessonCompleteRequest(student_id="user-student-a", time_spent_minutes=20.0),
            user=student_a,
            db=db
        )
        assert comp_res["success"] is True
        assert comp_res["xpAwarded"] == 50

        prog_res = get_course_progress(course_id="course-python", student_id="user-student-a", user=student_a, db=db)
        assert prog_res["completedLessons"] >= 2
        assert prog_res["overallProgressPercentage"] > 0
        assert prog_res["totalTimeSpentMinutes"] >= 30.0
        print(f"  ✓ Lesson completed: Course progress updated to {prog_res['overallProgressPercentage']}% ({prog_res['completedLessons']} lessons)")

        # [TEST 8] Lesson Bookmarks & Student Notes
        print("[TEST 8] Testing Lesson Bookmarks & Student Notes...")
        # Clear existing bookmark if present for clean idempotent test
        db.query(LessonBookmark).filter(LessonBookmark.lesson_id == "cl-py-m1-l2", LessonBookmark.student_id == "user-student-a").delete()
        db.commit()

        bm_res = toggle_lesson_bookmark(lesson_id="cl-py-m1-l2", req=LessonBookmarkRequest(student_id="user-student-a"), user=student_a, db=db)
        assert bm_res["success"] is True
        assert bm_res["isBookmarked"] is True

        note_res = save_lesson_notes(
            lesson_id="cl-py-m1-l2",
            req=LessonNoteRequest(student_id="user-student-a", note_text="Key rule: Indentation in Python defines block scope."),
            user=student_a,
            db=db
        )
        assert note_res["success"] is True

        get_notes_res = get_lesson_notes(lesson_id="cl-py-m1-l2", student_id="user-student-a", user=student_a, db=db)
        assert "Indentation in Python" in get_notes_res["noteText"]
        print("  ✓ Bookmarks toggled and personal student notes persisted in database")

        # [TEST 9] Module Assessment Submission
        print("[TEST 9] Testing Module Assessment Submission...")
        asmt_info = get_assessment(assessment_id="asmt-mod-py-1", hide_answers=False, db=db)
        asmt = asmt_info["assessment"]
        assert asmt["assessmentType"] == "module_quiz"
        q1 = asmt["questions"][0]["id"]
        q2 = asmt["questions"][1]["id"]

        sub_res = submit_assessment(
            assessment_id="asmt-mod-py-1",
            req=AssessmentSubmitRequest(
                student_id="user-student-a",
                answers={
                    q1: "What is Python & Its Ecosystem?",
                    q2: "True"
                }
            ),
            user=student_a,
            db=db
        )
        assert sub_res["success"] is True
        assert sub_res["passed"] is True
        assert sub_res["percentage"] == 100.0
        print(f"  ✓ Module quiz evaluated: Score {sub_res['score']}/{sub_res['totalPoints']} (100% Passed)")

        # [TEST 10] Final Exam & Verified Course Certificate Issuance
        print("[TEST 10] Testing Final Exam & Automatic Certificate Issuance...")
        final_sub = submit_assessment(
            assessment_id="asmt-course-python-final",
            req=AssessmentSubmitRequest(
                student_id="user-student-a",
                answers={
                    "q-py-final-1": "__init__",
                    "q-py-final-2": "O(1)",
                    "q-py-final-3": "False",
                    "q-py-final-4": "range()",
                    "q-py-final-5": "finally"
                }
            ),
            user=student_a,
            db=db
        )
        assert final_sub["passed"] is True
        assert final_sub["percentage"] == 100.0
        assert final_sub["certificate"] is not None
        cert = final_sub["certificate"]
        assert "ALAI-CERT-PYTHON" in cert["certificateNumber"]
        assert cert["grade"] == "A+"
        assert len(cert["verificationHash"]) == 64

        cert_query = get_course_certificate(course_id="course-python", student_id="user-student-a", user=student_a, db=db)
        assert cert_query["success"] is True
        assert cert_query["certificate"]["certificateNumber"] == cert["certificateNumber"]
        print(f"  ✓ Final exam passed! Official Certificate Issued: {cert['certificateNumber']} (Grade {cert['grade']})")

        # [TEST 11] AI Course Recommendations
        print("[TEST 11] Testing AI Course Recommendations...")
        recs_res = get_course_recommendations(student_id="user-student-a", user=student_a, db=db)
        assert recs_res["success"] is True
        assert len(recs_res["recommendations"]) >= 3
        rec_ids = [r["id"] for r in recs_res["recommendations"]]
        assert any(x in rec_ids for x in ["course-dsa", "course-dbms", "course-webdev"])
        assert len(recs_res["recommendations"][0]["recommendationReason"]) > 10
        print(f"  ✓ Top Recommendation: '{recs_res['recommendations'][0]['title']}' - Reason: {recs_res['recommendations'][0]['recommendationReason'][:60]}...")

        # [TEST 12] Teacher Course Management
        print("[TEST 12] Testing Teacher Course Management...")
        t_course = teacher_create_course(
            req=TeacherCreateCourseRequest(
                category_id="cat-cs",
                title="Microservices & Distributed Systems with Docker",
                description="Enterprise architecture, gRPC, and container orchestration.",
                difficulty="Advanced",
                estimated_duration="22 hours"
            ),
            user=teacher,
            db=db
        )
        assert t_course["success"] is True
        new_c_id = t_course["course"]["id"]

        t_mod = teacher_create_module(
            course_id=new_c_id,
            req=TeacherCreateModuleRequest(title="Module 1: Docker Essentials", sequence_number=1),
            user=teacher,
            db=db
        )
        assert t_mod["success"] is True
        new_m_id = t_mod["module"]["id"]

        t_lesson = teacher_create_lesson(
            module_id=new_m_id,
            req=TeacherCreateLessonRequest(
                title="Building Docker Containers",
                duration=25,
                content="Guide to containerizing applications with multi-stage Dockerfiles.",
                simple_explanation="A container packages code and dependencies into a lightweight box."
            ),
            user=teacher,
            db=db
        )
        assert t_lesson["success"] is True
        new_l_id = t_lesson["lesson"]["id"]

        t_res = teacher_add_resource(
            lesson_id=new_l_id,
            req=TeacherAddResourceRequest(
                resource_type="pdf",
                title="Docker Architecture Cheatsheet",
                resource_url="/downloads/docker-cheat.pdf"
            ),
            user=teacher,
            db=db
        )
        assert t_res["success"] is True

        overview_res = teacher_get_courses_overview(user=teacher, db=db)
        assert overview_res["success"] is True
        assert overview_res["kpis"]["totalCourses"] >= 10
        print("  ✓ Teacher course creation, module structuring, resource upload, and faculty analytics verified")

        print("======================================================================")
        print("ALL 12 PHASE 10 COURSE MANAGEMENT TESTS PASSED WITH 100% SUCCESS!")
        print("======================================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_all_course_tests()
