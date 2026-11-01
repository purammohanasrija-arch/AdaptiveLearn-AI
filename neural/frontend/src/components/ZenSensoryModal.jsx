import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  Wind,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react';

export const ZenSensoryModal = ({ isOpen, onClose }) => {
  const { speakText, stopSpeech, playChime } = useAccessibility();

  // Breathing state: 'inhale' | 'hold' | 'exhale'
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  // Sensory Ambient Audio using Web Audio API
  const [ambientSound, setAmbientSound] = useState('rain'); // 'rain' | 'waves' | 'pink' | 'none'
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Affirmations
  const affirmations = [
    "Your unique mind is a superpower. Take learning at your own pace.",
    "Breathe in calm and focus. Breathe out all tension.",
    "Small steps every day lead to incredible mastery.",
    "You have everything you need inside you right now.",
    "Mistakes are just data points helping your brain grow stronger.",
  ];
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);

  // 4-4-4 Box Breathing Timer Loop
  useEffect(() => {
    if (!isOpen || !isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathSeconds((prevSec) => {
        if (prevSec > 1) {
          return prevSec - 1;
        } else {
          // Switch phase
          setBreathPhase((prevPhase) => {
            if (prevPhase === 'inhale') return 'hold';
            if (prevPhase === 'hold') return 'exhale';
            // When exiting exhale, increment completed cycle
            setCyclesCompleted((c) => c + 1);
            return 'inhale';
          });
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isBreathingActive]);

  // Ambient sound synthesizer using Web Audio API (Rain / Pink Noise)
  useEffect(() => {
    if (!isOpen || ambientSound === 'none') {
      stopAmbientSound();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Create white/pink noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.04;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter based on ambient type
      const filter = ctx.createBiquadFilter();
      if (ambientSound === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 800;
      } else if (ambientSound === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.value = 450;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noiseNodeRef.current = noise;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn('Web Audio Ambient Synthesizer:', e);
    }

    return () => stopAmbientSound();
  }, [isOpen, ambientSound]);

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
  };

  const handleReadAffirmation = () => {
    const text = affirmations[currentAffirmationIndex];
    speakText(text, 'zen-affirmation');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="zen-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(10, 6, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAmbientSound();
          onClose();
        }
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'linear-gradient(180deg, #1E1428 0%, #150D1E 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid rgba(232, 59, 100, 0.3)',
          padding: '2.25rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🧘</span>
            <div style={{ textAlign: 'left' }}>
              <h2 id="zen-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Zen Sensory Calming Room
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>
                Decompress, reset attention, and soothe sensory fatigue.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              stopAmbientSound();
              onClose();
            }}
            className="btn btn-ghost btn-sm"
            style={{ color: '#FFFFFF', padding: '0.35rem' }}
            title="Return to learning"
          >
            <X size={20} />
          </button>
        </div>

        {/* 4-4-4 Box Breathing Visual Sphere */}
        <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
          {/* Animated Pulsing Halo */}
          <div
            style={{
              position: 'absolute',
              width: breathPhase === 'inhale' ? '200px' : breathPhase === 'hold' ? '200px' : '90px',
              height: breathPhase === 'inhale' ? '200px' : breathPhase === 'hold' ? '200px' : '90px',
              borderRadius: '50%',
              background:
                breathPhase === 'inhale'
                  ? 'radial-gradient(circle, rgba(232, 59, 100, 0.4) 0%, rgba(232, 59, 100, 0) 70%)'
                  : breathPhase === 'hold'
                  ? 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0) 70%)'
                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0) 70%)',
              transition: 'all 4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Central Breathing Core */}
          <div
            style={{
              width: breathPhase === 'inhale' ? '140px' : breathPhase === 'hold' ? '140px' : '75px',
              height: breathPhase === 'inhale' ? '140px' : breathPhase === 'hold' ? '140px' : '75px',
              borderRadius: '50%',
              background:
                breathPhase === 'inhale'
                  ? 'linear-gradient(135deg, #E83B64 0%, #F5B9A8 100%)'
                  : breathPhase === 'hold'
                  ? 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
              boxShadow: '0 0 30px rgba(232, 59, 100, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              zIndex: 2,
              transition: 'all 4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{breathSeconds}</span>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              {breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Release'}
            </span>
          </div>
        </div>

        {/* Phase Guidance Text */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            {breathPhase === 'inhale'
              ? '🌬️ Breathe in gently through your nose...'
              : breathPhase === 'hold'
              ? '✨ Gently hold and feel the quiet stillness...'
              : '🌊 Slowly exhale and release all tension...'}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Completed Cycles: {cyclesCompleted} • Target: 3 to 5 deep breaths
          </span>
        </div>

        {/* Ambient Sound Synthesizer Options */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>
            Ambient Sensory Sound:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { id: 'rain', label: '🌧️ Gentle Rain' },
              { id: 'waves', label: '🌊 Ocean Surf' },
              { id: 'pink', label: '📻 White Noise' },
              { id: 'none', label: '🔕 Silence' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => setAmbientSound(snd.id)}
                className={`btn btn-sm ${ambientSound === snd.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Positive Affirmation Card */}
        <div style={{
          background: 'rgba(232, 59, 100, 0.1)',
          border: '1px solid rgba(232, 59, 100, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          position: 'relative',
        }}>
          <p style={{ fontSize: '0.92rem', fontStyle: 'italic', margin: '0 0 0.5rem 0', color: '#FCE7EF', lineHeight: 1.5 }}>
            "{affirmations[currentAffirmationIndex]}"
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleReadAffirmation}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', gap: '3px' }}
            >
              <Volume2 size={13} style={{ color: 'var(--primary)' }} />
              <span>Listen Gently</span>
            </button>
            <button
              onClick={() => setCurrentAffirmationIndex((prev) => (prev + 1) % affirmations.length)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              <span>Next Affirmation ✨</span>
            </button>
          </div>
        </div>

        {/* Finish / Return Button */}
        <button
          onClick={() => {
            stopAmbientSound();
            onClose();
          }}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', fontWeight: 800, padding: '0.75rem' }}
        >
          <span>I'm Ready to Continue Learning</span>
        </button>
      </div>
    </div>
  );
};
