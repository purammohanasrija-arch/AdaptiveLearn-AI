import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { soundEffects } from '../services/soundEffects';
import {
  Sparkles,
  Volume2,
  Eye,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Zap,
  BookOpen,
  Timer,
  Play,
  RotateCcw,
} from 'lucide-react';

export const AdaptiveMorphSimulator = () => {
  const navigate = useNavigate();
  const { switchDemoUser } = useAuth();
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();

  // Mode: 'textbook' | 'adhd' | 'dyslexia' | 'auditory'
  const [activeMode, setActiveMode] = useState('dyslexia');

  const modes = [
    {
      id: 'textbook',
      name: '1. Standard Textbook',
      badge: 'Unadapted',
      badgeClass: 'badge-subtle',
      icon: '📄',
      description: 'Dense walls of small text with academic jargon and zero sensory accommodations.',
    },
    {
      id: 'dyslexia',
      name: '2. Dyslexia Mode',
      badge: 'WCAG AAA Anchors',
      badgeClass: 'badge-amber',
      icon: '📖',
      description: 'Lexend font, 1.8x line spacing, amber tinted background, and syllable eye-anchors.',
    },
    {
      id: 'adhd',
      name: '3. ADHD Focus Mode',
      badge: 'Distraction Dimmed',
      badgeClass: 'badge-emerald',
      icon: '🎯',
      description: 'Spotlight reading ruler, micro-chunked bullet takeaways, and visual pacing cues.',
    },
    {
      id: 'auditory',
      name: '4. Multimodal Audio',
      badge: 'Voice + Video CC',
      badgeClass: 'badge-sky',
      icon: '🎧',
      description: 'Live read-aloud voice synthesis, soundwave equalizer, and synchronized captioning.',
    },
  ];

  const handleSelectMode = (id) => {
    soundEffects.playClick();
    setActiveMode(id);
  };

  const handleLaunchTargetDemo = () => {
    soundEffects.playSuccess();
    if (activeMode === 'dyslexia' || activeMode === 'adhd') {
      switchDemoUser('learner-a');
      navigate('/lessons/lesson-1?tab=simplified');
    } else if (activeMode === 'auditory') {
      switchDemoUser('learner-b');
      navigate('/lessons/lesson-1?tab=video');
    } else {
      navigate('/lessons/lesson-1');
    }
  };

  return (
    <div style={{
      maxWidth: '960px',
      margin: '0 auto',
      background: 'var(--bg-card)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
    }}>
      {/* Top Controller Bar */}
      <div style={{
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1.25rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🎛️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Live Adaptive Experience Morph Simulator
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Toggle the modes below to watch the identical lesson paragraph transform instantly:
            </div>
          </div>
        </div>

        <span className="badge badge-primary shimmer-badge" style={{ fontSize: '0.78rem' }}>
          ✨ Real-Time Transformation
        </span>
      </div>

      {/* 4 Mode Selector Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-color)',
        gap: '1px',
      }}>
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectMode(m.id)}
              style={{
                background: isActive ? 'var(--bg-card)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                padding: '1rem 1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              aria-pressed={isActive}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                <span className={`badge ${m.badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                  {m.badge}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isActive ? 'var(--primary)' : 'var(--text-main)' }}>
                {m.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulator Display Sandbox */}
      <div style={{ padding: '2rem' }}>
        {/* MODE 1: STANDARD TEXTBOOK */}
        {activeMode === 'textbook' && (
          <div className="animate-fade-in" style={{
            background: '#F9F9F9',
            color: '#333333',
            fontFamily: 'Times New Roman, Georgia, serif',
            fontSize: '13px',
            lineHeight: 1.2,
            padding: '2rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #CCCCCC',
            letterSpacing: 'normal',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #999', paddingBottom: '4px' }}>
              CHAPTER 4: SYNCHRONOUS MICROPROCESSOR REGISTER PIPELINING AND INSTRUCTION CYCLE
            </div>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
              The central processing unit constitutes an integrated circuit utilizing arithmetic logic units, instruction registers, program counters, and bus transceivers operating synchronously under clock signal frequency modulation. Fetch-decode-execute instruction sequencing necessitates bus arbitration between volatile dynamic random-access memory address decoders and static cache lines to mitigate pipeline stalling under high memory latency constraints.
            </p>
            <p style={{ margin: 0, textAlign: 'justify' }}>
              A failure in cache line prediction precipitates a multi-cycle penalty where execution pipelines undergo flush procedures prior to retrieving subsequent machine opcodes from secondary persistent storage substrates.
            </p>
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#EEE', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
              ⚠️ High cognitive load: 0 visual aids, tiny serif typography, zero auditory fallbacks, impenetrable to students with dyslexia or ADHD.
            </div>
          </div>
        )}

        {/* MODE 2: DYSLEXIA MODE */}
        {activeMode === 'dyslexia' && (
          <div className="animate-fade-in" style={{
            background: '#FAF5EE', // Warm cream paper tint for Irlen Syndrome
            color: '#1C1917',
            fontFamily: 'Lexend, -apple-system, sans-serif',
            fontSize: '17px',
            lineHeight: 1.85,
            letterSpacing: '0.04em',
            wordSpacing: '0.12em',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #E6DBC8',
            boxShadow: 'inset 0 0 20px rgba(245, 185, 168, 0.15)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '1.2rem',
              marginBottom: '1rem',
            }}>
              <span>👨‍🍳</span>
              <span>1. The CPU is Like a Head Chef</span>
            </div>

            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1em' }}>T</strong>hink of your computer like a bustling kitchen bakery.
            </p>

            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <strong style={{ color: 'var(--primary)' }}>T</strong>he <strong>CPU</strong> is the <strong>Head Chef</strong> who reads recipes and prepares every meal.
              </li>
              <li>
                <strong style={{ color: 'var(--primary)' }}>E</strong>very time you click a button or tap a key, the chef follows that recipe instantly.
              </li>
              <li>
                <strong style={{ color: 'var(--primary)' }}>T</strong>he chef does billions of simple calculations every single second!
              </li>
            </ul>

            <div style={{
              marginTop: '1.5rem',
              background: '#FFF9F5',
              border: '1px solid #F5B9A8',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.88rem',
            }}>
              <span style={{ fontSize: '1.3rem' }}>✨</span>
              <span><strong>Why this works:</strong> Lexend letterforms reduce visual crowding. First-letter bolding creates visual anchors for the eye.</span>
            </div>
          </div>
        )}

        {/* MODE 3: ADHD FOCUS MODE */}
        {activeMode === 'adhd' && (
          <div className="animate-fade-in" style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--emerald)',
          }}>
            {/* Spotlight Banner */}
            <div style={{
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid var(--emerald)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--emerald)' }}>
                <Timer size={18} />
                <span>3-Minute Focus Sprint • 1 Key Concept</span>
              </div>
              <span className="badge badge-emerald">Reading Spotlight Active</span>
            </div>

            {/* Spotlight Highlight Box */}
            <div style={{
              background: 'var(--bg-subtle)',
              borderLeft: '5px solid var(--emerald)',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.15)',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--emerald)', marginBottom: '0.3rem' }}>
                Primary Goal
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                The CPU performs all the thinking for the computer.
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Without the CPU, buttons do nothing and apps cannot run.
              </div>
            </div>

            {/* Dimmed Next Chunk */}
            <div style={{
              opacity: 0.5,
              filter: 'blur(0.5px)',
              padding: '0.75rem 1.25rem',
              background: 'var(--bg-page)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-color)',
              fontSize: '0.9rem',
            }}>
              <span>🔒 Next Step: Memory (RAM) — unlocks after this 30-second review.</span>
            </div>

            <div style={{
              marginTop: '1.25rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} />
              <span>Removes sensory overwhelm by concealing secondary text until you are ready.</span>
            </div>
          </div>
        )}

        {/* MODE 4: MULTIMODAL AUDIO & VIDEO */}
        {activeMode === 'auditory' && (
          <div className="animate-fade-in" style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #0284C7',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="soundwave-visualizer">
                  <span /><span /><span /><span /><span />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Spoken Audio Narration</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Natural cadence with speed control</div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeech();
                  } else {
                    speakText("Welcome! Think of your computer like a busy kitchen bakery. The head chef in the middle is the CPU. Every time you click a button, the chef gets right to work!");
                  }
                }}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', background: '#0284C7', borderColor: '#0284C7' }}
              >
                <Volume2 size={15} />
                <span>{isSpeaking ? 'Pause Voice' : 'Play Aloud'}</span>
              </button>
            </div>

            {/* Read-Along Subtitle Box */}
            <div style={{
              fontSize: '1.25rem',
              lineHeight: 1.8,
              padding: '1.5rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
            }}>
              <p style={{ margin: 0 }}>
                <span style={{ background: '#BAE6FD', padding: '0 4px', borderRadius: '4px' }}>
                  “The central processing unit (CPU) is the head chef of your computer.”
                </span>{' '}
                It reads instructions from memory and transforms your clicks into live action on the screen.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <span>🎬 Includes toggleable closed-captions and ASL/visual gestures</span>
              <span className="badge badge-sky">0.75x–1.5x Speech Rate</span>
            </div>
          </div>
        )}

        {/* Footer Launch CTA */}
        <div style={{
          marginTop: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Experience this live in the full interactive lesson with practice quizzes and video:
          </div>

          <button
            onClick={handleLaunchTargetDemo}
            className="btn btn-primary"
            style={{ gap: '6px', fontWeight: 800 }}
          >
            <span>Launch Complete Adapted Lesson</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
