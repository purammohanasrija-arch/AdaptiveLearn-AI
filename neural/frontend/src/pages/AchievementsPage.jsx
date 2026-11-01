import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import confetti from 'canvas-confetti';
import {
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  Lock,
  Volume2,
  Eye,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AchievementsPage = () => {
  const { user, activeDemoId } = useAuth();
  const { playChime } = useAccessibility();

  const isDemo = !!activeDemoId;
  const completedCount = user?.progress?.filter((p) => p.status === 'completed').length || 0;
  const streak = user?.profile?.streakDays || (user ? 1 : 0);

  const handleCelebrate = () => {
    playChime('success');
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#E83B64', '#FCE7EF', '#F5B9A8', '#FEF08A'],
    });
  };

  const badges = [
    {
      id: 'b-welcome',
      title: 'Pioneer Explorer',
      description: 'Created your personalized inclusive learning profile.',
      icon: '🌱',
      unlocked: !!user,
      category: 'Milestone',
      date: 'Unlocked',
    },
    {
      id: 'b-streak',
      title: 'Streak Starter',
      description: 'Studied consistently and built your daily learning streak.',
      icon: '🔥',
      unlocked: isDemo || streak >= 1,
      category: 'Consistency',
      date: isDemo ? 'Earned 2 days ago' : (streak >= 1 ? 'Active today' : 'Study today to unlock'),
    },
    {
      id: 'b-audio',
      title: 'Audio Navigator',
      description: 'Explored voice read-aloud learning with custom speed.',
      icon: '🎧',
      unlocked: isDemo || completedCount >= 1,
      category: 'Multimodal',
      date: isDemo ? 'Earned yesterday' : (completedCount >= 1 ? 'Unlocked' : 'Listen to 1 lesson to unlock'),
    },
    {
      id: 'b-visual',
      title: 'Visual Thinker',
      description: 'Explored hardware concept cards and execution flowcharts.',
      icon: '👁️',
      unlocked: isDemo || completedCount >= 1,
      category: 'Multimodal',
      date: isDemo ? 'Earned 3 days ago' : (completedCount >= 1 ? 'Unlocked' : 'Finish 1 lesson to unlock'),
    },
    {
      id: 'b-cs',
      title: 'Hardware Scholar',
      description: 'Scored 80%+ on Computer Architecture knowledge check.',
      icon: '⭐',
      unlocked: isDemo || completedCount >= 1,
      category: 'Mastery',
      date: isDemo ? 'Earned today' : (completedCount >= 1 ? 'Unlocked' : 'Pass a quiz to unlock'),
    },
    {
      id: 'b-week-champ',
      title: '7-Day Champion',
      description: 'Reach a full 7-day learning streak.',
      icon: '🏆',
      unlocked: isDemo ? false : streak >= 7,
      category: 'Consistency',
      progress: Math.min(100, Math.round(((streak) / 7) * 100)),
    },
    {
      id: 'b-curriculum',
      title: 'Renaissance Learner',
      description: 'Complete lessons across all 4 subject domains.',
      icon: '🎓',
      unlocked: completedCount >= 4,
      category: 'Mastery',
      progress: Math.min(100, Math.round((completedCount / 4) * 100)),
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
          border: '2px solid var(--primary)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            fontSize: '4rem',
            filter: 'drop-shadow(0 4px 10px var(--primary-glow))',
          }}>
            🏆
          </div>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
              Personal Growth Celebrated
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Achievements & Milestones
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', marginTop: '0.25rem' }}>
              Celebrating every step of your inclusive learning journey. You have unlocked <strong>{unlockedCount} of {badges.length}</strong> milestones!
            </p>
          </div>
        </div>

        <button onClick={handleCelebrate} className="btn btn-primary btn-lg">
          <Sparkles size={18} />
          <span>Celebrate Progress!</span>
        </button>
      </div>

      {/* Badges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {badges.map((b) => (
          <div
            key={b.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: b.unlocked ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
              opacity: b.unlocked ? 1 : 0.75,
              background: b.unlocked ? 'var(--bg-card)' : 'var(--bg-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{b.icon}</span>
                <span className={`badge ${b.unlocked ? 'badge-emerald' : 'badge-sky'}`}>
                  {b.unlocked ? 'Unlocked' : 'In Progress'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                {b.title}
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {b.description}
              </p>
            </div>

            <div>
              {b.unlocked ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
                  ✓ {b.date}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>Progress</span>
                    <span>{b.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${b.progress}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/lessons" className="btn btn-secondary btn-lg">
          <BookOpen size={18} />
          <span>Continue Learning to Unlock More</span>
        </Link>
      </div>
    </div>
  );
};
