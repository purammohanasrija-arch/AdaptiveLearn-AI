import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Heart,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Accessibility,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
        }}>
          <Sparkles size={28} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          About AdaptLearn AI
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto' }}>
          Built for Problem Statement HI-03: Adaptive Learning for Students with Disabilities.
        </p>
      </div>

      {/* Mission & Empathy Statement */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', border: '2px solid var(--primary)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)' }}>
          The Presumption of Competence Principle
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-main)', marginBottom: '1rem' }}>
          In traditional education systems, curriculum is rigid: dense blocks of text, rapid lectures, and timed standardized tests. When a student struggles with dyslexia, visual impairment, auditory processing, or ADHD, the system often misinterprets format barriers as a lack of intellectual capability.
        </p>
        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-main)', margin: 0 }}>
          <strong>AdaptLearn AI starts with a fundamental truth:</strong> Every learner is capable of mastering advanced mathematics, computer science, programming, and biology when concepts are conveyed in the format that aligns with how their brain naturally processes information.
        </p>
      </div>

      {/* WCAG 2.2 AA Compliance Audit Checklist */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={24} style={{ color: '#059669' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            WCAG 2.2 AA Compliance Verification
          </h2>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Every component in AdaptLearn AI is built from the ground up to respect international accessibility standards:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { rule: '1.4.3 Contrast (Minimum)', detail: 'High contrast themes exceed 7:1 ratio (WCAG AAA); default warm palette maintains accessible AA contrast.', status: 'Compliant' },
            { rule: '1.4.4 Resize Text', detail: 'Native text scaling controls (Normal, Medium, Large, X-Large up to 150%) without horizontal scrolling or layout breakage.', status: 'Compliant' },
            { rule: '1.4.12 Text Spacing', detail: 'Adjustable line height (1.6 to 2.2), letter spacing (0.04em), and word spacing for dyslexia accommodation.', status: 'Compliant' },
            { rule: '2.1.1 Keyboard Navigable', detail: '100% interactive elements operable via Tab, Enter, Space, and custom shortcuts (Alt+A, Alt+P, Alt+Q).', status: 'Compliant' },
            { rule: '2.4.7 Focus Visible', detail: 'High-visibility 3px offset focus rings on every button, link, and input.', status: 'Compliant' },
            { rule: '2.3.3 Animation from Interactions', detail: 'Reduced motion mode disables all CSS animations, transitions, and keyframes.', status: 'Compliant' },
            { rule: '4.1.3 Status Messages', detail: 'Polite ARIA live region announces screen switches, audio playback states, and quiz feedback.', status: 'Compliant' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-subtle)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.rule}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.detail}</div>
              </div>
              <span className="badge badge-emerald" style={{ flexShrink: 0, fontSize: '0.75rem' }}>
                ✓ {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Technical Architecture & Stack
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Frontend</div>
            <div style={{ fontSize: '0.88rem' }}>React 19 + Vite 6</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Accessible Vanilla CSS Design System</div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Backend</div>
            <div style={{ fontSize: '0.88rem' }}>Node.js + Express REST API</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>JWT Auth & Role-Based Access Control</div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Database</div>
            <div style={{ fontSize: '0.88rem' }}>MongoDB Atlas</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dual mode with In-Memory fallback store</div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Speech & Sound</div>
            <div style={{ fontSize: '0.88rem' }}>Web Speech & Web Audio APIs</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Synthesized chimes & voice narration</div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/lessons/lesson-1" className="btn btn-primary btn-lg">
          <span>Explore Sample Lesson in Action</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
