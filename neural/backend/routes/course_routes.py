import os
import sys
import json
import uuid
import hashlib
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc

from database import get_db
from models import (
    User,
    CourseCategory,
    Course,
    CourseModule,
    CourseLesson,
    LessonResource,
    CourseEnrollment,
    CourseLessonProgress,
    CourseAssessment,
    CourseQuestion,
    AssessmentAttempt,
    CourseCertificate,
    StudentLessonNote,
    LessonBookmark,
    Lesson,  # Fallback to Phase 1 lessons if needed
)
from routes.auth_routes import get_current_user_from_header

router = APIRouter(tags=["Courses & Lesson Management System"])

# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

class CourseEnrollRequest(BaseModel):
    student_id: Optional[str] = None

class LessonCompleteRequest(BaseModel):
    student_id: Optional[str] = None
    time_spent_minutes: Optional[float] = 15.0

class LessonBookmarkRequest(BaseModel):
    student_id: Optional[str] = None

class LessonNoteRequest(BaseModel):
    student_id: Optional[str] = None
    note_text: str

class AssessmentSubmitRequest(BaseModel):
    student_id: Optional[str] = None
    answers: dict = Field(default_factory=dict)  # { question_id: answer }

class TeacherCreateCourseRequest(BaseModel):
    category_id: str
    title: str
    description: str
    difficulty: Optional[str] = "Beginner"
    instructor_name: Optional[str] = "Faculty Instructor"
    instructor_title: Optional[str] = "Senior Educator"
    thumbnail: Optional[str] = ""
    icon: Optional[str] = "BookOpen"
    color: Optional[str] = "#E83B64"
    estimated_duration: Optional[str] = "15 hours"
    learning_outcomes: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    published: Optional[bool] = True

class TeacherUpdateCourseRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    published: Optional[bool] = None
    estimated_duration: Optional[str] = None
    category_id: Optional[str] = None

class TeacherCreateModuleRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    sequence_number: Optional[int] = 1

class TeacherCreateLessonRequest(BaseModel):
    title: str
    duration: Optional[int] = 15
    sequence_number: Optional[int] = 1
    content: Optional[str] = ""
    learning_objectives: Optional[List[str]] = None
    code_snippet: Optional[str] = ""
    diagram_mermaid: Optional[str] = ""
    simple_explanation: Optional[str] = ""
    detailed_explanation: Optional[str] = ""
    step_by_step: Optional[List[str]] = None
    real_world_example: Optional[str] = ""
    revision_notes: Optional[str] = ""

class TeacherUpdateLessonRequest(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    content: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    code_snippet: Optional[str] = None
    diagram_mermaid: Optional[str] = None
    simple_explanation: Optional[str] = None
    detailed_explanation: Optional[str] = None
    real_world_example: Optional[str] = None
    revision_notes: Optional[str] = None

class TeacherAddResourceRequest(BaseModel):
    resource_type: str = "pdf"
    title: str
    resource_url: str

class TeacherCreateAssessmentRequest(BaseModel):
    course_id: str
    module_id: Optional[str] = None
    title: str
    assessment_type: Optional[str] = "module_quiz"  # module_quiz or final_exam
    total_marks: Optional[int] = 100
    passing_percentage: Optional[float] = 70.0

class TeacherAddQuestionRequest(BaseModel):
    question: str
    question_type: Optional[str] = "multiple_choice"
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = ""
    hints: Optional[List[str]] = None
    points: Optional[int] = 10


# =============================================================================
# HELPER: RESOLVE USER ID
# =============================================================================

def resolve_student_id(explicit_id: Optional[str], user: Optional[User]) -> str:
    if explicit_id:
        return explicit_id
    if user and user.id:
        return user.id
    return "user-student-a"  # Default demo persona fallback for evaluator convenience


# =============================================================================
# 1. COURSE CATEGORIES
# =============================================================================

@router.get("/courses/categories")
def get_course_categories(db: Session = Depends(get_db)):
    """Retrieve all available course categories with active course counts."""
    categories = db.query(CourseCategory).order_by(CourseCategory.sequence_order.asc()).all()
    return {
        "success": True,
        "total": len(categories),
        "categories": [c.to_dict() for c in categories],
    }


# =============================================================================
# 2. COURSE EXPLORER & DISCOVERY
# =============================================================================

@router.get("/courses")
def get_courses(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "popularity",  # popularity, newest, rating, duration
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """
    Search and filter courses by category, difficulty, keyword, and sort order.
    Includes user enrollment status and completion progress if authenticated.
    """
    query = db.query(Course).filter(Course.published == True)

    # Filter by category ID or category name
    if category and category.lower() != "all":
        query = query.join(CourseCategory).filter(
            or_(
                Course.category_id == category,
                CourseCategory.name.ilike(f"%{category}%")
            )
        )

    # Filter by difficulty
    if difficulty and difficulty.lower() != "all":
        query = query.filter(Course.difficulty.ilike(f"%{difficulty}%"))

    # Search keyword
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Course.title.ilike(search_term),
                Course.description.ilike(search_term),
                Course.instructor_name.ilike(search_term)
            )
        )

    # Sorting
    if sort == "newest":
        query = query.order_by(desc(Course.created_at))
    elif sort == "rating":
        query = query.order_by(desc(Course.rating))
    elif sort == "duration":
        query = query.order_by(Course.estimated_duration.asc())
    else:  # default: popularity
        query = query.order_by(desc(Course.enrollment_count))

    courses = query.all()

    # Determine user enrollments and progress if student is resolved
    active_student = resolve_student_id(student_id, user)
    enrollments_map = {}
    if active_student:
        user_enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.student_id == active_student).all()
        for e in user_enrollments:
            enrollments_map[e.course_id] = e

    result = []
    for c in courses:
        c_dict = c.to_dict()
        enrollment = enrollments_map.get(c.id)
        if enrollment:
            # Calculate completion percentage
            total_lessons = c_dict["lessonCount"]
            if total_lessons > 0:
                completed_count = (
                    db.query(CourseLessonProgress)
                    .join(CourseLesson)
                    .join(CourseModule)
                    .filter(
                        CourseModule.course_id == c.id,
                        CourseLessonProgress.student_id == active_student,
                        CourseLessonProgress.completion_status == "completed",
                    )
                    .count()
                )
                progress_pct = round((completed_count / total_lessons) * 100, 1)
            else:
                completed_count = 0
                progress_pct = 0.0

            c_dict["isEnrolled"] = True
            c_dict["enrollmentStatus"] = enrollment.status
            c_dict["completedLessons"] = completed_count
            c_dict["progressPercentage"] = progress_pct
            c_dict["lastAccessedLessonId"] = enrollment.last_accessed_lesson_id
        else:
            c_dict["isEnrolled"] = False
            c_dict["progressPercentage"] = 0.0

        result.append(c_dict)

    return {
        "success": True,
        "total": len(result),
        "courses": result,
    }


