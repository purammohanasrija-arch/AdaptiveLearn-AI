import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Accessibility } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>AdaptLearn AI</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Personalized, AI-powered inclusive education designed for students with visual, hearing, reading, and learning differences.
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={14} /> WCAG 2.2 AA Aligned
              </span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Student Dashboard</Link></li>
              <li><Link to="/lessons" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Lesson Library</Link></li>
              <li><Link to="/quiz/lesson-1" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Adaptive Quizzes</Link></li>
              <li><Link to="/progress" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Progress & Mastery</Link></li>
              <li><Link to="/teacher" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Teacher Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Adaptive Formats
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li>📖 Simplified Text (Chunked & Dyslexia-friendly)</li>
              <li>🎧 Audio Learning (Read-aloud with pacing)</li>
              <li>👁️ Visual Learning (Infographics & cards)</li>
              <li>🔬 Detailed Exploration (In-depth background)</li>
              <li>✏️ Practice Mode (Interactive check questions)</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Accessibility & Ethics
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Built upon the principle of presumption of competence: every student can master any topic when delivered in the right format.
            </p>
            <Link to="/about" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              <Accessibility size={16} />
              <span>Accessibility Statement</span>
            </Link>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © 2026 <strong>AdaptLearn AI</strong>. Built for Problem Statement HI-03: Adaptive Learning for Students with Disabilities.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Crafted with</span>
            <Heart size={14} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
            <span>for universal educational access.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
