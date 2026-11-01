import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Subtitles,
  Clock,
  Sparkles,
  Maximize2,
  CheckCircle2,
  FileText,
  Bookmark,
} from 'lucide-react';

const LESSON_VIDEOS = {
  'lesson-1': {
    title: 'How Computers Work: CPU, Memory & Storage',
    creator: 'Code.org & Crash Course Computer Science',
    duration: '4:32',
    embedUrl: 'https://www.youtube-nocookie.com/embed/AkFi90lZCE4',
    posterText: '👨‍🍳 The CPU Chef, RAM Countertop & Storage Pantry Explained',
    chapters: [
      { time: '00:00', title: '1. What Happens Inside a Computer?', text: 'Every computer receives inputs from you, processes them, and gives outputs.' },
      { time: '00:45', title: '2. The CPU: Master Chef & Calculator', text: 'The CPU performs billions of arithmetic calculations per second using microscopic transistors.' },
      { time: '01:30', title: '3. RAM: The High-Speed Kitchen Counter', text: 'RAM holds active apps. When power shuts down, the countertop is cleared.' },
      { time: '02:40', title: '4. Storage (SSD/HDD): The Long-Term Pantry', text: 'Files stay safe permanently in flash storage even when the power is completely turned off.' },
      { time: '03:45', title: '5. System Buses: The Information Highways', text: 'Buses shuttle electronic signals between CPU, RAM, and graphics cards at clock speeds.' },
    ],
    summaryTakeaways: [
      'The CPU executes program instructions step-by-step.',
      'RAM is volatile and wiped when shut down; SSD storage is permanent.',
      'Data travels between hardware parts along electronic bus pathways.',
    ],
  },
  'lesson-2': {
    title: 'Photosynthesis: How Plants Turn Light into Chemical Energy',
    creator: 'Amoeba Sisters & Crash Course Biology',
    duration: '5:12',
    embedUrl: 'https://www.youtube-nocookie.com/embed/UPBMG5EIyf8',
    posterText: '🌿 Chloroplasts, Solar Photons & Glucose Sugar Factory',
    chapters: [
      { time: '00:00', title: '1. Solar Power of Living Plants', text: 'Plants absorb sunlight through green chlorophyll pigments inside plant cells.' },
      { time: '01:05', title: '2. Inside the Chloroplast', text: 'Thylakoid discs capture photons of light and split water molecules into hydrogen and oxygen.' },
      { time: '02:20', title: '3. The Light Reactions', text: 'Water splitting generates ATP energy currency and releases life-giving oxygen into the air.' },
      { time: '03:45', title: '4. The Calvin Cycle (Sugar Factory)', text: 'Carbon dioxide gas is combined with chemical energy to forge glucose sugars.' },
      { time: '04:40', title: '5. Ecological Balance', text: 'Plants feed the planet and maintain atmospheric oxygen equilibrium.' },
    ],
    summaryTakeaways: [
      'Inputs: Carbon Dioxide (CO2) + Water (H2O) + Sunlight.',
      'Outputs: Glucose Sugar (Energy) + Oxygen (O2) for breathing.',
      'Chlorophyll absorbs blue and red wavelengths, reflecting green light.',
    ],
  },
  'lesson-3': {
    title: 'Adding Fractions with Unlike Denominators Explained Visually',
    creator: 'Math Antics Visual Series',
    duration: '6:15',
    embedUrl: 'https://www.youtube-nocookie.com/embed/N-Y0Kvakw9w',
    posterText: '🍕 Equalizing Slice Sizes with Common Denominators',
    chapters: [
      { time: '00:00', title: '1. The Problem with Unequal Slices', text: 'You cannot directly add 1/2 of a large pizza and 1/4 of a pizza without matching slice sizes.' },
      { time: '01:15', title: '2. Finding Common Denominators', text: 'We must find a common multiple so all slices are cut to the exact same size.' },
      { time: '02:40', title: '3. Converting Equivalent Fractions', text: 'Multiply both top and bottom by 2 so 1/2 becomes 2/4 without changing its value.' },
      { time: '04:10', title: '4. Combining the Numerators', text: 'Now that both are in fourths: 2/4 + 1/4 = 3/4! Simple and intuitive.' },
      { time: '05:25', title: '5. Simplifying the Final Answer', text: 'Check if numerator and denominator share any common factors before concluding.' },
    ],
    summaryTakeaways: [
      'The bottom number (denominator) tells you how many slices make a whole.',
      'Never add denominators together; only add numerators once denominators match.',
      'Equivalent fractions have identical real-world value.',
    ],
  },
  'lesson-4': {
    title: 'World Biomes & Ecosystem Dynamics',
    creator: 'National Geographic & Crash Course Geography',
    duration: '5:48',
    embedUrl: 'https://www.youtube-nocookie.com/embed/0fb8S-nS1yU',
    posterText: '🌍 Rainforests, Deserts, Tundras & Global Climate Bands',
    chapters: [
      { time: '00:00', title: '1. What Defines a Biome?', text: 'Climate, latitude, annual rainfall, and average temperatures shape plant and animal life.' },
      { time: '01:10', title: '2. Tropical Rainforests', text: 'Warm, humid equatorial bands supporting over 50% of Earth species in layered canopies.' },
      { time: '02:30', title: '3. Arid Deserts', text: 'Extreme temperature swings, specialized succulents, and nocturnal animal adaptations.' },
      { time: '03:50', title: '4. Arctic & Alpine Tundra', text: 'Treeless plains with permanently frozen soil (permafrost) and dwarf willow shrubs.' },
      { time: '04:55', title: '5. Human Stewardship', text: 'Protecting interconnected ecosystems prevents habitat fragmentation and biodiversity loss.' },
    ],
    summaryTakeaways: [
      'Temperature and precipitation dictate what organisms can thrive in each biome.',
      'Organisms develop evolutionary adaptations suited specifically to their environment.',
      'Ecosystem balance is fragile and requires active conservation.',
    ],
  },
};

