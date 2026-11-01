import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { 
  Bot, Send, Sparkles, Volume2, VolumeX, Copy, RefreshCw, Trash2, 
  BookOpen, HelpCircle, User, Check, AlertCircle, ArrowRight, 
  Mic, MicOff, Upload, FileText, Layers, Eye, CheckCircle2,
  ChevronRight, ChevronLeft, RotateCcw, Lightbulb, Zap, Award,
  Flame, Compass, PieChart, Code, Cpu, Leaf, Play, Pause, CornerDownLeft
} from 'lucide-react';

const LESSON_CONTEXTS = [
  {
    id: 'lesson-1',
    title: 'How Computers Work: CPU & Memory',
    subject: 'Computer Science',
    level: 'Elementary / Middle',
    summary: 'The CPU acts like a chef executing instructions, RAM is the kitchen counter, and Storage is the pantry.',
  },
  {
    id: 'lesson-2',
    title: 'Photosynthesis & Solar Energy Capture',
    subject: 'Biology & Life Sciences',
    level: 'Middle School',
    summary: 'Plants convert sunlight, carbon dioxide, and water into chemical glucose sugars and release oxygen.',
  },
  {
    id: 'lesson-3',
    title: 'Fraction Operations: Adding Unlike Denominators',
    subject: 'Mathematics',
    level: 'Grade 5-7',
    summary: 'Finding the Least Common Denominator (LCD) aligns slice sizes before combining numerators.',
  },
  {
    id: 'lesson-4',
    title: 'World Biomes & Ecosystem Dynamics',
    subject: 'Environmental Science',
    level: 'Middle / High School',
    summary: 'Tundra, Rainforests, Deserts, and Savannas host unique biodiversity adapted to distinct temperature and rainfall patterns.',
  }
];

const TEACHING_MODES = [
  {
    id: 'simple',
    name: 'Simple Teacher',
    avatar: '🌱',
    badge: 'Plain English',
    description: 'Everyday language & kitchen analogies',
  },
  {
    id: 'visual',
    name: 'Visual Teacher',
    avatar: '🎨',
    badge: 'Flowcharts & Models',
    description: 'Mermaid diagrams & spatial concepts',
  },
  {
    id: 'step_by_step',
    name: 'Step-by-Step Teacher',
    avatar: '🪜',
    badge: 'Numbered Steps',
    description: 'Bite-sized sequential chunks',
  },
  {
    id: 'practice',
    name: 'Practice Coach',
    avatar: '🎯',
    badge: 'Socratic Challenges',
    description: 'Interactive quizzes & 3-tier hints',
  },
  {
    id: 'revision',
    name: 'Revision Mentor',
    avatar: '🧠',
    badge: 'Mnemonics & Summary',
    description: 'High-yield memory pegs',
  },
];

const SUGGESTED_QUESTIONS = [
  { label: '🌱 Explain this simply', prompt: 'Can you explain this concept in simple plain English?' },
  { label: '🍕 Give me an example', prompt: 'Can you give me an everyday real-world example of this?' },
  { label: '🪜 Explain step by step', prompt: 'Can you break this down into clear numbered steps?' },
  { label: '🌍 Real-world application', prompt: 'What is a practical real-world application of this in daily life?' },
  { label: '🎯 Test my understanding', prompt: 'Can you quiz me with a practice question to test my understanding?' },
  { label: '🧠 Summarize this topic', prompt: 'Can you summarize this topic into 3 essential bullet points?' },
];

