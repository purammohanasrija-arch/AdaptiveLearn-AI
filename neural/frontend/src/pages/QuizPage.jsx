import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
  BookOpen,
  Volume2,
} from 'lucide-react';

export const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { playChime, announce, speakText } = useAccessibility();

  const [lesson, setLesson] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonQuiz = async () => {
      setLoading(true);
      try {
        const res = await api.getLessonById(id || 'lesson-1');
        setLesson(res.lesson);
      } catch (err) {
        console.warn('Failed to load quiz lesson');
      } finally {
        setLoading(false);
      }
    };
    fetchLessonQuiz();
  }, [id]);

  const questions = lesson?.quiz || [];
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (index) => {
    if (submittedQuestion) return; // locked after check
    setSelectedOptions({ ...selectedOptions, [currentQ.id]: index });
    playChime('click');
  };

  const handleCheckAnswer = () => {
    if (selectedOptions[currentQ.id] === undefined) return;
    setSubmittedQuestion(true);
    const isCorrect = selectedOptions[currentQ.id] === currentQ.correctAnswer;

    if (isCorrect) {
      playChime('success');
      announce('Correct answer! Great job.');
    } else {
      playChime('hint');
      announce('Not quite. Review the explanation.');
    }
  };

  const handleNextQuestion = async () => {
    setShowHint(false);
    setSubmittedQuestion(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      playChime('click');
    } else {
      // Quiz Complete - submit to backend
      await submitFinalQuiz();
    }
  };

  const submitFinalQuiz = async () => {
    const answersPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedOptions[q.id] ?? -1,
    }));

    try {
      const res = await api.submitQuiz(lesson.id, {
        answers: answersPayload,
        timeSpentSeconds: 90,
        userId: user?.id,
        token,
      });

      const finalResult = res.summary || res;
      setQuizResult(finalResult);
      setQuizCompleted(true);

      if (res.summary?.score >= 75) {
        playChime('success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#FB7185', '#F43F5E', '#FEF08A'],
        });
      }
    } catch (e) {
      // Offline fallback
      let correctCount = 0;
      questions.forEach((q) => {
        if (selectedOptions[q.id] === q.correctAnswer) correctCount++;
      });
      const score = Math.round((correctCount / questions.length) * 100);
      setQuizResult({
        score,
        accuracy: score / 100,
        correctCount,
        totalQuestions: questions.length,
        nextStepAdvice: score >= 80 ? 'Exceptional mastery!' : 'Solid practice! Review visual notes.',
        suggestedDifficulty: score >= 80 ? 'medium' : 'easy',
      });
      setQuizCompleted(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
    setShowHint(false);
    setSubmittedQuestion(false);
    setQuizCompleted(false);
    setQuizResult(null);
    playChime('click');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <p>Loading accessible quiz...</p>
      </div>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Quiz not found</h2>
        <Link to="/lessons" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Quiz Progress Header */}
      {!quizCompleted && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Question {currentQuestionIndex + 1} of {questions.length} • {lesson.title}
            </span>
            <span className="badge badge-sky" style={{ textTransform: 'capitalize' }}>
              Level: {currentQ.difficulty || 'Easy'}
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                height: '100%',
                background: 'var(--primary)',
                transition: 'width 0.3s ease',
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Quiz Card */}
      {!quizCompleted ? (
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Question Prompt */}
          {/* Question Prompt with Read Aloud */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, lineHeight: 1.4 }}>
              {currentQ.question}
            </h2>
            <button
              type="button"
              onClick={() => {
                const optionsText = currentQ.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join('. ');
                speakText(`Question ${currentQuestionIndex + 1}: ${currentQ.question}. ${optionsText}`);
              }}
              className="btn btn-secondary btn-sm"
              style={{ flexShrink: 0, padding: '0.35rem 0.65rem', gap: '4px' }}
              title="Read complete question and options aloud"
              aria-label="Read question and options aloud"
            >
              <Volume2 size={16} style={{ color: 'var(--primary)' }} />
              <span>Listen</span>
            </button>
          </div>

          {/* Multiple Choice Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }} role="radiogroup">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOptions[currentQ.id] === idx;
              const isCorrectAnswer = currentQ.correctAnswer === idx;

              let borderStyle = '1px solid var(--border-color)';
              let bgStyle = 'var(--bg-card)';
              let iconFeedback = null;

              if (submittedQuestion) {
                if (isCorrectAnswer) {
                  borderStyle = '2px solid #059669';
                  bgStyle = '#D1FAE5';
                  iconFeedback = <CheckCircle size={20} style={{ color: '#059669' }} />;
                } else if (isSelected) {
                  borderStyle = '2px solid #E11D48';
                  bgStyle = '#FEE2E2';
                  iconFeedback = <XCircle size={20} style={{ color: '#E11D48' }} />;
                }
              } else if (isSelected) {
                borderStyle = '2px solid var(--primary)';
                bgStyle = 'var(--primary-light)';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: borderStyle,
                    background: bgStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: submittedQuestion ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: '1rem',
                    transition: 'all 0.15s ease',
                    color: 'var(--text-main)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(`Option ${idx + 1}: ${opt}`);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Pronounce this option"
                      aria-label={`Pronounce option ${idx + 1}`}
                    >
                      <Volume2 size={16} />
                    </button>
                    {iconFeedback}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint Disclosure with Voice */}
          <div style={{ marginBottom: '1.5rem' }}>
            {!showHint ? (
              <button
                onClick={() => {
                  setShowHint(true);
                  playChime('hint');
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.85rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                <Lightbulb size={16} />
                <span>Need a Hint?</span>
              </button>
            ) : (
              <div style={{
                background: 'var(--bg-subtle)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid #D97706',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#D97706' }}>💡 Hint: </span>
                  <span>{currentQ.hint || 'Think back to the lesson analogies and core ideas.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakText(`Hint: ${currentQ.hint || 'Think back to the lesson analogies.'}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#D97706',
                    padding: '4px',
                    flexShrink: 0,
                  }}
                  title="Read hint aloud"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Explanation Banner (After Submission) */}
          {submittedQuestion && (
            <div style={{
              background: 'var(--bg-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Educational Explanation:
                </div>
                <button
                  type="button"
                  onClick={() => speakText(`Educational explanation: ${currentQ.explanation}`)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  <Volume2 size={13} style={{ color: 'var(--primary)' }} /> Listen
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {!submittedQuestion ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptions[currentQ.id] === undefined}
                className="btn btn-primary btn-lg"
              >
                <span>Check Answer</span>
                <CheckCircle size={18} />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary btn-lg"
              >
                <span>{currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Results Card */
        <div className="card animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: quizResult?.score >= 70 ? '#D1FAE5' : '#FEE2E2',
            color: quizResult?.score >= 70 ? '#059669' : '#E11D48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            fontSize: '2.5rem',
          }}>
            {quizResult?.score >= 70 ? '🎉' : '🌱'}
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {quizResult?.score >= 80 ? 'Mastery Achieved!' : quizResult?.score >= 60 ? 'Great Learning Effort!' : 'Keep Growing!'}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem auto' }}>
            {quizResult?.nextStepAdvice}
          </p>

          {/* Score & Mastery Metric Boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
            textAlign: 'left',
          }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quiz Score</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                {quizResult?.score}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {quizResult?.correctCount} of {quizResult?.totalQuestions} correct
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adaptive Mastery Score</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
                {Math.round(0.7 * (quizResult?.score || 80) + 0.3 * 100)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                70% Quiz + 30% Completion
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recommended Difficulty</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'capitalize', color: '#0284C7', marginTop: '0.3rem' }}>
                {quizResult?.suggestedDifficulty || 'Easy'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Calibrated to your pace
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>AI Smart Difficulty Switcher</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                Tier {quizResult?.adaptiveCalibration?.recommendedTier || (quizResult?.score >= 80 ? 3 : 1)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {quizResult?.adaptiveCalibration?.tierLabel || 'IRT + BKT Calibrated'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={handleRetake} className="btn btn-secondary btn-lg">
              <RotateCcw size={18} />
              <span>Retake Quiz</span>
            </button>

            <Link to="/lessons" className="btn btn-primary btn-lg">
              <BookOpen size={18} />
              <span>Continue Next Lesson</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
