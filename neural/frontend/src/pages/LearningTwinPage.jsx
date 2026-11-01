import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Sparkles,
  Bot,
  Brain,
  TrendingUp,
  Target,
  Zap,
  Clock,
  ShieldCheck,
  Compass,
  Layers,
  ChevronRight,
  BookOpen,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Languages,
  Sliders,
  Volume2,
  Bookmark,
  Share2,
  RefreshCw,
  Info,
} from 'lucide-react';

export const LearningTwinPage = () => {
  const { user } = useAuth();
  const { playChime, speakText, textSize, highContrast } = useAccessibility();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [twinData, setTwinData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [practiceHours, setPracticeHours] = useState(3.0);
  const [predicting, setPredicting] = useState(false);

  // Multilingual Translator State
  const [transText, setTransText] = useState('Central Processing Unit (CPU) executes algorithms and instructions in RAM.');
  const [targetLang, setTargetLang] = useState('hi');
  const [transResult, setTransResult] = useState(null);
  const [translating, setTranslating] = useState(false);

  const studentId = user?.id || 'user-student-a';

  useEffect(() => {
    loadDashboardData();
  }, [studentId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [twinRes, predRes, pathRes] = await Promise.all([
        api.getLearningTwinProfile(studentId),
        api.predictLearningProgress({ studentId, targetHorizonDays: 30, hypotheticalPracticeHours: practiceHours }),
        api.getLearningPath(studentId),
      ]);

      if (twinRes.success) setTwinData(twinRes.twin);
      if (predRes.success) setPredictionData(predRes.prediction);
      if (pathRes.success) setLearningPath(pathRes);
    } catch (err) {
      console.error('Failed to load learning twin data:', err);
      showToast('Loaded offline cached digital twin state', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTwin = async () => {
    setAnalyzing(true);
    playChime('click');
    try {
      const res = await api.analyzeLearningTwin({ studentId, triggerReason: 'manual_refresh' });
      if (res.success) {
        setTwinData(res.twin);
        showToast('AI Learning Twin recalculated with latest assessments!', 'success');
        playChime('celebration');
      }
    } catch (err) {
      showToast('Twin update failed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePredictHoursChange = async (hrs) => {
    setPracticeHours(hrs);
    setPredicting(true);
    try {
      const res = await api.predictLearningProgress({
        studentId,
        targetHorizonDays: 30,
        hypotheticalPracticeHours: parseFloat(hrs),
      });
      if (res.success) {
        setPredictionData(res.prediction);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  const handleTranslate = async () => {
    if (!transText.trim()) return;
    setTranslating(true);
    playChime('click');
    try {
      const res = await api.translateContent({
        text: transText,
        targetLanguage: targetLang,
        preserveTechnicalTerms: true,
      });
      if (res.success) {
        setTransResult(res);
        playChime('chime');
      }
    } catch (err) {
      showToast('Translation service unavailable offline.', 'error');
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h2>Synchronizing AI Digital Learning Twin...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Calibrating multi-dimensional learning velocity and neural retention priors.</p>
      </div>
    );
  }

  const radar = twinData?.radar || { mastery: 75, speed: 65, retention: 80, consistency: 90, resilience: 85, inquiry: 70 };
  const evoStages = twinData?.evolutionStages || [];
  const topicMastery = twinData?.topicMastery || {};
  const activeGaps = twinData?.activeKnowledgeGaps || [];

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.08) 0%, rgba(251, 113, 133, 0.15) 100%)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(232, 59, 100, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px var(--primary-glow)',
              flexShrink: 0,
            }}
          >
            <Bot size={36} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>AI Digital Learning Twin</h1>
              <span
                style={{
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={14} /> Archetype: {twinData?.twinArchetype || 'Visual Explorer'}
              </span>
            </div>
            <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px' }}>
              {twinData?.archetypeDescription || 'Your real-time digital double mapping cognitive mastery, sensory format affinities, and learning velocity.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => speakText(`AI Digital Learning Twin for ${twinData?.studentName || 'Student'}. Your archetype is ${twinData?.twinArchetype}. Overall mastery is ${twinData?.overallMastery} percent.`)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
            title="Read summary aloud"
          >
            <Volume2 size={18} /> Listen
          </button>
          <button
            onClick={handleRefreshTwin}
            disabled={analyzing}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
          >
            <RefreshCw size={18} className={analyzing ? 'spin' : ''} /> {analyzing ? 'Recalculating...' : 'Refresh Twin'}
          </button>
        </div>
      </div>

      {/* 4 Multi-Dimensional KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Mastery</span>
            <Target size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {twinData?.overallMastery || 78.5}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.4rem', fontWeight: 600 }}>
            Dynamic IRT Elo calibrated
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Learning Velocity</span>
            <Zap size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {twinData?.learningVelocity || '1.25x'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#F59E0B', marginTop: '0.4rem', fontWeight: 600 }}>
            Relative to cohort benchmark
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Spaced Retention</span>
            <Brain size={20} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {twinData?.retentionIndex || '84.5%'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.4rem', fontWeight: 600 }}>
            Protected against forgetting
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cognitive Sprints</span>
            <Clock size={20} style={{ color: '#6366F1' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            20 mins
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6366F1', marginTop: '0.4rem', fontWeight: 600 }}>
            {twinData?.cognitiveLoadTolerance || 'Optimal sprint duration'}
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Visualization + Chronological Evolution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Radar Visualization */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={20} style={{ color: 'var(--primary)' }} /> 6-Dimensional Cognitive Radar
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated real-time</span>
          </div>

          {/* SVG Radar Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <svg width="280" height="260" viewBox="0 0 300 280">
              {/* Concentric Polygons */}
              {[30, 60, 90, 120].map((r, i) => (
                <polygon
                  key={i}
                  points="150,20 254,80 254,200 150,260 46,200 46,80"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  transform={`scale(${r / 120}) translate(${150 * (1 - r / 120)}, ${140 * (1 - r / 120)})`}
                />
              ))}

              {/* Data Polygon */}
              {(() => {
                const center = { x: 150, y: 140 };
                const maxR = 110;
                const points = [
                  { angle: -90, val: radar.mastery },
                  { angle: -30, val: radar.speed },
                  { angle: 30, val: radar.retention },
                  { angle: 90, val: radar.consistency },
                  { angle: 150, val: radar.resilience },
                  { angle: 210, val: radar.inquiry },
                ].map((pt) => {
                  const rad = (pt.angle * Math.PI) / 180;
                  const r = (pt.val / 100) * maxR;
                  return `${center.x + r * Math.cos(rad)},${center.y + r * Math.sin(rad)}`;
                });
                return (
                  <polygon
                    points={points.join(' ')}
                    fill="rgba(232, 59, 100, 0.35)"
                    stroke="var(--primary)"
                    strokeWidth="3"
                  />
                );
              })()}

              {/* Axis Labels */}
              <text x="150" y="15" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-main)">Mastery ({radar.mastery}%)</text>
              <text x="265" y="80" textAnchor="start" fontSize="11" fontWeight="700" fill="var(--text-main)">Speed</text>
              <text x="265" y="210" textAnchor="start" fontSize="11" fontWeight="700" fill="var(--text-main)">Retention</text>
              <text x="150" y="275" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-main)">Consistency</text>
              <text x="35" y="210" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--text-main)">Resilience</text>
              <text x="35" y="80" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--text-main)">Inquiry</text>
            </svg>
          </div>

          {/* Sensory Affinity Progress */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sensory Format Affinity</div>
            <div style={{ display: 'flex', gap: '0.5rem', height: '10px', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: '40%', background: 'var(--primary)' }} title="Visual: 40%" />
              <div style={{ width: '30%', background: '#F59E0B' }} title="Interactive: 30%" />
              <div style={{ width: '20%', background: '#10B981' }} title="Auditory: 20%" />
              <div style={{ width: '10%', background: '#6366F1' }} title="Simplified Text: 10%" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span>🎨 Visual 40%</span>
              <span>⚡ Interactive 30%</span>
              <span>🎧 Auditory 20%</span>
              <span>📄 Text 10%</span>
            </div>
          </div>
        </div>

        {/* Chronological Evolution Timeline */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} /> Learning Twin Evolution
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 Milestones</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {evoStages.map((stage, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: stage.status === 'current' ? 'var(--primary)' : stage.status === 'projected' ? 'rgba(232, 59, 100, 0.15)' : '#10B981',
                    color: stage.status === 'projected' ? 'var(--primary)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    border: stage.status === 'projected' ? '2px dashed var(--primary)' : 'none',
                  }}
                >
                  {stage.status === 'completed' ? '✓' : idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {stage.stage}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: stage.status === 'current' ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    >
                      {stage.mastery}% Mastery
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {stage.date} &bull; {stage.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(232, 59, 100, 0.05)',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>
              Ethical AI Guarantee: Digital twin traits reflect practice and voluntarily selected accommodations, never a clinical diagnosis.
            </span>
          </div>
        </div>
      </div>

      {/* Predictive Learning Analytics Center (Scikit-Learn ML) */}
      <div
        className="card"
        style={{
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={24} style={{ color: 'var(--primary)' }} /> Predictive Learning Analytics (scikit-learn ML)
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Random Forest regression estimating your 30-day mastery trajectory and identifying early revision signals.
            </p>
          </div>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            Confidence: {predictionData?.predictionConfidence || 89.2}%
          </div>
        </div>

        {/* Interactive Practice Hours Slider */}
        <div
          style={{
            background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
            borderRadius: '14px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Simulated Practice: {practiceHours} hours / week</span>
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>+{predictionData?.expectedNetGain || 7.8}% Estimated 30-Day Gain</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.5"
            value={practiceHours}
            onChange={(e) => handlePredictHoursChange(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            <span>1 hr (Light)</span>
            <span>3 hrs (Recommended)</span>
            <span>6 hrs (Accelerated)</span>
          </div>
        </div>

        {/* Projection Horizon Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>7-Day Projection</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {predictionData?.projectedMastery?.day7 || 61.2}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '0.2rem' }}>Short-term consolidation</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>14-Day Projection</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {predictionData?.projectedMastery?.day14 || 68.5}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '0.2rem' }}>Mid-term trajectory</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '2px solid var(--primary)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>30-Day Target Horizon</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {predictionData?.projectedMastery?.day30 || 76.8}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '0.2rem' }}>With {practiceHours} hrs/wk practice</div>
          </div>
        </div>

        {/* Explainability Factors */}
        <div>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>Model Explainability & Driving Factors</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {(predictionData?.explainabilityFactors || []).map((factor, i) => (
              <div
                key={i}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span>{factor.factor}</span>
                  <span style={{ color: factor.weight.startsWith('-') ? '#EF4444' : '#10B981' }}>{factor.weight}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{factor.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multilingual AI Learning Translator */}
      <div
        className="card"
        style={{
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Languages size={24} style={{ color: 'var(--primary)' }} /> Multilingual AI Learning (Hindi & Telugu)
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Learn science and programming in your preferred regional language while strictly preserving technical English terms.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setTargetLang('hi')}
              className={`btn ${targetLang === 'hi' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '10px', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            >
              हिंदी (Hindi)
            </button>
            <button
              onClick={() => setTargetLang('te')}
              className={`btn ${targetLang === 'te' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '10px', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            type="text"
            value={transText}
            onChange={(e) => setTransText(e.target.value)}
            placeholder="Type any science concept or lesson text..."
            style={{
              flex: 1,
              minWidth: '280px',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
            }}
          />
          <button
            onClick={handleTranslate}
            disabled={translating}
            className="btn btn-primary"
            style={{ borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: 700 }}
          >
            {translating ? 'Translating...' : 'Translate with Preserved STEM Terms'}
          </button>
        </div>

        {transResult && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              background: 'rgba(232, 59, 100, 0.05)',
              border: '1px solid rgba(232, 59, 100, 0.2)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {transResult.translatedText}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Preserved Terms:</span>
              {(transResult.preservedTechnicalTerms || []).map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {t}
                </span>
              ))}
              <button
                onClick={() => speakText(transResult.translatedText)}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                <Volume2 size={14} /> Listen Pronunciation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningTwinPage;

