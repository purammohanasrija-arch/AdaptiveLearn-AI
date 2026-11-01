import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  // Theme & Contrast state
  const [theme, setTheme] = useState(() => localStorage.getItem('adaptlearn_theme') || 'warm-pink');
  const [contrastPreset, setContrastPreset] = useState(() => localStorage.getItem('adaptlearn_contrastPreset') || 'standard');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('adaptlearn_textSize') || 'medium');
  const [contentWidth, setContentWidth] = useState(() => localStorage.getItem('adaptlearn_contentWidth') || 'standard');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('adaptlearn_highContrast') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('adaptlearn_reducedMotion') === 'true');
  const [soundEffects, setSoundEffects] = useState(() => localStorage.getItem('adaptlearn_soundEffects') !== 'false');

  // Dyslexia & Typography
  const [dyslexicFont, setDyslexicFont] = useState(() => localStorage.getItem('adaptlearn_dyslexic') === 'true');
  const [letterSpacing, setLetterSpacing] = useState(() => localStorage.getItem('adaptlearn_letterSpacing') || 'normal');
  const [wordSpacing, setWordSpacing] = useState(() => localStorage.getItem('adaptlearn_wordSpacing') || 'normal');
  const [lineSpacing, setLineSpacing] = useState(() => localStorage.getItem('adaptlearn_lineSpacing') || 'relaxed');
  const [bionicReading, setBionicReading] = useState(() => localStorage.getItem('adaptlearn_bionicReading') === 'true');

  // Reading Ruler
  const [readingRulerEnabled, setReadingRulerEnabled] = useState(() => localStorage.getItem('adaptlearn_readingRuler') === 'true');
  const [readingRulerTint, setReadingRulerTint] = useState(() => localStorage.getItem('adaptlearn_readingRulerTint') || 'amber');

  // Hearing Accessibility & Visual Bell
  const [visualBellEnabled, setVisualBellEnabled] = useState(() => localStorage.getItem('adaptlearn_visualBell') !== 'false');
  const [activeVisualBell, setActiveVisualBell] = useState(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(() => localStorage.getItem('adaptlearn_captions') !== 'false');
  const [captionSize, setCaptionSize] = useState(() => localStorage.getItem('adaptlearn_captionSize') || 'large');

  // Cognitive & Focus Mode
  const [cognitiveMode, setCognitiveMode] = useState(() => localStorage.getItem('adaptlearn_cognitiveMode') === 'true');
  const [zenBreakOpen, setZenBreakOpen] = useState(false);
  const [assessmentTimeMultiplier, setAssessmentTimeMultiplier] = useState(() => parseFloat(localStorage.getItem('adaptlearn_timeMultiplier') || '1.0'));

  // Motor & Physical Mode
  const [motorMode, setMotorMode] = useState(() => localStorage.getItem('adaptlearn_motorMode') === 'true');

  // Primary Learner Pathway: 'sighted-video' (With Eyes) vs 'blind-audio' (Without Eyes / Audio-First)
  const [primaryModality, setPrimaryModalityState] = useState(() => localStorage.getItem('adaptlearn_primaryModality') || 'sighted-video');

  // Speech Synthesis state
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem('adaptlearn_speechRate') || '0.9'));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVoice, setActiveVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [activeSpeechSection, setActiveSpeechSection] = useState(null);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [activeWordCharIndex, setActiveWordCharIndex] = useState(0);

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState('');
  const audioContextRef = useRef(null);
  const visualBellTimeoutRef = useRef(null);

  // Visual Bell Trigger (Alerts deaf & hard-of-hearing students when sounds play)
  const triggerVisualBell = useCallback((message = 'Audio Alert') => {
    if (!visualBellEnabled) return;
    if (visualBellTimeoutRef.current) clearTimeout(visualBellTimeoutRef.current);
    setActiveVisualBell(message);
    visualBellTimeoutRef.current = setTimeout(() => {
      setActiveVisualBell(null);
    }, 2800);
  }, [visualBellEnabled]);

  // Sync with HTML root element attributes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-contrast-theme', contrastPreset);
    root.setAttribute('data-text-size', textSize);
    root.setAttribute('data-content-width', contentWidth);
    root.setAttribute('data-dyslexic', dyslexicFont ? 'true' : 'false');
    root.setAttribute('data-letter-spacing', letterSpacing);
    root.setAttribute('data-word-spacing', wordSpacing);
    root.setAttribute('data-line-spacing', lineSpacing);
    root.setAttribute('data-high-contrast', highContrast ? 'true' : 'false');
    root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
    root.setAttribute('data-bionic', bionicReading ? 'true' : 'false');
    root.setAttribute('data-modality', primaryModality);
    root.setAttribute('data-cognitive-mode', cognitiveMode ? 'true' : 'false');
    root.setAttribute('data-motor-mode', motorMode ? 'true' : 'false');
    root.setAttribute('data-captions', captionsEnabled ? 'true' : 'false');

    localStorage.setItem('adaptlearn_theme', theme);
    localStorage.setItem('adaptlearn_contrastPreset', contrastPreset);
    localStorage.setItem('adaptlearn_textSize', textSize);
    localStorage.setItem('adaptlearn_contentWidth', contentWidth);
    localStorage.setItem('adaptlearn_dyslexic', dyslexicFont);
    localStorage.setItem('adaptlearn_letterSpacing', letterSpacing);
    localStorage.setItem('adaptlearn_wordSpacing', wordSpacing);
    localStorage.setItem('adaptlearn_lineSpacing', lineSpacing);
    localStorage.setItem('adaptlearn_highContrast', highContrast);
    localStorage.setItem('adaptlearn_reducedMotion', reducedMotion);
    localStorage.setItem('adaptlearn_soundEffects', soundEffects);
    localStorage.setItem('adaptlearn_speechRate', speechRate.toString());
    localStorage.setItem('adaptlearn_readingRuler', readingRulerEnabled);
    localStorage.setItem('adaptlearn_readingRulerTint', readingRulerTint);
    localStorage.setItem('adaptlearn_bionicReading', bionicReading);
    localStorage.setItem('adaptlearn_primaryModality', primaryModality);
    localStorage.setItem('adaptlearn_visualBell', visualBellEnabled);
    localStorage.setItem('adaptlearn_captions', captionsEnabled);
    localStorage.setItem('adaptlearn_captionSize', captionSize);
    localStorage.setItem('adaptlearn_cognitiveMode', cognitiveMode);
    localStorage.setItem('adaptlearn_timeMultiplier', assessmentTimeMultiplier.toString());
    localStorage.setItem('adaptlearn_motorMode', motorMode);
  }, [
    theme, contrastPreset, textSize, contentWidth, dyslexicFont, letterSpacing, wordSpacing, lineSpacing,
    highContrast, reducedMotion, soundEffects, speechRate, readingRulerEnabled, readingRulerTint,
    bionicReading, primaryModality, visualBellEnabled, captionsEnabled, captionSize,
    cognitiveMode, assessmentTimeMultiplier, motorMode
  ]);

  // Load browser voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const naturalVoice = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
        ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
        setActiveVoice(naturalVoice || null);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Web Audio Synthetic Chimes with synchronized Visual Bell
  const playChime = useCallback((type = 'success', description = null) => {
    const alertDesc = description || (type === 'success' ? 'Task Completed' : type === 'hint' ? 'Learning Hint' : 'Setting Changed');
    triggerVisualBell(`🔔 Sound Cue: ${alertDesc}`);

    if (!soundEffects || typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'hint') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'toggle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio cue fail silently
    }
  }, [soundEffects, triggerVisualBell]);

  // Screen Reader Live Announcements
  const announce = useCallback((message) => {
    setAnnouncement('');
    setTimeout(() => {
      setAnnouncement(message);
    }, 50);
  }, []);

  // Text-To-Speech with boundary event tracking for synchronized word highlighting
  const speakText = useCallback((text, sectionId = null, onEndCallback = null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      announce('Speech synthesis is not supported on this device.');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) {
      setCurrentSpokenText('');
      setActiveWordCharIndex(0);
      return;
    }

    triggerVisualBell('Speaking aloud: Audio narration active');
    setCurrentSpokenText(text);
    const utterance = new SpeechSynthesisUtterance(text);
    if (activeVoice) utterance.voice = activeVoice;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setActiveSpeechSection(sectionId);
      announce(`Reading aloud: ${text.slice(0, 50)}...`);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setActiveWordCharIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSpeechSection(null);
      setCurrentSpokenText('');
      setActiveWordCharIndex(0);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSpeechSection(null);
      setCurrentSpokenText('');
      setActiveWordCharIndex(0);
    };

    window.speechSynthesis.speak(utterance);
  }, [activeVoice, speechRate, announce, triggerVisualBell]);

  const pauseSpeech = useCallback(() => {
    if ('speechSynthesis' in window && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      announce('Audio narration paused.');
    }
  }, [isSpeaking, isPaused, announce]);

  const resumeSpeech = useCallback(() => {
    if ('speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      announce('Audio narration resumed.');
    }
  }, [isPaused, announce]);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSpeechSection(null);
      setCurrentSpokenText('');
      setActiveWordCharIndex(0);
      announce('Audio narration stopped.');
    }
  }, [announce]);

  const resetSettings = useCallback(() => {
    setTheme('warm-pink');
    setContrastPreset('standard');
    setTextSize('medium');
    setContentWidth('standard');
    setDyslexicFont(false);
    setLetterSpacing('normal');
    setWordSpacing('normal');
    setLineSpacing('relaxed');
    setHighContrast(false);
    setReducedMotion(false);
    setSoundEffects(true);
    setSpeechRate(0.9);
    setReadingRulerEnabled(false);
    setReadingRulerTint('amber');
    setBionicReading(false);
    setZenBreakOpen(false);
    setVisualBellEnabled(true);
    setCaptionsEnabled(true);
    setCaptionSize('large');
    setCognitiveMode(false);
    setAssessmentTimeMultiplier(1.0);
    setMotorMode(false);
    setPrimaryModalityState('sighted-video');
    stopSpeech();
    announce('All accessibility settings reset to default.');
    playChime('hint', 'Settings reset');
  }, [stopSpeech, announce, playChime]);

  const setPrimaryModality = useCallback((modality) => {
    setPrimaryModalityState(modality);
    playChime('toggle', `Switched to ${modality}`);
    if (modality === 'blind-audio') {
      announce('Audio-First mode activated. Voice narration and screen-reader guidance prioritized.');
    } else {
      announce('Visual & Video mode activated. Diagrams and visual learning prioritized.');
    }
  }, [playChime, announce]);

  return (
    <AccessibilityContext.Provider
      value={{
        // Themes & Contrast
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
        activeVisualBell,
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

        // Modality
        primaryModality,
        setPrimaryModality,

        // Speech Synthesis & Cues
        soundEffects,
        setSoundEffects,
        speechRate,
        setSpeechRate,
        isSpeaking,
        isPaused,
        activeSpeechSection,
        currentSpokenText,
        activeWordCharIndex,
        availableVoices,
        activeVoice,
        setActiveVoice,
        speakText,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        playChime,

        // Announcements
        announce,
        announcement,
        resetSettings,
      }}
    >
      {children}

      {/* Floating Visual Bell Banner (For Deaf / Hard-of-Hearing Learners) */}
      {activeVisualBell && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 bg-amber-500 text-slate-950 font-bold rounded-2xl shadow-2xl border-2 border-white animate-bounce pointer-events-none"
        >
          <span className="text-xl">🔔</span>
          <span className="text-sm tracking-wide">{activeVisualBell}</span>
        </div>
      )}

      {/* Screen Reader live announcer */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
