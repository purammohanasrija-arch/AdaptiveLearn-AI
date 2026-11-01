import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Search,
  BookOpen,
  LayoutDashboard,
  FlaskConical,
  Bot,
  TrendingUp,
  Award,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';

export const QuickSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { playChime, setTextSize, setDyslexicFont, dyslexicFont } = useAccessibility();
  const [query, setQuery] = useState('');

  const searchItems = [
    { id: 'dash', label: 'Go to Student Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'courses', label: 'Explore Course Library (7 Categories & Certifications)', category: 'Courses', icon: BookOpen, action: () => navigate('/courses') },
    { id: 'c-py', label: 'Course: Python Programming - Novice to Architect', category: 'Courses', icon: BookOpen, action: () => navigate('/courses/course-python') },
    { id: 'c-java', label: 'Course: Java Programming & Enterprise Software', category: 'Courses', icon: BookOpen, action: () => navigate('/courses/course-java') },
    { id: 'c-web', label: 'Course: Full-Stack Web Development (React & Node)', category: 'Courses', icon: BookOpen, action: () => navigate('/courses/course-web') },
    { id: 'c-dsa', label: 'Course: Data Structures and Algorithms Mastery', category: 'Courses', icon: BookOpen, action: () => navigate('/courses/course-dsa') },
    { id: 'c-dbms', label: 'Course: Database Management Systems & SQL', category: 'Courses', icon: BookOpen, action: () => navigate('/courses/course-dbms') },
    { id: 'twin', label: 'AI Learning Twin & Trajectory Evolution', category: 'AI Tools', icon: Sparkles, action: () => navigate('/twin') },
    { id: 'exams', label: 'AI Exam Generator & Evaluator', category: 'Assessments', icon: BookOpen, action: () => navigate('/exams') },
    { id: 'parent', label: 'Parent Portal & Family Oversight', category: 'Family', icon: Sparkles, action: () => navigate('/parent') },
    { id: 'mentor', label: 'Faculty Mentor Dashboard & Analytics', category: 'Faculty', icon: GraduationCap, action: () => navigate('/teacher') },
    { id: 'lab', label: 'Adaptive Learning Lab (Live Interactive Morphing)', category: 'Interactive', icon: FlaskConical, action: () => navigate('/lab') },
    { id: 'tutor', label: 'Open Socratic AI Tutor Assistant (Aria)', category: 'AI Tools', icon: Bot, action: () => navigate('/tutor') },
    { id: 'progress', label: 'View Mastery & Predictive Progress Analytics', category: 'Analytics', icon: TrendingUp, action: () => navigate('/progress') },
    { id: 'achieve', label: 'Achievement Passport & Digital Badges', category: 'Achievements', icon: Award, action: () => navigate('/passport') },
    { id: 'access', label: 'Accessibility Center Controls & Dyslexia Mode', category: 'Accessibility', icon: SlidersHorizontal, action: () => navigate('/accessibility') },
  ];

  const filtered = searchItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '5rem 1rem 1rem 1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '1.5px solid var(--border-color)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1.15rem 1.5rem', borderBottom: '1px solid var(--border-color)', gap: '0.75rem' }}>
          <Search size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, lessons, topics, tools, or navigation..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '1.1rem',
              fontWeight: 500,
              outline: 'none',
            }}
          />
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%', minWidth: '32px', minHeight: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No matches found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                    playChime('click');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-main)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Press <strong>Esc</strong> to exit</span>
          <span><strong>⌘K</strong> / <strong>Ctrl+K</strong> opens anytime</span>
        </div>
      </div>
    </div>
  );
};
