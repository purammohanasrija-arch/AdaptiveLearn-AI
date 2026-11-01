import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Bot,
  TrendingUp,
  Award,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Video,
  Compass,
  FileText,
  Heart,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, role } = useAuth();
  const { playChime } = useAccessibility();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Course Library', icon: BookOpen, badge: 'Phase 10' },
    { to: '/twin', label: 'AI Learning Twin', icon: Compass, badge: 'Phase 7' },
    { to: '/exams', label: 'AI Exam Generator', icon: FileText, badge: 'New' },
    { to: '/lessons', label: 'My Learning', icon: BookOpen },
    { to: '/videos', label: 'Video Learning', icon: Video, badge: 'New' },
    { to: '/lab', label: 'Adaptive Lab', icon: FlaskConical, badge: 'Live Demo' },
    { to: '/tutor', label: 'AI Tutor', icon: Bot, badge: 'AI' },
    { to: '/passport', label: 'Achievement Passport', icon: Award, badge: 'Verified' },
    { to: '/parent', label: 'Parent Portal', icon: Heart, badge: 'Parent' },
    { to: '/teacher', label: 'Faculty Mentor', icon: GraduationCap, badge: 'Mentor' },
    { to: '/security', label: 'Security & 2FA', icon: ShieldCheck, badge: 'Secure' },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/accessibility', label: 'Accessibility', icon: SlidersHorizontal },
  ];

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      style={{
        width: isCollapsed ? '76px' : '275px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-speed) ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 60,
        userSelect: 'none',
      }}
      aria-label="Main Application Navigation"
    >
      {/* Brand Logo Header */}
      <div
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0' : '0 1.25rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <NavLink
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'inherit' }}
          onClick={() => playChime('click')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 3px 10px var(--primary-glow)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>AdaptLearn</span>
                <span style={{ color: 'var(--primary)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                HI-03 Inclusive Ed
              </div>
            </div>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="btn btn-secondary btn-sm"
            style={{ minWidth: '32px', minHeight: '32px', padding: '0.25rem', borderRadius: '50%' }}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Items List */}
      <nav
        style={{
          flex: 1,
          padding: '0.75rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => playChime('click')}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isCollapsed ? '0.65rem 0' : '0.55rem 0.85rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                minHeight: '40px',
                transition: 'all var(--transition-speed) ease',
                position: 'relative',
                whiteSpace: 'nowrap',
              })}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {!isCollapsed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '0.5rem',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: '1 1 auto',
                      minWidth: 0,
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.66rem',
                        padding: '0.2rem 0.5rem',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Controls / Expand */}
      <div
        style={{
          padding: '0.65rem 0.75rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', padding: '0.4rem', justifyContent: 'center' }}
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <NavLink
          to="/cover"
          className="btn btn-secondary btn-sm"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.4rem' : '0.5rem 0.85rem',
            border: 'none',
            fontSize: '0.85rem',
          }}
          title="Cover Page & Platform Overview"
        >
          <BookOpen size={16} />
          {!isCollapsed && <span>Cover Page</span>}
        </NavLink>

        <NavLink
          to="/about"
          className="btn btn-secondary btn-sm"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.4rem' : '0.5rem 0.85rem',
            border: 'none',
            fontSize: '0.85rem',
          }}
          title="About Project & Pedagogy"
        >
          <Info size={16} />
          {!isCollapsed && <span>About Project</span>}
        </NavLink>
      </div>
    </aside>
  );
};
