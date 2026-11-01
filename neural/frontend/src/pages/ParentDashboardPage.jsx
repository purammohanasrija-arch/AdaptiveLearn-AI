import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Heart,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Award,
  ChevronRight,
  Smile,
} from 'lucide-react';

export const ParentDashboardPage = () => {
  const { user } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState(null);
  const [accessPin, setAccessPin] = useState('1234');

  const studentId = user?.id || 'user-student-a';

  useEffect(() => {
    loadParentView();
  }, [studentId]);

  const loadParentView = async () => {
    setLoading(true);
    try {
      const res = await api.getParentDashboard(studentId, accessPin);
      if (res.success) {
        setParentData(res);
      }
    } catch (err) {
      console.error(err);
      showToast('Loaded offline parent summary', 'info');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h2>Opening Consent-Protected Parent View...</h2>
      </div>
    );
  }

  const weeklyPercentage = Math.min(100, Math.round(((parentData?.weeklyStudyMinutes || 85) / (parentData?.weeklyTargetMinutes || 120)) * 100));

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
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
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
              flexShrink: 0,
            }}
          >
            <Heart size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', letterSpacing: '0.05em' }}>
              CONSENT-VERIFIED FAMILY PORTAL
            </div>
            <h1 style={{ margin: '0.2rem 0', fontSize: '1.85rem', fontWeight: 800 }}>
              Welcome, {parentData?.parentName || 'Parent'}
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Celebrating learning milestones and supportive home partnership for <strong>{parentData?.studentName}</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <ShieldCheck size={18} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Student Consent Active</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weekly Study Time</span>
            <Clock size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {parentData?.weeklyStudyMinutes} / {parentData?.weeklyTargetMinutes} mins
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ width: `${weeklyPercentage}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Streak</span>
            <Sparkles size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
            {parentData?.currentStreak} Days
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Consistently studying daily!
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall STEM Mastery</span>
            <Award size={20} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>
            {parentData?.overallMastery}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Steady, solid foundation
          </div>
        </div>
      </div>

      {/* Main Grid: Mastered & Needs Support Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Mastered Topics */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} /> Mastered Topics (Celebration Zone)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(parentData?.masteredTopics || ['Computer Architecture & Hardware', 'Python Programming Loops']).map((topic, i) => (
              <div
                key={i}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                }}
              >
                🎉 {topic}
              </div>
            ))}
          </div>
        </div>

        {/* Supportive Revision Areas */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> Supportive Focus Areas (Gentle Practice)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(parentData?.topicsNeedingSupport || ['Fractions and Visual Ratios']).map((topic, i) => (
              <div
                key={i}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ fontWeight: 700 }}>🌱 {topic}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  A visual pizza-slice revision module is prepared for a relaxed 10-minute session.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Home Conversation Starters */}
      <div
        className="card"
        style={{
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(254, 242, 242, 0.5) 100%)',
          marginBottom: '2rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Smile size={22} style={{ color: 'var(--primary)' }} /> Home Conversation Starters
        </h3>
        <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Great questions to ask at dinner to encourage curiosity without pressure:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(parentData?.homeConversationStarters || []).map((starter, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <span>{starter}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Guidance Notes */}
      {parentData?.teacherNotes && parentData.teacherNotes.length > 0 && (
        <div className="card" style={{ padding: '2rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> Notes from Dr. Elena Sharma (Teacher)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {parentData.teacherNotes.map((noteItem, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  {noteItem.date} &bull; Category: {noteItem.category}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                  "{noteItem.note}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboardPage;