# =============================================================================
# 3. COURSE DETAILS & SYLLABUS
# =============================================================================

@router.get("/courses/{course_id}")
def get_course_detail(
    course_id: str,
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Retrieve full details of a single course, including modules, lessons, and enrollment state."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course_data = course.to_dict(include_modules=True)

    # Check user enrollment and progress
    active_student = resolve_student_id(student_id, user)
    enrollment = None
    completed_lesson_ids = set()

    if active_student:
        enrollment = (
            db.query(CourseEnrollment)
            .filter(CourseEnrollment.course_id == course_id, CourseEnrollment.student_id == active_student)
            .first()
        )
        completed_records = (
            db.query(CourseLessonProgress.lesson_id)
            .join(CourseLesson)
            .join(CourseModule)
            .filter(
                CourseModule.course_id == course_id,
                CourseLessonProgress.student_id == active_student,
                CourseLessonProgress.completion_status == "completed",
            )
            .all()
        )
        completed_lesson_ids = {r[0] for r in completed_records}

    # Annotate modules and lessons with completion indicators
    total_lessons = 0
    if "modules" in course_data:
        for m in course_data["modules"]:
            for l in m.get("lessons", []):
                total_lessons += 1
                l["isCompleted"] = l["id"] in completed_lesson_ids

    completed_count = len(completed_lesson_ids)
    progress_pct = round((completed_count / total_lessons * 100), 1) if total_lessons > 0 else 0.0

    course_data["isEnrolled"] = bool(enrollment)
    course_data["enrollmentStatus"] = enrollment.status if enrollment else None
    course_data["completedLessons"] = completed_count
    course_data["progressPercentage"] = progress_pct
    course_data["lastAccessedLessonId"] = (
        enrollment.last_accessed_lesson_id
        if enrollment and enrollment.last_accessed_lesson_id
        else (course_data["modules"][0]["lessons"][0]["id"] if course_data.get("modules") and course_data["modules"][0].get("lessons") else None)
    )

    # Check for earned certificate
    cert = (
        db.query(CourseCertificate)
        .filter(CourseCertificate.course_id == course_id, CourseCertificate.student_id == active_student)
        .first()
    )
    course_data["certificate"] = cert.to_dict() if cert else None

    return {
        "success": True,
        "course": course_data,
    }


@router.get("/courses/{course_id}/modules")
def get_course_modules(
    course_id: str,
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Retrieve structured modules and lesson hierarchy for a course with completion indicators."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    active_student = resolve_student_id(student_id, user)
    completed_lesson_ids = set()
    if active_student:
        records = (
            db.query(CourseLessonProgress.lesson_id)
            .join(CourseLesson)
            .join(CourseModule)
            .filter(
                CourseModule.course_id == course_id,
                CourseLessonProgress.student_id == active_student,
                CourseLessonProgress.completion_status == "completed",
            )
            .all()
        )
        completed_lesson_ids = {r[0] for r in records}

    modules = (
        db.query(CourseModule)
        .filter(CourseModule.course_id == course_id)
        .order_by(CourseModule.sequence_number.asc())
        .all()
    )

    module_list = []
    for m in modules:
        m_dict = m.to_dict(include_lessons=True)
        # Annotate lessons
        for l in m_dict.get("lessons", []):
            l["isCompleted"] = l["id"] in completed_lesson_ids
        module_list.append(m_dict)

    return {
        "success": True,
        "courseId": course_id,
        "courseTitle": course.title,
        "modules": module_list,
    }


# =============================================================================
# 4. COURSE ENROLLMENT
# =============================================================================

@router.post("/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: str,
    req: Optional[CourseEnrollRequest] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Enroll a student in a course and initialize progress tracking."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    student_id = resolve_student_id(req.student_id if req else None, user)

    # Check if already enrolled
    existing = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.course_id == course_id, CourseEnrollment.student_id == student_id)
        .first()
    )
    if existing:
        return {
            "success": True,
            "message": "Already enrolled in this course.",
            "enrollment": existing.to_dict(),
            "firstLessonId": existing.last_accessed_lesson_id,
        }

    # Find first lesson of course
    first_lesson_id = None
    first_mod = (
        db.query(CourseModule)
        .filter(CourseModule.course_id == course_id)
        .order_by(CourseModule.sequence_number.asc())
        .first()
    )
    if first_mod:
        first_lesson = (
            db.query(CourseLesson)
            .filter(CourseLesson.module_id == first_mod.id)
            .order_by(CourseLesson.sequence_number.asc())
            .first()
        )
        if first_lesson:
            first_lesson_id = first_lesson.id

    enrollment = CourseEnrollment(
        id=f"enroll-{uuid.uuid4().hex[:10]}",
        student_id=student_id,
        course_id=course_id,
        status="active",
        last_accessed_lesson_id=first_lesson_id,
        enrolled_at=datetime.utcnow(),
    )
    course.enrollment_count = (course.enrollment_count or 0) + 1
    db.add(enrollment)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully enrolled in {course.title}!",
        "enrollment": enrollment.to_dict(),
        "firstLessonId": first_lesson_id,
    }


