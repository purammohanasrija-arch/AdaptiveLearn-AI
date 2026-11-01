import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Alt + A', desc: 'Open Accessibility Controls Drawer' },
    { key: 'Alt + P', desc: 'Play / Pause Read-Aloud Narration' },
    { key: 'Alt + S', desc: 'Stop Read-Aloud Narration' },
    { key: 'Alt + D', desc: 'Navigate to Student Dashboard' },
    { key: 'Alt + L', desc: 'Navigate to Lessons Library' },
    { key: 'Alt + Q', desc: 'Jump to Interactive Quiz' },
    { key: 'Alt + 1', desc: 'Switch to Simplified Text Format' },
    { key: 'Alt + 2', desc: 'Switch to Audio Learning Format' },
    { key: 'Alt + 3', desc: 'Switch to Visual Diagrams Format' },
    { key: 'Alt + 4', desc: 'Switch to Detailed Dive Format' },
    { key: 'Alt + 5', desc: 'Switch to Practice Mode' },
    { key: '?', desc: 'Open this Keyboard Shortcuts Guide' },
    { key: 'Escape', desc: 'Close any active modal or drawer' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Keyboard size={24} style={{ color: 'var(--primary)' }} />
            <h2 id="shortcuts-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Keyboard Navigation Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', padding: '0.35rem' }}
            aria-label="Close shortcuts guide"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          AdaptLearn AI is engineered for 100% keyboard navigability with visible focus indicators and screen reader announcements.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '360px', overflowY: 'auto' }}>
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{s.desc}</span>
              <kbd
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
