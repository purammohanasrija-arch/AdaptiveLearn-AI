import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { soundEffects } from '../services/soundEffects';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Sparkles,
  Headphones,
  CheckCircle2,
  HelpCircle,
  EyeOff,
  BookOpen,
} from 'lucide-react';

export const BlindAudioLessonPlayer = ({ lesson }) => {
  const {
    speakText,
    isSpeaking,
    isPaused,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    speechRate,
    setSpeechRate,
    playChime,
    announce,
  } = useAccessibility();

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);

  // Extract chapters from adapted content
  const chapters = [
    {
      id: 'ch-intro',
      title: 'Chapter 1: The Core Big Idea',
      duration: '2 min',
      text: `${lesson?.title}. ${lesson?.adaptedContent?.simplified?.summary || lesson?.originalContent?.summary || ''}`,
    },
    ...(lesson?.adaptedContent?.simplified?.sections || []).map((sec, idx) => ({
      id: `ch-sec-${idx}`,
      title: `Chapter ${idx + 2}: ${sec.heading}`,
      duration: '2-3 min',
      text: `${sec.heading}. ${sec.bulletPoints?.join('. ') || ''}`,
    })),
    {
      id: 'ch-deepdive',
      title: 'Chapter Final: Practical Real-World Takeaway',
      duration: '3 min',
      text: `${lesson?.adaptedContent?.detailed?.deepDive || lesson?.originalContent?.summary || ''}`,
    },
  ];

  // Visual Scene Audio Description (AD) for students who cannot see the screen
  const visualAudioDescription = lesson?.id === 'lesson-1'
    ? 'Audio Description of Computer Architecture Diagram: In the center is a glowing square labeled CPU, drawn like a master chef in an apron. On the left, arrows stream inward from a keyboard and mouse representing raw user input. Above the CPU is a rapid scratchpad counter representing high-speed RAM. On the right, illuminated data packets flow outward to a colorful monitor screen.'
    : lesson?.id === 'lesson-2'
    ? 'Audio Description of Fractions Diagram: A large circular pizza pie is divided into eight perfectly equal slices. Three slices are lifted with golden cheese representing the numerator 3, while all eight equal pieces together represent the denominator 8.'
    : lesson?.id === 'lesson-3'
    ? 'Audio Description of Algorithm Flowchart: A start node leads downwards to an ingredient preparation step, followed by a diamond decision branch asking: "Is the oven hot enough?" If yes, an arrow continues to the baking stage. If no, a loop arrow circles back to wait 2 minutes.'
    : lesson?.id === 'lesson-4'
    ? 'Audio Description of Photosynthesis Diagram: Golden rays of sunlight shine down onto emerald green plant leaves. Microscopic pores underneath breathe in carbon dioxide gas, while roots drink moisture from the soil. From the leaves, clean oxygen bubbles float into the atmosphere while nourishing sugar fuels the stem.'
    : `Audio Description of Diagram: This visual overview presents ${lesson?.title} as connected learning stages, progressing from foundational principles to everyday applications.`;

  const fullLessonAudioScript = lesson?.adaptedContent?.audio?.script ||
    chapters.map((c) => `${c.title}. ${c.text}`).join(' ... Next chapter ... ');

  // Keyboard navigation for non-sighted users: Space = Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, isPaused]);

  const handleTogglePlay = () => {
    if (!isSpeaking) {
      soundEffects.playClick();
      speakText(fullLessonAudioScript, 'full-lesson');
      announce('Now playing full spoken lesson narration.');
    } else if (isPaused) {
      soundEffects.playClick();
      resumeSpeech();
      announce('Resumed audio narration.');
    } else {
      soundEffects.playClick();
      pauseSpeech();
      announce('Paused audio narration.');
    }
  };

  const handlePlayChapter = (idx) => {
    soundEffects.playNodeTone(idx);
    setActiveChapterIndex(idx);
    const chapter = chapters[idx];
    speakText(chapter.text, `chapter-${idx}`);
    announce(`Playing ${chapter.title}`);
  };

  const handlePlayAudioDescription = () => {
    soundEffects.playClick();
    speakText(visualAudioDescription, 'audio-desc');
    announce('Playing visual scene audio description.');
  };

  // Spoken practice question handler
  const sampleQuiz = lesson?.adaptedContent?.practice?.quickChecks || [
    {
      prompt: 'What is the primary function of the Central Processing Unit (CPU)?',
      guidance: 'Think about who does the calculations in the computer kitchen.',
      interactiveAnswer: 'The CPU performs calculations and coordinates all instructions.',
      options: [
        'A. Storing files permanently after power turns off',
        'B. Performing billions of math calculations and executing instructions',
        'C. Cooling down the laptop fan',
      ],
      correctIndex: 1,
    },
  ];

  const currentQuiz = sampleQuiz[activeQuizIndex] || sampleQuiz[0];

  const handleSpeakQuestion = () => {
    soundEffects.playClick();
    const opts = (currentQuiz.options || []).join('. ');
    speakText(`Question: ${currentQuiz.prompt}. Here are your choices: ${opts}. Guidance: ${currentQuiz.guidance}`);
  };

  const handleSelectQuizOption = (optIdx) => {
    setSelectedQuizOption(optIdx);
    const isCorrect = optIdx === (currentQuiz.correctIndex !== undefined ? currentQuiz.correctIndex : 1);
    if (isCorrect) {
      soundEffects.playSuccess();
      setQuizFeedback('Correct! Wonderful job! ' + (currentQuiz.interactiveAnswer || ''));
      speakText('Correct! Wonderful job! ' + (currentQuiz.interactiveAnswer || ''));
    } else {
      soundEffects.playClick();
      setQuizFeedback('Not quite. ' + currentQuiz.guidance);
      speakText('Not quite. Here is a helpful hint: ' + currentQuiz.guidance);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
      border: '3px solid var(--primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '2.5rem',
      boxShadow: 'var(--shadow-lg)',
      marginBottom: '2rem',
    }}>
      {/* Banner Indicator for Blind / Audio-First Learners */}
      <div style={{
        background: 'var(--primary)',
        color: '#FFFFFF',
        padding: '0.85rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Headphones size={24} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              🎧 Audio-First Spoken Learning Suite
            </div>
            <div style={{ fontSize: '0.82rem', opacity: 0.95 }}>
              Engineered for visually impaired, blind, and auditory learners • Press Spacebar anytime to play/pause
            </div>
          </div>
        </div>

        <button
          onClick={() => speakText("Audio-First learning suite active. Press Spacebar anytime to play or pause the spoken lecture. Use the large buttons below to skip chapters or hear visual scene audio descriptions.")}
          className="btn btn-secondary btn-sm"
          style={{ background: '#FFFFFF', color: 'var(--primary)', borderColor: '#FFFFFF', fontWeight: 800 }}
          title="Hear spoken instructions"
        >
          <Volume2 size={16} />
          <span>Spoken Instructions</span>
        </button>
      </div>

      {/* Main Tactile Playback Deck */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1rem',
        }}>
          {isSpeaking && !isPaused && (
            <div className="soundwave-visualizer">
              <span /><span /><span /><span /><span />
            </div>
          )}
          <span className="badge badge-sky" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
            {isSpeaking ? (isPaused ? '⏸️ Narration Paused' : '🔊 Speaking Lesson...') : 'Ready to Listen'}
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          {lesson?.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
          Full spoken narrative with natural intonation, chapter benchmarks, and scene audio descriptions.
        </p>

        {/* Master Large Playback Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
        }}>
          {/* Rewind */}
          <button
            onClick={() => {
              soundEffects.playClick();
              announce('Rewound 15 seconds.');
              handlePlayChapter(Math.max(0, activeChapterIndex - 1));
            }}
            className="btn btn-secondary btn-lg"
            style={{ borderRadius: 'var(--radius-full)', minWidth: '120px', gap: '6px' }}
            title="Jump to previous chapter (Rewind)"
            aria-label="Previous Chapter"
          >
            <Rewind size={20} />
            <span>Prev Ch.</span>
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="btn btn-primary btn-lg"
            style={{
              padding: '1rem 2.25rem',
              fontSize: '1.15rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 8px 24px var(--primary-glow)',
              minWidth: '220px',
              gap: '10px',
            }}
            aria-label={isSpeaking ? (isPaused ? 'Resume Spoken Lesson' : 'Pause Spoken Lesson') : 'Play Spoken Lesson'}
          >
            {isSpeaking && !isPaused ? <Pause size={24} /> : <Play size={24} />}
            <span>{isSpeaking ? (isPaused ? 'Resume Audio' : 'Pause Audio') : 'Play Full Lecture'}</span>
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => {
              soundEffects.playClick();
              announce('Advanced to next chapter.');
              handlePlayChapter(Math.min(chapters.length - 1, activeChapterIndex + 1));
            }}
            className="btn btn-secondary btn-lg"
            style={{ borderRadius: 'var(--radius-full)', minWidth: '120px', gap: '6px' }}
            title="Jump to next chapter"
            aria-label="Next Chapter"
          >
            <span>Next Ch.</span>
            <FastForward size={20} />
          </button>

          {/* Stop Button */}
          {isSpeaking && (
            <button
              onClick={() => {
                soundEffects.playClick();
                stopSpeech();
                announce('Stopped speech synthesis.');
              }}
              className="btn btn-secondary btn-lg"
              style={{ borderRadius: 'var(--radius-full)', borderColor: 'var(--rose)', color: 'var(--rose)' }}
              title="Stop audio playback"
            >
              <VolumeX size={20} />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Speed Adjustment Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🎙️ Speech Narration Speed:
          </span>
          {[0.75, 0.9, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                soundEffects.playClick();
                setSpeechRate(rate);
                announce(`Narration speed set to ${rate}x`);
              }}
              className={`btn btn-sm ${speechRate === rate ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '46px', fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
              aria-pressed={speechRate === rate}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Visual Scene Audio Description (AD) Section */}
      <div style={{
        background: 'var(--sky-light)',
        border: '2px solid var(--sky-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
        marginBottom: '2.5rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🎙️</span>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--sky)' }}>
                Accessibility Feature for Blind Learners
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Visual Scene Audio Description (AD)
              </h3>
            </div>
          </div>

          <button
            onClick={handlePlayAudioDescription}
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--sky)', borderColor: 'var(--sky)', gap: '6px' }}
            title="Read visual scene audio description aloud"
          >
            <Volume2 size={16} />
            <span>Hear Scene Description</span>
          </button>
        </div>

        <p style={{
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'var(--text-main)',
          background: 'var(--bg-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          margin: 0,
        }}>
          {visualAudioDescription}
        </p>
      </div>

      {/* Spoken Chapters Deck */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            📖 Spoken Chapter Breakdown
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Select any chapter to listen immediately
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {chapters.map((ch, idx) => {
            const isSelected = activeChapterIndex === idx;
            return (
              <div
                key={ch.id}
                role="button"
                tabIndex={0}
                onClick={() => handlePlayChapter(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayChapter(idx);
                  }
                }}
                style={{
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                aria-pressed={isSelected}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                      {ch.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      ⏱️ {ch.duration} • {ch.text.slice(0, 110)}...
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayChapter(idx);
                  }}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ gap: '5px', flexShrink: 0 }}
                  title={`Listen to ${ch.title}`}
                >
                  <Volume2 size={15} />
                  <span>Listen</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Hands-Free Spoken Practice */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '2rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '0.35rem' }}>
              🎯 Hands-Free Audio Quiz
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Spoken Knowledge Check
            </h3>
          </div>

          <button
            onClick={handleSpeakQuestion}
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px' }}
            title="Read question and options aloud"
          >
            <Volume2 size={15} style={{ color: 'var(--primary)' }} />
            <span>Read Question Aloud</span>
          </button>
        </div>

        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          {currentQuiz.prompt}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {(currentQuiz.options || [
            'A. Storing files permanently after power turns off',
            'B. Performing billions of calculations and executing instructions',
            'C. Cooling down the laptop fan',
          ]).map((opt, optIdx) => {
            const isPicked = selectedQuizOption === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectQuizOption(optIdx)}
                className={`btn btn-lg ${isPicked ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  fontSize: '0.98rem',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {quizFeedback && (
          <div style={{
            background: 'var(--bg-subtle)',
            borderLeft: '4px solid var(--emerald)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}>
            {quizFeedback}
          </div>
        )}
      </div>
    </div>
  );
};
