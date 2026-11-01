import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Volume2,
  Eye,
  BookOpen,
  Sliders,
  Award,
  Ear,
  Brain,
  MousePointer,
  Mic,
  ShieldCheck,
  Bell,
  Clock,
  Compass,
} from 'lucide-react';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, token, updateLearnerProfile } = useAuth();
  const {
    playChime,
    setTextSize,
    setDyslexicFont,
    setLineSpacing,
    setLetterSpacing,
    setWordSpacing,
    setHighContrast,
    setContrastPreset,
    setSpeechRate,
    setReadingRulerEnabled,
    setReadingRulerTint,
    setVisualBellEnabled,
    setCognitiveMode,
    setAssessmentTimeMultiplier,
    setMotorMode,
    announce,
  } = useAccessibility();

  const [step, setStep] = useState(1); // 1: Personal, 2: Preferences, 3: Accessibility Needs, 4: Diagnostic, 5: Summary

  // Form State - Step 1: Personal
  const [name, setName] = useState(user?.name || '');
  const [ageRange, setAgeRange] = useState('14-16');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Step 2: Learning Preferences
  const [learningLevel, setLearningLevel] = useState('beginner');
  const [preferredFormat, setPreferredFormat] = useState('simplified');
  const [readingSpeed, setReadingSpeed] = useState('moderate');
  const [explanationComplexity, setExplanationComplexity] = useState('simple');

  // Step 3: Accessibility Modalities (Voluntary multi-selection)
  const [selectedNeeds, setSelectedNeeds] = useState(['visual', 'reading']);
  const [textSizeChoice, setTextSizeChoice] = useState('large');
  const [contrastChoice, setContrastChoice] = useState('standard');
  const [audioSpeedChoice, setAudioSpeedChoice] = useState(0.9);
  const [navigationChoice, setNavigationChoice] = useState('mouse-and-keyboard');
  const [readingRulerChoice, setReadingRulerChoice] = useState(false);
  const [readingRulerTintChoice, setReadingRulerTintChoice] = useState('amber');
  const [dyslexicFontChoice, setDyslexicFontChoice] = useState(false);
  const [visualBellChoice, setVisualBellChoice] = useState(true);
  const [cognitiveModeChoice, setCognitiveModeChoice] = useState(false);
  const [timeMultiplierChoice, setTimeMultiplierChoice] = useState(1.0);
  const [motorModeChoice, setMotorModeChoice] = useState(false);

  // Diagnostic Quiz Answers
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const accessibilityCategories = [
    {
      id: 'visual',
      label: 'Visual Accessibility',
      icon: Eye,
      description: 'Screen reader semantics, high contrast, enlarged text, and audio cues.',
    },
    {
      id: 'hearing',
      label: 'Hearing Accessibility',
      icon: Ear,
      description: 'Visual bell notifications, video/audio transcripts, and sign language.',
    },
    {
      id: 'reading',
      label: 'Reading Assistance',
      icon: BookOpen,
      description: 'Synchronized text-to-speech, line reading ruler, and vocabulary simplifier.',
    },
    {
      id: 'dyslexia',
      label: 'Dyslexia-Friendly Presentation',
      icon: Sliders,
      description: 'OpenDyslexic font, wide letter & word spacing, and syllable helpers.',
    },
    {
      id: 'cognitive',
      label: 'Cognitive-Friendly Learning',
      icon: Brain,
      description: 'One concept at a time, distraction-free focus mode, and zen breaks.',
    },
    {
      id: 'motor',
      label: 'Motor & Physical Accessibility',
      icon: MousePointer,
      description: 'Full keyboard navigation, 44px+ touch targets, and zero drag-and-drop.',
    },
    {
      id: 'voice',
      label: 'Voice-Based Interaction',
      icon: Mic,
      description: 'Speech recognition commands, voice answering, and oral explanations.',
    },
    {
      id: 'general',
      label: 'General Learning Preferences',
      icon: Sparkles,
      description: 'Balanced visual diagrams, interactive practice, and step-by-step guides.',
    },
  ];

  const toggleNeed = (id) => {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    playChime('toggle', `Toggled ${id}`);
  };

  const diagnosticQuestions = [
    {
      id: 'diag-1',
      question: 'Which component in a computer processes instructions and does calculations like a brain?',
      options: ['Central Processing Unit (CPU)', 'Desk Mouse', 'Power Cord'],
      correct: 0,
    },
    {
      id: 'diag-2',
      question: 'In the fraction 1/2, what does the bottom number (2) tell us?',
      options: ['Total number of equal parts', 'How many parts were eaten', 'How heavy the object is'],
      correct: 0,
    },
    {
      id: 'diag-3',
      question: 'What is an algorithm in computing?',
      options: ['A step-by-step recipe to solve a problem', 'A physical laptop screen', 'A type of battery'],
      correct: 0,
    },
  ];

  const handleNextStep = () => {
    playChime('click', `Proceeding to step ${step + 1}`);
    setStep(step + 1);
    announce(`Step ${step + 1} of onboarding`);
  };

  const handlePrevStep = () => {
    playChime('click', `Going back to step ${step - 1}`);
    setStep(step - 1);
  };

  const handleCompleteOnboarding = async () => {
    setIsSaving(true);
    let score = 0;
    diagnosticQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) score += 33;
    });

    // Apply directly to AccessibilityContext for immediate feedback
    setTextSize(textSizeChoice);
    setDyslexicFont(dyslexicFontChoice);
    setContrastPreset(contrastChoice);
    setHighContrast(contrastChoice.includes('high-contrast'));
    setSpeechRate(audioSpeedChoice);
    setReadingRulerEnabled(readingRulerChoice);
    setReadingRulerTint(readingRulerTintChoice);
    setVisualBellEnabled(visualBellChoice);
    setCognitiveMode(cognitiveModeChoice);
    setAssessmentTimeMultiplier(timeMultiplierChoice);
    setMotorMode(motorModeChoice);

    const accessibilityPayload = {
      userId: user?.id || 'user-student-a',
      needs: selectedNeeds,
      textSize: textSizeChoice,
      textContrast: contrastChoice,
      readingSpeed,
      audioSpeed: audioSpeedChoice,
      explanationComplexity,
      learningFormat: preferredFormat,
      navigationMethod: navigationChoice,
      readingRuler: readingRulerChoice,
      readingRulerTint: readingRulerTintChoice,
      dyslexicFont: dyslexicFontChoice,
      visualBell: visualBellChoice,
      captionsEnabled: true,
      focusMode: cognitiveModeChoice,
      assessmentTimeMultiplier: timeMultiplierChoice,
      motorMode: motorModeChoice,
    };

    try {
      // 1. Save to FastAPI Accessibility Profile endpoint
      await api.saveAccessibilityProfile(accessibilityPayload, token);
    } catch (err) {
      console.warn('Backend accessibility profile save warning:', err);
    }

    // 2. Save to local learner profile in AuthContext
    updateLearnerProfile({
      name,
      ageRange,
      preferredLanguage,
      learningLevel,
      preferredFormat,
      textSize: textSizeChoice,
      readingSpeed,
      explanationStyle: explanationComplexity,
      quizDifficulty: 'easy',
      accessibilityPreferences: accessibilityPayload,
      baselineScore: Math.max(score, 65),
    });

    setIsSaving(false);
    playChime('success', 'Onboarding completed');
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Progress tracker */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <span>Step {step} of 5: {step === 1 ? 'About You' : step === 2 ? 'Learning Preferences' : step === 3 ? 'Inclusive Accessibility' : step === 4 ? 'Baseline Check' : 'Your Profile Blueprint'}</span>
          <span>{step * 20}% Complete</span>
        </div>
        <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${step * 20}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome to AdaptiveLearn AI! 🌟
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
              We tailor your educational journey to your exact comfort, pacing, and preferred sensory formats.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  What name should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Age Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {['Under 12', '12-14', '14-16', '16+'].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeRange(age)}
                      className={`btn btn-sm ${ageRange === age ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="French">French (Français)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNextStep} className="btn btn-primary">
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Learning Preferences */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              How do you learn best? 💡
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Select your favorite presentation style and starting pace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'simplified', title: 'Simple English & Plain Summaries', desc: 'Direct, clear sentences without unnecessary academic jargon' },
                { id: 'visual', title: 'Visual Explanations & Diagrams', desc: 'Flowcharts, infographics, structured SVG concept maps, and high visual clarity' },
                { id: 'audio', title: 'Spoken Audio Lessons', desc: 'Natural voice narration, pronunciation guides, and listening-first learning' },
                { id: 'step_by_step', title: 'Step-by-Step Breakdown', desc: 'Numbered progressive cards taking you from fundamentals to mastery' },
                { id: 'practice', title: 'Interactive Practice & Flashcards', desc: 'Hands-on quiz questions, 3D flipcards, and active recall exercises' },
              ].map((fmt) => (
                <div
                  key={fmt.id}
                  onClick={() => setPreferredFormat(fmt.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: preferredFormat === fmt.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: preferredFormat === fmt.id ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{fmt.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmt.desc}</div>
                  </div>
                  {preferredFormat === fmt.id && <CheckCircle size={20} style={{ color: 'var(--primary)' }} />}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handlePrevStep} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary">
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Comprehensive Accessibility Preferences */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                Inclusive Accessibility Preferences 🎛️
              </h2>
            </div>

            {/* Ethical Non-Diagnosis Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: 'var(--primary-light)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
              }}
            >
              <ShieldCheck size={22} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <strong>Strict Privacy & Ethics Standard:</strong> All accessibility options are 100% voluntary.
                AdaptiveLearn AI never diagnoses or labels students with a disability based on quiz scores. You are in total control.
              </div>
            </div>

            {/* 8 Voluntary Accessibility Categories */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                1. Select your accessibility needs (Choose all that apply):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {accessibilityCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedNeeds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleNeed(cat.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-soft)' : 'var(--bg-card)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
                          <Icon size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                          <span>{cat.label}</span>
                        </div>
                        {isSelected && <CheckCircle size={16} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        {cat.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Preference Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Text Size */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Default Font Sizing
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'normal', label: 'Normal (16px)' },
                    { id: 'medium', label: 'Medium (18px)' },
                    { id: 'large', label: 'Large (20px)' },
                    { id: 'xlarge', label: 'X-Large (23px)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTextSizeChoice(s.id)}
                      className={`btn btn-sm ${textSizeChoice === s.id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Contrast */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Display Contrast Theme
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'standard', label: 'Warm Ivory' },
                    { id: 'high-contrast', label: 'High Contrast' },
                    { id: 'black-gold', label: 'Black & Gold' },
                    { id: 'cream', label: 'Sepia Cream' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setContrastChoice(c.id)}
                      className={`btn btn-sm ${contrastChoice === c.id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Speed */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Audio Narration Speed
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    { rate: 0.75, label: '0.75x Slow' },
                    { rate: 0.9, label: '0.9x Relaxed' },
                    { rate: 1.0, label: '1.0x Normal' },
                    { rate: 1.25, label: '1.25x Fast' },
                  ].map((a) => (
                    <button
                      key={a.rate}
                      type="button"
                      onClick={() => setAudioSpeedChoice(a.rate)}
                      className={`btn btn-sm ${audioSpeedChoice === a.rate ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Assessment Time */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Assessment Quiz Time Allotment
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { mult: 1.0, label: 'Standard (1.0x)' },
                    { mult: 1.5, label: '1.5x Extra Time' },
                    { mult: 2.0, label: '2.0x Double Time' },
                  ].map((t) => (
                    <button
                      key={t.mult}
                      type="button"
                      onClick={() => setTimeMultiplierChoice(t.mult)}
                      className={`btn btn-sm ${timeMultiplierChoice === t.mult ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility Feature Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dyslexia-Friendly Font (Lexend / OpenDyslexic)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Heavier baselines to prevent character swapping</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dyslexicFontChoice}
                    onChange={(e) => setDyslexicFontChoice(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Visual Reading Ruler</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tinted focus bar following mouse or line to reduce tracking fatigue</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={readingRulerChoice}
                    onChange={(e) => setReadingRulerChoice(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Visual Bell (Hearing Alerts)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Flashes visible alert on screen whenever audio chimes play</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualBellChoice}
                    onChange={(e) => setVisualBellChoice(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Motor Accessibility Mode</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Large 44px touch targets and bold 4px focus rings for keyboard/switch</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={motorModeChoice}
                    onChange={(e) => setMotorModeChoice(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Distraction-Free Focus Mode</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Presents one concept at a time and mutes peripheral UI clutter</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cognitiveModeChoice}
                    onChange={(e) => setCognitiveModeChoice(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handlePrevStep} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary">
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Short Baseline Knowledge Quiz */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Quick 3-Question Warmup Check 🎯
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
              No pressure! This is not a graded test—it simply calibrates the starting difficulty of your practice questions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {diagnosticQuestions.map((q, idx) => (
                <div key={q.id} style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    {idx + 1}. {q.question}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          setQuizAnswers({ ...quizAnswers, [q.id]: optIdx });
                          playChime('click', `Selected option ${optIdx + 1}`);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: quizAnswers[q.id] === optIdx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: quizAnswers[q.id] === optIdx ? 'var(--primary-light)' : 'var(--bg-card)',
                          textAlign: 'left',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          fontWeight: quizAnswers[q.id] === optIdx ? 700 : 400,
                          minHeight: '44px',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handlePrevStep} className="btn btn-secondary">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleNextStep} className="btn btn-primary">
                <span>View Summary</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Profile Summary & Enter Space */}
        {step === 5 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}>
              <Award size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Your Inclusive Adaptive Space is Ready! 🎉
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Here is your personalized inclusive learning profile summary:
            </p>

            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              textAlign: 'left',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learner Name</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{name || 'Student'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preferred Format</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'capitalize' }}>{preferredFormat}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Font Size</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'capitalize' }}>{textSizeChoice}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contrast Theme</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'capitalize' }}>{contrastChoice}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dyslexic Font</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{dyslexicFontChoice ? 'Enabled' : 'Standard'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visual Bell (Deaf Alert)</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{visualBellChoice ? 'Active' : 'Off'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Motor Support</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{motorModeChoice ? '44px+ Buttons' : 'Standard'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quiz Time Multiplier</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{timeMultiplierChoice}x Time</div>
              </div>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              disabled={isSaving}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '1rem' }}
            >
              <span>{isSaving ? 'Configuring Space...' : 'Enter My Inclusive Dashboard'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
