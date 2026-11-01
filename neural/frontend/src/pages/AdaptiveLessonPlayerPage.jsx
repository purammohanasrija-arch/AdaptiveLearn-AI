import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Eye,
  Sliders,
  Type,
  Bookmark,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Zap,
  Lightbulb,
  Maximize2,
  Save,
  Trash2,
  Cpu,
  Layers,
  HardDrive,
  Split,
  Compass,
  Video,
  Headphones,
  EyeOff,
} from 'lucide-react';
import { LessonVideoPlayer } from '../components/LessonVideoPlayer';
import { InteractiveConceptMindmap } from '../components/InteractiveConceptMindmap';
import { BlindAudioLessonPlayer } from '../components/BlindAudioLessonPlayer';

export const AdaptiveLessonPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, switchDemoUser, activeDemoId } = useAuth();
  const {
    textSize,
    setTextSize,
    dyslexicFont,
    setDyslexicFont,
    lineSpacing,
    setLineSpacing,
    speechRate,
    setSpeechRate,
    isSpeaking,
    isPaused,
    speakText,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    playChime,
    announce,
    primaryModality,
    setPrimaryModality,
  } = useAccessibility();
  const toast = useToast();

  const [lesson, setLesson] = useState(null);
  const [activeFormat, setActiveFormat] = useState('simplified'); // 'simplified' | 'detailed' | 'audio' | 'visual' | 'steps' | 'practice'
  const [activeDifficulty, setActiveDifficulty] = useState('easy');
  const [showOriginalPanel, setShowOriginalPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState('Adaptive Engine');

  // AI Assistant Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState(''); // 'simply' | 'detail' | 'example' | 'summary' | 'practice'
  const [aiContent, setAiContent] = useState(null);

  // Notes and Bookmarks
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await api.getLessonById(id || 'lesson-1');
        setLesson(res.lesson);

        const queryParams = new URLSearchParams(window.location.search);
        const queryTab = queryParams.get('tab');
        if (queryTab && ['simplified', 'detailed', 'audio', 'blind-audio', 'visual', 'video', 'practice'].includes(queryTab)) {
          setActiveFormat(queryTab === 'audio' ? 'blind-audio' : queryTab);
        } else if (primaryModality === 'blind-audio') {
          setActiveFormat('blind-audio');
        } else if (user?.profile?.preferredFormat) {
          setActiveFormat(
            user.profile.preferredFormat === 'detailed'
              ? 'detailed'
              : user.profile.preferredFormat === 'visual'
              ? 'visual'
              : user.profile.preferredFormat === 'audio'
              ? 'blind-audio'
              : 'simplified'
          );
        }
        if (user?.profile?.quizDifficulty) {
          setActiveDifficulty(user.profile.quizDifficulty);
        }

        // Record progress
        await api.updateProgress({
          userId: user?.id,
          lessonId: id || 'lesson-1',
          completionPercentage: 50,
          timeSpentMinutes: 5,
          lastAccessedFormat: user?.profile?.preferredFormat || 'simplified',
          token,
        });
      } catch (err) {
        console.warn('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();

    return () => {
      stopSpeech();
    };
  }, [id, user, token]);

  // Audio Playback
  const handlePlayAudio = () => {
    if (!lesson) return;
    const textToRead =
      activeFormat === 'audio'
        ? lesson.adaptedContent?.audio?.script
        : activeFormat === 'simplified'
        ? lesson.adaptedContent?.simplified?.summary + '. ' + lesson.adaptedContent?.simplified?.sections?.map((s) => s.heading + '. ' + s.bulletPoints.join('. ')).join('. ')
        : activeFormat === 'detailed'
        ? lesson.adaptedContent?.detailed?.deepDive
        : lesson.originalContent?.fullText;

    speakText(textToRead, 'main-lesson');
    playChime('toggle');
  };

  // AI Functional Actions
  const handleTriggerAI = async (actionType) => {
    setAiModalType(actionType);
    setAiModalOpen(true);
    setAiGenerating(true);
    setAiContent(null);
    playChime('hint');

    try {
      if (actionType === 'simply') {
        const res = await api.makeItEasier({
          text: lesson?.originalContent?.summary || lesson?.title,
        });
        setAiContent(res);
      } else if (actionType === 'detail') {
        const res = await api.explainDetailed({
          text: lesson?.originalContent?.fullText || lesson?.title,
          subject: lesson?.subject,
        });
        setAiContent(res);
      } else if (actionType === 'example') {
        const res = await api.giveExample({
          topic: lesson?.topic || lesson?.title,
          concept: lesson?.title,
        });
        setAiContent(res);
      } else if (actionType === 'summary') {
        const res = await api.summarizeLesson({
          text: lesson?.originalContent?.summary,
          subject: lesson?.subject,
        });
        setAiContent(res);
      } else if (actionType === 'practice') {
        const res = await api.generatePracticeQuestions({
          topic: lesson?.topic || lesson?.title,
          difficulty: activeDifficulty,
        });
        setAiContent(res);
      }
      setGenerationSource('Gemini & Adaptive Pipeline');
    } catch (err) {
      console.warn('AI Action error', err);
      setAiContent({
        analogyTitle: 'Friendly Breakdown 🎈',
        explanation: 'Everything in this topic acts like a well-coordinated team where each player has one specific job to do!',
        takeaway: 'Focus on one small piece at a time and it will all make sense!',
      });
      setGenerationSource('Offline Template Fallback');
    } finally {
      setAiGenerating(false);
    }
  };

  // Reset adaptation to default
  const handleResetAdaptation = () => {
    setActiveFormat('simplified');
    setActiveDifficulty('easy');
    setShowOriginalPanel(false);
    stopSpeech();
    playChime('toggle');
    toast.info('Lesson adaptation reset to default simplified mode.');
  };

  // Notes & Bookmark Handlers
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const newNote = { id: Date.now(), text: noteText, date: new Date().toLocaleTimeString() };
    setSavedNotes([...savedNotes, newNote]);
    setNoteText('');
    playChime('success');
    toast.success('Personal note saved!');
  };

  const handleAddBookmark = (title) => {
    const newBmk = { id: Date.now(), title, date: new Date().toLocaleTimeString() };
    setBookmarks([...bookmarks, newBmk]);
    playChime('success');
    toast.success(`Bookmarked section: ${title}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <Sparkles size={36} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Preparing AI Adaptive Learning Studio...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Lesson Not Found</h2>
        <Link to="/lessons" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Lessons Library
        </Link>
      </div>
    );
  }

  return (
    <div className="adaptive-studio-page" style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Navigation Breadcrumbs & Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Link
            to="/lessons"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>All Lessons</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Toggle Split View (Original vs Adapted) */}
            <button
              onClick={() => {
                setShowOriginalPanel(!showOriginalPanel);
                playChime('toggle');
              }}
              className={`btn btn-sm ${showOriginalPanel ? 'btn-primary' : 'btn-secondary'}`}
              title="Toggle side-by-side view with original curriculum text"
            >
              <Split size={16} />
              <span>{showOriginalPanel ? 'Hide Original Panel' : 'Compare with Original'}</span>
            </button>

            <button
              onClick={() => handleAddBookmark(lesson.title)}
              className="btn btn-secondary btn-sm"
              title="Bookmark this lesson"
            >
              <Bookmark size={16} />
              <span className="hide-mobile">Bookmark</span>
            </button>

            <button
              onClick={() => setNotesDrawerOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Open personal notes panel"
            >
              <FileText size={16} />
              <span>Notes ({savedNotes.length})</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace Header Banner */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge">{lesson.subject}</span>
                <span className="badge badge-sky">{lesson.topic}</span>
                <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                  Calibrated Level: {activeDifficulty}
                </span>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                  ⚡ {generationSource}
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.3 }}>
                {lesson.title}
              </h1>
            </div>

            {/* Persona Switcher & Quiz Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {activeDemoId ? (
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Demo:</span>
                  <button
                    onClick={() => {
                      switchDemoUser('learner-a');
                      setActiveFormat('simplified');
                      playChime('toggle');
                    }}
                    className={`btn btn-sm ${activeDemoId === 'learner-a' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', minHeight: '28px' }}
                  >
                    👦🏽 Aarav
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('learner-b');
                      setActiveFormat('visual');
                      playChime('toggle');
                    }}
                    className={`btn btn-sm ${activeDemoId === 'learner-b' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', minHeight: '28px' }}
                  >
                    👧🏻 Maya
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                }}>
                  <span>{user ? user.avatar || '🎓' : '👤'}</span>
                  <span>{user ? user.name : 'Guest Learner'}</span>
                </div>
              )}

              <button
                onClick={() => {
                  playChime('click');
                  navigate(`/quiz/${lesson.id}`);
                }}
                className="btn btn-primary"
                style={{ boxShadow: '0 4px 12px var(--primary-glow)' }}
              >
                <CheckCircle2 size={18} />
                <span>Take Lesson Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY DUAL LEARNER PATHWAY SELECTOR */}
        {/* "For those who have eyes, they will see the videos, and those who don't have eyes, they will listen the learning part." */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary shimmer-badge" style={{ fontSize: '0.78rem' }}>
                ⭐ Sensory Inclusion Pathway
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Choose your primary sensory modality:
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>
              How would you like to experience this lesson?
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setPrimaryModality('sighted-video');
                setActiveFormat('video');
                playChime('toggle');
                speakText('Sighted and Video Mode activated. Video lecture with closed captions and interactive visual concept maps loaded.');
              }}
              className={`btn btn-lg ${activeFormat === 'video' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: '8px', padding: '0.65rem 1.25rem', fontSize: '0.92rem' }}
              aria-pressed={activeFormat === 'video'}
            >
              <Eye size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, lineHeight: 1.1 }}>👁️ Visual & Video Mode</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>For Sighted Learners • Videos & CC</div>
              </div>
            </button>

            <button
              onClick={() => {
                setPrimaryModality('blind-audio');
                setActiveFormat('blind-audio');
                playChime('toggle');
                speakText('Audio-First blind learner mode activated. Spoken narration, chapter breakdown, and visual scene audio descriptions loaded. Press space to play or pause.');
              }}
              className={`btn btn-lg ${activeFormat === 'blind-audio' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: '8px', padding: '0.65rem 1.25rem', fontSize: '0.92rem' }}
              aria-pressed={activeFormat === 'blind-audio'}
            >
              <Headphones size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, lineHeight: 1.1 }}>🎧 Audio-First (Blind Learner)</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>For Non-Sighted • Spoken Learning & AD</div>
              </div>
            </button>
          </div>
        </div>

        {/* Format Selection Toolbar */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Format Tabs Switcher */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }} role="tablist">
            {[
              { id: 'video', label: '🎥 Video & Captions (Sighted)' },
              { id: 'blind-audio', label: '🎧 Audio Spoken Lecture (Blind/AD)' },
              { id: 'simplified', label: '📖 Simplified Text' },
              { id: 'detailed', label: '🔬 Detailed Deep-Dive' },
              { id: 'visual', label: '👁️ Visual Mindmap Flow' },
              { id: 'practice', label: '✏️ Practice Questions' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeFormat === tab.id}
                onClick={() => {
                  setActiveFormat(tab.id);
                  playChime('toggle');
                  announce(`Switched to ${tab.label}`);
                }}
                className={`btn btn-sm ${activeFormat === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Audio & Font Size Quick Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isSpeaking ? (
              <button
                onClick={handlePlayAudio}
                className="btn btn-secondary btn-sm"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                title="Play Audio Read-Aloud"
              >
                <Play size={16} />
                <span>Read Aloud</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={resumeSpeech}
                className="btn btn-secondary btn-sm"
                title="Resume Audio"
              >
                <Play size={16} />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseSpeech}
                className="btn btn-secondary btn-sm"
                title="Pause Audio"
              >
                <Pause size={16} />
                <span>Pause</span>
              </button>
            )}

            {isSpeaking && (
              <button
                onClick={stopSpeech}
                className="btn btn-subtle btn-sm"
                title="Stop Audio"
              >
                <VolumeX size={16} />
              </button>
            )}

            {/* Font scaling */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', padding: '0.15rem' }}>
              <button
                onClick={() => {
                  if (textSize === 'xlarge') setTextSize('large');
                  else if (textSize === 'large') setTextSize('medium');
                  else setTextSize('normal');
                  playChime('toggle');
                }}
                className="btn btn-sm"
                style={{ padding: '0.2rem 0.5rem', minHeight: '30px', minWidth: '30px' }}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => {
                  if (textSize === 'normal') setTextSize('medium');
                  else if (textSize === 'medium') setTextSize('large');
                  else setTextSize('xlarge');
                  playChime('toggle');
                }}
                className="btn btn-sm"
                style={{ padding: '0.2rem 0.5rem', minHeight: '30px', minWidth: '30px' }}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Functional AI Actions Toolbar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '1.75rem',
          background: 'var(--bg-subtle)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={16} /> AI Studio Actions:
          </span>
          <button
            onClick={() => handleTriggerAI('simply')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            🗣️ Explain Simply
          </button>
          <button
            onClick={() => handleTriggerAI('detail')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            🔬 Explain in More Detail
          </button>
          <button
            onClick={() => handleTriggerAI('example')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            💡 Give an Example
          </button>
          <button
            onClick={() => handleTriggerAI('summary')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            📋 Summarize This Lesson
          </button>
          <button
            onClick={() => handleTriggerAI('practice')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            🎯 Generate Practice Questions
          </button>
          <button
            onClick={handleResetAdaptation}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem', marginLeft: 'auto' }}
            title="Reset adaptation"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Main Split Panels: Original Lesson (Optional) vs. Adapted Lesson */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showOriginalPanel ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* ORIGINAL LESSON PANEL */}
          {showOriginalPanel && (
            <div
              className="card animate-fade-in"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span className="badge" style={{ background: 'var(--bg-card)' }}>
                  📜 Original Baseline Curriculum
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unadapted Textbook Text</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                {lesson.title}
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                {lesson.originalContent?.fullText}
              </p>
            </div>
          )}

          {/* ADAPTED LESSON PANEL */}
          <div className="card" style={{ padding: '2.5rem', minHeight: '420px', lineHeight: 'var(--line-height-root)' }}>
            {/* FORMAT: SIMPLIFIED TEXT */}
            {activeFormat === 'simplified' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span className="badge badge-emerald">
                    <CheckCircle2 size={14} /> Simplified & Chunked for Reading Comfort
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Reading Level: {lesson.adaptedContent?.simplified?.readingLevel || 'Accessible'}
                  </span>
                </div>

                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <span>🌟 Core Idea: {lesson.adaptedContent?.simplified?.summary}</span>
                  <button
                    onClick={() => speakText(`Core idea: ${lesson.adaptedContent?.simplified?.summary}`)}
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0, padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                    title="Read core idea aloud"
                    aria-label="Read core idea aloud"
                  >
                    <Volume2 size={14} />
                    <span>Listen</span>
                  </button>
                </div>

                {lesson.adaptedContent?.simplified?.sections?.map((sec, idx) => (
                  <div key={idx} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {sec.heading}
                      </h2>
                      <button
                        onClick={() => speakText(`${sec.heading}. ${sec.bulletPoints?.join('. ')}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', gap: '4px' }}
                        title="Read this section aloud"
                        aria-label={`Read section ${sec.heading} aloud`}
                      >
                        <Volume2 size={14} style={{ color: 'var(--primary)' }} />
                        <span>Listen</span>
                      </button>
                    </div>

                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                      {sec.bulletPoints?.map((bp, bpIdx) => (
                        <li key={bpIdx} style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                          {bp}
                        </li>
                      ))}
                    </ul>

                    {sec.vocabulary && sec.vocabulary.length > 0 && (
                      <div style={{
                        background: 'var(--bg-subtle)',
                        borderLeft: '4px solid #0284C7',
                        padding: '0.85rem 1.25rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>
                            Vocabulary Word
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sec.vocabulary[0].word}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sec.vocabulary[0].definition}</div>
                        </div>
                        <button
                          onClick={() => speakText(`Vocabulary word: ${sec.vocabulary[0].word}. Definition: ${sec.vocabulary[0].definition}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem', borderRadius: '50%' }}
                          title="Pronounce vocabulary word and definition"
                          aria-label={`Pronounce ${sec.vocabulary[0].word}`}
                        >
                          <Volume2 size={15} style={{ color: '#0284C7' }} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* FORMAT: DETAILED TEXT */}
            {activeFormat === 'detailed' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span className="badge badge-sky">
                    🔬 In-Depth Engineering & Scientific Deep Dive
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Advanced Level Context</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                    Architectural Breakdown
                  </h2>
                  <button
                    onClick={() => speakText(`Architectural breakdown: ${lesson.adaptedContent?.detailed?.deepDive}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                    title="Read deep dive aloud"
                  >
                    <Volume2 size={14} style={{ color: 'var(--primary)' }} />
                    <span>Listen</span>
                  </button>
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {lesson.adaptedContent?.detailed?.deepDive}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Historical Context & Breakthroughs
                  </h3>
                  <button
                    onClick={() => speakText(`Historical context: ${lesson.adaptedContent?.detailed?.historicalContext}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                    title="Read historical context aloud"
                  >
                    <Volume2 size={14} style={{ color: 'var(--primary)' }} />
                    <span>Listen</span>
                  </button>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {lesson.adaptedContent?.detailed?.historicalContext}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Real-World Industry Applications
                  </h3>
                  <button
                    onClick={() => speakText(`Real-world applications: ${lesson.adaptedContent?.detailed?.realWorldApplications?.join('. ')}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                    title="Read applications aloud"
                  >
                    <Volume2 size={14} style={{ color: 'var(--primary)' }} />
                    <span>Listen</span>
                  </button>
                </div>
                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                  {lesson.adaptedContent?.detailed?.realWorldApplications?.map((app, idx) => (
                    <li key={idx} style={{ fontSize: '0.95rem' }}>{app}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* FORMAT: BLIND / AUDIO-FIRST SPOKEN LEARNING SUITE */}
            {(activeFormat === 'blind-audio' || activeFormat === 'audio') && (
              <div className="animate-fade-in">
                <BlindAudioLessonPlayer lesson={lesson} />
              </div>
            )}

            {/* FORMAT: VISUAL LEARNING */}
            {activeFormat === 'visual' && (
              <div className="animate-fade-in">
                {/* Interactive Concept Mindmap & Simulation Flow */}
                <InteractiveConceptMindmap lessonId={lesson.id} lesson={lesson} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span className="badge badge-emerald">
                    <Eye size={14} /> Concept Infographics & Step Flowcharts
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Optimized for visual, dyslexic, and hearing-impaired learners
                  </span>
                </div>

                <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
                  {lesson.adaptedContent?.visual?.conceptCards?.map((card, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '2px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Sparkles size={20} />
                          </div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{card.title}</h3>
                          <button
                            onClick={() => speakText(`${card.title}. ${card.description}. Visual metaphor: ${card.metaphor}`)}
                            className="btn btn-ghost btn-sm"
                            style={{ marginLeft: 'auto', padding: '0.25rem', color: 'var(--primary)' }}
                            title="Read concept card aloud"
                            aria-label={`Read ${card.title} aloud`}
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
                          {card.description}
                        </p>
                      </div>

                      <div style={{
                        background: 'var(--bg-card)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--border-color)',
                        fontSize: '0.85rem',
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Visual Metaphor: </span>
                        <span>{card.metaphor}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {lesson.adaptedContent?.visual?.flowchart && (
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '1.75rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                        Process Flowchart
                      </h3>
                      <button
                        onClick={() => speakText(`Process flowchart: ${lesson.adaptedContent.visual.flowchart.map(s => `Step ${s.step}: ${s.action}. ${s.detail}`).join('. ')}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                        title="Read all flowchart steps aloud"
                      >
                        <Volume2 size={14} style={{ color: 'var(--primary)' }} />
                        <span>Listen to Steps</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {lesson.adaptedContent.visual.flowchart.map((stepItem, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: 'var(--bg-card)',
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}>
                            {stepItem.step}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{stepItem.action}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stepItem.detail}</div>
                          </div>
                          <button
                            onClick={() => speakText(`Step ${stepItem.step}: ${stepItem.action}. ${stepItem.detail}`)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                            title="Read step aloud"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FORMAT: ACCESSIBLE VIDEO & CAPTIONS */}
            {activeFormat === 'video' && (
              <div className="animate-fade-in">
                <LessonVideoPlayer lessonId={lesson.id} customVideoData={lesson.videoData} />
              </div>
            )}

            {/* FORMAT: PRACTICE QUESTIONS */}
            {activeFormat === 'practice' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span className="badge badge-amber">
                    ✏️ Guided Practice with Clues
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Self-paced exploratory mode</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {lesson.adaptedContent?.practice?.quickChecks?.map((qc, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {qc.prompt}
                      </h3>
                      <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>
                        💡 {qc.guidance}
                      </div>

                      <details style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}>
                          Reveal Explanation & Solution
                        </summary>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          {qc.interactiveAnswer}
                        </p>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <button
            onClick={() => {
              playChime('click');
              navigate('/lessons');
            }}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            <span>Back to Library</span>
          </button>

          <button
            onClick={() => {
              playChime('click');
              navigate(`/quiz/${lesson.id}`);
            }}
            className="btn btn-primary btn-lg"
            style={{ boxShadow: '0 4px 15px var(--primary-glow)' }}
          >
            <span>Proceed to Knowledge Quiz</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {aiModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setAiModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800 }}>
                <Sparkles size={22} />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                  {aiModalType === 'simply'
                    ? '🗣️ Explain Simply'
                    : aiModalType === 'detail'
                    ? '🔬 Detailed Engineering Dive'
                    : aiModalType === 'example'
                    ? '💡 Concrete Example'
                    : aiModalType === 'summary'
                    ? '📋 Lesson Summary'
                    : '🎯 Practice Questions'}
                </h3>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="btn btn-secondary btn-sm">
                ✕
              </button>
            </div>

            {aiGenerating ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Sparkles size={32} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Generating inclusive AI adaptation...</p>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                {aiModalType === 'simply' && (
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{aiContent?.superSimplified}</p>
                    <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {aiContent?.bulletPoints?.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--emerald)' }}>
                      <strong>Golden Rule: </strong>{aiContent?.goldenRule}
                    </div>
                  </div>
                )}

                {aiModalType === 'detail' && (
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      {aiContent?.deepDiveTitle}
                    </h4>
                    <p style={{ marginBottom: '1rem' }}>{aiContent?.technicalMechanism}</p>
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                      <strong>Historical Origin: </strong>{aiContent?.historicalInsight}
                    </div>
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #0284C7' }}>
                      <strong>Mental Model: </strong>{aiContent?.proTip}
                    </div>
                  </div>
                )}

                {aiModalType === 'example' && (
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      {aiContent?.scenario}
                    </h4>
                    <p style={{ marginBottom: '1rem' }}>{aiContent?.walkthrough}</p>
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Fun Fact: </strong>{aiContent?.funFact}
                    </div>
                  </div>
                )}

                {aiModalType === 'summary' && (
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      {aiContent?.summaryHeadline}
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {aiContent?.keyTakeaways?.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                      <strong>Mnemonic: </strong>{aiContent?.mnemonic}
                    </div>
                  </div>
                )}

                {aiModalType === 'practice' && (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {aiContent?.questions?.map((q, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{idx + 1}. {q.question}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.3rem' }}>
                            💡 Hint: {q.hint}
                          </div>
                          <details style={{ background: 'var(--bg-card)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Show Answer</summary>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.88rem' }}>{q.explanation}</p>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1.75rem', textAlign: 'right' }}>
                  <button onClick={() => setAiModalOpen(false)} className="btn btn-primary btn-sm">
                    Close & Keep Reading
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Drawer */}
      {notesDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setNotesDrawerOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '100%',
              background: 'var(--bg-card)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>My Lesson Notes</h3>
              </div>
              <button onClick={() => setNotesDrawerOpen(false)} className="btn btn-secondary btn-sm">
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your personal observations and analogies..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  resize: 'none',
                }}
              />
              <button
                onClick={handleAddNote}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Save size={14} />
                <span>Save Note</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {savedNotes.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
                  No notes saved yet. Add key takeaways here!
                </div>
              ) : (
                savedNotes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{n.date}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{n.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
