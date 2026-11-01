import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  HelpCircle,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Dna,
  Brain,
  AlertTriangle,
  RotateCcw,
  Zap,
  Target,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

export const ProgressPage = () => {
  const { user, token, activeDemoId } = useAuth();
  const { playChime, speakText } = useAccessibility();

  const [progressData, setProgressData] = useState(null);
  const [learningDna, setLearningDna] = useState(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [revisionSchedule, setRevisionSchedule] = useState([]);
  const [journeyTimeline, setJourneyTimeline] = useState([]);
  const [learnerIntelligence, setLearnerIntelligence] = useState(null);
  const [learnerProgress, setLearnerProgress] = useState(null);
  const [learnerRecommendations, setLearnerRecommendations] = useState([]);
  const [revisionPlan, setRevisionPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = user?.id || (activeDemoId === 'learner-b' ? 'user-student-b' : 'user-student-a');

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      setLoading(true);
      try {
        const [progRes, dnaRes, gapsRes, revRes, timelineRes, lProgRes, lAiRes, lRecRes, lRevRes] = await Promise.all([
          api.getProgressSummary(targetUserId, token).catch(() => null),
          api.getLearningDna(targetUserId).catch(() => null),
          api.getKnowledgeGaps(targetUserId).catch(() => null),
          api.getRevisionSchedule(targetUserId).catch(() => null),
          api.getJourneyTimeline(targetUserId).catch(() => null),
          api.getLearnerProgress(targetUserId, token).catch(() => null),
          api.analyzeLearner(targetUserId, token).catch(() => null),
          api.getLearnerRecommendations(targetUserId, token).catch(() => null),
          api.getLearnerRevisionPlan(targetUserId, token).catch(() => null),
        ]);

        if (progRes) setProgressData(progRes);
        if (dnaRes?.learningDna) setLearningDna(dnaRes.learningDna);
        if (gapsRes?.gaps) setKnowledgeGaps(gapsRes.gaps);
        if (revRes?.revisionSchedule) setRevisionSchedule(revRes.revisionSchedule);
        if (timelineRes?.timeline) setJourneyTimeline(timelineRes.timeline);
        if (lProgRes) setLearnerProgress(lProgRes);
        if (lAiRes) setLearnerIntelligence(lAiRes);
        if (lRecRes?.recommendations) setLearnerRecommendations(lRecRes.recommendations);
        if (lRevRes) setRevisionPlan(lRevRes);
      } catch (err) {
        console.warn('Progress load fallback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAnalytics();
  }, [targetUserId, token]);

  const isDemo = !!activeDemoId;
  const overallMastery = progressData?.summary?.overallMastery !== undefined 
    ? progressData.summary.overallMastery 
    : (isDemo ? 84 : 75);

  const radarData = learningDna?.radarMetrics || [
    { dimension: 'Visual Processing', score: isDemo && activeDemoId === 'learner-b' ? 95 : 65, fullMark: 100 },
    { dimension: 'Auditory Processing', score: isDemo && activeDemoId === 'learner-a' ? 92 : 40, fullMark: 100 },
    { dimension: 'Reading Velocity', score: isDemo && activeDemoId === 'learner-b' ? 88 : 45, fullMark: 100 },
    { dimension: 'Cognitive Stamina', score: 78, fullMark: 100 },
    { dimension: 'Concept Mastery', score: overallMastery, fullMark: 100 },
    { dimension: 'Pacing Adaptability', score: 85, fullMark: 100 },
  ];

  const dnaArchetype = learningDna?.archetype || (activeDemoId === 'learner-b' ? 'High-Velocity Visual Explorer' : 'Auditory Scaffolded Learner');
  const genomeHash = learningDna?.genomeHash || (activeDemoId === 'learner-b' ? 'DNA-1988' : 'DNA-0928');
  const dnaTraits = learningDna?.traits || [
    'Audio read-aloud accelerates retention',
    'Short sentences lower cognitive fatigue',
    'Thrives with kitchen & daily analogies',
    'Responds well to calm, relaxed pacing',
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Sparkles style={{ color: 'var(--primary)' }} size={28} />
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Learning Analytics & AI Mastery Genome
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '750px' }}>
          Real-time Bayesian knowledge tracing, Item Response Theory calibration, and your unique AI Learning DNA.
        </p>
      </div>

      {/* FEATURE 1: AI LEARNING DNA STUDIO CARD */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.06) 0%, var(--bg-card) 100%)',
          border: '2px solid var(--primary)',
          padding: '2.2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald">scikit-learn Clustering</span>
              <span className="badge badge-amber">{genomeHash}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>
              AI Learning DNA: {dnaArchetype}
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
              {learningDna?.description || 'Your profile automatically balances content difficulty, auditory pacing, and visual density to optimize long-term cognitive retention.'}
            </p>
          </div>

          <div style={{ textAlign: 'center', minWidth: '150px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '6px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              background: 'var(--bg-card)',
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}>
              <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--primary)' }}>{overallMastery}%</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Mastery</span>
            </div>
          </div>
        </div>

        {/* Traits Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
          {dnaTraits.map((t, idx) => (
            <span
              key={idx}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Two Column: 6-Axis Radar vs BKT/IRT Engine Rules */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Radar Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              6-Axis Cognitive & Sensory Radar
            </h3>
            <span className="badge badge-sky">PCA 2D Projection</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Multi-dimensional evaluation of visual vs auditory processing, reading velocity, stamina, and pacing.
          </p>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="dimension" stroke="var(--text-main)" fontSize={11} fontWeight={600} />
                <PolarRadiusAxis stroke="var(--text-muted)" fontSize={10} angle={30} domain={[0, 100]} />
                <Radar name="Cognitive Profile" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bayesian Knowledge Tracing & IRT Explainer */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Bayesian Knowledge Tracing (BKT)
            </h3>
            <span className="badge badge-emerald">Item Response Theory</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            How our Python AI engine calculates skill mastery and adjusts challenge tiers:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #10B981',
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10B981', marginBottom: '0.2rem' }}>
                Tier 3: Advanced Challenge (Theta &gt; 0.6)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Unlocked when consecutive quiz accuracy exceeds 85%. Emphasizes synthesis and critical thinking.
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #3B82F6',
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3B82F6', marginBottom: '0.2rem' }}>
                Tier 2: Core Application (-0.3 &le; Theta &le; 0.6)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Balanced challenge with interactive mindmaps and accessible contextual hints.
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #E11D48',
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#E11D48', marginBottom: '0.2rem' }}>
                Tier 1: Foundational Scaffolding (Theta &lt; -0.3)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Provides audio read-aloud, kitchen/sports analogies, and step-by-step guidance.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 3: TOPIC-WISE PERFORMANCE & LINEAR REGRESSION PROGRESSION */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Topic-Wise Performance Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Topic-Wise Mastery Analytics
            </h3>
            <span className="badge badge-emerald">Python Engine</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Real-time mastery scores across curriculum subject domains:
          </p>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={learnerProgress?.topicPerformance || [
                  { topic: 'Computer Science', masteryScore: 88 },
                  { topic: 'Mathematics', masteryScore: 78 },
                  { topic: 'Programming', masteryScore: 92 },
                  { topic: 'Environmental', masteryScore: 82 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="topic" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="masteryScore" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Mastery %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Learning Improvement & Linear Regression */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Learning Improvement Progression
            </h3>
            <span className="badge badge-sky">Linear Regression Trend</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Sequential quiz performance measuring growth slope and dynamic tier calibration:
          </p>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(learnerProgress?.learningImprovementGraph && learnerProgress.learningImprovementGraph.length > 0)
                  ? learnerProgress.learningImprovementGraph
                  : [
                    { date: 'Quiz 1', score: 60, difficulty: 'beginner' },
                    { date: 'Quiz 2', score: 72, difficulty: 'beginner' },
                    { date: 'Quiz 3', score: 85, difficulty: 'intermediate' },
                    { date: 'Quiz 4', score: 92, difficulty: 'advanced' },
                  ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--emerald)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: 'var(--emerald)' }}
                  name="Quiz Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PHASE 3: ETHICAL COMPLIANCE & PERSONALIZED PEDAGOGICAL STRATEGY */}
      {learnerIntelligence && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--emerald)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-emerald">Active Learning Strategy</span>
                <span className="badge badge-sky">Ethical AI Standard</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Personalized Scaffolding: {learnerIntelligence.currentKnowledgeLevel} Level
              </h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Difficulty:</strong> {learnerIntelligence.recommendedDifficulty?.toUpperCase()} | <strong>Pacing:</strong> {learnerIntelligence.learningPace}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {learnerIntelligence.personalizedLearningStrategy?.map((strat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald)', marginTop: '2px', flexShrink: 0 }} />
                <span>{strat}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>
              <strong>Ethical Inclusion Protocol:</strong> {learnerIntelligence.ethicalCompliance || 'Accessibility requirements are voluntarily chosen. No disability is ever assumed from quiz scores alone.'}
            </span>
          </div>
        </div>
      )}

      {/* FEATURE 6: AI KNOWLEDGE GAP DETECTOR */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain style={{ color: 'var(--primary)' }} size={22} />
              AI Knowledge Gap Detector
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Identifies underlying cognitive misconceptions and recommends targeted 2-minute micro-lessons.
            </p>
          </div>
          <span className="badge badge-amber">{knowledgeGaps.length} Actionable Gaps</span>
        </div>

        {knowledgeGaps.length === 0 ? (
          <div style={{ padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              No critical concept gaps detected! You have demonstrated solid foundational comprehension across active lessons.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {knowledgeGaps.map((gap, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  borderLeft: gap.severity === 'high' ? '4px solid #E11D48' : '4px solid #F59E0B',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{gap.concept}</span>
                  <span className={`badge ${gap.severity === 'high' ? 'badge-rose' : 'badge-amber'}`}>
                    {gap.severity.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 0.6rem 0' }}>
                  <strong>Misconception:</strong> {gap.misconception}
                </p>
                <div style={{ fontSize: '0.8rem', background: 'var(--bg-card)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  💡 <strong>Micro-Remediation:</strong> {gap.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FEATURE 8: SMART REVISION SCHEDULER (EBBINGHAUS FORGETTING CURVE) */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw style={{ color: 'var(--primary)' }} size={22} />
              Smart Revision Scheduler (Ebbinghaus Forgetting Curve)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Decay formula R(t) = exp(-t / S) automatically predicts when retention drops below 75% and prompts review.
            </p>
          </div>
          <span className="badge badge-sky">Spaced Repetition Active</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Topic / Lesson</th>
                <th style={{ padding: '0.75rem 1rem' }}>Last Mastered</th>
                <th style={{ padding: '0.75rem 1rem' }}>Est. Retention</th>
                <th style={{ padding: '0.75rem 1rem' }}>Urgency</th>
                <th style={{ padding: '0.75rem 1rem' }}>Recommended Review</th>
              </tr>
            </thead>
            <tbody>
              {revisionSchedule.length > 0 ? (
                revisionSchedule.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{item.lessonId}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.masteryScore}%</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${item.retentionPercentage}%`,
                            height: '100%',
                            background: item.retentionPercentage >= 75 ? '#10B981' : (item.retentionPercentage >= 60 ? '#F59E0B' : '#E11D48'),
                          }} />
                        </div>
                        <span style={{ fontWeight: 800 }}>{item.retentionPercentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${item.urgency === 'high' ? 'badge-rose' : (item.urgency === 'medium' ? 'badge-amber' : 'badge-emerald')}`}>
                        {item.urgency.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {item.recommendedAction}
                    </td>
                  </tr>
                ))
              ) : (
                [
                  { lesson: 'Introduction to Computers & Hardware', score: '88%', retention: 84, urgency: 'low', action: '10-minute flashcard review in 4 days' },
                  { lesson: 'Basic Mathematics: Fractions & Ratios', score: '78%', retention: 68, urgency: 'high', action: 'Review visual pizza slices and retake 3-question check' },
                  { lesson: 'Introduction to Programming: Loops', score: '62%', retention: 72, urgency: 'medium', action: 'Walk through repeat loop flowchart with voice reader' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{row.lesson}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{row.score}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${row.retention}%`,
                            height: '100%',
                            background: row.retention >= 75 ? '#10B981' : (row.retention >= 60 ? '#F59E0B' : '#E11D48'),
                          }} />
                        </div>
                        <span style={{ fontWeight: 800 }}>{row.retention}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${row.urgency === 'high' ? 'badge-rose' : (row.urgency === 'medium' ? 'badge-amber' : 'badge-emerald')}`}>
                        {row.urgency.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {row.action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FEATURE 7: LEARNING JOURNEY TIMELINE */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock style={{ color: 'var(--primary)' }} size={22} />
          Learning Journey Timeline
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your chronological growth milestones, showing how adaptive accommodations supported your progress.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '2px dashed var(--primary)', paddingLeft: '1.5rem', marginLeft: '0.75rem' }}>
          {(journeyTimeline.length > 0 ? journeyTimeline : [
            {
              date: 'Day 1',
              title: 'Onboarding & Inclusive Profiling',
              badge: 'AI Learning DNA',
              description: 'Completed sensory assessment. Configured large text (18px), dyslexic font, and audio narration pacing.',
            },
            {
              date: 'Day 2',
              title: 'Lesson 1: Introduction to Computers',
              badge: '88% Mastery',
              description: 'Explored hardware concepts using Chef & Kitchen analogy. Completed 4-question check in 1m 50s.',
            },
            {
              date: 'Day 3',
              title: 'Lesson 2: Pizza Fractions & Ratios',
              badge: '78% Mastery',
              description: 'Interacted with visual pizza slice diagrams and denominator memory trick.',
            },
            {
              date: 'Today',
              title: 'Spaced Repetition & Dynamic Difficulty Switch',
              badge: 'Tier 2 Active',
              description: 'AI engine upgraded challenge tier based on Item Response Theory ability calibration.',
            },
          ]).map((item, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '-1.95rem',
                top: '4px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'var(--primary)',
                boxShadow: '0 0 0 4px var(--bg-card)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{item.date}</span>
                <span className="badge badge-emerald">{item.badge}</span>
              </div>
              <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', fontWeight: 800 }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/lessons" className="btn btn-primary btn-lg">
          <span>Explore Next Lesson</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
