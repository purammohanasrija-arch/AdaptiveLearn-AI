import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Award,
  Clock,
  Star,
  Users,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Layers,
  Compass,
  ArrowRight,
  Code,
  PieChart,
  Atom,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Play,
  RotateCcw,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'cat-cs': Code,
  'cat-math': PieChart,
  'cat-science': Atom,
  'cat-lang': MessageSquare,
  'cat-career': Briefcase,
  'cat-business': TrendingUp,
  'cat-exams': Award,
};

export const CourseExplorerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  const studentId = user ? user.id : 'user-student-a';

  useEffect(() => {
    loadCatalogData();
  }, [selectedCategory, selectedDifficulty, sortBy, studentId]);

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      const [catsRes, coursesRes, myRes, recsRes] = await Promise.all([
        api.getCourseCategories(),
        api.getCourses({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          search: searchQuery,
          sort: sortBy,
          student_id: studentId,
        }),
        api.getMyCourses(studentId),
        api.getCourseRecommendations(studentId),
      ]);

      if (catsRes.categories) setCategories(catsRes.categories);
      if (coursesRes.courses) setCourses(coursesRes.courses);
      if (myRes.courses) setMyCourses(myRes.courses);
      if (recsRes.recommendations) setRecommendations(recsRes.recommendations);
    } catch (err) {
      console.error('Failed to load course catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    playChime('click');
    loadCatalogData();
  };

  const handleEnrollClick = async (courseId, e) => {
    e.stopPropagation();
    playChime('click');
    try {
      const res = await api.enrollInCourse(courseId, studentId);
      showToast(res.message || 'Successfully enrolled in course!', 'success');
      playChime('celebration');
      navigate(`/courses/${courseId}`);
    } catch (err) {
      showToast(err.message || 'Enrollment failed', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(232, 59, 100, 0.05) 100%)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="badge" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 700 }}>
              <Sparkles size={14} /> Phase 10 Comprehensive Online Course Library
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 1rem', color: 'var(--text-main)' }}>
            Learn Without Barriers: <span style={{ color: 'var(--primary)' }}>Structured Inclusive Courses</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            Master computer science, mathematics, science, professional skills, and competitive exam preparation.
            Every lesson adapts dynamically into 8 sensory modalities (Simple English, Visual Mindmaps, Step-by-Step, Audio Narration, Examples, and Practice).
          </p>

          {/* Quick Stats Pill */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={18} style={{ color: 'var(--primary)' }} />
              <strong>{categories.length || 7} Categories</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <BookOpen size={18} style={{ color: '#3B82F6' }} />
              <strong>50+ Structured Modules</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Award size={18} style={{ color: '#10B981' }} />
              <strong>Verified Certificates</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={18} style={{ color: '#8B5CF6' }} />
              <strong>WCAG 2.2 AA Aligned</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Personalized Recommendations Strip */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(232, 59, 100, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>AI Recommended For Your Learning Journey</h2>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tailored to your current courses & gaps</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate(`/courses/${rec.id}`)}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(232, 59, 100, 0.08)', color: 'var(--primary)' }}>
                      AI Recommendation
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>{rec.difficulty}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-main)' }}>{rec.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 0.85rem' }}>
                    💡 <em>{rec.recommendationReason}</em>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} /> {rec.estimatedDuration}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Explore <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Active Enrolled Courses (If any) */}
      {myCourses.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>My Enrolled Courses</h2>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{myCourses.length} active learning path(s)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {myCourses.map((mc) => (
              <div
                key={mc.id}
                onClick={() => navigate(`/courses/${mc.id}`)}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                      Enrolled &bull; {mc.difficulty}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {mc.completedLessons} / {mc.lessonCount} Lessons
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.75rem', color: 'var(--text-main)' }}>{mc.title}</h3>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div style={{ width: `${mc.progressPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #10B981 100%)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 700 }}>
                    {mc.progressPercentage}% Completed
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Instructor: {mc.instructorName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playChime('click');
                      navigate(`/courses/${mc.id}/learn/${mc.lastAccessedLessonId || 'cl-py-m1-l1'}`);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.35rem', fontWeight: 700 }}
                  >
                    <Play size={12} /> Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Python, Java, DSA, Calculus, SQL, Web Dev..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                fontSize: '0.9rem',
              }}
            />
          </form>

          {/* Difficulty Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); playChime('click'); }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); playChime('click'); }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="duration">Estimated Duration</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto', paddingTop: '0.25rem' }}>
          <button
            type="button"
            onClick={() => { setSelectedCategory('all'); playChime('click'); }}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '20px',
              border: selectedCategory === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: selectedCategory === 'all' ? 'var(--primary)' : 'transparent',
              color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>All Courses</span>
            <span className="badge" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', background: selectedCategory === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)' }}>
              {courses.length}
            </span>
          </button>

          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || BookOpen;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setSelectedCategory(cat.id); playChime('click'); }}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Course Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Course Catalog ({courses.length} {courses.length === 1 ? 'Course' : 'Courses'})
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interactive Modules &bull; Adaptive Assessments</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading course catalog...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: '18px' }}>
            <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>No courses match your filter</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>Try clearing the search query or switching categories.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSearchQuery(''); }}
              className="btn btn-secondary btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => { playChime('click'); navigate(`/courses/${course.id}`); }}
                className="card"
                style={{
                  padding: 0,
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Header Banner */}
                <div
                  style={{
                    height: '110px',
                    background: `linear-gradient(135deg, ${course.color || '#E83B64'} 0%, #1E293B 100%)`,
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    color: '#FFFFFF',
                    position: 'relative',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(4px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {course.categoryName}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                    }}
                  >
                    {course.difficulty}
                  </span>
                </div>

                {/* Course Body */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        margin: '0 0 0.5rem',
                        lineHeight: 1.35,
                        color: 'var(--text-main)',
                      }}
                    >
                      {course.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        margin: '0 0 1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description}
                    </p>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Layers size={13} style={{ color: 'var(--primary)' }} />
                        {course.moduleCount} Chapters &bull; {course.lessonCount} Lessons
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        {course.estimatedDuration}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Star size={13} fill="#F59E0B" color="#F59E0B" />
                        <strong>{course.rating}</strong> ({course.ratingCount})
                      </span>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div
                    style={{
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        👩🏻‍🏫
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{course.instructorName}</span>
                    </div>

                    {course.isEnrolled ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playChime('click');
                          navigate(`/courses/${course.id}`);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 700 }}
                      >
                        Continue &rarr;
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleEnrollClick(course.id, e)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 700 }}
                      >
                        Enroll Free &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseExplorerPage;

