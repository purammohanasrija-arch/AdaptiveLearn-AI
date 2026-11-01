import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import {
  FlaskConical,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Eye,
  BookOpen,
  ArrowRight,
  Cpu,
  Layers,
  Zap,
  Video,
} from 'lucide-react';

export const AdaptiveLabPage = () => {
  const { speakText, stopSpeech, isSpeaking, playChime } = useAccessibility();
  const toast = useToast();

  // Selected Lesson for Comparison
  const [selectedTopic, setSelectedTopic] = useState('hardware');

  // Real-time Editable Preferences for Learner A
  const [learnerAPrefs, setLearnerAPrefs] = useState({
    name: 'Aarav Patel',
    format: 'simplified', // 'simplified' | 'audio'
    textSize: 'large',     // 'large' | 'xlarge'
    audioEnabled: true,
    speechRate: 0.85,
    quizDifficulty: 'easy',
  });

  // Real-time Editable Preferences for Learner B
  const [learnerBPrefs, setLearnerBPrefs] = useState({
    name: 'Maya Lin',
    format: 'visual',      // 'visual' | 'detailed'
    textSize: 'normal',
    highContrast: true,
    visualInfographics: true,
    quizDifficulty: 'hard',
  });

  // Active view comparison mode: 'side-by-side' | 'learner-a' | 'learner-b' | 'original'
  const [viewMode, setViewMode] = useState('side-by-side');

  // Topic Content Database for the self-contained demo
  const topicData = {
    hardware: {
      title: 'Introduction to Computers & Hardware Architecture',
      original: `At the heart of every modern computing system sits the Central Processing Unit (CPU), which executes arithmetic and logical operations using millions of semiconductor switches known as transistors. The Von Neumann architecture dictates how the CPU interacts with Primary Storage (RAM) and Secondary Storage (SSD/HDD). When a program executes, machine instructions are fetched from RAM into CPU registers, decoded by the control unit, and executed by the ALU.`,
      adaptationA: {
        heading: 'Chef CPU & The Kitchen Analogy 👨‍🍳',
        summary: 'Think of your computer as a fast-paced bakery with specialized helpers.',
        bullets: [
          'The CPU is the Head Chef: reads recipes and cooks meals instantly.',
          'RAM is the Kitchen Countertop: holds items you are touching right now.',
          'SSD is the Permanent Pantry: preserves food safely when the kitchen closes.',
        ],
        whyChosen: 'Reduces working memory strain by anchoring abstract silicon transistors into daily kitchen actions.',
        quizSample: 'Q: Which component is known as the "brain" that does all calculations? (CPU)',
      },
      adaptationB: {
        heading: 'Synchronous ALU Registers & Die Caching 🔬',
        summary: 'Synchronous clock cycles drive instruction pipelines traversing on-die L1/L2 caches.',
        bullets: [
          'Direct Die Execution: Bypasses DRAM motherboard traces for sub-nanosecond response.',
          'Non-Volatile NAND Trapping: Floating-gate transistors store charges indefinitely.',
          'Data Highway Flow: Input Controller ➔ Flash Cache ➔ Core Execution ➔ Framebuffer.',
        ],
        whyChosen: 'Emphasizes structural blueprints, graphical hierarchies, and technical depth for visual and hearing learners.',
        quizSample: 'Q: Why do CPU silicon dies incorporate L1, L2, and L3 SRAM caches directly? (To reduce DRAM latency)',
      },
    },
  };

  const currentTopic = topicData[selectedTopic];

  const handleResetDemo = () => {
    setLearnerAPrefs({
      name: 'Aarav Patel',
      format: 'simplified',
      textSize: 'large',
      audioEnabled: true,
      speechRate: 0.85,
      quizDifficulty: 'easy',
    });
    setLearnerBPrefs({
      name: 'Maya Lin',
      format: 'visual',
      textSize: 'normal',
      highContrast: true,
      visualInfographics: true,
      quizDifficulty: 'hard',
    });
    setViewMode('side-by-side');
    stopSpeech();
    playChime('hint');
    toast.info('Demonstration preferences reset to standard baseline.');
  };

  const handlePreviewAudioA = () => {
    speakText(
      'Welcome Aarav! Think of your computer as a fast-paced bakery with specialized helpers. The CPU is your master head chef!',
      'lab-a'
    );
    playChime('click');
  };

  const handlePreviewAudioB = () => {
    speakText(
      'Welcome Maya! Synchronous clock cycles drive instruction pipelines traversing on-die L1 and L2 caches, bypassing motherboard traces for sub-nanosecond response.',
      'lab-b'
    );
    playChime('click');
  };

  const handleReadOriginal = () => {
    speakText(
      `Unified Curriculum Concept: ${currentTopic.title}. ${currentTopic.original}`,
      'lab-orig'
    );
    playChime('click');
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1240px' }}>
      {/* Studio Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FlaskConical size={22} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Adaptive Learning Studio</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '720px' }}>
            Live side-by-side adaptation laboratory. Experience how one core lesson transforms dynamically to meet contrasting student needs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/lessons/lesson-1?tab=video"
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            <Video size={16} />
            <span>Watch Video Lesson</span>
          </Link>
          <button
            onClick={handleResetDemo}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={16} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* View Mode Switcher Pills */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Comparison View:</span>
          {['side-by-side', 'learner-a', 'learner-b', 'original'].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                playChime('toggle');
              }}
              className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>

        <span className="badge badge-emerald">
          <CheckCircle2 size={14} /> Self-Contained Evaluator Demonstration
        </span>
      </div>

      {/* Core Original Lesson Baseline Strip */}
      <div
        className="card"
        style={{
          background: 'var(--bg-subtle)',
          borderLeft: '5px solid var(--primary)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              Unified Curriculum Concept: {currentTopic.title}
            </h2>
          </div>
          <button
            onClick={handleReadOriginal}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem', gap: '4px' }}
            title="Read baseline textbook concept aloud"
          >
            <Volume2 size={13} style={{ color: 'var(--primary)' }} />
            <span>Listen Baseline</span>
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
          {currentTopic.original}
        </p>
      </div>

      {/* Split Comparison Canvas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            viewMode === 'side-by-side'
              ? 'repeat(auto-fit, minmax(360px, 1fr))'
              : '1fr',
          gap: '1.75rem',
          marginBottom: '3rem',
        }}
      >
        {/* LEARNER A PANEL */}
        {(viewMode === 'side-by-side' || viewMode === 'learner-a') && (
          <div
            className="card animate-fade-in"
            style={{
              border: '2px solid var(--primary)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Profile Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>👦🏽</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{learnerAPrefs.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Illustrative Profile: Reading & Audio Processing Focus
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePreviewAudioA}
                  className="btn btn-secondary btn-sm"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                >
                  <Volume2 size={16} />
                  <span>{isSpeaking ? 'Playing...' : 'Audio Preview'}</span>
                </button>
              </div>

              {/* Real-Time Preference Toggles for Learner A */}
              <div style={{
                background: 'var(--bg-subtle)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700 }}>Active Controls:</span>
                <button
                  onClick={() => {
                    setLearnerAPrefs((prev) => ({
                      ...prev,
                      textSize: prev.textSize === 'large' ? 'xlarge' : 'large',
                    }));
                    playChime('toggle');
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Text: {learnerAPrefs.textSize.toUpperCase()}
                </button>
                <button
                  onClick={() => {
                    setLearnerAPrefs((prev) => ({
                      ...prev,
                      format: prev.format === 'simplified' ? 'audio' : 'simplified',
                    }));
                    playChime('toggle');
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Mode: {learnerAPrefs.format}
                </button>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>Pacing: 0.85x</span>
              </div>

              {/* Adapted Content Rendered */}
              <div style={{
                fontSize: learnerAPrefs.textSize === 'xlarge' ? '1.25rem' : '1.1rem',
                lineHeight: 1.8,
                fontFamily: 'Lexend, sans-serif',
                marginBottom: '1.5rem',
              }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  {currentTopic.adaptationA.heading}
                </h4>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                  {currentTopic.adaptationA.summary}
                </p>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentTopic.adaptationA.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Why Adaptation was chosen */}
            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              borderTop: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Why This Adaptation Was Chosen:
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {currentTopic.adaptationA.whyChosen}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                🎯 Calibrated Assessment: {currentTopic.adaptationA.quizSample}
              </div>
            </div>
          </div>
        )}

        {/* LEARNER B PANEL */}
        {(viewMode === 'side-by-side' || viewMode === 'learner-b') && (
          <div
            className="card animate-fade-in"
            style={{
              border: '2px solid #0284C7',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Profile Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>👧🏻</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{learnerBPrefs.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Illustrative Profile: Visual & Engineering Depth Focus
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={handlePreviewAudioB}
                    className="btn btn-secondary btn-sm"
                    style={{ background: '#E0F2FE', color: '#0369A1', borderColor: '#38BDF8' }}
                  >
                    <Volume2 size={16} />
                    <span>Audio Preview</span>
                  </button>
                  <span className="badge badge-sky" style={{ padding: '0.4rem 0.75rem' }}>
                    <Eye size={14} /> Visual Diagram Mode
                  </span>
                </div>
              </div>

              {/* Real-Time Preference Toggles for Learner B */}
              <div style={{
                background: 'var(--bg-subtle)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700 }}>Active Controls:</span>
                <button
                  onClick={() => {
                    setLearnerBPrefs((prev) => ({
                      ...prev,
                      format: prev.format === 'visual' ? 'detailed' : 'visual',
                    }));
                    playChime('toggle');
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Mode: {learnerBPrefs.format}
                </button>
                <button
                  onClick={() => {
                    setLearnerBPrefs((prev) => ({
                      ...prev,
                      quizDifficulty: prev.quizDifficulty === 'hard' ? 'medium' : 'hard',
                    }));
                    playChime('toggle');
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Difficulty: {learnerBPrefs.quizDifficulty.toUpperCase()}
                </button>
                <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>Flowchart: Active</span>
              </div>

              {/* Adapted Content Rendered */}
              <div style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7', marginBottom: '0.75rem' }}>
                  {currentTopic.adaptationB.heading}
                </h4>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                  {currentTopic.adaptationB.summary}
                </p>

                {/* Visual Flowchart Box */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284C7', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Visual Data Flow:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <span className="badge">Registers</span>
                    <span>➔</span>
                    <span className="badge badge-sky">L1 Cache</span>
                    <span>➔</span>
                    <span className="badge badge-emerald">ALU Pipeline</span>
                    <span>➔</span>
                    <span className="badge badge-amber">NAND Flash</span>
                  </div>
                </div>

                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {currentTopic.adaptationB.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Why Adaptation was chosen */}
            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              borderTop: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Why This Adaptation Was Chosen:
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {currentTopic.adaptationB.whyChosen}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                🎯 Calibrated Assessment: {currentTopic.adaptationB.quizSample}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
