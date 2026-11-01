import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Volume2, VolumeX, Play, Pause, FastForward, RotateCcw } from 'lucide-react';

export const FloatingVoiceBar = () => {
  const {
    isSpeaking,
    isPaused,
    currentSpokenText,
    speechRate,
    setSpeechRate,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
  } = useAccessibility();

  if (!isSpeaking && !isPaused) return null;

  const previewSnippet = currentSpokenText
    ? (currentSpokenText.length > 90 ? currentSpokenText.slice(0, 90) + '...' : currentSpokenText)
    : 'Reading content aloud...';

  return (
    <div
      role="region"
      aria-label="Audio Reader Bar"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '480px',
        width: 'calc(100% - 48px)',
        background: 'var(--bg-surface)',
        border: '2px solid var(--primary)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 12px 32px rgba(232, 59, 100, 0.25)',
        padding: '14px 18px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(8px)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top row: Animated indicator & controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Volume2 size={20} />
          </div>

          {/* Soundwave animation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
            <span
              style={{
                width: '3px',
                height: isSpeaking && !isPaused ? '16px' : '4px',
                background: 'var(--primary)',
                borderRadius: '2px',
                animation: isSpeaking && !isPaused ? 'pulse 0.8s infinite' : 'none',
              }}
            />
            <span
              style={{
                width: '3px',
                height: isSpeaking && !isPaused ? '22px' : '6px',
                background: 'var(--primary)',
                borderRadius: '2px',
                animation: isSpeaking && !isPaused ? 'pulse 0.6s infinite 0.15s' : 'none',
              }}
            />
            <span
              style={{
                width: '3px',
                height: isSpeaking && !isPaused ? '14px' : '4px',
                background: 'var(--primary)',
                borderRadius: '2px',
                animation: isSpeaking && !isPaused ? 'pulse 0.9s infinite 0.3s' : 'none',
              }}
            />
            <span
              style={{
                width: '3px',
                height: isSpeaking && !isPaused ? '18px' : '5px',
                background: 'var(--primary)',
                borderRadius: '2px',
                animation: isSpeaking && !isPaused ? 'pulse 0.7s infinite 0.1s' : 'none',
              }}
            />
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {isPaused ? 'Narration Paused' : 'Voice Reader Active'}
          </div>
        </div>

        {/* Playback action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPaused ? (
            <button
              onClick={resumeSpeech}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              title="Resume Speech (Alt + P)"
              aria-label="Resume speech"
            >
              <Play size={14} />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={pauseSpeech}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              title="Pause Speech (Alt + P)"
              aria-label="Pause speech"
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={stopSpeech}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-full)', color: 'var(--rose)' }}
            title="Stop Speech (Escape)"
            aria-label="Stop speech"
          >
            <VolumeX size={15} />
          </button>
        </div>
      </div>

      {/* Subtitles / Spoken Snippet Bar */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--text-main)',
          fontStyle: 'italic',
          lineHeight: '1.4',
          borderLeft: '3px solid var(--primary)',
        }}
      >
        "{previewSnippet}"
      </div>

      {/* Speed controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '2px' }}>
        <span>Reading Speed:</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { label: '0.75x', val: 0.75 },
            { label: '0.9x', val: 0.9 },
            { label: '1.0x', val: 1.0 },
            { label: '1.25x', val: 1.25 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setSpeechRate(s.val)}
              style={{
                background: Math.abs(speechRate - s.val) < 0.05 ? 'var(--primary)' : 'var(--bg-subtle)',
                color: Math.abs(speechRate - s.val) < 0.05 ? '#FFFFFF' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