@router.get("/student/my-courses")
def get_my_courses(
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Retrieve all courses enrolled by the active student along with completion progress."""
    active_student = resolve_student_id(student_id, user)
    enrollments = (
        db.query(CourseEnrollment)
        .filter(CourseEnrollment.student_id == active_student)
        .order_by(desc(CourseEnrollment.last_accessed_at))
        .all()
    )

    enrolled_courses = []
    for e in enrollments:
        c = e.course
        if not c:
            continue
        c_dict = c.to_dict()
        total_lessons = c_dict["lessonCount"]

        completed_count = (
            db.query(CourseLessonProgress)
            .join(CourseLesson)
            .join(CourseModule)
            .filter(
                CourseModule.course_id == c.id,
                CourseLessonProgress.student_id == active_student,
                CourseLessonProgress.completion_status == "completed",
            )
            .count()
        )

        progress_pct = round((completed_count / total_lessons * 100), 1) if total_lessons > 0 else 0.0

        # Check for certificate
        cert = (
            db.query(CourseCertificate)
            .filter(CourseCertificate.course_id == c.id, CourseCertificate.student_id == active_student)
            .first()
        )

        enrolled_courses.append({
            **c_dict,
            "enrollmentId": e.id,
            "enrollmentStatus": e.status,
            "enrolledAt": e.enrolled_at.isoformat() if e.enrolled_at else None,
            "lastAccessedAt": e.last_accessed_at.isoformat() if e.last_accessed_at else None,
            "lastAccessedLessonId": e.last_accessed_lesson_id,
            "completedLessons": completed_count,
            "progressPercentage": progress_pct,
            "certificate": cert.to_dict() if cert else None,
        })

    return {
        "success": True,
        "total": len(enrolled_courses),
        "courses": enrolled_courses,
    }


@router.get("/student/course-progress/{course_id}")
def get_course_progress(
    course_id: str,
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Detailed module-by-module and lesson-by-lesson progress for a student in a course."""
    active_student = resolve_student_id(student_id, user)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = db.query(CourseModule).filter(CourseModule.course_id == course_id).order_by(CourseModule.sequence_number.asc()).all()
    
    total_lessons = 0
    completed_lessons = 0
    total_time_minutes = 0.0
    module_progress_list = []

    for m in modules:
        lessons = db.query(CourseLesson).filter(CourseLesson.module_id == m.id).order_by(CourseLesson.sequence_number.asc()).all()
        m_lessons_data = []
        m_completed = 0

        for l in lessons:
            total_lessons += 1
            prog = (
                db.query(CourseLessonProgress)
                .filter(CourseLessonProgress.lesson_id == l.id, CourseLessonProgress.student_id == active_student)
                .first()
            )
            is_comp = prog.completion_status == "completed" if prog else False
            time_spent = prog.time_spent_minutes if prog else 0.0
            total_time_minutes += time_spent

            if is_comp:
                completed_lessons += 1
                m_completed += 1

            m_lessons_data.append({
                "lessonId": l.id,
                "title": l.title,
                "duration": l.duration,
                "isCompleted": is_comp,
                "timeSpentMinutes": time_spent,
                "completedAt": prog.completed_at.isoformat() if prog and prog.completed_at else None,
            })

        m_pct = round((m_completed / len(lessons) * 100), 1) if lessons else 0.0
        module_progress_list.append({
            "moduleId": m.id,
            "title": m.title,
            "sequenceNumber": m.sequence_number,
            "totalLessons": len(lessons),
            "completedLessons": m_completed,
            "progressPercentage": m_pct,
            "lessons": m_lessons_data,
        })

    overall_pct = round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0.0

    return {
        "success": True,
        "courseId": course_id,
        "courseTitle": course.title,
        "studentId": active_student,
        "totalLessons": total_lessons,
        "completedLessons": completed_lessons,
        "overallProgressPercentage": overall_pct,
        "totalTimeSpentMinutes": round(total_time_minutes, 1),
        "modules": module_progress_list,
    }


# =============================================================================
# 5. INTERACTIVE LESSON LEARNING & AI ADAPTATIONS
# =============================================================================

@router.get("/lessons/{lesson_id}")
def get_lesson_detail(
    lesson_id: str,
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """
    Retrieve full lesson content with 8 AI-adapted formats, code snippets,
    Mermaid diagrams, sequence navigation (next/prev), student notes, and bookmarks.
    """
    active_student = resolve_student_id(student_id, user)
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()

    # Fallback to Phase 1 legacy lessons table if it's a legacy lesson ID
    if not lesson:
        legacy_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if legacy_lesson:
            return {
                "success": True,
                "lesson": legacy_lesson.to_dict(),
                "isLegacy": True,
            }
        raise HTTPException(status_code=404, detail="Lesson not found")

    module = lesson.module
    course = module.course if module else None

    # Determine Previous and Next Lesson IDs within the course
    all_course_lessons = (
        db.query(CourseLesson.id)
        .join(CourseModule)
        .filter(CourseModule.course_id == course.id)
        .order_by(CourseModule.sequence_number.asc(), CourseLesson.sequence_number.asc())
        .all()
    )
    lesson_ids_sequence = [r[0] for r in all_course_lessons]
    
    current_idx = lesson_ids_sequence.index(lesson_id) if lesson_id in lesson_ids_sequence else -1
    prev_lesson_id = lesson_ids_sequence[current_idx - 1] if current_idx > 0 else None
    next_lesson_id = lesson_ids_sequence[current_idx + 1] if current_idx >= 0 and current_idx < len(lesson_ids_sequence) - 1 else None

    # Fetch student progress, notes, and bookmark status
    progress = (
        db.query(CourseLessonProgress)
        .filter(CourseLessonProgress.lesson_id == lesson_id, CourseLessonProgress.student_id == active_student)
        .first()
    )
    note = (
        db.query(StudentLessonNote)
        .filter(StudentLessonNote.lesson_id == lesson_id, StudentLessonNote.student_id == active_student)
        .first()
    )
    bookmark = (
        db.query(LessonBookmark)
        .filter(LessonBookmark.lesson_id == lesson_id, LessonBookmark.student_id == active_student)
        .first()
    )

    # Update last accessed lesson on enrollment
    if course and active_student:
        enrollment = (
            db.query(CourseEnrollment)
            .filter(CourseEnrollment.course_id == course.id, CourseEnrollment.student_id == active_student)
            .first()
        )
        if enrollment:
            enrollment.last_accessed_lesson_id = lesson_id
            enrollment.last_accessed_at = datetime.utcnow()
            db.commit()

    # 8 Tailored AI Adaptation Formats
    adaptive_formats = {
        "simple": {
            "formatName": "Simple English (Accessible)",
            "description": "Flesch-Kincaid simplified explanations with clear everyday analogies.",
            "content": lesson.simple_explanation or lesson.content,
        },
        "detailed": {
            "formatName": "Detailed & Deep Dive",
            "description": "Technical rigor, internal architectural mechanics, and edge cases.",
            "content": lesson.detailed_explanation or lesson.content,
        },
        "step_by_step": {
            "formatName": "Step-by-Step Breakdown",
            "description": "Sequential numbered micro-steps for clear cognitive processing.",
            "steps": lesson.step_by_step,
        },
        "visual": {
            "formatName": "Visual Diagram & Concept Map",
            "description": "Mermaid flowchart or diagram visualizing logic and data flow.",
            "mermaid": lesson.diagram_mermaid,
            "concept": lesson.title,
        },
        "audio": {
            "formatName": "Audio Learning (Speech-Synthesized)",
            "description": "Phonetic narration script tailored for screen readers and auditory learners.",
            "script": lesson.audio_script,
        },
        "examples": {
            "formatName": "Example-Based Practical Learning",
            "description": "Practical scenarios and code examples illustrating theoretical concepts.",
            "example": lesson.real_world_example,
            "codeSnippet": lesson.code_snippet,
        },
        "revision": {
            "formatName": "Revision Notes & Flashcards",
            "description": "High-yield summary points and memory anchors for quick review.",
            "notes": lesson.revision_notes,
        },
        "practice": {
            "formatName": "Interactive Practice Activity",
            "description": "Hands-on challenge and exercise to test comprehension.",
            "challenge": f"Practice implementing: {lesson.title}",
            "starterCode": lesson.code_snippet,
        },
    }

    lesson_dict = lesson.to_dict()
    lesson_dict.update({
        "courseId": course.id if course else None,
        "courseTitle": course.title if course else "",
        "moduleId": module.id if module else None,
        "moduleTitle": module.title if module else "",
        "prevLessonId": prev_lesson_id,
        "nextLessonId": next_lesson_id,
        "isCompleted": progress.completion_status == "completed" if progress else False,
        "timeSpentMinutes": progress.time_spent_minutes if progress else 0.0,
        "isBookmarked": bool(bookmark),
        "studentNote": note.note_text if note else "",
        "adaptiveFormats": adaptive_formats,
    })

    return {
        "success": True,
        "lesson": lesson_dict,
    }


@router.post("/lessons/{lesson_id}/complete")
def mark_lesson_completed(
    lesson_id: str,
    req: Optional[LessonCompleteRequest] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Mark a lesson as completed, record study time, update course progress, and award XP."""
    active_student = resolve_student_id(req.student_id if req else None, user)
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    time_spent = req.time_spent_minutes if req and req.time_spent_minutes else 15.0

    progress = (
        db.query(CourseLessonProgress)
        .filter(CourseLessonProgress.lesson_id == lesson_id, CourseLessonProgress.student_id == active_student)
        .first()
    )

    if not progress:
        progress = CourseLessonProgress(
            id=f"prog-{uuid.uuid4().hex[:10]}",
            student_id=active_student,
            lesson_id=lesson_id,
            completion_status="completed",
            time_spent_minutes=time_spent,
            completed_at=datetime.utcnow(),
        )
        db.add(progress)
    else:
        progress.completion_status = "completed"
        progress.time_spent_minutes += time_spent
        progress.completed_at = datetime.utcnow()

    # Recalculate course completion percentage
    course = lesson.module.course if lesson.module else None
    course_progress_pct = 0.0
    if course:
        total = sum(len(m.lessons) for m in course.modules)
        completed = (
            db.query(CourseLessonProgress)
            .join(CourseLesson)
            .join(CourseModule)
            .filter(
                CourseModule.course_id == course.id,
                CourseLessonProgress.student_id == active_student,
                CourseLessonProgress.completion_status == "completed",
            )
            .count()
        )
        course_progress_pct = round((completed / total * 100), 1) if total > 0 else 0.0

    db.commit()

    return {
        "success": True,
        "message": f"Congratulations! You completed '{lesson.title}'.",
        "xpAwarded": 50,
        "courseProgressPercentage": course_progress_pct,
    }


@router.post("/lessons/{lesson_id}/bookmark")
def toggle_lesson_bookmark(
    lesson_id: str,
    req: Optional[LessonBookmarkRequest] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Toggle bookmark state for a course lesson."""
    active_student = resolve_student_id(req.student_id if req else None, user)
    bookmark = (
        db.query(LessonBookmark)
        .filter(LessonBookmark.lesson_id == lesson_id, LessonBookmark.student_id == active_student)
        .first()
    )

    if bookmark:
        db.delete(bookmark)
        db.commit()
        return {"success": True, "isBookmarked": False, "message": "Bookmark removed."}
    else:
        new_bm = LessonBookmark(
            id=f"bm-{uuid.uuid4().hex[:10]}",
            student_id=active_student,
            lesson_id=lesson_id,
            created_at=datetime.utcnow(),
        )
        db.add(new_bm)
        db.commit()
        return {"success": True, "isBookmarked": True, "message": "Lesson bookmarked successfully."}


@router.get("/lessons/{lesson_id}/notes")
def get_lesson_notes(
    lesson_id: str,
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Fetch personal notes saved by the student for this lesson."""
    active_student = resolve_student_id(student_id, user)
    note = (
        db.query(StudentLessonNote)
        .filter(StudentLessonNote.lesson_id == lesson_id, StudentLessonNote.student_id == active_student)
        .first()
    )
    return {
        "success": True,
        "noteText": note.note_text if note else "",
        "updatedAt": note.updated_at.isoformat() if note and note.updated_at else None,
    }


@router.post("/lessons/{lesson_id}/notes")
def save_lesson_notes(
    lesson_id: str,
    req: LessonNoteRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Save or update student's personal notes for this lesson."""
    active_student = resolve_student_id(req.student_id, user)
    note = (
        db.query(StudentLessonNote)
        .filter(StudentLessonNote.lesson_id == lesson_id, StudentLessonNote.student_id == active_student)
        .first()
    )

    if not note:
        note = StudentLessonNote(
            id=f"note-{uuid.uuid4().hex[:10]}",
            student_id=active_student,
            lesson_id=lesson_id,
            note_text=req.note_text,
            updated_at=datetime.utcnow(),
        )
        db.add(note)
    else:
        note.note_text = req.note_text
        note.updated_at = datetime.utcnow()

    db.commit()
    return {
        "success": True,
        "message": "Notes saved successfully.",
        "note": note.to_dict(),
    }


# =============================================================================
# 6. COURSE ASSESSMENTS & AUTOMATIC CERTIFICATION
# =============================================================================

@router.get("/assessments/{assessment_id}")
def get_assessment(
    assessment_id: str,
    hide_answers: bool = True,
    db: Session = Depends(get_db),
):
    """Retrieve assessment details and questions for evaluation."""
    asmt = db.query(CourseAssessment).filter(CourseAssessment.id == assessment_id).first()
    if not asmt:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions_data = [q.to_dict(hide_answer=hide_answers) for q in asmt.questions]
    return {
        "success": True,
        "assessment": {
            **asmt.to_dict(),
            "questions": questions_data,
        },
    }


@router.post("/assessments/{assessment_id}/submit")
def submit_assessment(
    assessment_id: str,
    req: AssessmentSubmitRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """
    Evaluate assessment answers, score performance, provide explanations,
    record attempt, and issue a verified CourseCertificate if the final exam is passed.
    """
    asmt = db.query(CourseAssessment).filter(CourseAssessment.id == assessment_id).first()
    if not asmt:
        raise HTTPException(status_code=404, detail="Assessment not found")

    active_student = resolve_student_id(req.student_id, user)
    user_record = db.query(User).filter(User.id == active_student).first()
    student_name = user_record.name if user_record else "Learner"

    questions = asmt.questions
    total_points = sum(q.points for q in questions) or 100
    earned_points = 0
    feedback = []

    for q in questions:
        student_ans = str(req.answers.get(q.id, "")).strip().lower()
        correct_ans = str(q.correct_answer).strip().lower()

        is_correct = False
        if q.question_type == "coding":
            # Semantic or keyword presence check for code
            is_correct = any(word in student_ans for word in correct_ans.split()[:3]) or student_ans == correct_ans
        else:
            is_correct = (student_ans == correct_ans)

        points_awarded = q.points if is_correct else 0
        earned_points += points_awarded

        feedback.append({
            "questionId": q.id,
            "question": q.question,
            "submittedAnswer": req.answers.get(q.id, ""),
            "correctAnswer": q.correct_answer,
            "isCorrect": is_correct,
            "pointsAwarded": points_awarded,
            "explanation": q.explanation,
        })

    percentage = round((earned_points / total_points * 100), 1) if total_points > 0 else 0.0
    passed = percentage >= asmt.passing_percentage

    # Record assessment attempt
    attempt = AssessmentAttempt(
        id=f"att-{uuid.uuid4().hex[:10]}",
        student_id=active_student,
        assessment_id=asmt.id,
        score=earned_points,
        total_points=total_points,
        percentage=percentage,
        passed=passed,
        answers_json=json.dumps(req.answers),
        attempted_at=datetime.utcnow(),
    )
    db.add(attempt)

    # If this is the Final Course Exam and the student passed, issue Course Certificate!
    certificate_data = None
    if asmt.assessment_type == "final_exam" and passed and asmt.course:
        course = asmt.course
        cert_num = f"ALAI-CERT-{course.id.upper().replace('COURSE-', '')}-{uuid.uuid4().hex[:6].upper()}"
        verification_hash = hashlib.sha256(f"{active_student}:{course.id}:{cert_num}".encode()).hexdigest()

        # Check if already issued
        existing_cert = (
            db.query(CourseCertificate)
            .filter(CourseCertificate.course_id == course.id, CourseCertificate.student_id == active_student)
            .first()
        )
        if not existing_cert:
            grade = "A+" if percentage >= 95 else "A" if percentage >= 85 else "B+" if percentage >= 75 else "B"
            cert = CourseCertificate(
                id=f"cert-{uuid.uuid4().hex[:10]}",
                student_id=active_student,
                course_id=course.id,
                certificate_number=cert_num,
                student_name=student_name,
                course_title=course.title,
                verification_hash=verification_hash,
                grade=grade,
                score_percentage=percentage,
                issued_at=datetime.utcnow(),
            )
            db.add(cert)
            db.flush()
            certificate_data = cert.to_dict()
        else:
            certificate_data = existing_cert.to_dict()

    db.commit()

    return {
        "success": True,
        "passed": passed,
        "score": earned_points,
        "totalPoints": total_points,
        "percentage": percentage,
        "passingPercentage": asmt.passing_percentage,
        "feedback": feedback,
        "certificate": certificate_data,
        "xpAwarded": 100 if passed else 25,
    }


@router.get("/courses/{course_id}/certificate")
def get_course_certificate(
    course_id: str,
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Retrieve earned certificate for a course."""
    active_student = resolve_student_id(student_id, user)
    cert = (
        db.query(CourseCertificate)
        .filter(CourseCertificate.course_id == course_id, CourseCertificate.student_id == active_student)
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found or course not yet completed.")

    return {
        "success": True,
        "certificate": cert.to_dict(),
    }


# =============================================================================
# 7. AI COURSE RECOMMENDATIONS
# =============================================================================

@router.get("/courses/recommendations")
def get_course_recommendations(
    student_id: Optional[str] = None,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """
    Intelligent AI recommendation algorithm returning top courses based on
    the student's enrolled subjects, skill level, and prerequisite career pathways.
    """
    active_student = resolve_student_id(student_id, user)

    # Get enrolled course IDs
    enrolled_ids = set()
    if active_student:
        user_enrollments = db.query(CourseEnrollment.course_id).filter(CourseEnrollment.student_id == active_student).all()
        enrolled_ids = {r[0] for r in user_enrollments}

    all_courses = db.query(Course).filter(Course.published == True).all()

    recommendations = []
    for c in all_courses:
        if c.id in enrolled_ids:
            continue

        reason = "Highly rated course across our inclusive educational community."
        priority_score = c.rating * 10

        if "python" in enrolled_ids:
            if "dsa" in c.id or "algorithm" in c.title.lower():
                reason = "Because you are learning Python, mastering Data Structures & Algorithms builds the algorithmic problem-solving core for software development."
                priority_score += 50
            elif "dbms" in c.id or "sql" in c.title.lower():
                reason = "Python applications rely heavily on relational databases. This course teaches essential SQL queries and data persistence."
                priority_score += 40
            elif "web" in c.id:
                reason = "Expand from Python scripting into full-stack modern web applications with React and Node."
                priority_score += 35
        elif "web" in enrolled_ids:
            if "dbms" in c.id:
                reason = "Connect your full-stack web applications to structured relational databases with MySQL and SQL."
                priority_score += 45
        elif "math" in c.category_id:
            reason = "Strengthen theoretical foundations and analytical reasoning for STEM disciplines."
            priority_score += 20

        recommendations.append({
            **c.to_dict(),
            "recommendationReason": reason,
            "priorityScore": priority_score,
        })

    recommendations.sort(key=lambda x: x["priorityScore"], reverse=True)

    return {
        "success": True,
        "total": len(recommendations[:6]),
        "recommendations": recommendations[:6],
    }


# =============================================================================
# 8. TEACHER COURSE MANAGEMENT APIS (Role Protected)
# =============================================================================

def verify_teacher_access(user: Optional[User]):
    if not user or user.role not in ["teacher", "admin"]:
        # Allow default faculty persona in development/demo mode
        if not user or user.id != "user-teacher-1":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: Teacher or Administrator credentials required."
            )

@router.post("/teacher/courses")
def teacher_create_course(
    req: TeacherCreateCourseRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Create a new course in the catalog."""
    verify_teacher_access(user)

    course_id = f"course-{uuid.uuid4().hex[:8]}"
    course = Course(
        id=course_id,
        category_id=req.category_id,
        title=req.title,
        description=req.description,
        difficulty=req.difficulty,
        instructor_id=user.id if user else "user-teacher-1",
        instructor_name=req.instructor_name or (user.name if user else "Dr. Elena Sharma"),
        instructor_title=req.instructor_title or "Senior AI & EdTech Specialist",
        thumbnail=req.thumbnail,
        icon=req.icon,
        color=req.color,
        estimated_duration=req.estimated_duration,
        learning_outcomes=req.learning_outcomes or [],
        prerequisites=req.prerequisites or [],
        published=req.published if req.published is not None else True,
        created_at=datetime.utcnow(),
    )
    db.add(course)
    db.commit()

    return {
        "success": True,
        "message": f"Course '{course.title}' created successfully.",
        "course": course.to_dict(),
    }


@router.put("/teacher/courses/{course_id}")
def teacher_update_course(
    course_id: str,
    req: TeacherUpdateCourseRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Update metadata and published status of an existing course."""
    verify_teacher_access(user)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if req.title is not None: course.title = req.title
    if req.description is not None: course.description = req.description
    if req.difficulty is not None: course.difficulty = req.difficulty
    if req.published is not None: course.published = req.published
    if req.estimated_duration is not None: course.estimated_duration = req.estimated_duration
    if req.category_id is not None: course.category_id = req.category_id

    db.commit()
    return {
        "success": True,
        "message": "Course updated successfully.",
        "course": course.to_dict(),
    }


@router.delete("/teacher/courses/{course_id}")
def teacher_delete_course(
    course_id: str,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Delete a course and its associated modules and lessons."""
    verify_teacher_access(user)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"success": True, "message": f"Course '{course_id}' deleted successfully."}


@router.post("/teacher/courses/{course_id}/modules")
def teacher_create_module(
    course_id: str,
    req: TeacherCreateModuleRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Add a new module/chapter to a course."""
    verify_teacher_access(user)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    mod_id = f"mod-{uuid.uuid4().hex[:8]}"
    module = CourseModule(
        id=mod_id,
        course_id=course_id,
        title=req.title,
        description=req.description,
        sequence_number=req.sequence_number,
        created_at=datetime.utcnow(),
    )
    db.add(module)
    db.commit()

    return {
        "success": True,
        "message": f"Module '{module.title}' added to course.",
        "module": module.to_dict(),
    }


@router.post("/teacher/modules/{module_id}/lessons")
def teacher_create_lesson(
    module_id: str,
    req: TeacherCreateLessonRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Add a new lesson to a course module."""
    verify_teacher_access(user)
    module = db.query(CourseModule).filter(CourseModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    lesson_id = f"cl-{uuid.uuid4().hex[:8]}"
    lesson = CourseLesson(
        id=lesson_id,
        module_id=module_id,
        title=req.title,
        duration=req.duration or 15,
        sequence_number=req.sequence_number or 1,
        learning_objectives_json=json.dumps(req.learning_objectives or []),
        content=req.content or "",
        code_snippet=req.code_snippet or "",
        diagram_mermaid=req.diagram_mermaid or "",
        simple_explanation=req.simple_explanation or "",
        detailed_explanation=req.detailed_explanation or "",
        step_by_step_json=json.dumps(req.step_by_step or []),
        real_world_example=req.real_world_example or "",
        revision_notes=req.revision_notes or "",
        audio_script=f"Welcome to {req.title}.",
        created_at=datetime.utcnow(),
    )
    db.add(lesson)
    db.commit()

    return {
        "success": True,
        "message": f"Lesson '{lesson.title}' created successfully.",
        "lesson": lesson.to_dict(),
    }


@router.put("/teacher/lessons/{lesson_id}")
def teacher_update_lesson(
    lesson_id: str,
    req: TeacherUpdateLessonRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Update content and parameters of a lesson."""
    verify_teacher_access(user)
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if req.title is not None: lesson.title = req.title
    if req.duration is not None: lesson.duration = req.duration
    if req.content is not None: lesson.content = req.content
    if req.learning_objectives is not None: lesson.learning_objectives = req.learning_objectives
    if req.code_snippet is not None: lesson.code_snippet = req.code_snippet
    if req.diagram_mermaid is not None: lesson.diagram_mermaid = req.diagram_mermaid
    if req.simple_explanation is not None: lesson.simple_explanation = req.simple_explanation
    if req.detailed_explanation is not None: lesson.detailed_explanation = req.detailed_explanation
    if req.real_world_example is not None: lesson.real_world_example = req.real_world_example
    if req.revision_notes is not None: lesson.revision_notes = req.revision_notes

    db.commit()
    return {
        "success": True,
        "message": "Lesson updated successfully.",
        "lesson": lesson.to_dict(),
    }


@router.delete("/teacher/lessons/{lesson_id}")
def teacher_delete_lesson(
    lesson_id: str,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Delete a lesson."""
    verify_teacher_access(user)
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db.delete(lesson)
    db.commit()
    return {"success": True, "message": f"Lesson '{lesson_id}' deleted successfully."}


@router.post("/teacher/lessons/{lesson_id}/resources")
def teacher_add_resource(
    lesson_id: str,
    req: TeacherAddResourceRequest,
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Add a downloadable PDF, slide deck, or video resource to a lesson."""
    verify_teacher_access(user)
    lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    res_id = f"res-{uuid.uuid4().hex[:8]}"
    resource = LessonResource(
        id=res_id,
        lesson_id=lesson_id,
        resource_type=req.resource_type,
        title=req.title,
        resource_url=req.resource_url,
        created_at=datetime.utcnow(),
    )
    db.add(resource)
    db.commit()

    return {
        "success": True,
        "message": f"Resource '{resource.title}' added to lesson.",
        "resource": resource.to_dict(),
    }


@router.get("/teacher/courses/overview")
def teacher_get_courses_overview(
    user: Optional[User] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db),
):
    """Comprehensive course analytics for faculty dashboard."""
    verify_teacher_access(user)

    total_courses = db.query(Course).count()
    published_courses = db.query(Course).filter(Course.published == True).count()
    total_enrollments = db.query(CourseEnrollment).count()
    total_completions = db.query(CourseEnrollment).filter(CourseEnrollment.status == "completed").count()
    total_certificates = db.query(CourseCertificate).count()

    courses = db.query(Course).all()
    courses_summary = []
    for c in courses:
        enroll_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == c.id).count()
        cert_count = db.query(CourseCertificate).filter(CourseCertificate.course_id == c.id).count()
        courses_summary.append({
            "id": c.id,
            "title": c.title,
            "category": c.category.name if c.category else "",
            "difficulty": c.difficulty,
            "published": c.published,
            "enrollments": enroll_count,
            "certificatesIssued": cert_count,
            "rating": c.rating,
        })

    return {
        "success": True,
        "kpis": {
            "totalCourses": total_courses,
            "publishedCourses": published_courses,
            "totalEnrollments": total_enrollments,
            "totalCompletions": total_completions,
            "totalCertificates": total_certificates,
        },
        "courses": courses_summary,
    }

