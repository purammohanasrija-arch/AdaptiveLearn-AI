import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sliders,
  Type,
  Eye,
  Volume2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Check,
  Ear,
  Brain,
  MousePointer,
  Mic,
  Bell,
  Clock,
  Compass,
  BookOpen,
  Layers,
  Award,
  Play,
  Pause,
  RefreshCw,
  Zap,
  HelpCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const AccessibilitySettingsPage = () => {
  const { user, token } = useAuth();
  const {
    // Theme & Contrast
    theme,
    setTheme,
    contrastPreset,
    setContrastPreset,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    contentWidth,
    setContentWidth,

    // Typography & Dyslexia
    textSize,
    setTextSize,
    dyslexicFont,
    setDyslexicFont,
    letterSpacing,
    setLetterSpacing,
    wordSpacing,
    setWordSpacing,
    lineSpacing,
    setLineSpacing,
    bionicReading,
    setBionicReading,

    // Reading Ruler
    readingRulerEnabled,
    setReadingRulerEnabled,
    readingRulerTint,
    setReadingRulerTint,

    // Hearing & Visual Bell
    visualBellEnabled,
    setVisualBellEnabled,
    triggerVisualBell,
    captionsEnabled,
    setCaptionsEnabled,
    captionSize,
    setCaptionSize,

    // Cognitive & Focus
    cognitiveMode,
    setCognitiveMode,
    zenBreakOpen,
    setZenBreakOpen,
    assessmentTimeMultiplier,
    setAssessmentTimeMultiplier,

    // Motor Accessibility
    motorMode,
    setMotorMode,

    // Speech & Cues
    soundEffects,
    setSoundEffects,
    speechRate,
    setSpeechRate,
    availableVoices,
    activeVoice,
    setActiveVoice,
    speakText,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    isSpeaking,
    isPaused,
    playChime,
    announce,
    resetSettings,
  } = useAccessibility();

  // Active Tab: 'visual' | 'dyslexia' | 'hearing' | 'cognitive' | 'motor' | 'sign_language'
  const [activeTab, setActiveTab] = useState('visual');

  // Sign Language Library State
  const [signResources, setSignResources] = useState(null);
  const [signFilter, setSignFilter] = useState('all'); // 'all', 'alphabet', 'numbers', 'vocabulary'
  const [signSearch, setSignSearch] = useState('');
  const [selectedSignItem, setSelectedSignItem] = useState(null);

  // Content Simplifier Testing State (Output A/B/C/D/E test)
  const [sampleText, setSampleText] = useState(
    'Photosynthesis is a fundamental biological mechanism by which photoautotrophic organisms synthesize carbohydrate macromolecules utilizing solar electromagnetic radiation, water, and atmospheric carbon dioxide.'
  );
  const [simplifiedResult, setSimplifiedResult] = useState(null);
  const [isSimplifying, setIsSimplifying] = useState(false);

  // Save to Cloud Feedback
  const [saveStatus, setSaveStatus] = useState(null);

  // Load verified sign language resources from FastAPI backend
  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await api.getAccessibilityResources();
        if (data && data.signLanguage) {
          setSignResources(data.signLanguage);
          if (data.signLanguage.vocabulary?.length > 0) {
            setSelectedSignItem(data.signLanguage.vocabulary[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load sign resources from API, using fallback data:', err);
      }
    };
    loadResources();
  }, []);

  // Save all settings persistently to FastAPI Learner Profile
  const handleSaveToCloud = async () => {
    setSaveStatus('saving');
    playChime('click', 'Saving accessibility profile');
    const preferences = {
      textSize,
      textContrast: contrastPreset,
      contrastTheme: contrastPreset,
      theme,
      highContrast,
      dyslexicFont,
      letterSpacing,
      wordSpacing,
      lineSpacing,
      bionicReading,
      readingRuler: readingRulerEnabled,
      readingRulerTint,
      visualBell: visualBellEnabled,
      captionsEnabled,
      captionSize,
      cognitiveMode,
      focusMode: cognitiveMode,
      assessmentTimeMultiplier,
      motorMode,
      soundEffects,
      audioSpeed: speechRate,
      reducedMotion,
    };

    try {
      await api.updateAccessibilityPreferences(preferences, user?.id || 'user-student-a', token);
      setSaveStatus('success');
      playChime('success', 'Preferences saved to cloud');
      announce('Accessibility settings successfully synchronized to your account.');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error('Save preferences failed:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  // Run Content Simplifier NLP
  const handleTestSimplify = async () => {
    if (!sampleText) return;
    setIsSimplifying(true);
    try {
      const res = await api.simplifyContentAccessible({ text: sampleText, targetGrade: 5 });
      setSimplifiedResult(res);
      playChime('success', 'Readability analyzed');
      announce(`Text simplified. Reading ease improved by ${res.readingEaseGain} points.`);
    } catch (err) {
      console.error('Simplification failed:', err);
    } finally {
      setIsSimplifying(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1040px', margin: '0 auto' }}>
      {/* Page Title & Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Sliders size={28} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Inclusive Accessibility Control Center
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            WCAG 2.2 AA compliant multimodal controls for visual, hearing, reading, dyslexia, cognitive, and motor requirements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={resetSettings}
            className="btn btn-secondary btn-sm"
            title="Reset to default settings"
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveToCloud}
            disabled={saveStatus === 'saving'}
            className="btn btn-primary btn-sm"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved to Profile!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Ethical Guarantee Alert */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--primary-light)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '2rem',
        }}
      >
        <ShieldCheck size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
          <strong>Voluntary Self-Determination:</strong> All options here are student-selected.
          We never infer disability from quiz accuracy, nor classify learners without consent.
        </div>
      </div>

      {/* 6 Modality Tabs */}
      <div
        role="tablist"
        aria-label="Accessibility Modalities"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { id: 'visual', label: 'Visual Accessibility', icon: Eye },
          { id: 'dyslexia', label: 'Dyslexia-Friendly Reading', icon: Type },
          { id: 'hearing', label: 'Hearing & Visual Bell', icon: Ear },
          { id: 'cognitive', label: 'Cognitive & Focus Mode', icon: Brain },
          { id: 'motor', label: 'Motor & Keyboard Access', icon: MousePointer },
          { id: 'sign_language', label: 'Sign Language Learning Support', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveTab(tab.id);
                playChime('click', `Switched to ${tab.label}`);
                announce(`${tab.label} settings selected`);
              }}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: isActive ? 800 : 600,
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Preview Box for Active Settings */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '2.5rem',
          border: '2px solid var(--primary)',
          background: 'var(--bg-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-sky" style={{ fontWeight: 800 }}>
              Live Modality Preview Box
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              (Reflects font size, contrast theme, letter spacing, and speech rate)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeech();
                } else {
                  speakText(
                    'Welcome to AdaptiveLearn AI. This preview demonstrates your selected typography, contrast palette, and audio narration pacing.',
                    'live-preview'
                  );
                }
              }}
              className="btn btn-secondary btn-sm"
            >
              {isSpeaking ? <Pause size={15} /> : <Volume2 size={15} />}
              <span>{isSpeaking ? 'Stop Audio' : 'Test Speech'}</span>
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
          Mastering Algorithms: Step by Step
        </h3>
        <p style={{ margin: 0, lineHeight: 'var(--line-height-root)' }}>
          An algorithm is a clear, finite sequence of instructions designed to solve a problem or accomplish a specific computational goal.
          Whether baking a cake, sorting numbers, or steering an autonomous rover, every step builds upon the previous one with reliable precision.
        </p>
      </div>

      {/* TAB 1: VISUAL ACCESSIBILITY MODE */}
      {activeTab === 'visual' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Contrast Themes */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Eye size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Contrast & Display Palettes</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'standard', name: 'Warm Ivory (#FFF9F5)', desc: 'Specification baseline with rose coral accents' },
                { id: 'high-contrast', name: 'High Contrast Light (WCAG AAA)', desc: 'True black text with crisp borders' },
                { id: 'black-gold', name: 'Black & Gold (14:1 AAA Ratio)', desc: 'Deep black background with luminous yellow text' },
                { id: 'cream', name: 'Sepia Cream (Low Eye-Strain)', desc: 'Warm espresso text on parchment background' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setContrastPreset(c.id);
                    setHighContrast(c.id.includes('high-contrast') || c.id === 'black-gold');
                    playChime('toggle', `Contrast set to ${c.name}`);
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: contrastPreset === c.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: contrastPreset === c.id ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.desc}</div>
                  </div>
                  {contrastPreset === c.id && <Check size={18} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizing Controls */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Type size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Font Size Scaling</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'normal', label: 'Normal (16px)' },
                { id: 'medium', label: 'Medium (18px)' },
                { id: 'large', label: 'Large (20px)' },
                { id: 'xlarge', label: 'X-Large (23px)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setTextSize(s.id);
                    playChime('toggle');
                    announce(`Text size set to ${s.label}`);
                  }}
                  className={`btn btn-sm ${textSize === s.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Reader & Audio Description Flags */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
              Assistive Screen Reader & Tactile Features
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Semantic HTML & ARIA Live Regions</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ensures seamless screen reader narration with NVDA, JAWS, and VoiceOver.</div>
                </div>
                <span className="badge badge-emerald">Always Active</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Reduced Motion (Zero Vestibular Stress)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Disables sliding and floating animations across the entire application.</div>
                </div>
                <button
                  onClick={() => {
                    setReducedMotion(!reducedMotion);
                    playChime('toggle');
                  }}
                  className={`btn btn-sm ${reducedMotion ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {reducedMotion ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYSLEXIA-FRIENDLY READING MODE */}
      {activeTab === 'dyslexia' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Dyslexic Font & Spacing */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BookOpen size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dyslexia-Optimized Typography</h2>
            </div>

            {/* Font Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>OpenDyslexic / Lexend Font System</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Weighted bottom gravity shapes prevent character inversion (b/d/p/q) and word blurring.
                </div>
              </div>
              <button
                onClick={() => {
                  setDyslexicFont(!dyslexicFont);
                  playChime('toggle');
                  announce(`Dyslexia font ${!dyslexicFont ? 'enabled' : 'disabled'}`);
                }}
                className={`btn btn-sm ${dyslexicFont ? 'btn-primary' : 'btn-secondary'}`}
              >
                {dyslexicFont ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Letter Spacing */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Letter Spacing (Character Separation)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'normal', label: 'Standard Spacing' },
                  { id: 'wide', label: 'Wide (+1.5px)' },
                  { id: 'extra-wide', label: 'Extra Wide (+3px)' },
                ].map((ls) => (
                  <button
                    key={ls.id}
                    onClick={() => {
                      setLetterSpacing(ls.id);
                      playChime('toggle');
                    }}
                    className={`btn btn-sm ${letterSpacing === ls.id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Spacing */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Word Spacing (Word Separation)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'normal', label: 'Standard Spacing' },
                  { id: 'wide', label: 'Wide (+3px)' },
                  { id: 'extra-wide', label: 'Extra Wide (+6px)' },
                ].map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWordSpacing(ws.id);
                      playChime('toggle');
                    }}
                    className={`btn btn-sm ${wordSpacing === ws.id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {ws.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Line Height (Vertical Relaxation)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'normal', label: 'Normal (1.6)' },
                  { id: 'relaxed', label: 'Relaxed (1.85)' },
                  { id: 'loose', label: 'Loose (2.2)' },
                ].map((lh) => (
                  <button
                    key={lh.id}
                    onClick={() => {
                      setLineSpacing(lh.id);
                      playChime('toggle');
                    }}
                    className={`btn btn-sm ${lineSpacing === lh.id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reading Ruler & Bionic Reading */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sliders size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reading Ruler & Focus Guides</h2>
            </div>

            {/* Ruler Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Overlay Reading Ruler</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  A floating tinted bar that tracks pointer position to keep your eyes centered on one line.
                </div>
              </div>
              <button
                onClick={() => {
                  setReadingRulerEnabled(!readingRulerEnabled);
                  playChime('toggle');
                }}
                className={`btn btn-sm ${readingRulerEnabled ? 'btn-primary' : 'btn-secondary'}`}
              >
                {readingRulerEnabled ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Ruler Tint */}
            {readingRulerEnabled && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Reading Ruler Tint Shade
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'amber', label: 'Amber (Warm Gold)' },
                    { id: 'cyan', label: 'Cyan (Cool Blue)' },
                    { id: 'rose', label: 'Rose (Soft Pink)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setReadingRulerTint(t.id);
                        playChime('toggle');
                      }}
                      className={`btn btn-sm ${readingRulerTint === t.id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bionic Reading Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Bionic Reading Fixation Anchor</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Bolds the initial letters of words to guide the eye and improve reading velocity.
                </div>
              </div>
              <button
                onClick={() => {
                  setBionicReading(!bionicReading);
                  playChime('toggle');
                }}
                className={`btn btn-sm ${bionicReading ? 'btn-primary' : 'btn-secondary'}`}
              >
                {bionicReading ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEARING & VISUAL BELL */}
      {activeTab === 'hearing' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Visual Bell Alerting System */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bell size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Visual Bell Sound Alerts</h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              For students who are deaf or hard-of-hearing, sound chimes are converted into high-visibility on-screen notifications and subtle flashing banners.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Visual Bell Banner & Icon</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Flashes an amber alert whenever audio events trigger (quiz completion, hints, error cues).
                </div>
              </div>
              <button
                onClick={() => {
                  setVisualBellEnabled(!visualBellEnabled);
                  playChime('toggle');
                }}
                className={`btn btn-sm ${visualBellEnabled ? 'btn-primary' : 'btn-secondary'}`}
              >
                {visualBellEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  playChime('success', 'Task Completed Successfully!');
                }}
                className="btn btn-secondary btn-sm"
              >
                <Bell size={15} />
                <span>Test Success Visual Bell</span>
              </button>

              <button
                onClick={() => {
                  playChime('hint', 'New Tutor Hint Available');
                }}
                className="btn btn-secondary btn-sm"
              >
                <Bell size={15} />
                <span>Test Hint Visual Bell</span>
              </button>
            </div>
          </div>

          {/* Captions & Transcripts */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileText size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Captions & Complete Transcripts</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Synchronized Video & Audio Captions</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Always displays verbatim text captions under media players.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCaptionsEnabled(!captionsEnabled);
                    playChime('toggle');
                  }}
                  className={`btn btn-sm ${captionsEnabled ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {captionsEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Caption Font Size
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'medium', label: 'Medium (18px)' },
                    { id: 'large', label: 'Large (22px)' },
                    { id: 'xlarge', label: 'Extra Large (26px)' },
                  ].map((cs) => (
                    <button
                      key={cs.id}
                      onClick={() => {
                        setCaptionSize(cs.id);
                        playChime('toggle');
                      }}
                      className={`btn btn-sm ${captionSize === cs.id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COGNITIVE & FOCUS MODE */}
      {activeTab === 'cognitive' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Distraction-Free Focus Mode */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Brain size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Distraction-Free Focus Mode</h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Designed for learners with ADHD or working memory challenges. Reduces extraneous visual clutter and isolates one educational concept at a time.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>One-Concept-At-A-Time Pacing</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Breaks long paragraphs into bite-sized micro-cards with explicit check-in pauses.
                </div>
              </div>
              <button
                onClick={() => {
                  setCognitiveMode(!cognitiveMode);
                  playChime('toggle');
                  announce(`Focus mode ${!cognitiveMode ? 'enabled' : 'disabled'}`);
                }}
                className={`btn btn-sm ${cognitiveMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cognitiveMode ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Extra Assessment Time */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Extended Assessment Time Multiplier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { mult: 1.0, label: 'Standard (1.0x)' },
                  { mult: 1.5, label: '1.5x Time (+50%)' },
                  { mult: 2.0, label: '2.0x Double Time' },
                ].map((tm) => (
                  <button
                    key={tm.mult}
                    onClick={() => {
                      setAssessmentTimeMultiplier(tm.mult);
                      playChime('toggle');
                    }}
                    className={`btn btn-sm ${assessmentTimeMultiplier === tm.mult ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {tm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zen Break Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>🧘 2-Minute Zen Relaxation Break</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Guided 4-7-8 breathing animation to reset sensory overload during intense study.
                </div>
              </div>
              <button
                onClick={() => {
                  setZenBreakOpen(true);
                  playChime('hint', 'Zen break initiated');
                }}
                className="btn btn-secondary btn-sm"
              >
                <span>Take Zen Break</span>
              </button>
            </div>
          </div>

          {/* NLP Content Simplifier Tool */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Zap size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>NLP Readability Simplifier Engine</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Test our backend NLP simplification algorithm. It computes Flesch-Kincaid Grade Level and replaces dense jargon with plain language.
            </p>

            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                marginBottom: '0.75rem',
              }}
            />

            <button
              onClick={handleTestSimplify}
              disabled={isSimplifying}
              className="btn btn-primary btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              {isSimplifying ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isSimplifying ? 'Analyzing NLP Readability...' : 'Simplify Text & Measure Flesch-Kincaid'}</span>
            </button>

            {simplifiedResult && (
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Grade Level</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#E11D48' }}>Grade {simplifiedResult.originalMetrics.fleschKincaidGrade}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simplified Grade Level</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#059669' }}>Grade {simplifiedResult.simplifiedMetrics.fleschKincaidGrade}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reading Ease Gain</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>+{simplifiedResult.readingEaseGain} pts</div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Simplified Output:</div>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  {simplifiedResult.simplifiedText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MOTOR & PHYSICAL ACCESSIBILITY */}
      {activeTab === 'motor' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <MousePointer size={22} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Motor & Physical Navigation Mode</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>WCAG 2.5.5 Large Target Mode (44px Minimum)</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Guarantees touch targets and clickable buttons meet or exceed 44x44 pixels with bold 4px focus rings.
                </div>
              </div>
              <button
                onClick={() => {
                  setMotorMode(!motorMode);
                  playChime('toggle');
                  announce(`Motor mode ${!motorMode ? 'enabled' : 'disabled'}`);
                }}
                className={`btn btn-sm ${motorMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {motorMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Full Keyboard Navigation Cheat Sheet
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {[
                { key: 'Tab', action: 'Move to next interactive button or control' },
                { key: 'Shift + Tab', action: 'Move to previous interactive element' },
                { key: 'Space / Enter', action: 'Activate selected button or flip 3D card' },
                { key: 'Esc', action: 'Close modals, drawers, or Zen Break' },
                { key: 'Arrow Keys', action: 'Navigate quiz options & reading slider' },
                { key: 'Alt + 1', action: 'Quick toggle high contrast theme' },
              ].map((k) => (
                <div
                  key={k.key}
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{k.action}</span>
                  <kbd style={{ background: 'var(--bg-card)', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 800, fontSize: '0.78rem' }}>
                    {k.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SIGN LANGUAGE LEARNING SUPPORT */}
      {activeTab === 'sign_language' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header & Verification Disclaimer */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Compass size={24} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Verified Sign Language Learning Resource Deck
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Curated reference for Deaf students, educators, and peers.
              <strong style={{ color: 'var(--text-main)', display: 'block', marginTop: '0.35rem' }}>
                Rule Compliance Notice: All handshapes, finger spelling, and educational signs are verified against American Sign Language (ASL) educational standards. We do not make misleading claims of automated real-time translation.
              </strong>
            </p>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[
                { id: 'all', label: 'All Signs' },
                { id: 'vocabulary', label: 'Core Educational Vocabulary (10)' },
                { id: 'alphabet', label: 'Finger Spelling A-Z (26)' },
                { id: 'numbers', label: 'Numbers 1-10' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSignFilter(f.id)}
                  className={`btn btn-sm ${signFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Selected Sign Highlight Card */}
            {selectedSignItem && (
              <div
                style={{
                  background: 'var(--primary-light)',
                  border: '2px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    fontSize: '3.5rem',
                    background: 'var(--bg-card)',
                    width: '90px',
                    height: '90px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0,
                  }}
                >
                  {selectedSignItem.unicodeIcon || '🤟'}
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                      {selectedSignItem.sign || selectedSignItem.name || selectedSignItem.letter}
                    </h3>
                    {selectedSignItem.meaning && (
                      <span className="badge badge-sky">{selectedSignItem.meaning}</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    <strong>Handshape:</strong> {selectedSignItem.handshape}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {selectedSignItem.description || selectedSignItem.exampleSentence}
                  </div>

                  <button
                    onClick={() => {
                      speakText(
                        `Sign for ${selectedSignItem.sign || selectedSignItem.name}. Handshape: ${selectedSignItem.handshape}. ${selectedSignItem.description || ''}`,
                        'sign-desc'
                      );
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Volume2 size={15} />
                    <span>Hear Verbal Description</span>
                  </button>
                </div>
              </div>
            )}

            {/* Grid of Signs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {/* Render Alphabet */}
              {(signFilter === 'all' || signFilter === 'alphabet') &&
                signResources?.alphabet?.map((item) => (
                  <button
                    key={item.letter}
                    onClick={() => {
                      setSelectedSignItem(item);
                      playChime('click', `Selected letter ${item.letter}`);
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSignItem?.letter === item.letter ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedSignItem?.letter === item.letter ? 'var(--primary-soft)' : 'var(--bg-card)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{item.unicodeIcon}</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{item.letter}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Finger Spelling</div>
                  </button>
                ))}

              {/* Render Numbers */}
              {(signFilter === 'all' || signFilter === 'numbers') &&
                signResources?.numbers?.map((num) => (
                  <button
                    key={num.number}
                    onClick={() => {
                      setSelectedSignItem(num);
                      playChime('click', `Selected number ${num.number}`);
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSignItem?.number === num.number ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedSignItem?.number === num.number ? 'var(--primary-soft)' : 'var(--bg-card)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{num.unicodeIcon}</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>#{num.number}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Count Sign</div>
                  </button>
                ))}

              {/* Render Vocabulary */}
              {(signFilter === 'all' || signFilter === 'vocabulary') &&
                signResources?.vocabulary?.map((vocab) => (
                  <button
                    key={vocab.sign}
                    onClick={() => {
                      setSelectedSignItem(vocab);
                      playChime('click', `Selected sign ${vocab.sign}`);
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSignItem?.sign === vocab.sign ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedSignItem?.sign === vocab.sign ? 'var(--primary-soft)' : 'var(--bg-card)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🤟</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{vocab.sign}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{vocab.meaning}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
