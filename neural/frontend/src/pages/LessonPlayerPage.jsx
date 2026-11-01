import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Share2,
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  FileText,
  Sliders,
  Check,
  RotateCcw,
  Code,
  Eye,
  ListOrdered,
  FileQuestion,
  Lightbulb,
  ExternalLink,
  Save,
  MessageSquare,
} from 'lucide-react';

export const LessonPlayerPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    playChime,
    speakText,
    stopSpeech,
    isSpeaking,
    isPaused,
    pauseSpeech,
    resumeSpeech,
    speechRate,
    setSpeechRate,
    dyslexicFont,
    setDyslexicFont,
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
  } = useAccessibility();
  const { showToast } = useToast();

  const studentId = user ? user.id : 'user-student-a';

  // Course & Lesson State
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active AI Adaptation Mode: 'original' | 'simple' | 'detailed' | 'step_by_step' | 'visual' | 'audio' | 'examples' | 'revision' | 'practice'
  const [activeFormat, setActiveFormat] = useState('original');

  // Student Interaction State
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [studentNote, setStudentNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Right Sidebar Tab: 'tutor' | 'notes' | 'quiz' | 'accessibility'
  const [rightTab, setRightTab] = useState('tutor');

  // AI Socratic Tutor State
  const [tutorMessages, setTutorMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm Aria, your Adaptive AI Tutor. Ask me any question about this lesson, or pick a suggested prompt below!",
    },
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorThinking, setTutorThinking] = useState(false);

  // Post-Lesson Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [hintsVisible, setHintsVisible] = useState({});

  // Reading progress scroll tracker
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    loadLessonAndCourse();
  }, [courseId, lessonId, studentId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadLessonAndCourse = async () => {
    try {
      setLoading(true);
      const [courseRes, modulesRes, lessonRes] = await Promise.all([
        api.getCourseById(courseId, studentId),
        api.getCourseModules(courseId, studentId),
        api.getCourseLesson(lessonId, studentId),
      ]);

      if (courseRes.course) setCourse(courseRes.course);
      if (modulesRes.modules) setModules(modulesRes.modules);
      if (lessonRes.lesson) {
        const l = lessonRes.lesson;
        setLesson(l);
        setIsCompleted(l.isCompleted || false);
        setIsBookmarked(l.isBookmarked || false);
        setStudentNote(l.studentNote || '');

        // Generate dynamic interactive quiz questions for this lesson
        setQuizQuestions([
          {
            id: 'lq-1',
            question: `What is the core learning objective of ${l.title}?`,
            type: 'multiple_choice',
            options: [
              l.learningObjectives?.[0] || 'Understand foundational mechanics',
              'Memorize obsolete legacy commands',
              'Avoid practical hands-on application',
              'Skip syntax validation',
            ],
            correct: l.learningObjectives?.[0] || 'Understand foundational mechanics',
            explanation: `The primary objective is: ${l.learningObjectives?.[0] || 'mastering core mechanics'}.`,
            hint: 'Review the learning objectives checklist at the top of the lesson.',
          },
          {
            id: 'lq-2',
            question: `True or False: ${l.title} provides structured, reproducible results across platforms.`,
            type: 'true_false',
            options: ['True', 'False'],
            correct: 'True',
            explanation: 'Modern computer science and inclusive education standards guarantee cross-platform consistency.',
            hint: 'Recall the portability and design philosophy discussed.',
          },
        ]);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
      showToast('Error loading lesson', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    playChime('celebration');
    try {
      const res = await api.completeCourseLesson(lessonId, studentId, 15.0);
      setIsCompleted(true);
      showToast(res.message || 'Lesson marked completed! +50 XP', 'success');
      // If there is a next lesson, prompt user
      if (lesson?.nextLessonId) {
        setTimeout(() => {
          navigate(`/courses/${courseId}/learn/${lesson.nextLessonId}`);
        }, 1200);
      }
    } catch (err) {
      showToast(err.message || 'Failed to complete lesson', 'error');
    }
  };

  const handleToggleBookmark = async () => {
    playChime('click');
    try {
      const res = await api.toggleLessonBookmark(lessonId, studentId);
      setIsBookmarked(res.isBookmarked);
      showToast(res.message, 'info');
    } catch (err) {
      showToast('Failed to toggle bookmark', 'error');
    }
  };

  const handleSaveNotes = async () => {
    playChime('click');
    try {
      await api.saveLessonNotes(lessonId, studentNote, studentId);
      setNoteSaved(true);
      showToast('Notes saved successfully!', 'success');
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      showToast('Failed to save notes', 'error');
    }
  };

  const handleDownloadNotes = () => {
    playChime('click');
    const blob = new Blob([studentNote || `Notes for: ${lesson?.title}\n\n${lesson?.revisionNotes}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lesson?.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.txt`;
    link.click();
    showToast('Downloaded study notes file', 'success');
  };

  // AI Socratic Tutor Submission
  const handleTutorSubmit = async (promptText) => {
    const textToSend = promptText || tutorInput;
    if (!textToSend.trim()) return;

    playChime('click');
    const newMessages = [...tutorMessages, { role: 'user', text: textToSend }];
    setTutorMessages(newMessages);
    setTutorInput('');
    setTutorThinking(true);

    try {
      const res = await api.tutorChat(
        textToSend,
        `Course: ${course?.title}, Lesson: ${lesson?.title}. Summary: ${lesson?.simpleExplanation}`,
        user?.profile || {},
        'simple'
      );
      setTutorMessages([...newMessages, { role: 'assistant', text: res.response || "Here's how to think about this..." }]);
      playChime('chime');
    } catch (err) {
      // Fallback response grounded in current lesson
      setTimeout(() => {
        setTutorMessages([
          ...newMessages,
          {
            role: 'assistant',
            text: `Great question regarding **${lesson?.title}**! In simple terms: ${lesson?.simpleExplanation}\n\n💡 **Key Takeaway**: ${lesson?.realWorldExample || 'Apply this pattern step by step.'}`,
          },
        ]);
        playChime('chime');
        setTutorThinking(false);
      }, 700);
      return;
    } finally {
      setTutorThinking(false);
    }
  };

  // Quiz Handling
  const handleQuizAnswer = (qId, option) => {
    playChime('click');
    setQuizAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    playChime('click');
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correctCount += 1;
    });
    const pct = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizScore({ score: correctCount, total: quizQuestions.length, percentage: pct });
    setQuizSubmitted(true);
    if (pct >= 50) {
      playChime('celebration');
      showToast(`Quiz Passed: ${pct}%! Earned +25 XP`, 'success');
    } else {
      playChime('alert');
      showToast(`Score: ${pct}%. Review the hints and retry!`, 'warning');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Preparing accessible interactive lesson workspace...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Lesson Not Found</h2>
        <button onClick={() => navigate(`/courses/${courseId}`)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)' }}>
      {/* Top Reading Progress Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, height: '4px', background: 'var(--border-color)', width: '100%' }}>
        <div style={{ height: '100%', width: `${readingProgress}%`, background: 'var(--primary)', transition: 'width 0.15s ease' }} />
      </div>

      {/* 3-Column Studio Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', flex: 1, background: 'var(--bg-page)' }}>
        {/* ================================================================= */}
        {/* COLUMN 1: LEFT NAVIGATION SIDEBAR */}
        {/* ================================================================= */}
        <aside
          style={{
            borderRight: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            height: 'calc(100vh - 74px)',
            overflowY: 'auto',
            padding: '1.25rem 1rem',
            position: 'sticky',
            top: '74px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          aria-label="Course Lesson Navigation"
        >
          {/* Course Back Link */}
          <div>
            <Link
              to={`/courses/${courseId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              <ChevronLeft size={14} /> Course Syllabus
            </Link>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1.3 }}>
              {course?.title}
            </h2>
          </div>

          {/* Module Hierarchy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modules.map((mod, modIdx) => (
              <div key={mod.id}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                  Chapter {modIdx + 1}: {mod.title.replace(/Module \d+:\s*/, '')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {mod.lessons && mod.lessons.map((l, lIdx) => {
                    const isCurrent = l.id === lessonId;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          playChime('click');
                          navigate(`/courses/${courseId}/learn/${l.id}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: isCurrent ? 'var(--primary-light, rgba(232, 59, 100, 0.1))' : 'transparent',
                          color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                          fontWeight: isCurrent ? 800 : 500,
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          width: '100%',
                        }}
                      >
                        {l.isCompleted ? (
                          <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                        ) : isCurrent ? (
                          <Play size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--border-color)', flexShrink: 0 }} />
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {l.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ================================================================= */}
        {/* COLUMN 2: MAIN CONTENT & 8 AI ADAPTATIONS */}
        {/* ================================================================= */}
        <main
          style={{
            padding: '2rem 2.5rem 5rem',
            maxWidth: '900px',
            margin: '0 auto',
            width: '100%',
          }}
          aria-label="Interactive Lesson Content"
        >
          {/* Header Bar: Breadcrumb + Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>{lesson.moduleTitle}</span>
              <span>&bull;</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} /> {lesson.duration || 15} mins
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Bookmark Button */}
              <button
                type="button"
                onClick={handleToggleBookmark}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', color: isBookmarked ? 'var(--primary)' : 'inherit' }}
                title="Bookmark Lesson"
              >
                <Bookmark size={15} fill={isBookmarked ? 'var(--primary)' : 'none'} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              {/* Text-To-Speech Listen Button */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    if (isPaused) resumeSpeech();
                    else pauseSpeech();
                  } else {
                    speakText(lesson.simpleExplanation || lesson.content);
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', color: isSpeaking ? 'var(--primary)' : 'inherit' }}
                title="Listen to lesson audio narration"
              >
                {isSpeaking ? (isPaused ? <Play size={15} /> : <Pause size={15} />) : <Volume2 size={15} />}
                <span>{isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}</span>
              </button>

              {/* Mark Completed Button */}
              <button
                type="button"
                onClick={handleMarkComplete}
                className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                style={{ gap: '0.4rem', fontWeight: 700 }}
              >
                <CheckCircle2 size={15} />
                <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>

          {/* Lesson Title */}
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)', fontWeight: 800, margin: '0 0 1.25rem', color: 'var(--text-main)', lineHeight: 1.25 }}>
            {lesson.title}
          </h1>

          {/* =============================================================== */}
          {/* SECTION 6: AI-POWERED LESSON ADAPTATION SWITCHER (8 FORMATS)    */}
          {/* =============================================================== */}
          <div
            className="card"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              marginBottom: '2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>
                Adaptive Learning Mode (8 Modalities)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'original', label: 'Standard Lesson', icon: BookOpen },
                { id: 'simple', label: '1. Simple English', icon: Eye },
                { id: 'detailed', label: '2. Deep Dive', icon: FileText },
                { id: 'step_by_step', label: '3. Step-by-Step', icon: ListOrdered },
                { id: 'visual', label: '4. Visual Mindmap', icon: Lightbulb },
                { id: 'audio', label: '5. Audio Transcript', icon: Volume2 },
                { id: 'examples', label: '6. Examples & Code', icon: Code },
                { id: 'revision', label: '7. Revision Notes', icon: Sparkles },
                { id: 'practice', label: '8. Hands-On Practice', icon: Award },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = activeFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      playChime('click');
                      setActiveFormat(fmt.id);
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={13} />
                    <span>{fmt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Learning Objectives Checklist Card */}
          {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
            <div
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: 'rgba(59, 130, 246, 0.04)',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Key Learning Objectives
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {lesson.learningObjectives.map((obj, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    <span style={{ color: '#3B82F6', fontWeight: 800 }}>&bull;</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ACTIVE CONTENT VIEW BASED ON ADAPTIVE FORMAT                    */}
          {/* =============================================================== */}
          <div className="lesson-body" style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
            {/* 1. ORIGINAL / STANDARD VIEW */}
            {activeFormat === 'original' && (
              <div>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  {lesson.content}
                </p>

                {lesson.simpleExplanation && (
                  <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-subtle)', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem', fontWeight: 800 }}>Plain English Explanation</h4>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>{lesson.simpleExplanation}</p>
                  </div>
                )}

                {lesson.codeSnippet && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E293B', padding: '0.5rem 1rem', borderRadius: '12px 12px 0 0', color: '#94A3B8', fontSize: '0.78rem' }}>
                      <span>Source Code Example</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lesson.codeSnippet);
                          showToast('Code copied to clipboard!', 'success');
                        }}
                        style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Copy
                      </button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '1rem',
                        background: '#0F172A',
                        color: '#E2E8F0',
                        borderRadius: '0 0 12px 12px',
                        overflowX: 'auto',
                        fontSize: '0.88rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      <code>{lesson.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {lesson.realWorldExample && (
                  <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', borderLeft: '4px solid #10B981', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.92rem', fontWeight: 800, color: '#10B981' }}>Real-World Practical Scenario</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{lesson.realWorldExample}</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. SIMPLE ENGLISH ADAPTATION */}
            {activeFormat === 'simple' && (
              <div className="card" style={{ padding: '2rem', borderRadius: '18px', borderLeft: '5px solid var(--primary)' }}>
                <span className="badge" style={{ marginBottom: '1rem' }}>Simplified Readability Mode</span>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>Core Idea in Everyday Language</h3>
                <p style={{ fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  {lesson.simpleExplanation || lesson.content}
                </p>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px' }}>
                  <strong>Everyday Analogy:</strong>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)' }}>{lesson.realWorldExample}</p>
                </div>
              </div>
            )}

            {/* 3. DETAILED DEEP DIVE */}
            {activeFormat === 'detailed' && (
              <div className="card" style={{ padding: '2rem', borderRadius: '18px' }}>
                <span className="badge" style={{ marginBottom: '1rem' }}>Technical Deep Dive</span>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>Architectural Specifications & Rigor</h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  {lesson.detailedExplanation || lesson.content}
                </p>
                {lesson.codeSnippet && (
                  <pre style={{ padding: '1rem', background: '#0F172A', color: '#E2E8F0', borderRadius: '12px', overflowX: 'auto', fontSize: '0.88rem' }}>
                    <code>{lesson.codeSnippet}</code>
                  </pre>
                )}
              </div>
            )}

            {/* 4. STEP-BY-STEP ADAPTATION */}
            {activeFormat === 'step_by_step' && (
              <div>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800 }}>Sequential Step-by-Step Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(lesson.stepByStep || ['Step 1: Core setup', 'Step 2: Execution', 'Step 3: Verification']).map((step, idx) => (
                    <div key={idx} className="card" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ fontSize: '1rem', lineHeight: 1.6, paddingTop: '3px' }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. VISUAL DIAGRAM & CONCEPT MAP */}
            {activeFormat === 'visual' && (
              <div className="card" style={{ padding: '2rem', borderRadius: '18px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>Visual Concept Mindmap</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Visual flow diagram mapping concept interactions:
                </p>
                <div style={{ background: '#0F172A', color: '#38BDF8', padding: '1.5rem', borderRadius: '14px', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.88rem', overflowX: 'auto' }}>
                  <pre style={{ margin: 0 }}>{lesson.diagramMermaid || 'graph TD;\n  Start[Begin Topic] --> Process[Execute Logic] --> Goal[Master Objective];'}</pre>
                </div>
              </div>
            )}

            {/* 6. AUDIO TRANSCRIPT */}
            {activeFormat === 'audio' && (
              <div className="card" style={{ padding: '2rem', borderRadius: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <Volume2 size={24} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Spoken Audio Learning Script</h3>
                </div>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                  {lesson.audioScript || `Welcome to ${lesson.title}. In this lesson, we break down core principles into clear acoustic concepts.`}
                </p>
                <button
                  onClick={() => speakText(lesson.audioScript || lesson.simpleExplanation)}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <Play size={16} /> Play Audio Narration
                </button>
              </div>
            )}

            {/* 7. EXAMPLES & PRACTICAL CODE */}
            {activeFormat === 'examples' && (
              <div>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>Practical Real-World Application</h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {lesson.realWorldExample || 'Learn through tangible examples applied in professional software environments.'}
                </p>
                {lesson.codeSnippet && (
                  <pre style={{ padding: '1rem', background: '#0F172A', color: '#E2E8F0', borderRadius: '12px', overflowX: 'auto' }}>
                    <code>{lesson.codeSnippet}</code>
                  </pre>
                )}
              </div>
            )}

            {/* 8. REVISION NOTES */}
            {activeFormat === 'revision' && (
              <div className="card" style={{ padding: '2rem', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10B981' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>High-Yield Revision Cheat Sheet</h3>
                <div style={{ whiteSpace: 'pre-line', fontSize: '1rem', lineHeight: 1.8 }}>
                  {lesson.revisionNotes || `• Key concept: ${lesson.title}\n• Spaced retention point\n• Practice daily for mastery`}
                </div>
              </div>
            )}

            {/* 9. HANDS-ON PRACTICE */}
            {activeFormat === 'practice' && (
              <div className="card" style={{ padding: '2rem', borderRadius: '18px' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800 }}>Interactive Practice Challenge</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Try writing and testing your own implementation based on this lesson:
                </p>
                <div style={{ background: '#0F172A', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <code style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                    # Challenge: Implement the logic described in {lesson.title}<br />
                    # Open your terminal or Python interpreter and verify your results!
                  </code>
                </div>
                <button onClick={() => setRightTab('quiz')} className="btn btn-primary btn-sm">
                  Take Lesson Knowledge Quiz &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Bottom Lesson Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '2.5rem',
              marginTop: '3rem',
              borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {lesson.prevLessonId ? (
              <button
                type="button"
                onClick={() => {
                  playChime('click');
                  navigate(`/courses/${courseId}/learn/${lesson.prevLessonId}`);
                }}
                className="btn btn-secondary"
                style={{ gap: '0.4rem' }}
              >
                <ChevronLeft size={16} /> Previous Lesson
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleMarkComplete}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.5rem', fontWeight: 800 }}
            >
              <CheckCircle2 size={18} />
              <span>{isCompleted ? 'Next Lesson &rarr;' : 'Mark Completed & Continue &rarr;'}</span>
            </button>

            {lesson.nextLessonId ? (
              <button
                type="button"
                onClick={() => {
                  playChime('click');
                  navigate(`/courses/${courseId}/learn/${lesson.nextLessonId}`);
                }}
                className="btn btn-secondary"
                style={{ gap: '0.4rem' }}
              >
                Next Lesson <ChevronRight size={16} />
              </button>
            ) : (
              <Link to={`/courses/${courseId}`} className="btn btn-secondary">
                Course Syllabus
              </Link>
            )}
          </div>
        </main>

        {/* ================================================================= */}
        {/* COLUMN 3: RIGHT COLLAPSIBLE ASSISTANT (AI TUTOR, NOTES, QUIZ)     */}
        {/* ================================================================= */}
        <aside
          style={{
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            height: 'calc(100vh - 74px)',
            overflowY: 'auto',
            padding: '1.25rem 1rem',
            position: 'sticky',
            top: '74px',
            display: 'flex',
            flexDirection: 'column',
          }}
          aria-label="Interactive Study Assistant"
        >
          {/* Tab Selector Buttons */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
              borderRadius: '12px',
              padding: '0.25rem',
              marginBottom: '1.25rem',
              gap: '0.2rem',
            }}
          >
            {[
              { id: 'tutor', label: 'AI Tutor', icon: Bot },
              { id: 'notes', label: 'My Notes', icon: FileText },
              { id: 'quiz', label: 'Quiz', icon: Award },
              { id: 'accessibility', label: 'A11y', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = rightTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playChime('click');
                    setRightTab(tab.id);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? 'var(--bg-surface)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: AI SOCRATIC TUTOR (ARIA) */}
          {rightTab === 'tutor' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Aria &bull; Socratic Tutor</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Context: {lesson.title}</div>
                  </div>
                </div>

                {/* Chat History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
                  {tutorMessages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        background: msg.role === 'assistant' ? 'var(--bg-subtle, rgba(0,0,0,0.03))' : 'var(--primary-light, rgba(232, 59, 100, 0.1))',
                        color: msg.role === 'assistant' ? 'var(--text-main)' : 'var(--primary)',
                        alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                        maxWidth: '92%',
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {tutorThinking && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Aria is synthesizing explanation...
                    </div>
                  )}
                </div>

                {/* Suggested Prompts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>QUICK QUESTIONS:</span>
                  {[
                    'Explain this simply',
                    'Give me a code example',
                    'What is a real-world analogy?',
                    'Test my understanding',
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTutorSubmit(p)}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        fontSize: '0.74rem',
                        textAlign: 'left',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTutorSubmit();
                }}
                style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}
              >
                <input
                  type="text"
                  placeholder="Ask a doubt..."
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                    fontSize: '0.82rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={tutorThinking || !tutorInput.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 0.85rem', borderRadius: '10px' }}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PERSONAL STUDENT NOTES */}
          {rightTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.85rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', fontWeight: 800 }}>My Lesson Notepad</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Take notes as you read. Notes are automatically saved to your cloud profile.
                </p>
              </div>

              <textarea
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder="Write your key observations, takeaways, or code snippets here..."
                style={{
                  flex: 1,
                  minHeight: '220px',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, gap: '0.35rem', fontWeight: 700 }}
                >
                  <Save size={14} /> {noteSaved ? 'Saved!' : 'Save Notes'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadNotes}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.5rem', gap: '0.3rem' }}
                  title="Download notes as .txt file"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LESSON ASSESSMENT QUIZ */}
          {rightTab === 'quiz' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 800 }}>Quick Lesson Check</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verify your comprehension with instant rubric feedback.
                </p>
              </div>

              {quizScore && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: quizScore.percentage >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${quizScore.percentage >= 50 ? '#10B981' : '#EF4444'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: quizScore.percentage >= 50 ? '#10B981' : '#EF4444' }}>
                    Score: {quizScore.score} / {quizScore.total} ({quizScore.percentage}%)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {quizScore.percentage >= 50 ? 'Well done! Concept mastered.' : 'Review explanations and retry.'}
                  </div>
                </div>
              )}

              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {idx + 1}. {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[q.id] === opt;
                        const isCorrectAnswer = opt === q.correct;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleQuizAnswer(q.id, opt)}
                            style={{
                              padding: '0.5rem 0.65rem',
                              borderRadius: '8px',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                              background: quizSubmitted
                                ? isCorrectAnswer
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : isSelected
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'transparent'
                                : isSelected
                                ? 'var(--primary-light, rgba(232, 59, 100, 0.08))'
                                : 'transparent',
                              color: 'var(--text-main)',
                              fontSize: '0.78rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontWeight: isSelected ? 700 : 500,
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setHintsVisible((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        {hintsVisible[q.id] ? 'Hide Hint' : '💡 Need a Hint?'}
                      </button>
                    </div>
                    {hintsVisible[q.id] && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '0.4rem 0.65rem', borderRadius: '6px' }}>
                        {q.hint}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontWeight: 800, padding: '0.65rem' }}
                >
                  {quizSubmitted ? 'Re-Evaluate Quiz' : 'Submit Answers'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY SHORTCUTS */}
          {rightTab === 'accessibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', fontWeight: 800 }}>Reading & Audio Controls</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tailor visual display and speech narration speed.
                </p>
              </div>

              {/* Text Size */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }}>Font Size</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['normal', 'large', 'xlarge'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => { setTextSize(sz); playChime('click'); }}
                      className={`btn ${textSize === sz ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexia Font Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>OpenDyslexic Font</span>
                <input
                  type="checkbox"
                  checked={dyslexicFont}
                  onChange={(e) => { setDyslexicFont(e.target.checked); playChime('toggle'); }}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                />
              </div>

              {/* High Contrast Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>High Contrast Mode</span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => { setHighContrast(e.target.checked); playChime('toggle'); }}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                />
              </div>

              {/* Speech Rate Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700 }}>Audio Speed</span>
                  <span>{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LessonPlayerPage;

