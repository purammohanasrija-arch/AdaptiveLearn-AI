import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { TeacherCourseManager } from '../components/TeacherCourseManager';
import {
  GraduationCap,
  Users,
  TrendingUp,
  CheckCircle2,
  Award,
  Search,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  HelpCircle,
  Brain,
  Sliders,
  Printer,
  FileText,
  Clock,
  Filter,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  Zap,
  BarChart2,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { playChime, announce } = useAccessibility();

  // Active view: 'overview' | 'students' | 'heatmap' | 'analytics' | 'assignments' | 'reports'
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [heatmapSubject, setHeatmapSubject] = useState('all');

  // Modals
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState(null);

  // Form States
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState('beginner');
  const [newStudentFormat, setNewStudentFormat] = useState('simplified');

  const [assignLessonId, setAssignLessonId] = useState('lesson-1');
  const [assignTitle, setAssignTitle] = useState('Foundational Hardware Lab');
  const [assignFormat, setAssignFormat] = useState('simplified');
  const [assignInstructions, setAssignInstructions] = useState('Review the CPU kitchen analogy and complete practice questions.');
  const [assignTarget, setAssignTarget] = useState('all');

  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('guidance');
  const [feedbackPriority, setFeedbackPriority] = useState('normal');

  // Report Modal / Print Preview
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState('class');

  const loadAllTeacherData = async () => {
    try {
      setRefreshing(true);
      const [dash, heat, anal, ins] = await Promise.all([
        api.getTeacherDashboard(token),
        api.getKnowledgeHeatmap(heatmapSubject, token),
        api.getClassAnalytics(token),
        api.getTeacherInsights(token),
      ]);
      setDashboardData(dash);
      setHeatmapData(heat);
      setAnalyticsData(anal);
      setInsightsData(ins);
    } catch (err) {
      console.warn('Teacher dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllTeacherData();
  }, [token, heatmapSubject]);

  // Handle Enrollment
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    try {
      await api.enrollStudent({
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        learningLevel: newStudentLevel,
        preferredFormat: newStudentFormat,
      }, token);
      playChime('success', 'Student enrolled');
      setEnrollModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
      loadAllTeacherData();
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    }
  };

  // Handle Assignment Creation
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const studentIds = assignTarget === 'all'
        ? (dashboardData?.students || []).map(s => s.id)
        : [assignTarget];

      await api.createAssignment({
        studentIds,
        lessonId: assignLessonId,
        title: assignTitle,
        instructions: assignInstructions,
        recommendedFormat: assignFormat,
      }, token);

      playChime('success', 'Assignment created');
      setAssignmentModalOpen(false);
      loadAllTeacherData();
    } catch (err) {
      alert(err.message || 'Failed to dispatch assignment');
    }
  };

  // Handle Feedback Submission
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackNote.trim() || !selectedStudentForFeedback) return;
    try {
      await api.sendStudentFeedback(
        selectedStudentForFeedback.id,
        feedbackNote.trim(),
        feedbackCategory,
        feedbackPriority,
        token
      );
      playChime('success', 'Feedback sent');
      setFeedbackModalOpen(false);
      setFeedbackNote('');
      setSelectedStudentForFeedback(null);
      loadAllTeacherData();
    } catch (err) {
      alert(err.message || 'Failed to dispatch feedback');
    }
  };

  // Handle Report Generation
  const handleGenerateReport = async (studentId = 'class') => {
    setReportLoading(true);
    try {
      const rep = await api.getPerformanceReport(studentId, token);
      setReportData(rep);
      playChime('click', 'Report generated');
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter students
  const filteredStudents = (dashboardData?.students || []).filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.statusCategory === statusFilter;
    const matchesFormat = formatFilter === 'all' || s.preferredFormat === formatFilter;
    return matchesSearch && matchesStatus && matchesFormat;
  });

  const kpis = dashboardData?.kpiMetrics || {
    totalStudents: 5,
    activeLearners: 5,
    completedLessons: 12,
    averageClassPerformance: 79.4,
    averageQuizAccuracy: 78.2,
    studentsRequiringSupport: 1,
    studentsShowingImprovement: 1,
    learningImprovementPercentage: 8.5,
    pendingAssessments: 2,
    totalTimeSpentHours: 4.8,
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Teacher Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '2rem' }}>👩‍🏫</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>
              Inclusive Classroom Analytics
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Faculty Mentor: <strong>Dr. Elena Sharma</strong> • Cohort: <strong>Inclusive STEM 2026 (Room 402)</strong> • Real-time DB Grounded
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadAllTeacherData}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <button
            onClick={() => setEnrollModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <PlusCircle size={15} />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={() => setAssignmentModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <BookOpen size={15} />
            <span>New Assignment</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              handleGenerateReport('class');
            }}
            className="btn btn-primary btn-sm"
          >
            <FileText size={15} />
            <span>Class Report</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div
        role="tablist"
        aria-label="Teacher Dashboard Views"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { id: 'overview', label: 'Class Overview', icon: Users },
          { id: 'students', label: 'Student Roster & Difficulty Status', icon: GraduationCap },
          { id: 'heatmap', label: 'Knowledge Gap Heatmap', icon: Layers },
          { id: 'analytics', label: 'Performance Analytics & Trends', icon: BarChart2 },
          { id: 'assignments', label: 'Assignments & Interventions', icon: BookOpen },
          { id: 'courses', label: 'Course Management', icon: BookOpen },
          { id: 'reports', label: 'Downloadable PDF Reports', icon: Printer },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveTab(tab.id);
                playChime('click', `Switched to ${tab.label}`);
                announce(`${tab.label} tab opened`);
                if (tab.id === 'reports' && !reportData) {
                  handleGenerateReport('class');
                }
              }}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: isActive ? 800 : 600,
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top 4 KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Enrolled Students</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {kpis.totalStudents} <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>100% active</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {kpis.totalTimeSpentHours} total learning hours logged
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Average Class Performance</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                {kpis.averageClassPerformance}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Quiz Accuracy: <strong>{kpis.averageQuizAccuracy}%</strong>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284C7' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Learning Improvement Trend</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0284C7', marginTop: '0.2rem' }}>
                +{kpis.learningImprovementPercentage}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {kpis.studentsShowingImprovement} student(s) on strong upward slope
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #E11D48' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Requiring Additional Support</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#E11D48', marginTop: '0.2rem' }}>
                {kpis.studentsRequiringSupport}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {dashboardData?.alerts?.length || 0} active intervention alerts
              </div>
            </div>
          </div>

          {/* AI Insights & Alerts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* AI Insights Panel */}
            <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>AI-Generated Classroom Insights</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {insightsData?.insights?.map(ins => (
                  <div
                    key={ins.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderLeft: `3px solid ${ins.type === 'alert' ? '#E11D48' : ins.type === 'warning' ? '#D97706' : '#059669'}`,
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {ins.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {ins.statistic}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                      <strong>Evidence:</strong> {ins.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Actionable Recommendations */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Zap size={20} style={{ color: '#D97706' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Prioritized Teaching Recommendations</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {insightsData?.recommendations?.map(rec => (
                  <div
                    key={rec.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span className={`badge ${rec.priority === 'urgent' ? 'badge-rose' : rec.priority === 'high' ? 'badge-amber' : 'badge-sky'}`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.topic}</span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {rec.action}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {rec.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Performance & Topic Completion */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Subject Performance & Completion Overview
            </h3>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.subjectComparisons || []} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    formatter={(val) => [`${val}%`, 'Score']}
                  />
                  <Bar dataKey="averageMastery" fill="var(--primary)" name="Average Mastery (%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="averageQuizScore" fill="#0284C7" name="Quiz Accuracy (%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT MANAGEMENT ROSTER */}
      {activeTab === 'students' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search & Filters */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                  }}
                >
                  <option value="all">All Trajectories</option>
                  <option value="progressing_well">Progressing Well (80%+)</option>
                  <option value="showing_improvement">Showing Improvement (+Slope)</option>
                  <option value="needs_revision">Needs Revision (60-79%)</option>
                  <option value="requires_support">Requires Support (Under 60%)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Format:</span>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                  }}
                >
                  <option value="all">All Formats</option>
                  <option value="simplified">Simple English</option>
                  <option value="visual">Visual Diagrams</option>
                  <option value="audio">Audio Narrations</option>
                  <option value="step_by_step">Step-by-Step</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Student Name</th>
                    <th style={{ padding: '1rem' }}>Preferred Format</th>
                    <th style={{ padding: '1rem' }}>Overall Mastery</th>
                    <th style={{ padding: '1rem' }}>Quiz Accuracy</th>
                    <th style={{ padding: '1rem' }}>Difficulty Status</th>
                    <th style={{ padding: '1rem' }}>Time Spent</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{s.avatar}</span>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-sky" style={{ textTransform: 'capitalize' }}>
                          {s.preferredFormat.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontWeight: 800 }}>
                        <span style={{ color: s.avgMastery >= 80 ? '#059669' : s.avgMastery >= 60 ? '#D97706' : '#E11D48' }}>
                          {s.avgMastery}%
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontWeight: 700 }}>
                        {s.avgQuizScore}%
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: `${s.statusColor}18`,
                            color: s.statusColor,
                            border: `1px solid ${s.statusColor}40`,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.statusColor }} />
                          {s.statusBadge}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        {s.totalTimeSpentMinutes} mins
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setSelectedStudentForFeedback(s);
                              setFeedbackModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Send Guidance Note"
                          >
                            <MessageSquare size={14} />
                            <span>Feedback</span>
                          </button>

                          <Link
                            to={`/teacher/student/${s.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <span>Profile</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE GAP HEATMAP */}
      {activeTab === 'heatmap' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Subject Filter & Legend */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Subject Filter:</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['all', 'Computer Science', 'Mathematics', 'Programming', 'Environmental Science'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setHeatmapSubject(subj)}
                    className={`btn btn-sm ${heatmapSubject === subj ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {subj === 'all' ? 'All Subjects' : subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#059669' }} />
                <span>Mastered (80-100%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#D97706' }} />
                <span>Needs Review (60-79%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#E11D48' }} />
                <span>Struggling (&lt;60%)</span>
              </div>
            </div>
          </div>

          {/* Matrix Heatmap Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left', minWidth: '180px' }}>Student</th>
                    {heatmapData?.topicColumns?.map(tc => (
                      <th key={tc.lessonId} style={{ padding: '0.85rem 0.5rem', minWidth: '130px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>{tc.topic}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tc.subject}</div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: tc.color, marginTop: '0.2rem' }}>
                          Avg: {tc.columnAverage}%
                        </div>
                      </th>
                    ))}
                    <th style={{ padding: '1rem', minWidth: '100px' }}>Student Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData?.matrixRows?.map(row => (
                    <tr key={row.studentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'left' }}>
                        <Link to={`/teacher/student/${row.studentId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                          <span>{row.avatar}</span>
                          <span style={{ fontWeight: 700 }}>{row.studentName}</span>
                        </Link>
                      </td>

                      {row.topicCells.map(cell => (
                        <td key={cell.lessonId} style={{ padding: '0.65rem 0.4rem' }}>
                          <div
                            style={{
                              background: `${cell.color}18`,
                              color: cell.color,
                              border: `1.5px solid ${cell.color}60`,
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.5rem 0.4rem',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                            }}
                          >
                            {cell.score}%
                          </div>
                        </td>
                      ))}

                      <td style={{ padding: '0.85rem', fontWeight: 800 }}>
                        <span style={{ color: row.rowAverage >= 80 ? '#059669' : row.rowAverage >= 60 ? '#D97706' : '#E11D48' }}>
                          {row.rowAverage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heatmap Insights Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 700 }}>Strongest Topic in Cohort</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', marginTop: '0.2rem' }}>
                {heatmapData?.strongestTopic?.topic || 'Computer Science'} ({heatmapData?.strongestTopic?.columnAverage || 86}%)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.2rem' }}>
                Students show clear recall and conceptual confidence.
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#FFF1F2', border: '1px solid #FECDD3' }}>
              <div style={{ fontSize: '0.8rem', color: '#9F1239', fontWeight: 700 }}>Topic Requiring Reinforcement</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9F1239', marginTop: '0.2rem' }}>
                {heatmapData?.weakestTopic?.topic || 'Fractions & Ratios'} ({heatmapData?.weakestTopic?.columnAverage || 62}%)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#BE123C', marginTop: '0.2rem' }}>
                Recommend assigning visual interactive pizza slice analogy to reinforce denominator concepts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLASS ANALYTICS & TRENDS */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Score Distribution Histogram */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                Quiz Score Distribution Across Cohort
              </h3>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.scoreDistribution || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="band" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
                    <Bar dataKey="count" name="Evaluations Count" radius={[6, 6, 0, 0]}>
                      {analyticsData?.scoreDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Learning Engagement Pacing */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                Weekly Cohort Accuracy Growth
              </h3>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.weeklyTrends || []} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis domain={[50, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
                    <Line type="monotone" dataKey="averageScore" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5 }} name="Cohort Score (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Learning Format Preferences */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Accommodation & Learning Format Utilization
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {analyticsData?.formatDistribution?.map((fmt, idx) => (
                <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{fmt.format}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {fmt.percentage}%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {fmt.count} student(s) enrolled in this mode
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASSIGNMENTS & TEACHER INTERVENTIONS */}
      {activeTab === 'assignments' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              Dispatched Inclusive Assignments & Active Alerts
            </h3>
            <button
              onClick={() => setAssignmentModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={15} />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Active Alerts */}
          {dashboardData?.alerts?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#E11D48', margin: 0 }}>
                ⚠️ Active Student Intervention Alerts
              </h4>
              {dashboardData.alerts.map(al => (
                <div
                  key={al.id}
                  style={{
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#9F1239' }}>
                      {al.studentName} – {al.topic}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#BE123C', marginTop: '0.15rem' }}>
                      {al.reason}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#881337', marginTop: '0.25rem' }}>
                      <strong>Recommended Intervention:</strong> {al.recommendedIntervention}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await api.resolveTeacherAlert(al.id, token);
                      playChime('success', 'Alert resolved');
                      loadAllTeacherData();
                    }}
                    className="btn btn-sm btn-secondary"
                    style={{ background: '#FFFFFF' }}
                  >
                    <Check size={14} />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Assignments List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {dashboardData?.assignments?.map(assign => (
              <div key={assign.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-sky">ACTIVE ASSIGNMENT</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: 7 Days</span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {assign.title}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {assign.instructions}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <span>Assigned to: <strong>{assign.studentIds?.length || 'Class'} students</strong></span>
                  <span style={{ textTransform: 'capitalize' }}>Format: <strong>{assign.recommendedFormat}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DOWNLOADABLE PDF REPORTS */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Report Selection Header */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Select Report Target:</span>
              <select
                value={selectedReportStudent}
                onChange={(e) => {
                  setSelectedReportStudent(e.target.value);
                  handleGenerateReport(e.target.value);
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                <option value="class">Full Class Cohort Report</option>
                {dashboardData?.students?.map(s => (
                  <option key={s.id} value={s.id}>Individual Report: {s.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Printable Report Layout */}
          {reportData && (
            <div
              id="printable-report"
              className="card"
              style={{
                padding: '2.5rem',
                background: '#FFFFFF',
                color: '#29242B',
                boxShadow: 'var(--shadow-lg)',
                border: '2px solid var(--primary)',
              }}
            >
              {/* Report Header */}
              <div style={{ borderBottom: '2px solid #E83B64', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#E83B64', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AdaptiveLearn AI – Inclusive Education Performance System
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#29242B', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
                    {reportData.reportTitle}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#665E69' }}>
                    Generated on {new Date(reportData.generatedAt).toLocaleDateString()} at {new Date(reportData.generatedAt).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#665E69' }}>
                  <div>Instructor: <strong>Dr. Elena Sharma</strong></div>
                  <div>Class: <strong>Inclusive STEM 2026</strong></div>
                  <div>Status: <strong style={{ color: '#059669' }}>Official Record</strong></div>
                </div>
              </div>

              {/* Class Cohort Report Content */}
              {reportData.reportType === 'class_cohort_report' && (
                <div>
                  {/* Summary Metric Boxes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#F8F9FA', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Enrolled</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{reportData.summaryMetrics.totalEnrolled}</div>
                    </div>
                    <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#166534' }}>Cohort Mastery</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#166534' }}>{reportData.summaryMetrics.cohortAverageMastery}</div>
                    </div>
                    <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                      <div style={{ fontSize: '0.75rem', color: '#1E40AF' }}>Quiz Accuracy</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E40AF' }}>{reportData.summaryMetrics.cohortAverageQuizAccuracy}</div>
                    </div>
                    <div style={{ background: '#FFF1F2', padding: '1rem', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9F1239' }}>Support Required</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#9F1239' }}>{reportData.summaryMetrics.studentsRequiringSupport}</div>
                    </div>
                  </div>

                  {/* Student Table */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>Cohort Performance Roster</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                        <th style={{ padding: '0.65rem' }}>Student Name</th>
                        <th style={{ padding: '0.65rem' }}>Preferred Format</th>
                        <th style={{ padding: '0.65rem' }}>Average Mastery</th>
                        <th style={{ padding: '0.65rem' }}>Quiz Accuracy</th>
                        <th style={{ padding: '0.65rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.studentRoster.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '0.65rem', fontWeight: 700 }}>{s.name}</td>
                          <td style={{ padding: '0.65rem', textTransform: 'capitalize' }}>{s.preferredFormat}</td>
                          <td style={{ padding: '0.65rem', fontWeight: 800 }}>{s.averageMastery}%</td>
                          <td style={{ padding: '0.65rem' }}>{s.averageQuizScore}%</td>
                          <td style={{ padding: '0.65rem' }}>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: s.statusCategory === 'requires_support' ? '#FEE2E2' : '#DCFCE7', color: s.statusCategory === 'requires_support' ? '#991B1B' : '#166534', fontWeight: 700, fontSize: '0.75rem' }}>
                              {s.statusBadge}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Next Steps */}
                  <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>Recommended Cohort Action Items:</div>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#4B5563', margin: 0, lineHeight: 1.6 }}>
                      {reportData.nextActionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Individual Student Report Content */}
              {reportData.reportType === 'individual_student_report' && (
                <div>
                  {/* Bio & Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Overall Mastery</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#E83B64' }}>{reportData.performanceSummary.overallMastery}</div>
                    </div>
                    <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Quiz Accuracy</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284C7' }}>{reportData.performanceSummary.quizAccuracy}</div>
                    </div>
                    <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Improvement Trend</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{reportData.performanceSummary.improvementSlope}</div>
                    </div>
                    <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Learning Time</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#29242B' }}>{reportData.performanceSummary.totalTimeSpent}</div>
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534', marginBottom: '0.35rem' }}>Key Strengths:</div>
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#14532D', margin: 0 }}>
                        {reportData.strengths.map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400E', marginBottom: '0.35rem' }}>Focus Growth Areas:</div>
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#78350F', margin: 0 }}>
                        {reportData.growthAreas.map((ga, idx) => (
                          <li key={idx}>{ga}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Topic Mastery Table */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Topic-by-Topic Performance</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                        <th style={{ padding: '0.65rem' }}>Lesson / Topic</th>
                        <th style={{ padding: '0.65rem' }}>Subject</th>
                        <th style={{ padding: '0.65rem' }}>Mastery</th>
                        <th style={{ padding: '0.65rem' }}>Status</th>
                        <th style={{ padding: '0.65rem' }}>Time Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topicRecords.map((tr, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '0.65rem', fontWeight: 700 }}>{tr.lessonTitle}</td>
                          <td style={{ padding: '0.65rem' }}>{tr.subject}</td>
                          <td style={{ padding: '0.65rem', fontWeight: 800 }}>{tr.masteryScore}</td>
                          <td style={{ padding: '0.65rem' }}>{tr.completionStatus}</td>
                          <td style={{ padding: '0.65rem' }}>{tr.timeSpent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Teacher Guidance Notes */}
                  {reportData.teacherGuidanceHistory?.length > 0 && (
                    <div style={{ background: '#FDF2F8', padding: '1rem', borderRadius: '8px', border: '1px solid #FBCFE8', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#9D174D', marginBottom: '0.25rem' }}>Teacher Guidance History:</div>
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#831843', margin: 0 }}>
                        {reportData.teacherGuidanceHistory.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Next Steps */}
                  <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#374151', marginBottom: '0.25rem' }}>Recommended Next Learning Steps:</div>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#4B5563', margin: 0 }}>
                      {reportData.recommendedNextSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: COURSE & CURRICULUM MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="animate-fade-in">
          <TeacherCourseManager />
        </div>
      )}

      {/* MODAL 1: ENROLL NEW STUDENT */}
      {enrollModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Enroll New Student</h3>
              <button onClick={() => setEnrollModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Taylor"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@student.adaptlearn.ai"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Starting Level</label>
                <select
                  value={newStudentLevel}
                  onChange={(e) => setNewStudentLevel(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Core)</option>
                  <option value="advanced">Advanced (Synthesis)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Preferred Learning Format</label>
                <select
                  value={newStudentFormat}
                  onChange={(e) => setNewStudentFormat(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                >
                  <option value="simplified">Simple English & Summaries</option>
                  <option value="visual">Visual Explanations & Diagrams</option>
                  <option value="audio">Audio Lessons</option>
                  <option value="step_by_step">Step-by-Step Breakdown</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEnrollModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Enroll into Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE ASSIGNMENT */}
      {assignmentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Dispatch Inclusive Assignment</h3>
              <button onClick={() => setAssignmentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Assignment Title</label>
                <input
                  type="text"
                  required
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Assign To</label>
                <select
                  value={assignTarget}
                  onChange={(e) => setAssignTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                >
                  <option value="all">Entire Class (All 5 Students)</option>
                  {dashboardData?.students?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.statusBadge})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Lesson Topic</label>
                <select
                  value={assignLessonId}
                  onChange={(e) => setAssignLessonId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                >
                  <option value="lesson-1">Computer Science: Hardware Architecture</option>
                  <option value="lesson-2">Mathematics: Fractions & Ratios</option>
                  <option value="lesson-3">Programming: Loops & Algorithms</option>
                  <option value="lesson-4">Environmental Science: Photosynthesis</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Recommended Format</label>
                <select
                  value={assignFormat}
                  onChange={(e) => setAssignFormat(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                >
                  <option value="simplified">Simple English Format</option>
                  <option value="visual">Visual Mindmap & Diagram</option>
                  <option value="step_by_step">Step-by-Step Breakdown</option>
                  <option value="audio">Audio Narration</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Instructions for Learners</label>
                <textarea
                  rows={2}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setAssignmentModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Dispatch Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SEND FEEDBACK */}
      {feedbackModalOpen && selectedStudentForFeedback && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Guidance & Feedback</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>To: {selectedStudentForFeedback.name}</div>
              </div>
              <button onClick={() => setFeedbackModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Feedback Note</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Great job on your recent quiz! Keep up the momentum..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  >
                    <option value="guidance">Learning Guidance</option>
                    <option value="praise">Positive Praise</option>
                    <option value="revision_reminder">Revision Reminder</option>
                    <option value="accommodation">Accommodation Adjustment</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={feedbackPriority}
                    onChange={(e) => setFeedbackPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setFeedbackModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Dispatch Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
