import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Sparkles,
  BookOpen,
  LayoutDashboard,
  CheckCircle,
  TrendingUp,
  GraduationCap,
  Sliders,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const Navbar = ({ onOpenAccessibility, onOpenShortcuts }) => {
  const location = useLocation();
  const { user, role, activeDemoId, switchDemoUser, logout } = useAuth();
  const { isSpeaking, stopSpeech, playChime, announce } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleDemoSelect = (key) => {
    switchDemoUser(key);
    setDemoDropdownOpen(false);
    playChime('toggle');
    announce(`Switched to demo profile: ${key}`);
  };

  return (
    <header className="navbar-wrapper" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'inherit' }}
          onClick={() => playChime('click')}
          aria-label="AdaptLearn AI Homepage"
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #E11D48, #FB7185)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 3px 10px rgba(225, 29, 72, 0.3)',
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>AdaptLearn</span>
              <span style={{ color: 'var(--primary)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Inclusive Education • HI-03
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }} className="desktop-nav">
          <Link
            to="/dashboard"
            className={`btn btn-sm ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: isActive('/dashboard') ? 'none' : '1px solid transparent' }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/lessons"
            className={`btn btn-sm ${isActive('/lessons') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: isActive('/lessons') ? 'none' : '1px solid transparent' }}
          >
            <BookOpen size={16} />
            <span>Lessons</span>
          </Link>
          <Link
            to="/quiz/lesson-1"
            className={`btn btn-sm ${isActive('/quiz/lesson-1') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: isActive('/quiz/lesson-1') ? 'none' : '1px solid transparent' }}
          >
            <CheckCircle size={16} />
            <span>Quizzes</span>
          </Link>
          <Link
            to="/progress"
            className={`btn btn-sm ${isActive('/progress') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: isActive('/progress') ? 'none' : '1px solid transparent' }}
          >
            <TrendingUp size={16} />
            <span>Progress</span>
          </Link>
          <Link
            to="/teacher"
            className={`btn btn-sm ${isActive('/teacher') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: isActive('/teacher') ? 'none' : '1px solid transparent' }}
          >
            <GraduationCap size={16} />
            <span>Teacher Portal</span>
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Active Audio Narration Indicator */}
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              className="btn btn-sm"
              style={{
                background: '#FEE2E2',
                color: '#BE123C',
                border: '1px solid #FDA4AF',
                animation: 'pulseGlow 1.5s infinite',
              }}
              title="Stop audio narration"
              aria-label="Stop audio narration"
            >
              <VolumeX size={16} />
              <span style={{ fontSize: '0.8rem' }}>Mute Narration</span>
            </button>
          )}

          {/* Quick Demo Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: 'var(--primary)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
              aria-label="Switch Demo Learner Profile"
              aria-expanded={demoDropdownOpen}
            >
              <span>{user?.avatar || '🎓'}</span>
              <span className="demo-name-pill" style={{ fontSize: '0.85rem' }}>
                {activeDemoId === 'learner-a'
                  ? 'Learner A (Aarav)'
                  : activeDemoId === 'learner-b'
                  ? 'Learner B (Maya)'
                  : role === 'teacher'
                  ? 'Teacher View'
                  : user?.name?.split(' ')[0] || 'User'}
              </span>
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>

            {demoDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '280px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  zIndex: 100,
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Quick Demo Switcher
                </div>

                <button
                  onClick={() => handleDemoSelect('learner-a')}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    background: activeDemoId === 'learner-a' ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>👦🏽</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Learner A (Aarav)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dyslexia & ADHD • Audio/Simplified</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoSelect('learner-b')}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    background: activeDemoId === 'learner-b' ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>👧🏻</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Learner B (Maya)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hearing Impairment • Visual/Detailed</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoSelect('teacher')}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    background: activeDemoId === 'teacher' ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>👩🏻‍🏫</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Dr. Elena Sharma</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teacher Analytics & Assignments</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Accessibility Quick Drawer Button */}
          <button
            onClick={onOpenAccessibility}
            className="btn btn-secondary btn-sm"
            aria-label="Open Accessibility Settings Toolbar"
            title="Accessibility Controls (Alt + A)"
          >
            <Sliders size={18} style={{ color: 'var(--primary)' }} />
            <span className="hide-mobile" style={{ fontSize: '0.85rem' }}>Accessibility</span>
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            className="btn btn-secondary btn-sm"
            style={{ minWidth: '38px', padding: '0.4rem' }}
            aria-label="Open Keyboard Shortcuts Help"
            title="Keyboard Shortcuts (? or Alt + ?)"
          >
            <HelpCircle size={18} />
          </button>

          {/* Auth Button */}
          {user ? (
            <Link
              to="/auth"
              className="btn btn-subtle btn-sm hide-mobile"
              title="User Account"
            >
              <User size={16} />
              <span style={{ fontSize: '0.85rem' }}>Account</span>
            </Link>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">
              Log In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/lessons"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${isActive('/lessons') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <BookOpen size={18} />
            <span>Lessons Library</span>
          </Link>
          <Link
            to="/quiz/lesson-1"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${isActive('/quiz/lesson-1') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <CheckCircle size={18} />
            <span>Interactive Quizzes</span>
          </Link>
          <Link
            to="/progress"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${isActive('/progress') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <TrendingUp size={18} />
            <span>Progress & Mastery</span>
          </Link>
          <Link
            to="/teacher"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn ${isActive('/teacher') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start' }}
          >
            <GraduationCap size={18} />
            <span>Teacher Portal</span>
          </Link>
          <Link
            to="/accessibility"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <Sliders size={18} />
            <span>Accessibility Settings</span>
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <HelpCircle size={18} />
            <span>About AdaptLearn AI</span>
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
