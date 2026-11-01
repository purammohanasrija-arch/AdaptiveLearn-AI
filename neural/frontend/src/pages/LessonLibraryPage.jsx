import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  BookOpen,
  Search,
  Cpu,
  PieChart,
  Code,
  Leaf,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Video,
  Volume2,
  PlusCircle,
  Sparkles,
  X,
  Globe,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';

export const LessonLibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const toast = useToast();

  const [lessons, setLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Subject & Lesson Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [newDuration, setNewDuration] = useState('15');
  const [newSummary, setNewSummary] = useState('');
  const [newEmbedUrl, setNewEmbedUrl] = useState('');

  const popularSubjects = [
    'Physics',
    'World History',
    'Chemistry',
    'Astronomy',
    'English Literature',
    'Robotics & AI',
    'Economics',
    'Environmental Science',
  ];

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.getLessons();
        setLessons(res.lessons || []);
      } catch (e) {
        console.warn('Failed to fetch lessons');
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  // Dynamically extract all available subjects from lessons database
  const uniqueSubjects = Array.from(new Set(lessons.map((l) => l.subject).filter(Boolean)));
  const subjects = ['All', ...uniqueSubjects];
  const difficulties = ['All', 'easy', 'medium', 'hard'];

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSubject = selectedSubject === 'All' || lesson.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'All' || lesson.difficulty === selectedDifficulty;
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  const getSubjectIcon = (subject = '') => {
    const s = subject.toLowerCase();
    if (s.includes('computer') || s.includes('code') || s.includes('tech') || s.includes('robot')) return <Cpu size={24} style={{ color: '#E11D48' }} />;
    if (s.includes('math') || s.includes('econom')) return <PieChart size={24} style={{ color: '#0284C7' }} />;
    if (s.includes('programming')) return <Code size={24} style={{ color: '#10B981' }} />;
    if (s.includes('physic') || s.includes('chem')) return <FlaskConical size={24} style={{ color: '#8B5CF6' }} />;
    if (s.includes('astronomy') || s.includes('earth') || s.includes('geograph')) return <Globe size={24} style={{ color: '#38BDF8' }} />;
    if (s.includes('history') || s.includes('literature') || s.includes('social')) return <BookOpen size={24} style={{ color: '#F59E0B' }} />;
    return <Leaf size={24} style={{ color: '#059669' }} />;
  };

  const handleAutoFillWithAI = () => {
    if (!newSubject && !newTitle) {
      setNewSubject('Physics');
      setNewTitle("Newton's Laws of Motion & Gravitational Pull");
      setNewSummary("Understand how force, mass, and acceleration dictate how all objects move in our physical universe, explained through skateboarding and rocket launches.");
      playChime('hint');
      toast.info('Suggested physics topic filled in!');
      return;
    }
    const subj = newSubject || 'General Science';
    const titl = newTitle || 'Foundational Principles';
    setNewSummary(`Comprehensive, multi-sensory adaptive breakdown of ${titl} in ${subj}. Explores foundational mechanisms, real-world examples, and visual analogies.`);
    playChime('hint');
    toast.info('AI generated an accessible lesson summary for you!');
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTitle.trim()) {
      toast.error('Please enter both a Subject and a Lesson Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createLesson({
        subject: newSubject.trim(),
        title: newTitle.trim(),
        topic: newTitle.trim(),
        difficulty: newDifficulty,
        estimatedDuration: Number(newDuration) || 15,
        summary: newSummary.trim() || undefined,
        embedUrl: newEmbedUrl.trim() || undefined,
      });

      if (res.lesson) {
        setLessons((prev) => [res.lesson, ...prev]);
        setSelectedSubject(res.lesson.subject);
        setIsModalOpen(false);
        playChime('success');
        toast.success(`Subject "${res.lesson.subject}" & lesson created successfully!`);

        // Reset form
        setNewSubject('');
        setNewTitle('');
        setNewSummary('');
        setNewEmbedUrl('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header with Add Custom Subject Action */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        gap: '1.25rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Adaptive Lesson Library
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px', margin: 0 }}>
            Select any lesson to experience AI-adapted multi-format learning, or add any custom subject of your choice.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            playChime('click');
          }}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.4rem',
            fontWeight: 800,
            boxShadow: '0 4px 16px var(--primary-glow)',
          }}
          id="btn-add-subject"
        >
          <PlusCircle size={18} />
          <span>Add Custom Subject or Lesson</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, or keywords..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
              }}
              aria-label="Search lessons"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                playChime('toggle');
              }}
              className={`btn btn-sm ${selectedSubject === sub ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
              aria-pressed={selectedSubject === sub}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid-2">
        {filteredLessons.map((lesson) => {
          const prog = (user?.progress || []).find((p) => p.lessonId === lesson.id);
          const completion = prog?.completionPercentage || (lesson.id === 'lesson-1' ? 100 : 0);

          return (
            <div
              key={lesson.id}
              className="card card-interactive"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getSubjectIcon(lesson.subject)}
                    </div>
                    <div>
                      <span className="badge" style={{ fontSize: '0.75rem' }}>{lesson.subject}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lesson.topic}</div>
                    </div>
                  </div>

                  <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                    {lesson.difficulty}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.4, margin: 0 }}>
                    {lesson.title}
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playChime('click');
                      speakText(`Lesson: ${lesson.title}. Subject: ${lesson.subject}. ${lesson.originalContent?.summary || ''}`);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', gap: '4px', flexShrink: 0 }}
                    title="Read lesson summary aloud"
                  >
                    <Volume2 size={14} style={{ color: 'var(--primary)' }} />
                    <span>Voice</span>
                  </button>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {lesson.originalContent?.summary || 'Interactive adaptive educational module.'}
                </p>

                {/* Available Adaptive Formats Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>🎥 Video & Subtitles</span>
                  <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>🎧 Audio Paced</span>
                  <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>📖 Simplified</span>
                  <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>👁️ Visual Cards</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>🎯 Quiz Ready</span>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Clock size={16} /> {lesson.estimatedDuration} mins
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      playChime('click');
                      navigate(`/lessons/${lesson.id}?tab=video`);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    title="Watch video lesson with closed captions and timestamps"
                  >
                    <Video size={14} />
                    <span>Video</span>
                  </button>

                  <button
                    onClick={() => {
                      playChime('click');
                      navigate(`/lessons/${lesson.id}`);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <span>{completion > 0 ? 'Resume' : 'Start'} Lesson</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>No lessons matched your filter criteria.</p>
          <button
            onClick={() => {
              setSelectedSubject('All');
              setSelectedDifficulty('All');
              setSearchQuery('');
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1rem' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Accessible Subject & Lesson Creator Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-subject-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsModalOpen(false);
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '640px',
              width: '100%',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h2 id="modal-subject-title" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                    Add Custom Subject or Lesson
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    AI will automatically generate simplified, audio, visual, and practice formats!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem', borderRadius: '50%' }}
                aria-label="Close dialog"
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Popular Subject Quick Chips */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Quick Choose or Type New Subject:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  {popularSubjects.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => {
                        setNewSubject(s);
                        playChime('toggle');
                      }}
                      className={`btn btn-sm ${newSubject === s ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, World History, Astronomy, Chemistry..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                  }}
                  id="input-new-subject"
                />
              </div>

              {/* Lesson Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Lesson / Topic Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Newton's Three Laws of Motion & Gravitational Pull"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                  }}
                  id="input-new-title"
                />
              </div>

              {/* Difficulty & Estimated Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    Difficulty Level:
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="easy">Easy (Elementary / Foundations)</option>
                    <option value="medium">Medium (Middle / Standard)</option>
                    <option value="hard">Hard (Advanced / In-Depth)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    Estimated Duration:
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Lesson Summary / Overview with AI Auto-Fill */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Lesson Summary / Notes:
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillWithAI}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    <Sparkles size={13} />
                    <span>Auto-Fill with AI</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Provide brief notes, textbook excerpt, or click 'Auto-Fill with AI' to generate..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Video Embed Link (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Video URL / Embed (Optional):
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube-nocookie.com/embed/... (or leave blank for auto-curated video)"
                  value={newEmbedUrl}
                  onChange={(e) => setNewEmbedUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  💡 If left empty, AdaptLearn AI will automatically link an educational video lecture with subtitles and chapters for your chosen subject.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ gap: '0.5rem', fontWeight: 800 }}
                  id="btn-submit-new-lesson"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
                      <span>Generating Adaptations...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Create & Adapt Subject</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
