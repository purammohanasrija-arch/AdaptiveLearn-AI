import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import {
  Search,
  SlidersHorizontal,
  Bell,
  VolumeX,
  User,
  ChevronDown,
  Menu,
  Check,
  Sparkles,
  HelpCircle,
  LogOut,
  UserPlus,
  LogIn,
  Eye,
  Headphones,
} from 'lucide-react';

export const TopNav = ({ onOpenAccessibility, onOpenSearch, onOpenShortcuts, onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, isDemoUser, activeDemoId, switchDemoUser, logout, role } = useAuth();
  const {
    isSpeaking,
    stopSpeech,
    playChime,
    setZenBreakOpen,
    primaryModality,
    setPrimaryModality,
  } = useAccessibility();
  const toast = useToast();

  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Generate breadcrumbs from location
  const pathnames = location.pathname.split('/').filter((x) => x);
  const getBreadcrumbLabel = (segment) => {
    switch (segment) {
      case 'dashboard': return 'Dashboard';
      case 'lessons': return 'My Learning';
      case 'lab': return 'Adaptive Lab';
      case 'tutor': return 'AI Tutor';
      case 'progress': return 'Progress & Mastery';
      case 'achievements': return 'Achievements';
      case 'accessibility': return 'Accessibility Center';
      case 'teacher': return 'Teacher Portal';
      case 'quiz': return 'Quiz';
      case 'about': return 'About';
      case 'auth': return 'Account';
      case 'onboarding': return 'Onboarding';
      case 'cover': return 'Cover Page';
      case 'landing': return 'Cover Page';
      case 'courses': return 'Course Library';
      case 'learn': return 'Lesson Studio';
      default: return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  const handleDemoSelect = (key) => {
    switchDemoUser(key);
    setDemoDropdownOpen(false);
    playChime('toggle');
    const label = key === 'learner-a' ? 'Learner A (Aarav)' : key === 'learner-b' ? 'Learner B (Maya)' : key === 'parent' ? 'Parent (Priya Patel)' : 'Mentor (Dr. Elena Sharma)';
    toast.success(`Switched active profile to ${label}`);
  };

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        gap: '1rem',
      }}
    >
      {/* Left: Mobile Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button
          onClick={onOpenMobileMenu}
          className="btn btn-secondary btn-sm mobile-only"
          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
          aria-label="Open mobile navigation menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Center: Prominent, Big Quick Search Bar */}
      <div style={{ flex: '1 1 auto', maxWidth: '640px', minWidth: '280px', margin: '0 auto' }}>
        <button
          onClick={onOpenSearch}
          className="btn btn-secondary"
          style={{
            width: '100%',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0 1.25rem',
            borderRadius: '999px',
            background: 'var(--bg-subtle, #F8FAFC)',
            border: '1.5px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Quick Search (Ctrl + K)"
          aria-label="Quick Search"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={19} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.94rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Search courses, lessons, topics...
            </span>
          </span>
          <kbd style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            background: 'var(--bg-surface)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        {/* Zen Sensory Break Room Launcher */}
        <button
          onClick={() => {
            setZenBreakOpen(true);
            playChime('hint');
          }}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            padding: '0.4rem 0.65rem',
          }}
          title="Open Zen Sensory Calming Room (Breathing & Focus Reset)"
        >
          <span style={{ fontSize: '0.9rem' }}>🧘</span>
          <span className="hide-mobile">Zen Break</span>
        </button>

        {/* Audio Mute when speaking */}
        {isSpeaking && (
          <button
            onClick={stopSpeech}
            className="btn btn-sm"
            style={{
              background: 'var(--rose-light)',
              color: 'var(--rose)',
              border: '1px solid var(--rose-border)',
              animation: 'pulseGlow 1.5s infinite',
            }}
            title="Stop Read-Aloud Narration"
          >
            <VolumeX size={16} />
            <span className="hide-mobile" style={{ fontSize: '0.8rem' }}>Stop Audio</span>
          </button>
        )}

        {/* Instant Demo Persona Switcher (clearly marked for Judges / Evaluators) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
            className="btn btn-sm"
            style={{
              background: isDemoUser ? 'var(--primary-light)' : 'var(--bg-subtle)',
              color: isDemoUser ? 'var(--primary)' : 'var(--text-muted)',
              borderColor: 'var(--border-color)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
            }}
            aria-label="Demo Personas for Testing"
            aria-expanded={demoDropdownOpen}
            title="Pre-configured profiles for judges & evaluators"
          >
            <Sparkles size={14} color="var(--primary)" />
            <span className="hide-mobile">
              {isDemoUser
                ? activeDemoId === 'learner-a'
                  ? 'Demo: Aarav'
                  : activeDemoId === 'learner-b'
                  ? 'Demo: Maya'
                  : 'Demo: Teacher'
                : 'Demo Profiles'}
            </span>
            <ChevronDown size={13} />
          </button>

          {demoDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '280px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.75rem',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Testing Personas (Judges)
              </div>

              <button
                onClick={() => handleDemoSelect('learner-a')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid transparent',
                  background: activeDemoId === 'learner-a' ? 'var(--primary-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>👦🏽</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Aarav (Learner A)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dyslexia & ADHD • Audio/Simple</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoSelect('learner-b')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid transparent',
                  background: activeDemoId === 'learner-b' ? 'var(--primary-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>👧🏻</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Maya (Learner B)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hearing Impairment • Visual/Detail</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoSelect('teacher')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid transparent',
                  background: activeDemoId === 'teacher' ? 'var(--primary-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>👩🏻‍🏫</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Dr. Elena Sharma (Mentor)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Faculty Mentor & Curriculum Portal</div>
                </div>
              </button>

              <button
                onClick={() => handleDemoSelect('parent')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid transparent',
                  background: activeDemoId === 'parent' ? 'var(--primary-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>👨‍👩‍👧</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Priya Patel (Parent)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Guardian & Inclusive Learning Oversight</div>
                </div>
              </button>

              {isDemoUser && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => {
                      logout();
                      setDemoDropdownOpen(false);
                      toast.info('Exited demo mode');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--rose)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Exit Demo Mode (Return to Fresh View)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accessibility Drawer Trigger */}
        <button
          onClick={onOpenAccessibility}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          title="Open Accessibility Controls (Alt + A)"
          aria-label="Accessibility settings"
        >
          <SlidersHorizontal size={17} style={{ color: 'var(--primary)' }} />
          <span className="hide-mobile" style={{ fontSize: '0.82rem' }}>Accessibility</span>
        </button>

        {/* Guest or User Actions */}
        {isGuest ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/auth?tab=login')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600 }}
            >
              <LogIn size={14} />
              <span>Log In</span>
            </button>
            <button
              onClick={() => navigate('/auth?tab=register')}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </button>
          </div>
        ) : (
          /* User Profile Menu for Logged In User */
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
              }}
              aria-label="User Profile Menu"
            >
              <span style={{ fontSize: '1.1rem' }}>{user.avatar || '🎓'}</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {user.name ? user.name.split(' ')[0] : 'Account'}
              </span>
              <ChevronDown size={14} />
            </button>

            {profileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '230px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  zIndex: 100,
                }}
              >
                <div style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '0.25rem', padding: '1px 6px' }}>
                    {user.role === 'teacher' ? 'Faculty Mentor' : user.role === 'parent' ? 'Parent / Guardian' : 'Student'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/dashboard');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.25rem', fontSize: '0.85rem' }}
                >
                  <span>My Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/onboarding');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.25rem', fontSize: '0.85rem' }}
                >
                  <span>Edit Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenShortcuts();
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', marginBottom: '0.25rem', fontSize: '0.85rem' }}
                >
                  <span>Keyboard Guide (?)</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/');
                    toast.info('Signed out successfully');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: 'var(--rose)', fontSize: '0.85rem' }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 901px) {
          .mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
