import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Sparkles,
  Volume2,
  Eye,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Cpu,
  PieChart,
  Code,
  Leaf,
  ShieldCheck,
  Zap,
  Sliders,
  Users,
  Compass,
  Video,
  Mic,
  Smile,
} from 'lucide-react';
import { AdaptiveMorphSimulator } from '../components/AdaptiveMorphSimulator';
import { soundEffects } from '../services/soundEffects';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { switchDemoUser, demoProfiles } = useAuth();
  const { playChime, speakText, stopSpeech, isSpeaking } = useAccessibility();

  // Interactive Live Comparison Widget State
  const [activeTabLearner, setActiveTabLearner] = useState('learner-a');

  const handleLaunchLearnerA = () => {
    switchDemoUser('learner-a');
    playChime('success');
    navigate('/lessons/lesson-1');
  };

  const handleLaunchLearnerB = () => {
    switchDemoUser('learner-b');
    playChime('success');
    navigate('/lessons/lesson-1');
  };

  const handleLaunchTeacher = () => {
    switchDemoUser('teacher');
    playChime('success');
    navigate('/teacher');
  };

  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section style={{
        padding: '4rem 0 3.5rem 0',
        background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--bg-page) 100%)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="badge" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              <Sparkles size={16} /> HI-03 Inclusive Adaptive Learning Engine
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: 'var(--text-main)',
          }}>
            Personalized Learning for <span style={{ color: 'var(--primary)', textDecoration: 'underline decoration-wavy 2px' }}>Everyone</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
            maxWidth: '720px',
            margin: '0 auto 1.5rem auto',
          }}>
            Every mind is unique. AdaptLearn AI transforms the exact same lesson into simplified text, voice narration, video lessons with closed captions, visual infographics, or deep dives—tailored to students with reading, visual, hearing, or cognitive learning differences.
          </p>

          {/* Dual Sensory Modality Banner: Video vs Audio-First */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'var(--bg-card)',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👁️</span> <strong>For Sighted Learners:</strong> Interactive Video Lectures & CC
            </span>
            <span style={{ color: 'var(--border-color)', fontWeight: 800 }}>•</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎧</span> <strong>For Blind Learners:</strong> Spoken Audio Learning & Scene Descriptions (AD)
            </span>
          </div>

          {/* Voice Read-Aloud for Hero */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <button
              onClick={() => speakText("Every mind is unique. AdaptLearn AI transforms the exact same lesson into simplified text, voice narration, video lessons with closed captions, visual infographics, or deep dives—tailored to students with reading, visual, hearing, or cognitive learning differences.")}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}
              title="Listen to platform overview"
            >
              <Volume2 size={16} style={{ color: 'var(--primary)' }} />
              <span>Listen to Overview</span>
            </button>
          </div>

          {/* Real User Call to Actions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}>
            <button
              onClick={() => navigate('/auth?tab=register')}
              className="btn btn-primary btn-lg"
              style={{
                boxShadow: '0 6px 20px var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 800,
                padding: '0.85rem 1.75rem',
              }}
            >
              <span>Get Started — Create Free Account</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/auth?tab=login')}
              className="btn btn-secondary btn-lg"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 700,
                padding: '0.85rem 1.5rem',
              }}
            >
              <span>Log In</span>
            </button>

            <button
              onClick={() => navigate('/lab')}
              className="btn btn-subtle btn-lg"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
              title="Explore the Section 15 side-by-side comparison without logging in"
            >
              <Sparkles size={16} color="var(--primary)" />
              <span>Explore Live Demo (Judges)</span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--emerald)' }} /> 100% Free Demo • No Sign-Up Needed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--emerald)' }} /> WCAG 2.2 AA Accessible
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--emerald)' }} /> Browser Speech & AI Engine
            </span>
          </div>

          {/* Interactive Voice Assistant Quick-Demo Pill Bar */}
          <div style={{
            marginTop: '2.5rem',
            background: 'var(--bg-card)',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Mic size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>🎙️ Hands-Free Voice Assistant Ready</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Try saying or tapping one of these commands:</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: '“Explain like I\'m 10”', phrase: 'Explaining like you are 10: Think of your computer like a bakery where the head chef reads recipes and makes the food!' },
                { label: '“Turn on Dyslexia Font”', phrase: 'Dyslexia friendly mode active with Lexend font, enhanced spacing, and bionic reading anchors.' },
                { label: '“Play Calm Rain”', phrase: 'Opening Zen sensory break with 4-4-4 box breathing and offline rain sounds.' },
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    soundEffects.playClick();
                    speakText(cmd.phrase);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
                  title={`Test command: ${cmd.label}`}
                >
                  <span>{cmd.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE EXPERIENCE MORPH SIMULATOR */}
      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--bg-subtle) 100%)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge badge-primary shimmer-badge" style={{ marginBottom: '0.75rem' }}>
              <Sparkles size={14} /> Interactive Inclusion Technology
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Watch the Exact Same Lesson Transform Live
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Select an accommodation mode below to see how AdaptLearn AI converts traditional academic textbook walls of text into dyslexia-spaced, ADHD-focused, or multimodal audio experiences.
            </p>
          </div>

          <AdaptiveMorphSimulator />
        </div>
      </section>

      {/* SECTION 15 SPOTLIGHT: Interactive Side-by-Side Learner Comparison */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge badge-sky" style={{ marginBottom: '0.75rem' }}>
              <Compass size={14} /> Section 15 Core Demonstration
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              One Lesson. Two Completely Different Experiences.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Both learners are studying <em>“Computer Hardware & Architecture”</em>. Notice how the vocabulary, font scale, audio support, and pacing adapt to their strengths.
            </p>
          </div>

          {/* Tab Selector for Learner A vs Learner B */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <button
              onClick={() => {
                setActiveTabLearner('learner-a');
                playChime('toggle');
              }}
              className={`btn btn-lg ${activeTabLearner === 'learner-a' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '220px' }}
              aria-pressed={activeTabLearner === 'learner-a'}
            >
              <span style={{ fontSize: '1.4rem' }}>👦🏽</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Learner A: Aarav</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Dyslexia & ADHD • Audio/Simple</div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTabLearner('learner-b');
                playChime('toggle');
              }}
              className={`btn btn-lg ${activeTabLearner === 'learner-b' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '220px' }}
              aria-pressed={activeTabLearner === 'learner-b'}
            >
              <span style={{ fontSize: '1.4rem' }}>👧🏻</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Learner B: Maya</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Hearing Impairment • Visual/Detail</div>
              </div>
            </button>
          </div>

          {/* Interactive Comparison Card */}
          <div className="card" style={{
            maxWidth: '920px',
            margin: '0 auto',
            padding: '2.5rem',
            border: '2px solid var(--primary)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {activeTabLearner === 'learner-a' ? (
              <div className="animate-fade-in">
                {/* Learner A Profile Header */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>👦🏽</div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Aarav Patel (Age 14)</h3>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span className="badge badge-emerald">Large Text (130%)</span>
                        <span className="badge badge-sky">Audio Narration On</span>
                        <span className="badge badge-amber">Dyslexia-Friendly Spacing</span>
                        <span className="badge">Simplified Reading Level</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => speakText(
                      'Welcome Aarav! Think of your computer like a busy kitchen bakery. The head chef in the middle is the CPU. Every time you click a button, the chef gets to work!',
                      'sample-a'
                    )}
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    <Volume2 size={16} />
                    <span>{isSpeaking ? 'Playing Voice...' : 'Listen to Narration'}</span>
                  </button>
                </div>

                {/* Adapted Content Preview */}
                <div style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.85',
                  letterSpacing: '0.04em',
                  fontFamily: 'Lexend, sans-serif',
                }}>
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '5px solid var(--primary)',
                    marginBottom: '1.25rem',
                  }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      1. The CPU is the Head Chef 👨‍🍳
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li>The CPU is the central brain of your computer.</li>
                      <li>Just like a head chef reads recipes and prepares food, the CPU reads instructions and does the work.</li>
                      <li>It does billions of tiny calculations every single second!</li>
                    </ul>
                  </div>

                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '5px solid #0284C7',
                  }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0284C7' }}>
                      2. RAM is the Kitchen Countertop 🍳
                    </h4>
                    <p style={{ margin: 0 }}>
                      Whatever tabs or games you have open right now sit on the countertop. When you shut down at night, the countertop is wiped clean!
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      switchDemoUser('learner-a');
                      playChime('click');
                      navigate('/lessons/lesson-1?tab=video');
                    }}
                    className="btn btn-secondary"
                    style={{ gap: '6px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    <Video size={16} />
                    <span>Watch Video & Captions</span>
                  </button>
                  <button onClick={handleLaunchLearnerA} className="btn btn-primary">
                    <span>Open Full Lesson as Learner A</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                {/* Learner B Profile Header */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>👧🏻</div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Maya Lin (Age 16)</h3>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span className="badge badge-emerald">Visual Flowcharts</span>
                        <span className="badge badge-sky">High Contrast Visuals</span>
                        <span className="badge">Detailed Architecture</span>
                        <span className="badge badge-amber">Hard Quiz Difficulty</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => speakText(
                        'Welcome Maya! Von Neumann CPU architecture executes synchronous clock cycles at 3.5 GHz traversing Fetch, Decode, and Execute registers. On-die SRAM L1 and L2 caches minimize DRAM latency.',
                        'sample-b'
                      )}
                      className="btn btn-secondary btn-sm"
                      style={{ background: '#E0F2FE', color: '#0369A1', borderColor: '#38BDF8' }}
                    >
                      <Volume2 size={16} />
                      <span>{isSpeaking ? 'Playing Voice...' : 'Listen to Narration'}</span>
                    </button>
                    <span className="badge badge-sky" style={{ padding: '0.5rem 0.85rem' }}>
                      <Eye size={16} /> Visual & Captions
                    </span>
                  </div>
                </div>

                {/* Adapted Content Preview */}
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                  }}>
                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '2px solid var(--primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.35rem' }}>
                        <Cpu size={18} />
                        <span>Von Neumann CPU</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Executes synchronous clock cycles (3.5 GHz) traversing Fetch-Decode-Execute registers.
                      </p>
                    </div>

                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '2px solid #0284C7',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284C7', fontWeight: 800, marginBottom: '0.35rem' }}>
                        <Zap size={18} />
                        <span>SRAM Cache (L1/L2)</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Low-latency memory located directly on the silicon die, bypassing slower DRAM buses.
                      </p>
                    </div>

                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '2px solid #059669',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 800, marginBottom: '0.35rem' }}>
                        <ShieldCheck size={18} />
                        <span>NAND Flash Storage</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Non-volatile charge-trapping floating gate transistors preserving bits permanently.
                      </p>
                    </div>
                  </div>

                  {/* Visual Flow Diagram */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      Hardware Execution Flowchart:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <span className="badge">1. Input Controller</span>
                      <span>➔</span>
                      <span className="badge badge-sky">2. Flash to RAM Copy</span>
                      <span>➔</span>
                      <span className="badge badge-emerald">3. CPU Core ALU Execution</span>
                      <span>➔</span>
                      <span className="badge badge-amber">4. Display Pixel Buffer</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      switchDemoUser('learner-b');
                      playChime('click');
                      navigate('/lessons/lesson-1?tab=video');
                    }}
                    className="btn btn-secondary"
                    style={{ gap: '6px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    <Video size={16} />
                    <span>Watch Video & Captions</span>
                  </button>
                  <button onClick={handleLaunchLearnerB} className="btn btn-primary">
                    <span>Open Full Lesson as Learner B</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 Sample Lessons Showcase */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Multi-Subject Adaptive Curriculum
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Explore realistic interactive lessons with pre-built simplified, audio, visual, and practice modes.
            </p>
          </div>

          <div className="grid-4">
            {[
              {
                id: 'lesson-1',
                title: 'Introduction to Computers & Hardware',
                subject: 'Computer Science',
                icon: <Cpu size={24} style={{ color: '#E11D48' }} />,
                duration: '15 min',
                difficulty: 'Easy',
                bg: 'var(--bg-card)',
              },
              {
                id: 'lesson-2',
                title: 'Basic Mathematics: Fractions & Ratios',
                subject: 'Mathematics',
                icon: <PieChart size={24} style={{ color: '#0284C7' }} />,
                duration: '12 min',
                difficulty: 'Easy',
                bg: 'var(--bg-card)',
              },
              {
                id: 'lesson-3',
                title: 'Introduction to Programming: Algorithms',
                subject: 'Programming',
                icon: <Code size={24} style={{ color: '#10B981' }} />,
                duration: '18 min',
                difficulty: 'Medium',
                bg: 'var(--bg-card)',
              },
              {
                id: 'lesson-4',
                title: 'Environmental Science: Photosynthesis',
                subject: 'Environmental Science',
                icon: <Leaf size={24} style={{ color: '#059669' }} />,
                duration: '14 min',
                difficulty: 'Easy',
                bg: 'var(--bg-card)',
              },
            ].map((lesson) => (
              <div
                key={lesson.id}
                className="card card-interactive"
                onClick={() => {
                  playChime('click');
                  navigate(`/lessons/${lesson.id}`);
                }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    {lesson.icon}
                  </div>
                  <span className="badge" style={{ fontSize: '0.72rem', marginBottom: '0.5rem' }}>
                    {lesson.subject}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0 0.6rem 0', lineHeight: 1.4 }}>
                    {lesson.title}
                  </h3>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}>
                  <span>⏱️ {lesson.duration}</span>
                  <span className="badge badge-emerald">{lesson.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Built for Universal Accessibility
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Engineered according to WCAG 2.2 AA standards with deep empathy for neurodiverse and disabled learners.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                AI Content Adaptation
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Instantly generates simplified, visual, detailed, or practice formats without altering core educational accuracy or meaning.
              </p>
            </div>

            <div className="card">
              <div style={{ color: '#0284C7', marginBottom: '1rem' }}>
                <Volume2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Speech & Audio Synthesis
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Adjustable playback speed (0.75x–1.5x), sentence-by-sentence text highlighting, and calm intonation to assist audio learners.
              </p>
            </div>

            <div className="card">
              <div style={{ color: '#059669', marginBottom: '1rem' }}>
                <Sliders size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Dynamic Accessibility Suite
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Dyslexia font (Lexend), high contrast themes, font scaling up to 150%, line-spacing controls, and visible focus rings.
              </p>
            </div>

            <div className="card">
              <div style={{ color: '#D97706', marginBottom: '1rem' }}>
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Explainable Mastery Engine
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Transparent formula: 70% Quiz Accuracy + 30% Completion. Avoids penalizing slow reading speeds and recommends sensible next steps.
              </p>
            </div>

            <div className="card">
              <div style={{ color: '#7C3AED', marginBottom: '1rem' }}>
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Empathetic Teacher Analytics
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Constructive tracking highlighting students who may benefit from extra support—without deficit labeling or ranking by disability.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Zero-Barrier Keyboard Navigation
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every single interactive element is accessible via Tab, arrow keys, and documented shortcuts (Alt+A, Alt+P, Alt+Q).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE INCLUSION CAPABILITY MATRIX */}
      <section style={{
        padding: '4.5rem 0',
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> Full WCAG 2.2 AA Compliance
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Engineered for Every Cognitive & Sensory Profile
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Built specifically to remove systemic educational barriers for neurodivergent and disabled students.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {[
              {
                icon: '🧠',
                title: 'Dyslexia & Reading Differences',
                badge: 'OpenDyslexic & Bionic',
                badgeColor: 'badge-amber',
                features: [
                  'Lexend & OpenDyslexic specialized typography',
                  'Bionic eye-anchor letter weighting',
                  'Amber / Rose / Cyan Irlen Syndrome paper tints',
                  'Read-along synchronized voice narration',
                ],
              },
              {
                icon: '🎯',
                title: 'ADHD & Focus Regulation',
                badge: 'Executive Support',
                badgeColor: 'badge-emerald',
                features: [
                  'Translucent reading ruler spotlight dimming',
                  'Micro-chunked bullet takeaways (2 sentences max)',
                  'Guided 3-minute sprint milestones',
                  'Zero unexpected autoplaying popups or ads',
                ],
              },
              {
                icon: '🦻',
                title: 'Deaf & Hard of Hearing',
                badge: 'Visual & Captioned',
                badgeColor: 'badge-sky',
                features: [
                  'Curated video lessons with toggleable Closed Captions (CC)',
                  'Full timestamped chapter transcripts',
                  'Interactive concept node mindmaps & flowcharts',
                  'High-contrast visual analogies and diagrams',
                ],
              },
              {
                icon: '👁️',
                title: 'Low Vision & Photophobia',
                badge: 'WCAG AAA Contrast',
                badgeColor: 'badge-primary',
                features: [
                  'Scalable font sizing up to 150%',
                  'High Contrast Dark & Soft Cream themes',
                  'Universal screen reader ARIA live regions',
                  'Adjustable line & word spacing metrics',
                ],
              },
              {
                icon: '🎙️',
                title: 'Motor & Hands-Free Interaction',
                badge: 'Voice Driven',
                badgeColor: 'badge-sky',
                features: [
                  'Aria Voice Assistant with Speech-to-Text mic',
                  'Full keyboard navigation (Alt+A, Alt+P, Alt+Q)',
                  'Large touch targets (>48px minimum)',
                  'Optional student camera mirror feedback',
                ],
              },
              {
                icon: '🧘',
                title: 'Sensory Overload & Anxiety',
                badge: 'Zen Sensory Break',
                badgeColor: 'badge-emerald',
                features: [
                  '4-4-4 Box Breathing animated visual circle',
                  '100% offline synthetic ambient sound generator',
                  'Gentle rain, ocean waves & pink noise chimes',
                  'Calming neurodivergent affirmative reminders',
                ],
              },
            ].map((col, idx) => (
              <div
                key={idx}
                className="card card-glass"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '2.4rem' }}>{col.icon}</span>
                    <span className={`badge ${col.badgeColor}`} style={{ fontSize: '0.72rem' }}>
                      {col.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>
                    {col.title}
                  </h3>

                  <ul style={{
                    paddingLeft: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}>
                    {col.features.map((feat, fIdx) => (
                      <li key={fIdx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #BE185D 0%, #E11D48 50%, #FB7185 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: '#FFFFFF' }}>
            Start Your Personalized Learning Journey
          </h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, lineHeight: 1.6, marginBottom: '2rem' }}>
            No credit card, no registration barrier. Explore our interactive lessons or customize your personal learner profile in 2 minutes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/onboarding"
              className="btn btn-lg"
              style={{
                background: '#FFFFFF',
                color: '#BE123C',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              <span>Take Learning Preferences Wizard</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <span>View Student Dashboard</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
