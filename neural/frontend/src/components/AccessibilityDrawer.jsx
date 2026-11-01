import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  X,
  Type,
  Sun,
  Moon,
  Eye,
  Volume2,
  Sparkles,
  RotateCcw,
  Sliders,
  Check,
  Headphones,
} from 'lucide-react';

export const AccessibilityDrawer = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    textSize,
    setTextSize,
    contentWidth,
    setContentWidth,
    dyslexicFont,
    setDyslexicFont,
    lineSpacing,
    setLineSpacing,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    soundEffects,
    setSoundEffects,
    speechRate,
    setSpeechRate,
    readingRulerEnabled,
    setReadingRulerEnabled,
    readingRulerTint,
    setReadingRulerTint,
    bionicReading,
    setBionicReading,
    setZenBreakOpen,
    primaryModality,
    setPrimaryModality,
    resetSettings,
    playChime,
    announce,
  } = useAccessibility();

  const drawerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme.includes('high-contrast')) {
      setHighContrast(true);
    } else {
      setHighContrast(false);
    }
    playChime('toggle');
    announce(`Theme switched to ${newTheme}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-drawer-title"
    >
      <div
        ref={drawerRef}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={22} style={{ color: 'var(--primary)' }} />
            <h2 id="accessibility-drawer-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Accessibility Controls
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            aria-label="Close accessibility controls"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sensory Pathway Modality: Sighted Video vs Blind Audio */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--primary)',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⭐ Primary Sensory Modality</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Choose whether to prioritize visual video lectures or spoken audio narration for blind learners.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => setPrimaryModality('sighted-video')}
              className={`btn btn-sm ${primaryModality === 'sighted-video' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.6rem 0.5rem', flexDirection: 'column', gap: '2px', height: 'auto' }}
              aria-pressed={primaryModality === 'sighted-video'}
            >
              <Eye size={16} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>👁️ Visual Mode</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>For Sighted (Videos)</span>
            </button>

            <button
              onClick={() => setPrimaryModality('blind-audio')}
              className={`btn btn-sm ${primaryModality === 'blind-audio' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.6rem 0.5rem', flexDirection: 'column', gap: '2px', height: 'auto' }}
              aria-pressed={primaryModality === 'blind-audio'}
            >
              <Headphones size={16} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>🎧 Audio-First</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>For Blind (Spoken)</span>
            </button>
          </div>
        </div>

        {/* Text Size Control */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            <Type size={18} style={{ color: 'var(--primary)' }} />
            <span>Text Size</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {[
              { id: 'normal', label: '100%', tag: 'Normal' },
              { id: 'medium', label: '115%', tag: 'Medium' },
              { id: 'large', label: '130%', tag: 'Large' },
              { id: 'xlarge', label: '150%', tag: 'X-Large' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTextSize(item.id);
                  playChime('toggle');
                  announce(`Text size set to ${item.tag}`);
                }}
                className={`btn btn-sm ${textSize === item.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', padding: '0.5rem 0.2rem', height: '56px' }}
                aria-pressed={textSize === item.id}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>{item.label}</span>
                <span style={{ fontSize: '0.7rem' }}>{item.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dyslexia-Friendly Font Mode */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📖 Dyslexia-Friendly Font</span>
                {dyslexicFont && <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Active</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Uses Lexend with specialized character weighting and enhanced letter spacing.
              </div>
            </div>
            <button
              onClick={() => {
                setDyslexicFont(!dyslexicFont);
                playChime('toggle');
                announce(`Dyslexia font ${!dyslexicFont ? 'enabled' : 'disabled'}`);
              }}
              className={`btn btn-sm ${dyslexicFont ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={dyslexicFont}
            >
              {dyslexicFont ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* 2. Interactive Reading Ruler (Focus Guide) */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: readingRulerEnabled ? '0.75rem' : '0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📏 Visual Reading Ruler</span>
                {readingRulerEnabled && <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Active</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Translucent spotlight bar follows cursor to eliminate line jumping and crowding.
              </div>
            </div>
            <button
              onClick={() => {
                setReadingRulerEnabled(!readingRulerEnabled);
                playChime('toggle');
                announce(`Reading ruler ${!readingRulerEnabled ? 'enabled' : 'disabled'}`);
              }}
              className={`btn btn-sm ${readingRulerEnabled ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={readingRulerEnabled}
            >
              {readingRulerEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Color Tint Selector when enabled */}
          {readingRulerEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tint:</span>
              {[
                { id: 'amber', color: '#F59E0B', label: 'Amber' },
                { id: 'cyan', color: '#0284C7', label: 'Cyan' },
                { id: 'rose', color: '#E11D48', label: 'Rose' },
                { id: 'neutral', color: '#94A3B8', label: 'Clear' },
              ].map((tint) => (
                <button
                  key={tint.id}
                  onClick={() => {
                    setReadingRulerTint(tint.id);
                    playChime('toggle');
                  }}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: readingRulerTint === tint.id ? tint.color : 'transparent',
                    color: readingRulerTint === tint.id ? '#FFFFFF' : 'var(--text-main)',
                    border: `1px solid ${tint.color}`,
                  }}
                >
                  {tint.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Bionic Reading Mode */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>👁️ Bionic Eye-Anchor Mode</span>
                {bionicReading && <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Active</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Bolds the first few letters of words to guide the eye and improve reading flow.
              </div>
            </div>
            <button
              onClick={() => {
                setBionicReading(!bionicReading);
                playChime('toggle');
                announce(`Bionic reading ${!bionicReading ? 'enabled' : 'disabled'}`);
              }}
              className={`btn btn-sm ${bionicReading ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={bionicReading}
            >
              {bionicReading ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* 4. Zen Sensory Calming Break Room */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🧘 Zen Sensory Break Room</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                4-4-4 guided breathing, ambient rain sounds, and anxiety reset.
              </div>
            </div>
            <button
              onClick={() => {
                setZenBreakOpen(true);
                playChime('success');
                onClose();
              }}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 800 }}
            >
              Open
            </button>
          </div>
        </div>

        {/* Themes & High Contrast */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            <Eye size={18} style={{ color: 'var(--primary)' }} />
            <span>Contrast & Theme</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'warm-pink', name: 'Warm Pink & White (Default)', desc: 'Soft warm palette with gentle pink tones' },
              { id: 'soft-cream', name: 'Soft Cream (Calm)', desc: 'Low-glare warm cream for visual relaxation' },
              { id: 'dark', name: 'Dark Slate Rose', desc: 'Reduced screen fatigue in low light' },
              { id: 'high-contrast-light', name: 'High Contrast Light (WCAG AAA)', desc: 'Maximized black/white contrast with bold borders' },
              { id: 'high-contrast-dark', name: 'High Contrast Dark (WCAG AAA)', desc: 'Deep black with luminous yellow/rose cues' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: theme === t.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: theme === t.id ? 'var(--primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                aria-pressed={theme === t.id}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                </div>
                {theme === t.id && <Check size={18} style={{ color: 'var(--primary)' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Line Spacing */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            Line Spacing & Breathing Room
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'normal', label: 'Standard', height: '1.6' },
              { id: 'relaxed', label: 'Relaxed', height: '1.85' },
              { id: 'loose', label: 'Loose', height: '2.2' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setLineSpacing(item.id);
                  playChime('toggle');
                  announce(`Line spacing set to ${item.label}`);
                }}
                className={`btn btn-sm ${lineSpacing === item.id ? 'btn-primary' : 'btn-secondary'}`}
                aria-pressed={lineSpacing === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Width Control */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            Reading Column Width
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'compact', label: 'Narrow (720px)' },
              { id: 'standard', label: 'Standard (960px)' },
              { id: 'wide', label: 'Full Width' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setContentWidth(item.id);
                  playChime('toggle');
                  announce(`Reading column width set to ${item.label}`);
                }}
                className={`btn btn-sm ${contentWidth === item.id ? 'btn-primary' : 'btn-secondary'}`}
                aria-pressed={contentWidth === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Narration Speed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Volume2 size={18} style={{ color: 'var(--primary)' }} />
              <span>Read-Aloud Speed</span>
            </label>
            <span className="badge badge-sky" style={{ fontWeight: 800 }}>{speechRate}x</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.05"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            aria-label="Text to speech playback rate slider"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            <span>0.7x (Patient)</span>
            <span>1.0x (Standard)</span>
            <span>1.5x (Brisk)</span>
          </div>
        </div>

        {/* Accessible Toggles: Sound effects & Reduced Motion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Accessible Audio Cues</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chimes on correct answers and navigation</div>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Reduced Motion</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disables animations and transitions</div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
            />
          </label>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={resetSettings}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
