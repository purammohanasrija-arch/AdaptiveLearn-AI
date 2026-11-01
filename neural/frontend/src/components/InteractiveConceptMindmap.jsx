import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { soundEffects } from '../services/soundEffects';
import {
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
  Lightbulb,
} from 'lucide-react';

export const InteractiveConceptMindmap = ({ lessonId, lesson }) => {
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(null);

  // Extract or generate interactive concept nodes based on lesson
  const getConceptNodes = () => {
    if (lessonId === 'lesson-1') {
      return [
        {
          id: 1,
          icon: '⌨️',
          title: '1. Input Stream',
          short: 'User Gestures & Data',
          metaphor: 'The Waiter bringing meal orders',
          description: 'Keyboard keystrokes, mouse clicks, and mic signals are converted into binary 1s and 0s.',
          takeaway: 'Without input, the computer sits idle waiting for your instructions.',
        },
        {
          id: 2,
          icon: '👨‍🍳',
          title: '2. CPU Engine',
          short: 'The Central Brain',
          metaphor: 'The Head Chef in the kitchen',
          description: 'The Arithmetic Logic Unit (ALU) performs billions of math calculations every second.',
          takeaway: 'Clock speed (e.g. 3.5 GHz) measures how many billions of cycles the CPU executes per second.',
        },
        {
          id: 3,
          icon: '📋',
          title: '3. Fast Memory (RAM)',
          short: 'Working Scratchpad',
          metaphor: 'The Chef\'s chopping cutting board',
          description: 'Holds the active apps and tabs currently open. Extremely fast but temporary (volatile).',
          takeaway: 'When power shuts off, RAM clears out. Permanent files live on the SSD/Hard Drive.',
        },
        {
          id: 4,
          icon: '🖥️',
          title: '4. Output Display',
          short: 'Rich Visuals & Sound',
          metaphor: 'The Plated Meal served to guests',
          description: 'Processed computations are converted back into colors on your screen and sounds in your headphones.',
          takeaway: 'You experience the result of billions of calculations in less than 16 milliseconds!',
        },
      ];
    }

    if (lessonId === 'lesson-2') {
      return [
        {
          id: 1,
          icon: '🍕',
          title: '1. The Whole Unit',
          short: 'One Complete Entity (1.0)',
          metaphor: 'An uncut whole pizza pie',
          description: 'Represents 100% of an object before any cuts or divisions.',
          takeaway: 'All fractions are parts of this complete unit.',
        },
        {
          id: 2,
          icon: '🔪',
          title: '2. Equal Division',
          short: 'Splitting into Fair Slices',
          metaphor: 'Cutting exact equal triangles',
          description: 'Fractions require every partition to be exactly identical in size.',
          takeaway: 'Unequal slices cannot be written as simple standard fractions.',
        },
        {
          id: 3,
          icon: '🔢',
          title: '3. Numerator (Top)',
          short: 'Portions Counted',
          metaphor: 'Slices left on your plate',
          description: 'Tells you precisely how many pieces you have or are working with.',
          takeaway: 'If you take 3 slices of pizza, 3 is your numerator.',
        },
        {
          id: 4,
          icon: '🎯',
          title: '4. Denominator (Bottom)',
          short: 'Total Unit Slices',
          metaphor: 'Total slices the pizza was cut into',
          description: 'Names the fraction size. Larger denominators mean each individual slice is smaller!',
          takeaway: 'In 3/8, the denominator 8 means the whole was sliced into 8 parts.',
        },
      ];
    }

    if (lessonId === 'lesson-3') {
      return [
        {
          id: 1,
          icon: '📝',
          title: '1. Problem Input',
          short: 'Starting Parameters',
          metaphor: 'Raw recipe ingredients on counter',
          description: 'Defines what data is provided and what end goal must be achieved.',
          takeaway: 'Clear inputs make building precise algorithm steps simple.',
        },
        {
          id: 2,
          icon: '👣',
          title: '2. Ordered Steps',
          short: 'Step-by-Step Logic',
          metaphor: 'Step 1: Preheat oven, Step 2: Mix flour',
          description: 'Unambiguous instructions executed sequentially one after another.',
          takeaway: 'Computers cannot guess—every step must be explicitly declared.',
        },
        {
          id: 3,
          icon: '🔀',
          title: '3. Condition Check',
          short: 'Decisions & Loops',
          metaphor: 'Is dough golden? If YES: Take out; If NO: Bake 5m more',
          description: 'Allows programs to react dynamically based on real-time data.',
          takeaway: 'Branching logic creates smart and responsive applications.',
        },
        {
          id: 4,
          icon: '🚀',
          title: '4. Verified Output',
          short: 'Repeatable Solution',
          metaphor: 'Perfect warm baked loaf',
          description: 'The algorithm terminates successfully with predictable, tested accuracy.',
          takeaway: 'A great algorithm works correctly every single time with zero errors.',
        },
      ];
    }

    if (lessonId === 'lesson-4') {
      return [
        {
          id: 1,
          icon: '☀️',
          title: '1. Solar Photons',
          short: 'Sunlight Energy Wave',
          metaphor: 'Solar panels soaking up light rays',
          description: 'Light energy from the sun hits chlorophyll molecules inside the plant cells.',
          takeaway: 'Chlorophyll absorbs red and blue light while reflecting green light.',
        },
        {
          id: 2,
          icon: '💧',
          title: '2. Water & Carbon Dioxide',
          short: 'H₂O Roots + CO₂ Stomata',
          metaphor: 'Baking ingredients mixed together',
          description: 'Roots suck water up through xylem; tiny leaf leaf pores breathe in CO₂ gas.',
          takeaway: 'Six molecules of water combine with six molecules of CO₂.',
        },
        {
          id: 3,
          icon: '🍃',
          title: '3. Chloroplast Reaction',
          short: 'Chemical Powerhouse',
          metaphor: 'A high-efficiency solar kitchen',
          description: 'Light-dependent reactions split water and recharge chemical ATP energy bonds.',
          takeaway: 'This magical biological cycle powers almost all living ecosystems on Earth!',
        },
        {
          id: 4,
          icon: '🍬',
          title: '4. Sugar Food + Oxygen',
          short: 'Glucose C₆H₁₂O₆ + Fresh O₂',
          metaphor: 'Freshly baked energy bars for the tree',
          description: 'Glucose provides fuel for plant growth, while clean oxygen gas is released for us to breathe.',
          takeaway: 'Every breath of oxygen you take was created by photosynthesizing plants and ocean algae!',
        },
      ];
    }

    // Custom lesson fallback from flowchart or conceptCards
    if (lesson?.adaptedContent?.visual?.conceptCards?.length) {
      return lesson.adaptedContent.visual.conceptCards.map((c, i) => ({
        id: i + 1,
        icon: ['💡', '⚡', '🔬', '🌟'][i % 4],
        title: `${i + 1}. ${c.title}`,
        short: c.title,
        metaphor: c.metaphor || 'Foundational conceptual bridge',
        description: c.description,
        takeaway: `Key understanding for ${c.title}`,
      }));
    }

    return [
      {
        id: 1,
        icon: '💡',
        title: '1. Core Principle',
        short: 'Foundational Concept',
        metaphor: 'The anchor idea',
        description: lesson?.originalContent?.summary || 'The primary building block of this topic.',
        takeaway: 'Mastering the core idea makes advanced applications easy.',
      },
      {
        id: 2,
        icon: '⚡',
        title: '2. Dynamic Process',
        short: 'How It Operates',
        metaphor: 'The engine in motion',
        description: 'How individual elements interact and transform over time.',
        takeaway: 'Notice how each component relies on the previous stage.',
      },
      {
        id: 3,
        icon: '🎯',
        title: '3. Practical Application',
        short: 'Real-World Meaning',
        metaphor: 'Tools in your everyday life',
        description: 'How this concept is used in modern science, society, and engineering.',
        takeaway: 'Connects academic study with tangible real-world results.',
      },
    ];
  };

  const nodes = getConceptNodes();
  const currentNode = nodes[selectedNodeIndex] || nodes[0];

  const handleSelectNode = (idx) => {
    soundEffects.playNodeTone(idx);
    setSelectedNodeIndex(idx);
  };

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    soundEffects.playClick();

    for (let i = 0; i < nodes.length; i++) {
      setSelectedNodeIndex(i);
      setSimulationStep(i);
      soundEffects.playNodeTone(i);
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    setSimulationStep(null);
    setIsSimulating(false);
    soundEffects.playSuccess();
  };

  const handleSpeakCurrentNode = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakText(`${currentNode.title}: ${currentNode.description}. Visual metaphor: ${currentNode.metaphor}. Key takeaway: ${currentNode.takeaway}`);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '2rem',
    }}>
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem',
      }}>
        <div>
          <span className="badge badge-sky" style={{ marginBottom: '0.4rem' }}>
            <Sparkles size={14} /> Interactive Visual Mindmap & Concept Flow
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
            {lesson?.title || 'Concept Architecture'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            Click any node below to hear its concept or run the live signal flow simulation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px', fontWeight: 700 }}
            title="Simulate data travelling through each concept node"
          >
            <Zap size={15} />
            <span>{isSimulating ? 'Simulating Signal Flow...' : 'Simulate Data Flow'}</span>
          </button>

          <button
            onClick={handleSpeakCurrentNode}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Listen to selected concept node"
          >
            <Volume2 size={15} style={{ color: 'var(--primary)' }} />
            <span>{isSpeaking ? 'Pause Audio' : 'Explain Node'}</span>
          </button>
        </div>
      </div>

      {/* Concept Node Cards */}
      <div className="concept-node-grid">
        {nodes.map((node, idx) => {
          const isSelected = selectedNodeIndex === idx;
          const isStepActive = simulationStep === idx;

          return (
            <div
              key={node.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectNode(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectNode(idx);
                }
              }}
              className={`concept-node-card ${isSelected ? 'active' : ''}`}
              style={{
                transition: 'all 0.25s ease',
                transform: isStepActive ? 'scale(1.04)' : isSelected ? 'translateY(-3px)' : 'none',
                boxShadow: isStepActive 
                  ? '0 0 0 4px var(--primary), 0 12px 24px var(--primary-glow)' 
                  : undefined,
              }}
              aria-pressed={isSelected}
              aria-label={`${node.title}: ${node.short}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.2rem' }}>{node.icon}</span>
                <span className={`badge ${isSelected ? 'badge-primary' : 'badge-subtle'}`} style={{ fontSize: '0.72rem' }}>
                  Step {node.id}
                </span>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.3rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                {node.title}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {node.short}
              </div>

              {isSelected && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}>
                  <CheckCircle2 size={13} />
                  <span>Currently Focused</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Animated Flow Packet Stream Bar */}
      <div className="flow-packet-stream" title="Continuous processing signal line">
        <div className="flow-packet" />
      </div>

      {/* Expanded Deep-Dive Node Inspection Box */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--primary)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        boxShadow: '0 6px 20px var(--primary-glow)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{currentNode.icon}</span>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)' }}>
                Stage {currentNode.id} Deep Dive
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
                {currentNode.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                const prev = (selectedNodeIndex - 1 + nodes.length) % nodes.length;
                handleSelectNode(prev);
              }}
              className="btn btn-secondary btn-sm"
              title="Previous concept node"
            >
              ← Prev Stage
            </button>
            <button
              onClick={() => {
                const next = (selectedNodeIndex + 1) % nodes.length;
                handleSelectNode(next);
              }}
              className="btn btn-secondary btn-sm"
              title="Next concept node"
            >
              Next Stage →
            </button>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          {currentNode.description}
        </p>

        {/* Visual Metaphor & Key Takeaway Split Cards */}
        <div className="grid-2">
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--primary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
              <Lightbulb size={16} />
              <span>Memorable Analogy / Metaphor</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {currentNode.metaphor}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--emerald)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--emerald)', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} />
              <span>Key Takeaway</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {currentNode.takeaway}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