export const LessonVideoPlayer = ({ lessonId, customVideoData }) => {
  const { speakText, isSpeaking, stopSpeech, playChime } = useAccessibility();
  const toast = useToast();

  const videoData = customVideoData || LESSON_VIDEOS[lessonId] || LESSON_VIDEOS['lesson-1'];
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [useEmbed, setUseEmbed] = useState(true);

  const currentChapter = videoData.chapters[activeChapterIndex] || videoData.chapters[0];

  const handleListenChapter = (chapter) => {
    playChime('click');
    speakText(`${chapter.title}. ${chapter.text}`);
    toast.info(`Reading aloud: ${chapter.title}`);
  };

  const handleListenAllTranscript = () => {
    playChime('success');
    const fullText = videoData.chapters.map((c) => `${c.title}: ${c.text}`).join(' ');
    speakText(`Video lesson transcript for ${videoData.title}. ${fullText}`);
    toast.success('Reading full video lesson transcript aloud');
  };

  return (
    <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
      {/* Video Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary">🎥 Accessible Video Lesson</span>
            <span className="badge badge-secondary"><Clock size={12} style={{ marginRight: '4px' }} /> {videoData.duration}</span>
            <span className="badge badge-emerald">Subtitles & Transcripts Available</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {videoData.title}
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Curated Educational Video by {videoData.creator}
          </span>
        </div>

        {/* Accessibility Video Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCaptionsEnabled(!captionsEnabled)}
            className={`btn btn-sm ${captionsEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            title="Toggle Closed Captions"
            aria-pressed={captionsEnabled}
          >
            <Subtitles size={14} />
            <span>CC Captions {captionsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleListenAllTranscript}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            title="Read complete video transcript aloud"
          >
            <Volume2 size={14} style={{ color: 'var(--primary)' }} />
            <span>Read Transcript Aloud</span>
          </button>
        </div>
      </div>

      {/* Main Video Frame */}
      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 Aspect Ratio
          height: 0,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '1.25rem',
          border: '2px solid var(--border-color)',
        }}
      >
        {useEmbed ? (
          <iframe
            src={`${videoData.embedUrl}?rel=0&modestbranding=1`}
            title={videoData.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #1E1B24 0%, #2A2433 100%)',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {videoData.title}
            </h3>
            <p style={{ maxWidth: '480px', color: '#D1D5DB', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {videoData.posterText}
            </p>
            <button
              onClick={() => setUseEmbed(true)}
              className="btn btn-primary"
              style={{ fontWeight: 800 }}
            >
              <Play size={16} /> Load Video Stream
            </button>
          </div>
        )}
      </div>

      {/* Accessible Closed Captions Live Banner */}
      {captionsEnabled && (
        <div
          role="status"
          aria-live="polite"
          style={{
            backgroundColor: '#1E1B24',
            color: '#FDE047',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '2px solid #CA8A04',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-amber" style={{ fontWeight: 800, fontSize: '0.72rem' }}>
              CC [{currentChapter.time}]
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.4 }}>
              {currentChapter.text}
            </div>
          </div>
          <button
            onClick={() => handleListenChapter(currentChapter)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Read this caption line aloud"
            aria-label="Read caption line aloud"
          >
            <Volume2 size={16} />
          </button>
        </div>
      )}

      {/* Interactive Video Chapters & Jump Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="var(--primary)" />
          <span>Interactive Timestamped Chapters</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
          {videoData.chapters.map((ch, idx) => {
            const isActive = activeChapterIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveChapterIndex(idx);
                  playChime('click');
                }}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-sky" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                    {ch.time}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleListenChapter(ch);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--primary)',
                      padding: '2px',
                    }}
                    title="Read chapter text aloud"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {ch.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {ch.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Video Takeaways */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>Key Video Concepts to Remember</span>
          </h4>
          <button
            onClick={() => {
              playChime('click');
              speakText(`Key concepts to remember from the video: ${videoData.summaryTakeaways.join('. ')}`);
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            <Volume2 size={13} /> Listen
          </button>
        </div>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
          {videoData.summaryTakeaways.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