export const AITutorPage = () => {
  const { currentStudent, token } = useAuth();
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();
  const { toast } = useToast();

  // Active view tab: 'chat' | 'multimodal' | 'visualize' | 'flashcards'
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedLesson, setSelectedLesson] = useState(LESSON_CONTEXTS[0]);
  const [teachingMode, setTeachingMode] = useState('simple');
  const [speakingRate, setSpeakingRate] = useState(1.0);

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I'm your AdaptLearn AI Tutor. I'm currently set to **Simple Teacher** mode. I can explain concepts at your pace, break tough problems into easy steps, provide Socratic hints, or answer questions about your uploaded notes. How can I help you today?`,
      timestamp: 'Just now',
      suggestedActions: [
        'Explain this simply',
        'Give me an example',
        'Break into 3 steps',
        'Test my understanding'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Document Upload State (AI Doubt Solver)
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Multimodal 10-Format Studio State
  const [tenFormats, setTenFormats] = useState(null);
  const [selectedFormatKey, setSelectedFormatKey] = useState('simpleEnglish');
  const [isTransforming, setIsTransforming] = useState(false);

  // Visual Generator State
  const [visualData, setVisualData] = useState(null);
  const [isLoadingVisual, setIsLoadingVisual] = useState(false);

  // Flashcards Studio State
  const [flashcardCollection, setFlashcardCollection] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardStats, setCardStats] = useState({ mastered: 0, reviewNeeded: 0 });
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
        toast.info('Microphone access paused. You can continue typing!');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load initial flashcards and visual diagram when lesson changes
  useEffect(() => {
    loadVisualDiagram(selectedLesson.title);
    loadFlashcards(selectedLesson.title);
  }, [selectedLesson]);

  const loadVisualDiagram = async (topic) => {
    setIsLoadingVisual(true);
    try {
      const res = await api.tutorVisualize({ topic, concept: selectedLesson.summary });
      setVisualData(res);
    } catch (err) {
      console.warn('Visual fallback', err);
    } finally {
      setIsLoadingVisual(false);
    }
  };

  const loadFlashcards = async (topic) => {
    setIsLoadingFlashcards(true);
    try {
      const res = await api.tutorFlashcards({ topic, content: selectedLesson.summary });
      if (res?.cards) {
        setFlashcardCollection(res.cards);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
      }
    } catch (err) {
      console.warn('Flashcard fallback', err);
    } finally {
      setIsLoadingFlashcards(false);
    }
  };

  const handleTransformTenFormats = async () => {
    setIsTransforming(true);
    try {
      const res = await api.tutorTransform({
        topic: selectedLesson.title,
        text: selectedLesson.summary,
      });
      setTenFormats(res.formats);
      toast.success('Successfully transformed lesson into 10 learning formats!');
    } catch (err) {
      toast.error('Failed to transform lesson formats');
    } finally {
      setIsTransforming(false);
    }
  };

  // Toggle Voice Input
  const toggleVoiceInput = () => {
    if (!speechSupported) {
      toast.info('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.info('Listening... Speak your question clearly!');
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // Handle Document Upload (AI Doubt Solver)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info(`Parsing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question', 'What are the main principles explained in this document?');
      formData.append('teachingMode', teachingMode);

      const res = await api.tutorUploadDocument(formData);
      setUploadedDoc({
        name: file.name,
        wordCount: res.wordCount,
        snippet: res.extractedTextSnippet,
        fullText: res.fullExtractedText,
      });

      // Add as assistant message
      setMessages(prev => [
        ...prev,
        {
          id: `usr-doc-${Date.now()}`,
          sender: 'user',
          text: `📄 Uploaded notes: **${file.name}** (${res.wordCount} words)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `bot-doc-${Date.now()}`,
          sender: 'assistant',
          text: `I have parsed your document **${file.name}**!\n\n${res.queryResult?.answer || 'I am ready to answer any questions about these notes.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            'Summarize this document',
            'Explain the hardest part',
            'Quiz me on these notes'
          ]
        }
      ]);

      toast.success(`Loaded ${file.name} successfully!`);
    } catch (err) {
      console.warn('Doc upload error', err);
      toast.error('Failed to parse document. You can paste notes directly into the chat!');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSendMessage = async (userText = inputValue) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if uploaded document context should be included
      const docContext = uploadedDoc ? `\n\n[Uploaded Document: ${uploadedDoc.name}]\n${uploadedDoc.snippet}` : '';

      const res = await api.tutorChat({
        messages: [...messages, userMessage].map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text + docContext
        })),
        lessonContext: {
          title: selectedLesson.title,
          subject: selectedLesson.subject,
          summary: selectedLesson.summary + docContext,
        },
        studentProfile: {
          name: currentStudent?.name || 'Learner',
          readingLevel: currentStudent?.profile?.readingLevel || 'Simplified',
          preferredFormat: currentStudent?.profile?.preferredFormat || 'simplified'
        },
        teachingMode: teachingMode
      }, token, currentStudent?.id);

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply || "Here is a simplified explanation based on your lesson context.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedFollowUps || [
          'Give me an example',
          'Break it into steps',
          'Test my understanding'
        ]
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.warn('Tutor Chat API fallback:', err);
      const botMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'assistant',
        text: `Based on **${selectedLesson.title}** (${TEACHING_MODES.find(m => m.id === teachingMode)?.name}):\n\n` +
          `• **Concept Insight:** ${selectedLesson.summary}\n` +
          `• **Key Takeaway:** Connect new vocabulary to things you already touch and know.\n` +
          `• **Next Step:** Would you like a step-by-step example or a 3-question quick check?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Give me an example', 'Break into steps', 'Quiz me now']
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReadAloud = (text) => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakText(text, { rate: speakingRate });
      toast.info(`Reading aloud at ${speakingRate}x speed`);
    }
  };

  const handlePersonalityChange = (modeId) => {
    setTeachingMode(modeId);
    const modeObj = TEACHING_MODES.find(m => m.id === modeId);
    toast.success(`Switched teaching personality to: ${modeObj?.name}!`);

    // Add brief intro message from the new teacher personality
    setMessages(prev => [
      ...prev,
      {
        id: `sys-mode-${Date.now()}`,
        sender: 'assistant',
        text: `### ${modeObj?.avatar} Switched to ${modeObj?.name}\n\n${modeObj?.description}. How can I guide you on **${selectedLesson.title}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Explain this simply',
          'Give me an example',
          'Explain step by step',
          'Test my understanding'
        ]
      }
    ]);
  };

  // Flashcard interactions
  const handleCardRate = (difficulty) => {
    if (difficulty === 'easy') {
      setCardStats(prev => ({ ...prev, mastered: prev.mastered + 1 }));
      toast.success('Card marked as Mastered! 🎉');
    } else {
      setCardStats(prev => ({ ...prev, reviewNeeded: prev.reviewNeeded + 1 }));
      toast.info('Card queued for spaced repetition review.');
    }
    // Advance to next card
    if (currentCardIndex + 1 < flashcardCollection.length) {
      setCurrentCardIndex(prev => prev + 1);
      setIsCardFlipped(false);
    } else {
      toast.success('Congratulations! You completed all flashcards in this deck!');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1240px' }}>
      
      {/* 1. Header & Persona Context Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.08) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--primary)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px var(--primary-glow)',
          }}>
            <Bot size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
                Multimodal AI Tutor & Learning Assistant
              </h1>
              <span className="badge badge-rose" style={{ fontSize: '0.72rem' }}>
                <Sparkles size={12} style={{ marginRight: '4px' }} /> Python FastAPI + Educational NLP
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Inclusive, patient, context-aware companion adapting content, pacing, voice, and formats to your profile.
            </p>
          </div>
        </div>

        {/* Current Lesson Context Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Lesson:
            </span>
          </div>
          <select
            value={selectedLesson.id}
            onChange={(e) => {
              const found = LESSON_CONTEXTS.find(l => l.id === e.target.value);
              if (found) {
                setSelectedLesson(found);
                toast.info(`Switched context to: ${found.title}`);
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {LESSON_CONTEXTS.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.subject}: {lesson.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Teaching Personality Switcher (5 Personalities) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Teaching Personality Mode (Choose your preferred instruction style):
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
            Active: {TEACHING_MODES.find(m => m.id === teachingMode)?.name}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}>
          {TEACHING_MODES.map((mode) => {
            const isSelected = teachingMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handlePersonalityChange(mode.id)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>{mode.avatar}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{mode.name}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {mode.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top Mode View Tabs (Chat / 10 Formats / Visuals / Flashcards) */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-color)',
        gap: '0.5rem',
        marginBottom: '1.75rem',
        overflowX: 'auto',
      }}>
        {[
          { id: 'chat', label: '💬 AI Tutor & Doubt Solver', icon: Bot },
          { id: 'multimodal', label: '🔄 10 Learning Formats Studio', icon: Layers },
          { id: 'visualize', label: '🎨 AI Visual Explanations', icon: PieChart },
          { id: 'flashcards', label: '🗂️ AI Flashcard Studio', icon: Sparkles },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CHAT & DOUBT SOLVER INTERFACE */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem' }}>
          
          {/* Main Chat Stream Container */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '650px',
            padding: 0,
            overflow: 'hidden',
          }}>
            {/* Chat Header Status Bar */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span>Mode: <strong>{TEACHING_MODES.find(m => m.id === teachingMode)?.name}</strong></span>
                {uploadedDoc && (
                  <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>
                    📄 {uploadedDoc.name}
                  </span>
                )}
              </div>

              {/* Speech rate control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <Volume2 size={15} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Speed:</span>
                {[0.8, 1.0, 1.25].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setSpeakingRate(rate)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      background: speakingRate === rate ? 'var(--primary)' : 'var(--bg-card)',
                      color: speakingRate === rate ? '#FFFFFF' : 'var(--text-main)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: isBot ? 'row' : 'row-reverse',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isBot ? 'var(--primary)' : 'var(--border-color)',
                      color: isBot ? '#FFFFFF' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {isBot ? 'AI' : <User size={18} />}
                    </div>

                    {/* Message Bubble */}
                    <div style={{ maxWidth: '82%' }}>
                      <div style={{
                        padding: '1.1rem 1.3rem',
                        borderRadius: 'var(--radius-lg)',
                        background: isBot ? 'var(--bg-subtle)' : 'var(--primary)',
                        color: isBot ? 'var(--text-main)' : '#FFFFFF',
                        border: isBot ? '1px solid var(--border-color)' : 'none',
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                      }}>
                        {/* Simple Markdown Formatting */}
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {msg.text}
                        </div>
                      </div>

                      {/* Bot Actions (Listen, Copy) */}
                      {isBot && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginLeft: '4px' }}>
                          <button
                            onClick={() => handleReadAloud(msg.text)}
                            style={{
                              padding: '2px 8px',
                              background: 'none',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Volume2 size={13} />
                            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                          </button>
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            style={{
                              padding: '2px 8px',
                              background: 'none',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {copiedId === msg.id ? <Check size={13} style={{ color: 'var(--emerald)' }} /> : <Copy size={13} />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}

                      {/* Suggested Follow-Ups Pills */}
                      {isBot && msg.suggestedActions && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                          {msg.suggestedActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(action)}
                              style={{
                                padding: '4px 10px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              👉 {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    AI
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Thinking with educational scaffolding...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Prompt Bar */}
            <div style={{
              padding: '0.6rem 1rem',
              background: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
            }}>
              {SUGGESTED_QUESTIONS.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sq.prompt)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {sq.label}
                </button>
              ))}
            </div>

            {/* Input Bar & Voice Mic */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={isListening ? 'voice-pulsing' : ''}
                title={isListening ? 'Click to stop listening' : 'Click to speak your question'}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isListening ? '#E11D48' : 'var(--bg-subtle)',
                  color: isListening ? '#FFFFFF' : 'var(--primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isListening ? 'Listening to your voice... Speak now!' : 'Ask anything, request an analogy, or type a question...'}
                style={{
                  flex: 1,
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-page)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="btn btn-primary"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.85rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 800,
                }}
              >
                <span>Send</span>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Right Support & Doubt Solver Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* AI Doubt Solver: Document & Notes Upload Panel */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  AI Doubt Solver: Notes Upload
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Upload PDF study guides or text lesson notes. The AI tutor will answer questions directly grounded in your document.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--primary)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Upload size={22} />
                <span>{isUploading ? 'Extracting text...' : 'Upload PDF or Lesson Notes'}</span>
              </button>

              {uploadedDoc && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Active Notes: {uploadedDoc.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Word Count: {uploadedDoc.wordCount} words
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{uploadedDoc.snippet?.slice(0, 100)}..."
                  </div>
                </div>
              )}
            </div>

            {/* Quick Socratic Hint Panel */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Lightbulb size={18} style={{ color: '#D97706' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Socratic Hints
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Stuck on a tricky problem? Ask for a hint without giving away the test answers.
              </p>
              <button
                type="button"
                onClick={() => handleSendMessage("Can you give me a Socratic hint on this lesson?")}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
              >
                💡 Request 3-Stage Hint
              </button>
            </div>

            {/* Current Lesson Summary Card */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                {selectedLesson.subject}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                {selectedLesson.title}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {selectedLesson.summary}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ONE LESSON – 10 LEARNING FORMATS STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'multimodal' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px 0' }}>
                One Lesson – 10 Multimodal Formats Studio
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Every student learns differently. Transform <strong>{selectedLesson.title}</strong> into 10 accessible representations.
              </p>
            </div>
            <button
              onClick={handleTransformTenFormats}
              disabled={isTransforming}
              className="btn btn-primary"
              style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Zap size={18} />
              <span>{isTransforming ? 'Generating 10 Formats...' : 'Generate All 10 Formats'}</span>
            </button>
          </div>

          {/* 10 Formats Tab Selector */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '1.75rem',
            padding: '0.75rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
          }}>
            {[
              { key: 'simpleEnglish', label: '1. Simple English' },
              { key: 'detailedExplanation', label: '2. Detailed Deep-Dive' },
              { key: 'audioNarration', label: '3. Audio Script' },
              { key: 'visualExplanation', label: '4. Visual Map' },
              { key: 'stepByStep', label: '5. Step-by-Step' },
              { key: 'keyPointSummary', label: '6. Key Points' },
              { key: 'flashcards', label: '7. Flashcards' },
              { key: 'interactiveQuiz', label: '8. Practice Quiz' },
              { key: 'realWorldExamples', label: '9. Everyday Analogies' },
              { key: 'revisionNotes', label: '10. Revision Notes' },
            ].map(fmt => (
              <button
                key={fmt.key}
                onClick={() => setSelectedFormatKey(fmt.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: selectedFormatKey === fmt.key ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedFormatKey === fmt.key ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Render Active Format */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            minHeight: '300px',
          }}>
            {/* Format 1: Simple English */}
            {selectedFormatKey === 'simpleEnglish' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🌱 Simple English Representation
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                  {tenFormats?.simpleEnglish || (
                    `Imagine ${selectedLesson.title} like running a friendly bakery with your family. ` +
                    `Each helper has one specific job: one reads tickets (CPU), one works on the counter (RAM), ` +
                    `and supplies stay in the pantry (storage). That is all there is to it!`
                  )}
                </p>
              </div>
            )}

            {/* Format 2: Detailed */}
            {selectedFormatKey === 'detailedExplanation' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284C7', marginBottom: '1rem' }}>
                  🔬 Academic Technical Synthesis
                </h3>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                  {tenFormats?.detailedExplanation || (
                    `In professional architectures, ${selectedLesson.title} coordinates through low-latency instruction buses ` +
                    `and pipelined stages. Registers provide single-cycle execution speed, while multi-level caches minimize memory bottlenecks.`
                  )}
                </div>
              </div>
            )}

            {/* Format 3: Audio Narration */}
            {selectedFormatKey === 'audioNarration' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                    🎧 Spoken Audio Narration Script
                  </h3>
                  <button
                    onClick={() => speakText(tenFormats?.audioNarration || selectedLesson.summary, { rate: speakingRate })}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Volume2 size={16} /> Read Script Aloud
                  </button>
                </div>
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                }}>
                  {tenFormats?.audioNarration || `[Calm pacing] Welcome to your audio lesson on ${selectedLesson.title}. Take a relaxed breath. ${selectedLesson.summary}`}
                </div>
              </div>
            )}

            {/* Format 4: Visual Explanation */}
            {selectedFormatKey === 'visualExplanation' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🎨 Visual Concept & Flowchart
                </h3>
                <pre style={{
                  background: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                }}>
                  {tenFormats?.visualExplanation?.mermaid || "graph TD\n  Input --> CPU\n  CPU --> RAM\n  RAM --> Storage"}
                </pre>
              </div>
            )}

            {/* Format 5: Step-by-Step */}
            {selectedFormatKey === 'stepByStep' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🪜 Chronological Step-by-Step Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(tenFormats?.stepByStep || [
                    { step: 1, title: 'Input Reception', description: 'Raw parameters enter the primary intake system.' },
                    { step: 2, title: 'Transformation Cycle', description: 'Arithmetic and logic gates calculate results.' },
                    { step: 3, title: 'Working Buffer', description: 'Intermediate states sit temporarily in high-speed RAM.' },
                    { step: 4, title: 'Persistent Save', description: 'Final verified data is stored safely on drive.' },
                  ]).map((st, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {st.step}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{st.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{st.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format 6: Key Points */}
            {selectedFormatKey === 'keyPointSummary' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  📌 High-Impact Key Points
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(tenFormats?.keyPointSummary || [
                    'Every complex system is built by connecting simple components together.',
                    'Working memory (RAM) is fast and temporary; storage is permanent and safe.',
                    'Automation loops eliminate repetitive human effort.',
                    'Always verify edge conditions before finalizing answers.',
                  ]).map((kp, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.95rem' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format 7: Flashcards */}
            {selectedFormatKey === 'flashcards' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🗂️ Lesson Flashcard Collection
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {(tenFormats?.flashcards || flashcardCollection).map((card, i) => (
                    <div key={i} className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {card.category || 'Core Question'}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', margin: '6px 0' }}>{card.front}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{card.back}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format 8: Interactive Quiz */}
            {selectedFormatKey === 'interactiveQuiz' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🎯 Interactive Practice Quiz
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(tenFormats?.interactiveQuiz || [
                    {
                      question: `What is the primary role of ${selectedLesson.title}?`,
                      options: ['Execute operations reliably', 'Stay turned off', 'Make paper airplanes'],
                      explanation: 'Built specifically to process inputs and yield verified results.'
                    }
                  ]).map((q, i) => (
                    <div key={i} style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 800, marginBottom: '8px' }}>Q{i+1}: {q.question}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {q.options?.map((opt, oi) => (
                          <div key={oi} style={{ padding: '6px 12px', background: 'var(--bg-card)', borderRadius: '6px', fontSize: '0.85rem' }}>
                            {String.fromCharCode(65 + oi)}) {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format 9: Real-World Examples */}
            {selectedFormatKey === 'realWorldExamples' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🍕 Everyday Real-World Analogies
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {(tenFormats?.realWorldExamples || [
                    { analogy: 'The Kitchen Countertop 👨‍🍳', story: 'Active ingredients sit on the counter; seasonal supplies stay downstairs in the pantry.' },
                    { analogy: 'The Tooth-Brushing Routine 🪥', story: 'Repeating an action 10 times until clean is the exact same logic computers use in repeat loops.' },
                  ]).map((rw, i) => (
                    <div key={i} className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{rw.analogy}</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{rw.story}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format 10: Revision Notes */}
            {selectedFormatKey === 'revisionNotes' && (
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                  🧠 High-Yield Revision Notes & Mnemonics
                </h3>
                <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '6px' }}>
                    Mnemonic: {tenFormats?.revisionNotes?.mnemonic || 'F-A-S-T: Foundation, Action, Storage, Transfer'}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                    {tenFormats?.revisionNotes?.oneLiner || `${selectedLesson.title} is a dependable transformation engine.`}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(tenFormats?.revisionNotes?.highYieldBulletPoints || [
                      'Review inputs before diagnosing outputs.',
                      'Keep temporary scratchpads separate from permanent archives.',
                      'Use analogies whenever abstract formulas feel heavy.',
                    ]).map((pt, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        • {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI VISUAL EXPLANATION GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'visualize' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px 0' }}>
                AI Visual Explanation & Concept Flowchart
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Spatial concept maps, process flowcharts, and structured comparison matrices for <strong>{selectedLesson.title}</strong>.
              </p>
            </div>
            <button
              onClick={() => loadVisualDiagram(selectedLesson.title)}
              className="btn btn-secondary"
              style={{ gap: '6px' }}
            >
              <RefreshCw size={16} /> Regenerate Diagram
            </button>
          </div>

          {/* Interactive SVG Flowchart Card */}
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-color)',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
              {visualData?.title || `${selectedLesson.title} Architecture Flowchart`}
            </h3>

            {/* Custom Interactive Accessible SVG Diagram */}
            <div style={{ maxWidth: '850px', margin: '0 auto', overflowX: 'auto' }}>
              <svg viewBox="0 0 800 240" style={{ width: '100%', height: 'auto', maxHeight: '280px' }} role="img" aria-label="Visual flowchart explaining concept">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#E83B64" />
                  </marker>
                </defs>

                {/* Node 1: Input */}
                <rect x="20" y="80" width="160" height="80" rx="14" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2.5" />
                <text x="100" y="115" textAnchor="middle" fill="#1E3A8A" fontWeight="800" fontSize="14">📥 Raw Inputs</text>
                <text x="100" y="135" textAnchor="middle" fill="#4B5563" fontSize="11">Data / Energy Signals</text>

                {/* Arrow 1 */}
                <line x1="180" y1="120" x2="280" y2="120" stroke="#E83B64" strokeWidth="2.5" markerEnd="url(#arrow)" />

                {/* Node 2: Core Processing */}
                <rect x="290" y="60" width="220" height="120" rx="18" fill="#FCE7EF" stroke="#E83B64" strokeWidth="3" />
                <text x="400" y="100" textAnchor="middle" fill="#9F1239" fontWeight="900" fontSize="15">⚡ Central Engine</text>
                <text x="400" y="122" textAnchor="middle" fill="#831843" fontSize="11">Instruction Cycles / Synthesis</text>
                <text x="400" y="142" textAnchor="middle" fill="#E83B64" fontWeight="700" fontSize="11">[Active Scratchpad RAM]</text>

                {/* Arrow 2 */}
                <line x1="510" y1="120" x2="610" y2="120" stroke="#E83B64" strokeWidth="2.5" markerEnd="url(#arrow)" />

                {/* Node 3: Output */}
                <rect x="620" y="80" width="160" height="80" rx="14" fill="#ECFDF5" stroke="#10B981" strokeWidth="2.5" />
                <text x="700" y="115" textAnchor="middle" fill="#065F46" fontWeight="800" fontSize="14">📤 Verified Output</text>
                <text x="700" y="135" textAnchor="middle" fill="#4B5563" fontSize="11">Safe Storage & Display</text>
              </svg>
            </div>

            {/* LaTeX Formula Anchor */}
            {visualData?.latexFormula && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1.5rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-block',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                Mathematical Formula: <code>{visualData.latexFormula}</code>
              </div>
            )}
          </div>

          {/* Structured Comparison Table */}
          {visualData?.comparisonTable && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                📊 Component Comparison Matrix
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                      {Object.keys(visualData.comparisonTable[0] || {}).map((col, idx) => (
                        <th key={idx} style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize' }}>
                          {col.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visualData.comparisonTable.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} style={{ padding: '0.85rem 1rem', fontSize: '0.88rem', color: cIdx === 0 ? 'var(--primary)' : 'var(--text-main)', fontWeight: cIdx === 0 ? 800 : 500 }}>
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AI FLASHCARD STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'flashcards' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px 0' }}>
                AI Flashcard Active Recall Studio
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Test memory retention with 3D flip-cards. Mark cards as Easy, Medium, or Hard to calibrate spaced repetition intervals.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <span className="badge badge-emerald">Mastered: {cardStats.mastered}</span>
              <span className="badge badge-amber">Review: {cardStats.reviewNeeded}</span>
            </div>
          </div>

          {/* Flashcard 3D Interactive Container */}
          {flashcardCollection.length > 0 ? (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              
              {/* Card Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                <span>Card {currentCardIndex + 1} of {flashcardCollection.length}</span>
                <span className={`badge ${flashcardCollection[currentCardIndex]?.difficulty === 'hard' ? 'badge-rose' : (flashcardCollection[currentCardIndex]?.difficulty === 'medium' ? 'badge-amber' : 'badge-emerald')}`}>
                  {flashcardCollection[currentCardIndex]?.difficulty?.toUpperCase()}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                className="flashcard-perspective"
                onClick={() => setIsCardFlipped(prev => !prev)}
                style={{ marginBottom: '1.5rem' }}
              >
                <div className={`flashcard-inner ${isCardFlipped ? 'flipped' : ''}`}>
                  
                  {/* Front of Card */}
                  <div className="flashcard-front">
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {flashcardCollection[currentCardIndex]?.category || 'Core Question'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.5, margin: 'auto 0' }}>
                      {flashcardCollection[currentCardIndex]?.front}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      👆 Click card to flip and reveal answer
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className="flashcard-back">
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Verified Explanation
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.6, margin: 'auto 0' }}>
                      {flashcardCollection[currentCardIndex]?.back}
                    </div>
                    {flashcardCollection[currentCardIndex]?.hint && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                        💡 Hint: {flashcardCollection[currentCardIndex].hint}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Rating Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => handleCardRate('easy')}
                  className="btn"
                  style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 800, flex: 1 }}
                >
                  🟢 Easy (Mastered)
                </button>
                <button
                  onClick={() => handleCardRate('medium')}
                  className="btn"
                  style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', fontWeight: 800, flex: 1 }}
                >
                  🟡 Medium (Review Soon)
                </button>
                <button
                  onClick={() => handleCardRate('hard')}
                  className="btn"
                  style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', fontWeight: 800, flex: 1 }}
                >
                  🔴 Hard (Repeat in 24h)
                </button>
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (currentCardIndex > 0) {
                      setCurrentCardIndex(prev => prev - 1);
                      setIsCardFlipped(false);
                    }
                  }}
                  disabled={currentCardIndex === 0}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <ChevronLeft size={16} /> Previous Card
                </button>

                <button
                  onClick={() => {
                    setCurrentCardIndex(0);
                    setIsCardFlipped(false);
                    toast.info('Reset deck to first card.');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ gap: '4px' }}
                >
                  <RotateCcw size={14} /> Restart Deck
                </button>

                <button
                  onClick={() => {
                    if (currentCardIndex + 1 < flashcardCollection.length) {
                      setCurrentCardIndex(prev => prev + 1);
                      setIsCardFlipped(false);
                    }
                  }}
                  disabled={currentCardIndex + 1 >= flashcardCollection.length}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  Next Card <ChevronRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading flashcards...</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
