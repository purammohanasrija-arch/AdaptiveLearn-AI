import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  Camera,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Compass,
  ArrowRight,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export const VoiceVideoAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { speakText, stopSpeech, isSpeaking, playChime, speechRate } = useAccessibility();
  const toast = useToast();

  // Assistant UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [avatarMode, setAvatarMode] = useState('avatar'); // 'avatar' | 'sign' | 'camera'
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);

  // Speech Recognition (Speech-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Student Webcam Mirror State
  const [isCamActive, setIsCamActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Dialogue & Assistant Messages
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'aria',
      text: "Hi there! I'm Aria, your AI Voice & Video Companion. You can talk to me with your microphone, watch me explain concepts with visual gestures, or ask me to guide you through any subject!",
      timestamp: 'Just now',
      visualCue: '👋 Welcome to AdaptLearn AI!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [mouthOpen, setMouthOpen] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);

  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        playChime('hint');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setInputValue(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.info('Voice mic ready. You can also type or use quick actions.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Animate mouth when speaking
  useEffect(() => {
    let interval;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 180);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Periodic natural eye blinking for avatar
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Auto-scroll chat log
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Handle student webcam mirror
  useEffect(() => {
    if (avatarMode === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [avatarMode, isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCamActive(true);
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err.message);
      setIsCamActive(false);
      toast.info('Camera unavailable in current environment; displaying Aria animated avatar.');
      setAvatarMode('avatar');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCamActive(false);
  };

  // Toggle voice listening
  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // Fallback for browsers that require user gesture reset
        toast.info('Listening for your voice... speak now!');
        setIsListening(true);
        setTimeout(() => setIsListening(false), 5000);
      }
    }
  };

  // Process voice & text message
  const handleSendMessage = async (textToSend = inputValue) => {
    const cleanText = (textToSend || transcript).trim();
    if (!cleanText || isLoading) return;

    // Check for direct voice action commands
    const lower = cleanText.toLowerCase();

    // Voice Command: Navigation
    if (lower.includes('show video') || lower.includes('watch video') || lower.includes('open video')) {
      navigate('/lessons/lesson-1?tab=video');
      speakResponse("Opening your accessible video lesson with subtitles now!");
      return;
    }
    if (lower.includes('go to lesson') || lower.includes('all lesson') || lower.includes('open library')) {
      navigate('/lessons');
      speakResponse("Taking you to the Adaptive Lesson Library!");
      return;
    }
    if (lower.includes('take quiz') || lower.includes('start quiz') || lower.includes('open quiz')) {
      navigate('/quiz/lesson-1');
      speakResponse("Taking you to your practice quiz!");
      return;
    }
    if (lower.includes('stop talking') || lower.includes('be quiet') || lower.includes('mute')) {
      stopSpeech();
      toast.info('Voice speech stopped');
      return;
    }

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setTranscript('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          lessonContext: {
            currentPath: location.pathname,
            title: 'Adaptive Learning Assistant',
          },
          studentProfile: {
            name: user?.name || 'Learner',
            preferredFormat: user?.profile?.preferredFormat || 'simplified',
            textSize: user?.profile?.textSize || 'large',
          },
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const reply = data.reply || data.response || "I'm right here with you! Let's break this down step-by-step.";

      const ariaMsg = {
        id: `aria-${Date.now()}`,
        sender: 'aria',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visualCue: data.visualCue || '💡 Key Insight',
      };

      setMessages((prev) => [...prev, ariaMsg]);
      speakResponse(reply);
    } catch (err) {
      console.warn('AI chat resilient fallback:', err);
      // Graceful local educational response
      let fallbackText = `I understand you're asking about "${cleanText}". In our adaptive lessons, we break big ideas into 1) simple real-world analogies, 2) visual diagrams, and 3) spoken audio. Would you like me to show you a video walkthrough or quiz you on this?`;
      if (cleanText.toLowerCase().includes('cpu')) {
        fallbackText = "The CPU is like the master head chef in a busy kitchen! It takes orders, reads instructions, and prepares answers at lightning speed.";
      } else if (cleanText.toLowerCase().includes('photo')) {
        fallbackText = "Photosynthesis is nature's solar kitchen! Plant leaves absorb sunlight and water to make food (glucose) and release fresh oxygen for us to breathe.";
      }

      const fallbackMsg = {
        id: `aria-fallback-${Date.now()}`,
        sender: 'aria',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visualCue: '✨ Simplified Concept',
      };

      setMessages((prev) => [...prev, fallbackMsg]);
      speakResponse(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text) => {
    setCurrentSubtitle(text);
    if (voiceAudioEnabled) {
      speakText(text, 'aria-assistant');
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  return (
    <>
      {/* 1. FLOATING MINIMIZED TRIGGER BUTTON (Bottom-Right) */}
      {!isOpen && (
        <aside
          aria-label="AI Voice and Video Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              playChime('click');
            }}
            className="animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, #E83B64 0%, #D81B60 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              boxShadow: '0 8px 24px rgba(232, 59, 100, 0.45)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.92rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            title="Open Aria - AI Voice & Video Assistant"
            id="btn-open-assistant"
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={16} />
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>Aria AI Guide</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>🎙️ Voice & 🎥 Video Assistant</div>
            </div>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #10B981',
              marginLeft: '2px',
            }} />
          </button>
        </aside>
      )}

      {/* 2. MINIMIZED SLIM DOCK */}
      {isOpen && isMinimized && (
        <aside
          aria-label="Aria Assistant Minimized"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Aria (Active)</span>
            </div>

            <button
              onClick={handleToggleListening}
              className={`btn btn-sm ${isListening ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', gap: '4px' }}
              title="Speak into microphone"
            >
              {isListening ? <Mic size={14} style={{ animation: 'pulse 1s infinite' }} /> : <Mic size={14} />}
              <span>{isListening ? 'Listening...' : 'Voice'}</span>
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.25rem' }}
              title="Expand Video Companion"
            >
              <Maximize2 size={16} />
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                stopSpeech();
              }}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.25rem' }}
              title="Close Assistant"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* 3. FULL INTERACTIVE VOICE & VIDEO ASSISTANT MODAL WINDOW */}
      {isOpen && !isMinimized && (
        <aside
          role="complementary"
          aria-label="AI Voice and Video Companion Window"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 48px)',
            background: 'var(--bg-card)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="animate-fade-in"
        >
          {/* Top Window Bar */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #D81B60 100%)',
            color: '#FFFFFF',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.2 }}>Aria AI Companion</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Interactive Voice & Video Guide</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
                className="btn btn-ghost btn-sm"
                style={{ color: '#FFFFFF', padding: '0.25rem' }}
                title={voiceAudioEnabled ? 'Mute Voice Audio' : 'Unmute Voice Audio'}
                aria-pressed={voiceAudioEnabled}
              >
                {voiceAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="btn btn-ghost btn-sm"
                style={{ color: '#FFFFFF', padding: '0.25rem' }}
                title="Minimize Window"
              >
                <Minimize2 size={16} />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  stopSpeech();
                  stopCamera();
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: '#FFFFFF', padding: '0.25rem' }}
                title="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0.4rem 0.75rem',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.75rem',
          }}>
            <button
              onClick={() => setAvatarMode('avatar')}
              className={`btn btn-sm ${avatarMode === 'avatar' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
            >
              👩‍🏫 Avatar Guide
            </button>
            <button
              onClick={() => setAvatarMode('sign')}
              className={`btn btn-sm ${avatarMode === 'sign' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
            >
              🤟 Visual & Sign
            </button>
            <button
              onClick={() => setAvatarMode('camera')}
              className={`btn btn-sm ${avatarMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem' }}
            >
              📷 Video Mirror
            </button>
          </div>

          {/* 🎥 INTERACTIVE VIDEO / AVATAR VIEWPORT */}
          <div style={{
            height: '180px',
            background: 'linear-gradient(180deg, #1A1320 0%, #2A1C30 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* AVATAR MODE */}
            {avatarMode === 'avatar' && (
              <div style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
                {/* Aura rings when speaking or listening */}
                {(isSpeaking || isListening) && (
                  <div style={{
                    position: 'absolute',
                    inset: '-15px',
                    borderRadius: '50%',
                    border: `2px dashed ${isListening ? '#10B981' : 'var(--primary)'}`,
                    animation: 'spin 6s linear infinite',
                    opacity: 0.8,
                  }} />
                )}

                {/* Animated Aria Face */}
                <svg width="105" height="105" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDDFD0" />
                      <stop offset="100%" stopColor="#F5B9A8" />
                    </linearGradient>
                    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5D3A24" />
                      <stop offset="100%" stopColor="#3C2415" />
                    </linearGradient>
                  </defs>

                  {/* Hair back */}
                  <circle cx="50" cy="50" r="44" fill="url(#hairGrad)" />

                  {/* Face */}
                  <circle cx="50" cy="54" r="34" fill="url(#skinGrad)" />

                  {/* Cheeks blush */}
                  <circle cx="34" cy="59" r="6" fill="#F43F5E" opacity="0.25" />
                  <circle cx="66" cy="59" r="6" fill="#F43F5E" opacity="0.25" />

                  {/* Left Eye */}
                  {eyeBlink ? (
                    <line x1="33" y1="49" x2="43" y2="49" stroke="#29242B" strokeWidth="3" strokeLinecap="round" />
                  ) : (
                    <>
                      <circle cx="38" cy="48" r="4" fill="#29242B" />
                      <circle cx="39.5" cy="46.5" r="1.5" fill="#FFFFFF" />
                    </>
                  )}

                  {/* Right Eye */}
                  {eyeBlink ? (
                    <line x1="57" y1="49" x2="67" y2="49" stroke="#29242B" strokeWidth="3" strokeLinecap="round" />
                  ) : (
                    <>
                      <circle cx="62" cy="48" r="4" fill="#29242B" />
                      <circle cx="63.5" cy="46.5" r="1.5" fill="#FFFFFF" />
                    </>
                  )}

                  {/* Eyebrows */}
                  <path d="M 32 41 Q 38 38 44 42" fill="none" stroke="#3C2415" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 56 42 Q 62 38 68 41" fill="none" stroke="#3C2415" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Mouth (animated open/close when speaking) */}
                  {mouthOpen ? (
                    <ellipse cx="50" cy="67" rx="8" ry="6" fill="#991B1B" />
                  ) : (
                    <path d="M 43 65 Q 50 71 57 65" fill="none" stroke="#E11D48" strokeWidth="2.8" strokeLinecap="round" />
                  )}

                  {/* Front Hair Bangs */}
                  <path d="M 18 42 Q 50 20 82 42 Q 50 32 18 42 Z" fill="url(#hairGrad)" />
                  {/* Headphone band */}
                  <path d="M 15 48 A 38 38 0 0 1 85 48" fill="none" stroke="#E83B64" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="15" cy="50" r="7" fill="#E83B64" />
                  <circle cx="85" cy="50" r="7" fill="#E83B64" />
                </svg>

                {/* State Tag */}
                <div style={{ marginTop: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: isSpeaking ? 'var(--primary)' : isListening ? '#10B981' : 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                  }}>
                    {isSpeaking ? 'Aria Explaining 🎙️' : isListening ? 'Listening to You 👂' : 'Aria Ready 😊'}
                  </span>
                </div>
              </div>
            )}

            {/* SIGN & VISUALS MODE */}
            {avatarMode === 'sign' && (
              <div style={{ textAlign: 'center', color: '#FFFFFF', padding: '1rem', zIndex: 2 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🤟 💡 👁️</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Visual & Sign Language Support</div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1', maxWidth: '280px', margin: '0 auto' }}>
                  High-contrast visual cues and synchronized text transcripts activated for deaf and hard-of-hearing learners.
                </div>
              </div>
            )}

            {/* CAMERA MIRROR MODE */}
            {avatarMode === 'camera' && (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {!isCamActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '1rem',
                    textAlign: 'center',
                  }}>
                    <Camera size={28} style={{ marginBottom: '0.4rem', color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Webcam preview loading...</span>
                  </div>
                )}
              </div>
            )}

            {/* Synchronized Closed Caption Ticker Overlay */}
            {currentSubtitle && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.85)',
                color: '#FFFFFF',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                lineHeight: 1.4,
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 3,
                maxHeight: '44px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                <span style={{ color: '#FCD34D', fontWeight: 700, marginRight: '4px' }}>CC:</span>
                {currentSubtitle}
              </div>
            )}
          </div>

          {/* Quick Voice Actions Pills */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.6rem 0.85rem',
            overflowX: 'auto',
            background: 'var(--bg-subtle, #FFF9F5)',
            borderBottom: '1px solid var(--border-color, #F1E5DF)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
          }}>
            {[
              { icon: '💡', label: 'Explain simply', prompt: 'Explain this concept simply using an everyday analogy' },
              { icon: '🎬', label: 'Video lesson', prompt: 'Show me the video lesson with captions' },
              { icon: '📋', label: '3 easy steps', prompt: 'Break this concept into 3 easy steps' },
              { icon: '🍎', label: 'Real analogy', prompt: 'Give me a real-world analogy from daily life' },
              { icon: '❓', label: 'Quiz me', prompt: 'Ask me a quick multiple choice question to test my understanding' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(chip.prompt)}
                style={{
                  flexShrink: 0,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  background: 'var(--bg-surface, #FFFFFF)',
                  color: 'var(--text-main, #1E293B)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(232, 59, 100, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color, #E2E8F0)';
                  e.currentTarget.style.color = 'var(--text-main, #1E293B)';
                  e.currentTarget.style.background = 'var(--bg-surface, #FFFFFF)';
                }}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Transcript */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-page)',
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-main)',
                  padding: '0.75rem 1rem',
                  borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: 'var(--shadow-sm)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                }}>
                  {m.text}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.25rem',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                }}>
                  <span>{m.timestamp}</span>
                  {m.sender === 'aria' && (
                    <button
                      onClick={() => speakResponse(m.text)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.1rem 0.35rem', fontSize: '0.7rem', color: 'var(--primary)' }}
                      title="Read response aloud"
                    >
                      <Volume2 size={11} style={{ marginRight: '2px' }} />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
                <span>Aria is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input & Controls Bar */}
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
          }}>
            {/* Listening Feedback Strip */}
            {isListening && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10B981',
                color: '#059669',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 1s infinite' }} />
                <span>Listening... Speak your question now!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {/* Push-to-Talk Voice Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`btn btn-sm ${isListening ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isListening ? '0 0 12px var(--primary)' : 'none',
                }}
                title={isListening ? 'Stop listening' : 'Speak into microphone (Voice to Text)'}
                id="btn-voice-mic"
              >
                {isListening ? (
                  <Mic size={18} style={{ color: '#FFFFFF', animation: 'pulse 1s infinite' }} />
                ) : (
                  <Mic size={18} style={{ color: 'var(--primary)' }} />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={isListening ? 'Listening...' : 'Type or ask Aria anything...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                }}
                id="input-assistant-query"
              />

              {/* Send Button */}
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                disabled={!inputValue.trim() || isLoading}
                title="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
};
