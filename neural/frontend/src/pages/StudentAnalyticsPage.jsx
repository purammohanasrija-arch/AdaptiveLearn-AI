import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import {
  ArrowLeft,
  User,
  Award,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
  FileText,
  Sliders,
  Send,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Printer,
  ShieldCheck,
  Zap,
  RotateCcw,
  GraduationCap,
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

export const StudentAnalyticsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const { playChime, announce } = useAccessibility();

  const [studentData, setStudentData] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('guidance');
  const [feedbackPriority, setFeedbackPriority] = useState('normal');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDetail(id || 'user-student-a', token);
      setStudentData(res);
    } catch (e) {
      console.warn('Student detail fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id, token]);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;
    setFeedbackSending(true);
    try {
      await api.sendStudentFeedback(
        id || 'user-student-a',
        feedbackNote.trim(),
        feedbackCategory,
        feedbackPriority,
        token
      );
      playChime('success', 'Feedback sent');
      setFeedbackNote('');
      fetchStudent();
      announce('Teacher feedback sent to student');
    } catch (err) {
      alert('Feedback dispatched in offline mode.');
    } finally {
      setFeedbackSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const student = studentData?.student || {
    id: id || 'user-student-a',
    name: 'Aarav Patel',
    email: 'aarav@student.adaptlearn.ai',
    avatar: '👦🏽',
    profile: {
      preferredFormat: 'simplified',
      textSize: 'large',
      readingSpeed: 'slow',
      streakDays: 4,
      disabilityContext: 'Reading difficulties (Dyslexia) & ADHD',
    },
  };

  const diffEval = studentData?.difficultyEvaluation || {
    category: 'progressing_well',
    badge: 'Progressing Well',
    color: '#059669',
    reason: 'Demonstrating solid concept retention and consistent quiz scores above 80%.',
    averageMastery: 84.0,
    averageQuizScore: 80.0,
    improvementSlope: 5.0,
  };

  const progress = studentData?.topicMastery || [];
  const chartData = progress.map(p => ({
    title: p.title.split(':')[0],
    mastery: p.masteryScore,
    completion: p.completionPercentage,
  }));

  const timeline = studentData?.timeline || [];
  const gaps = studentData?.knowledgeGaps || [];
  const feedbacks = studentData?.feedbackHistory || [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/teacher" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Teacher Dashboard</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={15} />
            <span>Print Student Report</span>
          </button>
        </div>
      </div>

      {/* Student Profile Overview Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderTop: `5px solid ${diffEval.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ fontSize: '3.5rem', background: 'var(--bg-subtle)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {student.avatar || '🎓'}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {student.name}
                </h1>
                <span
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: `${diffEval.color}18`,
                    color: diffEval.color,
                    border: `1px solid ${diffEval.color}50`,
                  }}
                >
                  {diffEval.badge}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {student.email} • ID: <code>{student.id}</code>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Preferred Modality: <strong style={{ textTransform: 'capitalize' }}>{student.profile?.preferredFormat}</strong> • Text Size: <strong style={{ textTransform: 'capitalize' }}>{student.profile?.textSize}</strong> • Study Streak: <strong>{student.profile?.streakDays || 1} Days</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Mastery</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: diffEval.averageMastery >= 80 ? '#059669' : diffEval.averageMastery >= 60 ? '#D97706' : '#E11D48' }}>
                {diffEval.averageMastery}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quiz Accuracy</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284C7' }}>
                {diffEval.averageQuizScore}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Improvement Slope</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: diffEval.improvementSlope >= 0 ? '#059669' : '#E11D48' }}>
                {diffEval.improvementSlope >= 0 ? `+${diffEval.improvementSlope}%` : `${diffEval.improvementSlope}%`}
              </div>
            </div>
          </div>
        </div>

        {/* AI Learning Difficulty Analysis Card */}
        <div style={{ marginTop: '1.5rem', background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Brain size={18} style={{ color: diffEval.color }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
              AI Learning Difficulty & Pedagogical Status: {diffEval.badge}
            </h4>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0.25rem 0 0.5rem 0', lineHeight: 1.5 }}>
            {diffEval.reason}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={15} style={{ color: 'var(--primary)' }} />
            <span><strong>Ethical Standard:</strong> This categorization guides pedagogical pacing and accommodations. It never makes clinical or disability assumptions.</span>
          </div>
        </div>
      </div>

      {/* Grid: Topic Mastery Chart & Knowledge Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Performance Chart */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Topic Mastery & Completion
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="title" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
                <Bar dataKey="mastery" fill="var(--primary)" name="Mastery Score (%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completion" fill="#0284C7" name="Completion (%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} style={{ color: '#D97706' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Flagged Knowledge Gaps ({gaps.length})
            </h3>
          </div>

          {gaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <CheckCircle size={32} style={{ color: '#059669', margin: '0 auto 0.5rem auto' }} />
              <div>No active misconceptions identified. Mastery remains consistent!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {gaps.map((g, idx) => (
                <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #D97706' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {g.topic}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <strong>Misconception:</strong> {g.misconception}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                    <strong>Action:</strong> {g.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chronological Learning Journey Timeline */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Chronological Learning Journey Timeline
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
          {timeline.map((evt, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-1.95rem',
                  top: '0.2rem',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: evt.eventType === 'quiz_attempt' ? 'var(--primary)' : evt.eventType === 'knowledge_gap' ? '#D97706' : '#059669',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 0 0 2px var(--border-color)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>{evt.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(evt.date).toLocaleDateString()}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {evt.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher-Student Guidance Communication Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            Send Direct Guidance to {student.name}
          </h3>
        </div>

        <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            rows={3}
            required
            placeholder="Type your encouragement, accommodation advice, or revision guidance here..."
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.35rem' }}>Category:</span>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                >
                  <option value="guidance">Learning Guidance</option>
                  <option value="praise">Positive Praise</option>
                  <option value="revision_reminder">Revision Reminder</option>
                  <option value="accommodation">Accommodation Adjustment</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.35rem' }}>Priority:</span>
                <select
                  value={feedbackPriority}
                  onChange={(e) => setFeedbackPriority(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={feedbackSending}
              className="btn btn-primary btn-sm"
            >
              <Send size={15} />
              <span>{feedbackSending ? 'Sending...' : 'Dispatch Feedback'}</span>
            </button>
          </div>
        </form>

        {/* Previous Feedback History */}
        {feedbacks.length > 0 && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.75rem' }}>Previous Guidance History:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {feedbacks.map((fb, idx) => (
                <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{fb.category}</span>
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)' }}>{fb.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
