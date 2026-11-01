import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  FileText,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  Award,
  ChevronRight,
  RefreshCw,
  Sliders,
  Send,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ExamGeneratorPage = () => {
  const { user } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const { showToast } = useToast();

  const [topic, setTopic] = useState('Computer Architecture & Hardware');
  const [subject, setSubject] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      handleSubmitExam();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const handleGenerateExam = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    playChime('click');
    try {
      const res = await api.generateExam({
        topic,
        subject,
        difficulty,
        questionCount,
        studentId: user?.id || 'user-student-a',
      });
      if (res.success) {
        setExam(res.exam);
        setTimeLeft(res.exam.timeLimitMinutes * 60);
        setTimerRunning(true);
        showToast('AI practice exam successfully generated!', 'success');
        playChime('chime');
      }
    } catch (err) {
      showToast('Failed to generate exam. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitExam = async () => {
    if (!exam) return;
    setSubmitting(true);
    setTimerRunning(false);
    playChime('click');
    try {
      const res = await api.submitExam({
        examId: exam.id,
        studentId: user?.id || 'user-student-a',
        answers,
        timeSpentSeconds: exam.timeLimitMinutes * 60 - timeLeft,
      });

      if (res.success) {
        setResult(res);
        if (res.accuracy >= 75) {
          playChime('celebration');
          showToast(`Congratulations! You earned ${res.xpAwarded} XP (Grade ${res.letterGrade})!`, 'success');
        } else {
          playChime('chime');
          showToast(`Exam completed! Score: ${res.score}/${res.totalPoints}`, 'info');
        }
      }
    } catch (err) {
      showToast('Error submitting exam. Please check connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
              background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px var(--primary-glow)',
              flexShrink: 0,
            }}
          >
            <FileText size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>AI Exam & Practice Paper Generator</h1>
            <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Create tailored assessments spanning MCQs, True/False, Fill-in-the-Blanks, and Application questions with instant rubric grading.
            </p>
          </div>
        </div>

        {exam && !result && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--primary)',
              borderRadius: '14px',
              padding: '0.5rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: timeLeft < 180 ? '#EF4444' : 'var(--text-main)',
            }}
          >
            <Clock size={20} style={{ color: 'var(--primary)' }} />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Generator Configuration (when exam not active or when viewing new generator) */}
      {!exam && !result && (
        <div className="card" style={{ padding: '2rem', borderRadius: '18px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} style={{ color: 'var(--primary)' }} /> Customize Examination Parameters
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Subject Area</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Programming">Programming</option>
                <option value="Environmental Science">Environmental Science</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Target Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
              >
                <option value="Computer Architecture & Hardware">Computer Architecture & Hardware</option>
                <option value="Fractions and Visual Ratios">Fractions and Visual Ratios</option>
                <option value="Python Programming Loops">Python Programming Loops</option>
                <option value="Plant Biology & Energy Cycles">Plant Biology & Energy Cycles</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Difficulty Calibration</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
              >
                <option value="beginner">Beginner (Foundational concepts)</option>
                <option value="intermediate">Intermediate (Standard curriculum)</option>
                <option value="advanced">Advanced (Deep conceptual mastery)</option>
                <option value="adaptive">Adaptive (Auto-calibrated via Twin)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
              >
                <option value="5">5 Comprehensive Questions</option>
                <option value="8">8 Practice Questions</option>
                <option value="10">10 Full Exam Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateExam}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
          >
            {loading ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} />}
            {loading ? 'Synthesizing Multimodal Exam Paper...' : 'Generate AI Practice Exam'}
          </button>
        </div>
      )}

      {/* Active Exam Questions Runner */}
      {exam && !result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'rgba(232, 59, 100, 0.05)',
              borderRadius: '14px',
              border: '1px solid rgba(232, 59, 100, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{exam.title}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty: {exam.difficulty} &bull; {exam.questionCount} Questions</span>
            </div>
            <button
              onClick={() => speakText(`Practice examination: ${exam.title}. Please answer all ${exam.questionCount} questions.`)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem' }}
            >
              <Volume2 size={16} /> Listen Overview
            </button>
          </div>

          {exam.questions.map((q, idx) => (
            <div
              key={q.id}
              className="card"
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{
                      background: 'rgba(0,0,0,0.05)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {q.type.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{q.points || 20} pts</span>
                  <button
                    onClick={() => speakText(q.question)}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}
                    title="Read Question"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                {q.question}
              </div>

              {/* MCQ Options */}
              {q.type === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: answers[q.id] === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: answers[q.id] === opt ? 'rgba(232, 59, 100, 0.05)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.92rem',
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswerChange(q.id, opt)}
                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* True / False Buttons */}
              {q.type === 'true_false' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['True', 'False'].map((tfVal) => (
                    <button
                      key={tfVal}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, tfVal)}
                      className={`btn ${answers[q.id] === tfVal ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontWeight: 700 }}
                    >
                      {tfVal}
                    </button>
                  ))}
                </div>
              )}

              {/* Fill in the Blanks */}
              {q.type === 'fill_blanks' && (
                <input
                  type="text"
                  placeholder="Type the missing technical term here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '1rem',
                  }}
                />
              )}

              {/* Short Answer & Application */}
              {['short_answer', 'application'].includes(q.type) && (
                <textarea
                  rows={3}
                  placeholder="Type your explanation or justification here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                  }}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '14px', width: '100%' }}
          >
            {submitting ? 'Submitting & Evaluating...' : 'Submit Examination for Instant AI Evaluation'}
          </button>
        </div>
      )}

      {/* Evaluation Results Breakdown */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Result Score Banner */}
          <div
            className="card"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              border: '2px solid var(--primary)',
              background: 'linear-gradient(135deg, rgba(232, 59, 100, 0.08) 0%, rgba(251, 113, 133, 0.15) 100%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 900,
                marginBottom: '1rem',
                boxShadow: '0 8px 24px var(--primary-glow)',
              }}
            >
              {result.letterGrade}
            </div>

            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              Examination Score: {result.score} / {result.totalPoints} ({result.accuracy}%)
            </h2>
            <p style={{ margin: '0.5rem 0 1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Awesome effort! You earned <strong style={{ color: 'var(--primary)' }}>+{result.xpAwarded} XP</strong> and updated your AI Learning Twin.
            </p>

            <button
              onClick={() => {
                setExam(null);
                setResult(null);
              }}
              className="btn btn-primary"
              style={{ borderRadius: '12px', padding: '0.65rem 1.5rem', fontWeight: 700 }}
            >
              Generate Another Practice Exam
            </button>
          </div>

          {/* Per-Question Feedback */}
          <div className="card" style={{ padding: '2rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800 }}>Step-by-Step Question Breakdown</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {result.evaluation.map((evalItem, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: evalItem.isCorrect ? '1px solid #10B981' : '1px solid #EF4444',
                    background: evalItem.isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Question {idx + 1}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: evalItem.isCorrect ? '#10B981' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      {evalItem.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {evalItem.pointsEarned} / {evalItem.totalPoints} pts
                    </span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.65rem' }}>
                    {evalItem.question}
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <strong>Your Answer:</strong> {evalItem.submittedAnswer || 'None provided'}
                  </div>

                  {!evalItem.isCorrect && (
                    <div style={{ fontSize: '0.85rem', color: '#10B981', marginBottom: '0.35rem' }}>
                      <strong>Correct Model Answer:</strong> {evalItem.correctAnswer}
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                    <strong>Explanation:</strong> {evalItem.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamGeneratorPage;

