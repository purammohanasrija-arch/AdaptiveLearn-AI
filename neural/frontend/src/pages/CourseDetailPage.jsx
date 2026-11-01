import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Sparkles,
  Layers,
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);

  const studentId = user ? user.id : 'user-student-a';

  useEffect(() => {
    loadCourseDetails();
  }, [courseId, studentId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getCourseById(courseId, studentId);
      if (res.course) {
        setCourse(res.course);
        // Expand first module by default
        if (res.course.modules && res.course.modules.length > 0) {
          setExpandedModules({ [res.course.modules[0].id]: true });
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
      showToast('Course not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (modId) => {
    playChime('click');
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleEnroll = async () => {
    playChime('click');
    setEnrolling(true);
    try {
      const res = await api.enrollInCourse(courseId, studentId);
      showToast(res.message || 'Enrolled in course!', 'success');
      playChime('celebration');
      await loadCourseDetails();
      if (res.firstLessonId) {
        navigate(`/courses/${courseId}/learn/${res.firstLessonId}`);
      }
    } catch (err) {
      showToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId) => {
    playChime('click');
    navigate(`/courses/${courseId}/learn/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading course syllabus and resources...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested course could not be located in our catalog.</p>
        <button onClick={() => navigate('/courses')} className="btn btn-primary">
          Browse Courses
        </button>
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;
  const progressPct = course.progressPercentage || 0.0;
  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
  const resumeLessonId = course.lastAccessedLessonId || firstLessonId;

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/courses')}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem', border: 'none', background: 'transparent', padding: '0.4rem 0' }}
        >
          <ArrowLeft size={16} /> Back to Course Library
        </button>
      </div>

      {/* Main Layout: 2 Columns on Desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Course Overview, Outcomes, Syllabus */}
        <div>
          {/* Hero Header */}
          <div
            className="card"
            style={{
              padding: '2.5rem',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(232, 59, 100, 0.1)', color: 'var(--primary)', fontWeight: 700 }}>
                {course.categoryName}
              </span>
              <span className="badge" style={{ background: 'var(--bg-subtle)' }}>
                {course.difficulty} Level
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} /> {course.estimatedDuration}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <strong>{course.rating}</strong> ({course.ratingCount} reviews)
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', fontWeight: 800, margin: '0 0 1rem', color: 'var(--text-main)', lineHeight: 1.25 }}>
              {course.title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              {course.description}
            </p>

            {/* Instructor Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                👩🏻‍🏫
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{course.instructorName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.instructorTitle}</div>
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div
              className="card"
              style={{
                padding: '2rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                marginBottom: '2rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--text-main)' }}>
                What You Will Master in This Course
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Course Syllabus Accordion */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                  Course Curriculum & Syllabus
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {course.moduleCount} Chapters &bull; {course.lessonCount} Structured Lessons &bull; Interactive Quizzes
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {course.modules && course.modules.map((mod, modIdx) => {
                const isExpanded = expandedModules[mod.id];
                return (
                  <div
                    key={mod.id}
                    className="card"
                    style={{
                      padding: 0,
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Module Accordion Header */}
                    <div
                      onClick={() => toggleModule(mod.id)}
                      style={{
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isExpanded ? 'var(--bg-subtle, rgba(0,0,0,0.02))' : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: 'rgba(232, 59, 100, 0.1)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {modIdx + 1}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {mod.title}
                          </h3>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {mod.description || `${mod.lessons?.length || 0} lessons`}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {mod.lessons?.length || 0} Lessons
                        </span>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Module Lessons List */}
                    {isExpanded && (
                      <div style={{ padding: '0.5rem 1.5rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {mod.lessons && mod.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              onClick={() => handleStartLesson(lesson.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              className="nav-item"
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {lesson.isCompleted ? (
                                  <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                                ) : (
                                  <Play size={16} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                                )}
                                <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {lesson.title}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Lesson {modIdx + 1}.{lIdx + 1} &bull; {lesson.duration || 15} mins
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartLesson(lesson.id);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                              >
                                {lesson.isCompleted ? 'Review' : 'Start'}
                              </button>
                            </div>
                          ))}

                          {/* Module Quiz Card */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1rem',
                              borderRadius: '12px',
                              background: 'rgba(232, 59, 100, 0.05)',
                              border: '1px dashed var(--primary)',
                              marginTop: '0.5rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Award size={18} style={{ color: 'var(--primary)' }} />
                              <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>
                                  {mod.title} - Knowledge Quiz
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  20 Marks &bull; 70% passing grade
                                </div>
                              </div>
                            </div>
                            <span className="badge" style={{ fontSize: '0.72rem', background: 'var(--primary)', color: '#FFFFFF' }}>
                              Quiz
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Enrollment Card, Progress & Certificate */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              boxShadow: '0 12px 35px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Visual Thumbnail */}
            <div
              style={{
                height: '140px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${course.color || '#E83B64'} 0%, #1E293B 100%)`,
                padding: '1.5rem',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <span className="badge" style={{ background: 'rgba(0,0,0,0.3)', color: '#FFFFFF', alignSelf: 'flex-start' }}>
                {course.difficulty}
              </span>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>AdaptiveLearn AI</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Interactive Course Series</div>
              </div>
            </div>

            {/* Progress or Free Badge */}
            {isEnrolled ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700 }}>Your Progress</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{progressPct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #10B981 100%)', borderRadius: '4px' }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  {course.completedLessons} of {course.lessonCount} lessons completed
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>100% Free</span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sponsored by Inclusive EdTech &bull; No credit card required
                </p>
              </div>
            )}

            {/* Main Action Button */}
            {isEnrolled ? (
              <button
                onClick={() => {
                  playChime('click');
                  navigate(`/courses/${courseId}/learn/${resumeLessonId}`);
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem', gap: '0.5rem' }}
              >
                <Play size={16} /> Resume Learning &rarr;
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem' }}
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course &rarr;'}
              </button>
            )}

            {/* Quick Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} style={{ color: '#10B981' }} />
                <span>8 Sensory Adaptive Learning Formats</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} style={{ color: '#10B981' }} />
                <span>AI Socratic Tutor Assistance 24/7</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} style={{ color: '#10B981' }} />
                <span>Verified Certificate on Completion</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} style={{ color: '#10B981' }} />
                <span>WCAG 2.2 Accessible Screen Reader Support</span>
              </div>
            </div>

            {/* Certificate Preview Card if Earned */}
            {course.certificate && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid #10B981',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>🎓</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10B981' }}>Course Certificate Earned!</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem' }}>
                  {course.certificate.certificateNumber} &bull; Grade: {course.certificate.grade}
                </div>
                <button
                  onClick={() => {
                    playChime('click');
                    navigate('/passport');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '0.78rem' }}
                >
                  View in Achievement Passport &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;

