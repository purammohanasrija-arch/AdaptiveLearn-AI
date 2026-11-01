import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Eye, X, Sliders, Check } from 'lucide-react';

export const ReadingRuler = () => {
  const {
    readingRulerEnabled,
    setReadingRulerEnabled,
    readingRulerTint,
    setReadingRulerTint,
    playChime,
  } = useAccessibility();

  const [mouseY, setMouseY] = useState(window.innerHeight / 2);
  const [rulerHeight, setRulerHeight] = useState(54); // pixels

  useEffect(() => {
    if (!readingRulerEnabled) return;

    const handleMouseMove = (e) => {
      setMouseY(e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        setMouseY(e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [readingRulerEnabled]);

  if (!readingRulerEnabled) return null;

  const tints = {
    amber: { bg: 'rgba(251, 191, 36, 0.26)', border: '#F59E0B', label: 'Amber (Yellow)' },
    cyan: { bg: 'rgba(56, 189, 248, 0.26)', border: '#0284C7', label: 'Cyan (Blue)' },
    rose: { bg: 'rgba(244, 63, 94, 0.24)', border: '#E11D48', label: 'Rose (Pink)' },
    neutral: { bg: 'rgba(255, 255, 255, 0.28)', border: '#94A3B8', label: 'Clear' },
  };

  const activeTint = tints[readingRulerTint] || tints.amber;

  const topMaskHeight = Math.max(0, mouseY - rulerHeight / 2);
  const bottomMaskTop = mouseY + rulerHeight / 2;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      {/* Top Dimming Mask */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: `${topMaskHeight}px`,
          background: 'rgba(15, 10, 20, 0.45)',
          backdropFilter: 'blur(0.5px)',
          transition: 'height 0.05s ease-out',
        }}
      />

      {/* The Active Reading Spotlight Strip */}
      <div
        style={{
          position: 'fixed',
          top: `${topMaskHeight}px`,
          left: 0,
          right: 0,
          height: `${rulerHeight}px`,
          background: activeTint.bg,
          borderTop: `2px solid ${activeTint.border}`,
          borderBottom: `2px solid ${activeTint.border}`,
          boxShadow: `0 0 16px ${activeTint.border}44`,
          transition: 'top 0.05s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '1rem',
        }}
      >
        {/* Floating Ruler Controls (Clickable) */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            padding: '0.2rem 0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.75rem',
            color: 'var(--text-main)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            Ruler:
          </span>

          {Object.entries(tints).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setReadingRulerTint(key);
                playChime('toggle');
              }}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: item.border,
                border: readingRulerTint === key ? '2px solid #FFFFFF' : 'none',
                cursor: 'pointer',
                boxShadow: readingRulerTint === key ? '0 0 0 2px var(--primary)' : 'none',
              }}
              title={`Switch to ${item.label}`}
              aria-label={`Switch to ${item.label}`}
            />
          ))}

          <button
            onClick={() => setRulerHeight((prev) => (prev === 40 ? 56 : prev === 56 ? 72 : 40))}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              padding: '0 0.3rem',
            }}
            title="Adjust line height"
          >
            {rulerHeight}px
          </button>

          <button
            onClick={() => {
              setReadingRulerEnabled(false);
              playChime('hint');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Turn Off Reading Ruler"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Dimming Mask */}
      <div
        style={{
          position: 'fixed',
          top: `${bottomMaskTop}px`,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 10, 20, 0.45)',
          backdropFilter: 'blur(0.5px)',
        }}
      />
    </div>
  );
};
