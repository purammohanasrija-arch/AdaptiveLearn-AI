import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  PieChart,
  Code,
  Leaf,
  Volume2,
  HelpCircle,
  Play,
  RotateCcw,
  Target,
  Compass,
  Video,
  PlusCircle,
  Mic,
  Moon,
  Sun,
  Eye,
  Sliders,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { soundEffects } from '../services/soundEffects';

export const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { user, token, activeDemoId, switchDemoUser } = useAuth();
  const {
    playChime,
    speakText,
    readingRulerEnabled,
    setReadingRulerEnabled,
    bionicReading,
    setBionicReading,
    setZenBreakOpen,
  } = useAccessibility();
  const toast = useToast();

  const [lessons, setLessons] = useState([]);
  const [progressSummary, setProgressSummary] = useState(null);
  const [adaptiveIntelligence, setAdaptiveIntelligence] = useState(null);
  const [dynamicRecommendations, setDynamicRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d'

  // Weekly Activity dataset
  const weeklyActivity7d = [
    { day: 'Mon', minutes: 18, lessons: 1, label: 'Mon: 18m' },
    { day: 'Tue', minutes: 24, lessons: 2, label: 'Tue: 24m' },
    { day: 'Wed', minutes: 15, lessons: 1, label: 'Wed: 15m' },
    { day: 'Thu', minutes: 30, lessons: 2, label: 'Thu: 30m' },
    { day: 'Fri', minutes: 22, lessons: 1, label: 'Fri: 22m' },
    { day: 'Sat', minutes: 28, lessons: 2, label: 'Sat: 28m' },
    { day: 'Sun', minutes: 16, lessons: 1, label: 'Sun: 16m' },
  ];

  const weeklyActivity30d = [
    { day: 'Week 1', minutes: 95, lessons: 5, label: 'W1: 95m' },
    { day: 'Week 2', minutes: 120, lessons: 6, label: 'W2: 120m' },
    { day: 'Week 3', minutes: 110, lessons: 5, label: 'W3: 110m' },
    { day: 'Week 4', minutes: 135, lessons: 7, label: 'W4: 135m' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const targetUid = user?.id || (activeDemoId === 'learner-b' ? 'user-student-b' : 'user-student-a');
        const [lessonRes, progRes, aiRes, recRes] = await Promise.all([
          api.getLessons().catch(() => ({ lessons: [] })),
          api.getProgressSummary(targetUid, token).catch(() => null),
          api.analyzeLearner(targetUid, token).catch(() => null),
          api.getLearnerRecommendations(targetUid, token).catch(() => null),
        ]);

        if (lessonRes?.lessons) setLessons(lessonRes.lessons);
        if (progRes) setProgressSummary(progRes);
        if (aiRes) setAdaptiveIntelligence(aiRes);
        if (recRes?.recommendations) setDynamicRecommendations(recRes.recommendations);
      } catch (err) {
        console.warn('API error, using cached demo data', err);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchData();
  }, [user, token, activeDemoId]);

  const isDemo = !!activeDemoId;
  const streakDays = user?.profile?.streakDays !== undefined ? user.profile.streakDays : (isDemo ? 5 : (user ? 1 : 0));
  const dailyGoalMinutes = user?.profile?.dailyGoalMinutes || 20;
  const todayMinutesSpent = user?.profile?.todayMinutesSpent !== undefined ? user.profile.todayMinutesSpent : (isDemo ? 16 : 0);
  const overallMastery = progressSummary?.summary?.overallMastery !== undefined 
    ? progressSummary.summary.overallMastery 
    : (isDemo ? 82 : (user?.profile?.baselineScore || 0));
  const completedCount = progressSummary?.summary?.completedLessons !== undefined 
    ? progressSummary.summary.completedLessons 
    : (isDemo ? 2 : (user?.progress?.filter(p => p.status === 'completed').length || 0));

  const recommendation = progressSummary?.recommendation || {
    lessonId: 'lesson-1',
    lessonTitle: 'Introduction to Computers & How Hardware Works',
    action: 'continue',
    advice: completedCount === 0 
      ? 'Start with Lesson 1 to explore computer concepts using your customized format!' 
      : 'Continue your journey with your personalized format and review!',
  };

  const getSubjectIcon = (subject) => {
    if (subject.includes('Computer')) return <Cpu size={20} style={{ color: 'var(--primary)' }} />;
    if (subject.includes('Math')) return <PieChart size={20} style={{ color: '#0284C7' }} />;
    if (subject.includes('Programming')) return <Code size={20} style={{ color: '#10B981' }} />;
    return <Leaf size={20} style={{ color: '#059669' }} />;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '140px', width: '100%', marginBottom: '2rem' }}></div>
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '100px' }}></div>
          ))}
        </div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: '300px' }}></div>
          <div className="skeleton" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Guest Mode Banner */}
      {!user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.08) 0%, rgba(252, 231, 239, 0.6) 100%)',
          border: '1px solid var(--border-color)',
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} /> Exploring AdaptLearn AI in Guest Mode
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Create your free student account to track your mastery, build your learning streak, and save personalized accommodations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => navigate('/auth?tab=register')} className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
              Create My Account
            </button>
            <button onClick={() => navigate('/auth?tab=login')} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
              Log In
            </button>
          </div>
        </div>
      )}

      {/* 1. Personalized Welcome Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
          border: '1px solid var(--border-color)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ fontSize: '3.2rem', filter: 'drop-shadow(0 4px 8px var(--primary-glow))' }}>
            {user?.avatar || '🎓'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                {user ? `Welcome back, ${user.name}!` : 'Welcome to AdaptLearn AI!'}
              </h1>
              {activeDemoId && (
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                  Demo: {activeDemoId === 'learner-a' ? 'Learner A (Aarav)' : 'Learner B (Maya)'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                {user ? (
                  <>Your space is optimized for <strong>{user?.profile?.preferredFormat || 'simplified'}</strong> delivery with <strong>{user?.profile?.textSize || 'standard'}</strong> typography.</>
                ) : (
                  <>Inclusive, adaptive education tailored to every student's learning differences and speed.</>
                )}
              </p>
              <button
                onClick={() => speakText(`${user ? `Welcome back, ${user.name}!` : 'Welcome to AdaptLearn AI!'} ${user ? `Your space is optimized for ${user?.profile?.preferredFormat || 'simplified'} delivery with ${user?.profile?.textSize || 'standard'} typography.` : 'Inclusive, adaptive education tailored to every student\'s learning differences and speed.'}`)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem', gap: '4px' }}
                title="Read welcome briefing aloud"
              >
                <Volume2 size={13} style={{ color: 'var(--primary)' }} />
                <span>Listen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Header Action */}
        <div>
          {isDemo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  switchDemoUser('learner-a');
                  playChime('toggle');
                }}
                className={`btn btn-sm ${activeDemoId === 'learner-a' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                👦🏽 Aarav
              </button>
              <button
                onClick={() => {
                  switchDemoUser('learner-b');
                  playChime('toggle');
                }}
                className={`btn btn-sm ${activeDemoId === 'learner-b' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                👧🏻 Maya
              </button>
            </div>
          ) : user ? (
            <button
              onClick={() => navigate('/onboarding')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Adjust Accommodations
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth?tab=register')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 800 }}
            >
              Sign Up to Save Progress
            </button>
          )}
        </div>
      </div>

      {/* Quick Sensory & Assistive Focus Toolbar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Personalized Focus & Assistive Toolbar</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quickly toggle your sensory accommodations for this session:</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              soundEffects.playClick();
              speakText('Aria voice assistant is listening. You can speak commands, ask for explanations, or practice your quiz hands-free!');
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px', fontSize: '0.8rem' }}
            title="Trigger hands-free Aria voice assistant"
          >
            <Mic size={14} style={{ color: 'var(--primary)' }} />
            <span>Voice Assistant</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playFocusBell();
              setZenBreakOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: '5px', fontSize: '0.8rem' }}
            title="Take a 4-4-4 breathing and calming audio break"
          >
            <span>🧘</span>
            <span>Zen Sensory Break</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setReadingRulerEnabled(!readingRulerEnabled);
              toast.info(readingRulerEnabled ? 'Reading Ruler Spotlight Turned Off' : 'Reading Ruler Spotlight Active! Move mouse or touch to guide reading.');
            }}
            className={`btn btn-sm ${readingRulerEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '5px', fontSize: '0.8rem' }}
            title="Toggle distraction-dimming spotlight bar"
          >
            <Eye size={14} />
            <span>{readingRulerEnabled ? 'Ruler: ON' : 'Reading Ruler'}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setBionicReading(!bionicReading);
              toast.info(bionicReading ? 'Bionic Eye-Anchor Mode Off' : 'Bionic Eye-Anchor Mode Active! First letters bolded for faster eye fixation.');
            }}
            className={`btn btn-sm ${bionicReading ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '5px', fontSize: '0.8rem' }}
            title="Toggle syllable bolding for accelerated fixation"
          >
            <Sparkles size={14} />
            <span>{bionicReading ? 'Bionic: ON' : 'Bionic Reading'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Stat Cards with Tooltip Explanations */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {/* Streak (Interactive with celebration chime) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            soundEffects.playCelebration();
            toast.success(`🔥 Outstanding ${streakDays}-Day Learning Streak! Keep up your steady momentum!`);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              soundEffects.playCelebration();
              toast.success(`🔥 Outstanding ${streakDays}-Day Learning Streak! Keep up your steady momentum!`);
            }
          }}
          className="card card-interactive"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
          title="Click to celebrate your streak!"
        >
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Flame size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{streakDays} Days</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Streak 🔥 (Tap!)</div>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'var(--sky-light)',
            color: 'var(--sky)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Target size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{todayMinutesSpent} / {dailyGoalMinutes}m</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Goal Progress</div>
          </div>
        </div>

        {/* Mastery Score */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'var(--emerald-light)',
            color: 'var(--emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{overallMastery}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adaptive Mastery Score</div>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'var(--amber-light)',
            color: 'var(--amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{completedCount} / 4</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Curriculum Lessons Done</div>
          </div>
        </div>
      </div>

      {/* PHASE 3: AI ADAPTIVE LEARNING ENGINE INTELLIGENCE BAR */}
      {adaptiveIntelligence && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.05) 0%, var(--bg-card) 100%)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--primary)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  AI Adaptive Engine: {adaptiveIntelligence.currentKnowledgeLevel} Level
                </span>
                <span className={`badge ${adaptiveIntelligence.recommendedDifficulty === 'advanced' ? 'badge-emerald' : (adaptiveIntelligence.recommendedDifficulty === 'intermediate' ? 'badge-sky' : 'badge-amber')}`}>
                  {adaptiveIntelligence.recommendedDifficulty ? adaptiveIntelligence.recommendedDifficulty.toUpperCase() : 'TIER 1'}
                </span>
                <span className="badge badge-rose" style={{ fontSize: '0.72rem' }}>
                  scikit-learn Linear Regression
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <span><strong>Pacing:</strong> {adaptiveIntelligence.learningPace}</span>
                <span><strong>Growth Slope:</strong> {adaptiveIntelligence.improvementSlope >= 0 ? `+${adaptiveIntelligence.improvementSlope}` : adaptiveIntelligence.improvementSlope}% / attempt</span>
                <span><strong>Trend:</strong> {adaptiveIntelligence.improvementTrend}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/progress')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <span>View AI Analytics</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Hero Continue Learning & AI Recommendation Section */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Recommendation Card */}
        <div className="card" style={{
          border: '2px solid var(--primary)',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="badge" style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}>
                🎯 Recommended Next Step
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => speakText(`Recommended next step: ${recommendation.lessonTitle}. ${recommendation.advice}`)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', gap: '3px' }}
                  title="Read recommendation aloud"
                >
                  <Volume2 size={13} style={{ color: 'var(--primary)' }} />
                  <span>Listen</span>
                </button>
                <span className="badge badge-sky">Calibrated Pacing</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.6rem' }}>
              {recommendation.lessonTitle}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {recommendation.advice}
            </p>

            <div style={{
              background: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Why This Was Chosen: </span>
              <span>Based on your recent mastery ({overallMastery}%), your format preferences have been queued with audio read-along and visual concept cards.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                playChime('click');
                navigate(`/lessons/${recommendation.lessonId}`);
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <BookOpen size={18} />
              <span>Resume Lesson</span>
            </button>
            <button
              onClick={() => {
                playChime('click');
                navigate(`/quiz/${recommendation.lessonId}`);
              }}
              className="btn btn-secondary"
            >
              <span>Take Quiz</span>
            </button>
          </div>
        </div>

        {/* Weekly Learning Activity Chart with Date Filter */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Weekly Learning Minutes</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: 20 mins daily</span>
            </div>

            {/* Date range filter */}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                onClick={() => setTimeRange('7d')}
                className={`btn btn-sm ${timeRange === '7d' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', minHeight: '28px' }}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`btn btn-sm ${timeRange === '30d' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', minHeight: '28px' }}
              >
                4 Weeks
              </button>
            </div>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeRange === '7d' ? weeklyActivity7d : weeklyActivity30d}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="minutes" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Minutes Studied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {isDemo 
              ? '🎉 Sample Analytics: You hit your learning targets on 4 of the past 7 days!' 
              : '💡 Tip: Studying 20 minutes a day builds confidence and steady mastery!'}
          </div>
        </div>
      </div>

      {/* GAMIFIED ADAPTIVE LEARNING PATHWAY & ROADMAP */}
      <div className="card" style={{
        marginBottom: '2.5rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
      }}>
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
            <span className="badge badge-primary shimmer-badge" style={{ marginBottom: '0.4rem' }}>
              <Zap size={14} /> Adaptive Quest Pathway
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Your Personalized Mastery Journey
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
              Milestones adapt dynamically to your quiz accuracy without penalty for learning pace.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.82rem', padding: '0.35rem 0.8rem' }}>
              ⭐ 225 Total XP Earned
            </span>
            <button
              onClick={() => {
                soundEffects.playCelebration();
                toast.success('🎉 Milestone XP Boost! +25 bonus focus points added to your profile!');
              }}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
              title="Claim daily streak XP boost"
            >
              <span>Claim Daily Quest XP</span>
            </button>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            {
              step: 1,
              title: 'Hardware & Microprocessor Foundations',
              subject: 'Computer Science',
              score: '88% Mastery',
              status: 'Completed',
              dotClass: 'completed',
              icon: '🌟',
              xp: '+100 XP',
              lessonId: 'lesson-1',
            },
            {
              step: 2,
              title: 'Fractions, Proportions & Fair Slicing',
              subject: 'Mathematics',
              score: '78% Mastery',
              status: 'Active Quest',
              dotClass: 'active',
              icon: '🚀',
              xp: '+80 XP',
              lessonId: 'lesson-2',
            },
            {
              step: 3,
              title: 'Algorithms, Sequencing & Conditional Logic',
              subject: 'Programming',
              score: '60% Mastery',
              status: 'In Progress',
              dotClass: 'active',
              icon: '🔁',
              xp: '+45 XP',
              lessonId: 'lesson-3',
            },
            {
              step: 4,
              title: 'Photosynthesis & Solar Energy Cycles',
              subject: 'Environmental Science',
              score: 'Unlocked',
              status: 'Ready',
              dotClass: '',
              icon: '🌿',
              xp: '50 XP Available',
              lessonId: 'lesson-4',
            },
          ].map((mile) => (
            <div key={mile.step} className="roadmap-step" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div className={`roadmap-dot ${mile.dotClass}`}>
                {mile.dotClass === 'completed' ? '✓' : mile.step}
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{mile.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-main)' }}>
                    {mile.title}
                  </span>
                  <span className="badge" style={{ fontSize: '0.72rem' }}>{mile.subject}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Status: <strong>{mile.status}</strong> • {mile.score}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  {mile.xp}
                </span>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    navigate(`/lessons/${mile.lessonId}`);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <span>{mile.status === 'Completed' ? 'Review' : 'Continue'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Lessons Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Your Active Curriculum</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Progress is tracked across all your chosen adaptive formats.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/lessons" className="btn btn-primary btn-sm" style={{ gap: '4px' }}>
              <PlusCircle size={14} />
              <span>Add Any Subject</span>
            </Link>
            <Link to="/lessons" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid-2">
          {lessons.map((lesson) => {
            const prog = (user?.progress || []).find((p) => p.lessonId === lesson.id);
            const completion = prog?.completionPercentage || (lesson.id === 'lesson-1' ? 100 : lesson.id === 'lesson-2' ? 80 : 0);
            const mastery = prog?.masteryScore || (lesson.id === 'lesson-1' ? 88 : lesson.id === 'lesson-2' ? 78 : 60);

            return (
              <div key={lesson.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getSubjectIcon(lesson.subject)}
                      <span className="badge" style={{ fontSize: '0.75rem' }}>{lesson.subject}</span>
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                      Mastery: {mastery}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.4, margin: 0 }}>
                      {lesson.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playChime('click');
                        speakText(`Lesson: ${lesson.title}. Mastery: ${mastery} percent. ${lesson.originalContent?.summary || ''}`);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '3px', flexShrink: 0 }}
                      title="Read lesson summary aloud"
                    >
                      <Volume2 size={13} style={{ color: 'var(--primary)' }} />
                      <span>Voice</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {lesson.originalContent?.summary || 'Interactive adaptive educational module.'}
                  </p>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>Completion</span>
                      <span>{completion}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${completion}%`, height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      playChime('click');
                      navigate(`/lessons/${lesson.id}`);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <span>{completion > 0 ? 'Continue' : 'Start'} Lesson</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => {
                      playChime('click');
                      navigate(`/lessons/${lesson.id}?tab=video`);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '3px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    title="Watch video lesson with captions"
                  >
                    <Video size={13} />
                    <span>Video</span>
                  </button>
                  <button
                    onClick={() => {
                      playChime('click');
                      navigate(`/quiz/${lesson.id}`);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Quiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Achievement Showcase Banner */}
      <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Unlocked Achievements</h3>
          </div>
          <Link to="/achievements" className="btn btn-secondary btn-sm">
            <span>View All Badges</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Streak Pioneer', icon: '🔥', desc: '4-day streak' },
            { title: 'Audio Navigator', icon: '🎧', desc: '30m read-aloud' },
            { title: 'Visual Thinker', icon: '👁️', desc: 'Concept cards' },
            { title: 'Hardware Scholar', icon: '⭐', desc: 'Scored 80%+' },
          ].map((b, idx) => (
            <div key={idx} style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{b.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{b.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
