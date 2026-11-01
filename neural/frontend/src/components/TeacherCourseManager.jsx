import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  PlusCircle,
  Layers,
  Award,
  Users,
  Clock,
  Star,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Plus,
  X,
  FileText,
  Upload,
} from 'lucide-react';

export const TeacherCourseManager = () => {
  const { playChime } = useAccessibility();
  const { showToast } = useToast();

  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);

  // Course Form
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cat-cs');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('15 hours');
  const [outcomes, setOutcomes] = useState('');

  // Module Form
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleSequence, setModuleSequence] = useState(1);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonContent, setLessonContent] = useState('');
  const [lessonSimple, setLessonSimple] = useState('');

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    try {
      setLoading(true);
      const [ovRes, catRes] = await Promise.all([
        api.teacherGetCoursesOverview(),
        api.getCourseCategories(),
      ]);
      if (ovRes) setOverview(ovRes);
      if (catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load courses overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    playChime('click');
    try {
      const outcomesList = outcomes.split('\n').filter((x) => x.trim());
      await api.teacherCreateCourse({
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        estimated_duration: duration,
        learning_outcomes: outcomesList,
      });
      showToast('Course created successfully!', 'success');
      playChime('celebration');
      setCreateCourseOpen(false);
      setTitle('');
      setDescription('');
      setOutcomes('');
      loadTeacherCourses();
    } catch (err) {
      showToast(err.message || 'Failed to create course', 'error');
    }
  };

  const handleAddModuleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseForModule) return;
    playChime('click');
    try {
      const modRes = await api.teacherCreateModule(selectedCourseForModule.id, {
        title: moduleTitle.trim(),
        sequence_number: moduleSequence,
      });

      if (modRes.module && lessonTitle.trim()) {
        await api.teacherCreateLesson(modRes.module.id, {
          title: lessonTitle.trim(),
          duration: lessonDuration,
          content: lessonContent.trim() || 'Core educational concepts for this lesson.',
          simple_explanation: lessonSimple.trim() || 'A simple breakdown for accessible understanding.',
        });
      }

      showToast('Module & initial lesson added!', 'success');
      playChime('celebration');
      setAddModuleOpen(false);
      setModuleTitle('');
      setLessonTitle('');
      setLessonContent('');
      setLessonSimple('');
      loadTeacherCourses();
    } catch (err) {
      showToast(err.message || 'Failed to add module', 'error');
    }
  };

  const handleDeleteCourse = async (cId, cTitle) => {
    if (!window.confirm(`Are you sure you want to remove '${cTitle}'?`)) return;
    playChime('click');
    try {
      await api.teacherDeleteCourse(cId);
      showToast('Course removed from catalog', 'info');
      loadTeacherCourses();
    } catch (err) {
      showToast(err.message || 'Failed to delete course', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading course management dashboard...</p>
      </div>
    );
  }

  const kpis = overview?.kpis || { totalCourses: 10, publishedCourses: 10, totalEnrollments: 20, totalCertificates: 2 };
  const coursesList = overview?.courses || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Courses</span>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{kpis.totalCourses}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>
            {kpis.publishedCourses} Published & Active
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Enrollments</span>
            <Users size={18} style={{ color: '#3B82F6' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{kpis.totalEnrollments}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Across all cohorts</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Certificates Issued</span>
            <Award size={18} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{kpis.totalCertificates}</div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>Verified credentials</div>
        </div>
      </div>

      {/* Course List & Actions */}
      <div className="card" style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800 }}>Active Course Catalog</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage curriculum structure, chapters, lessons, and assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('click');
              setCreateCourseOpen(true);
            }}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.45rem', fontWeight: 800 }}
          >
            <PlusCircle size={16} /> Create New Course
          </button>
        </div>

        {/* Courses Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Course Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Difficulty</th>
                <th style={{ padding: '0.75rem 1rem' }}>Enrollments</th>
                <th style={{ padding: '0.75rem 1rem' }}>Rating</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coursesList.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    <div>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>ID: {c.id}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.category}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ fontSize: '0.72rem' }}>{c.difficulty}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{c.enrollments}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" /> {c.rating}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ background: c.published ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: c.published ? '#10B981' : '#EF4444' }}>
                      {c.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourseForModule(c);
                          setAddModuleOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', gap: '0.25rem' }}
                        title="Add Module & Lesson"
                      >
                        <Plus size={13} /> Add Chapter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#EF4444', padding: '0.3rem 0.5rem' }}
                        title="Delete Course"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COURSE MODAL */}
      {createCourseOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setCreateCourseOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '2rem',
              borderRadius: '24px',
              background: 'var(--bg-surface)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Create New Course</h3>
              <button onClick={() => setCreateCourseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Deep Learning Foundations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Estimated Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 20 hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Course Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide a comprehensive summary of this course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Learning Outcomes (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Master neural network weights&#10;Implement backpropagation&#10;Deploy TensorFlow models"
                  value={outcomes}
                  onChange={(e) => setOutcomes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontWeight: 800 }}>
                Publish Course to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD MODULE & LESSON MODAL */}
      {addModuleOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setAddModuleOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '2rem',
              borderRadius: '24px',
              background: 'var(--bg-surface)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Add Chapter to Course</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Course: {selectedCourseForModule?.title}</div>
              </div>
              <button onClick={() => setAddModuleOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Chapter / Module Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 3: Convolutional Neural Networks"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                />
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-subtle)' }}>
                <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', fontWeight: 800 }}>Initial Lesson in This Chapter</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Lesson Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Filters, Kernels & Feature Maps"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Simple English Summary</label>
                    <textarea
                      rows={2}
                      placeholder="Explain the concept in everyday language..."
                      value={lessonSimple}
                      onChange={(e) => setLessonSimple(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontWeight: 800 }}>
                Save Chapter & Lesson
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourseManager;

