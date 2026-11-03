import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { QuickSearchModal } from './components/QuickSearchModal';
import { AccessibilityDrawer } from './components/AccessibilityDrawer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FloatingVoiceBar } from './components/FloatingVoiceBar';
import { ReadingRuler } from './components/ReadingRuler';
import { ZenSensoryModal } from './components/ZenSensoryModal';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { LessonLibraryPage } from './pages/LessonLibraryPage';
import { AdaptiveLessonPlayerPage } from './pages/AdaptiveLessonPlayerPage';
import { AdaptiveLabPage } from './pages/AdaptiveLabPage';
import { AITutorPage } from './pages/AITutorPage';
import { QuizPage } from './pages/QuizPage';
import { ProgressPage } from './pages/ProgressPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { AccessibilitySettingsPage } from './pages/AccessibilitySettingsPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { StudentAnalyticsPage } from './pages/StudentAnalyticsPage';
import { AboutPage } from './pages/AboutPage';
import { VideoLibraryPage } from './pages/VideoLibraryPage';
import { LearningTwinPage } from './pages/LearningTwinPage';
import { ExamGeneratorPage } from './pages/ExamGeneratorPage';
import { AchievementPassportPage } from './pages/AchievementPassportPage';
import { ParentDashboardPage } from './pages/ParentDashboardPage';
import { AccountSecurityPage } from './pages/AccountSecurityPage';
import { CourseExplorerPage } from './pages/CourseExplorerPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';

// Loading Spinner during Auth Validation
const AuthLoadingScreen = () => (
  <div style={{
    minHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.25rem',
  }}>
    <div style={{
      width: '46px',
      height: '46px',
      border: '4px solid rgba(232, 59, 100, 0.15)',
      borderTopColor: '#E83B64',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.01em' }}>
      Verifying secure learning session...
    </span>
  </div>
);

// Route Protection Guard (Prevents unauthorized URL hopping)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  }

  return children;
};

// Public Route Guard (Redirects already logged in users to Dashboard)
const PublicAuthRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
      return <Navigate to={redirectUrl} replace />;
    }
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  }

  return <AuthPage />;
};

// Inner shell layout connecting Sidebar, TopNav, and Router
const AppShellLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isSpeaking, isPaused, pauseSpeech, resumeSpeech, stopSpeech, zenBreakOpen, setZenBreakOpen } = useAccessibility();

  // Hide sidebar on public auth & cover pages, and inside the immersive 3-column lesson studio
  const isLandingOrAuth = ['/', '/auth', '/cover', '/landing'].includes(location.pathname) || location.pathname.includes('/learn/');

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen(true);
      }

      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setAccessibilityOpen((prev) => !prev);
      }

      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (isSpeaking) {
          if (isPaused) resumeSpeech();
          else pauseSpeech();
        }
      }

      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        stopSpeech();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSpeaking, isPaused, pauseSpeech, resumeSpeech, stopSpeech]);

  return (
    <div className="app-shell">
      {/* Collapsible SaaS Sidebar (Hidden on auth & cover pages for immersive focus) */}
      {!isLandingOrAuth && (
        <div className="hide-mobile">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <TopNav
          onOpenAccessibility={() => setAccessibilityOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main id="main-content" className="main-content" tabIndex="-1">
          <Routes>
            {/* Public & Authentication Routes */}
            <Route path="/" element={<PublicAuthRoute />} />
            <Route path="/auth" element={<PublicAuthRoute />} />
            <Route path="/cover" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CourseExplorerPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />

            {/* Protected Learner & Common Routes */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
            <Route path="/lessons" element={<ProtectedRoute><LessonLibraryPage /></ProtectedRoute>} />
            <Route path="/lessons/:id" element={<ProtectedRoute><AdaptiveLessonPlayerPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/learn/:lessonId" element={<ProtectedRoute><LessonPlayerPage /></ProtectedRoute>} />
            <Route path="/lab" element={<ProtectedRoute><AdaptiveLabPage /></ProtectedRoute>} />
            <Route path="/tutor" element={<ProtectedRoute><AITutorPage /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/accessibility" element={<ProtectedRoute><AccessibilitySettingsPage /></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><VideoLibraryPage /></ProtectedRoute>} />
            <Route path="/twin" element={<ProtectedRoute><LearningTwinPage /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><ExamGeneratorPage /></ProtectedRoute>} />
            <Route path="/passport" element={<ProtectedRoute><AchievementPassportPage /></ProtectedRoute>} />
            <Route path="/parent" element={<ProtectedRoute><ParentDashboardPage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><AccountSecurityPage /></ProtectedRoute>} />

            {/* Protected Faculty & Teacher Routes */}
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboardPage /></ProtectedRoute>} />
            <Route path="/teacher/student/:id" element={<ProtectedRoute allowedRoles={['teacher']}><StudentAnalyticsPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Accessibility Control Drawer */}
      <AccessibilityDrawer
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Quick Search Modal (Cmd/Ctrl + K) */}
      <QuickSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Global Floating Voice Reader Bar (Active in learning workspace) */}
      {!isLandingOrAuth && <FloatingVoiceBar />}

      {/* Visual Reading Spotlight Ruler */}
      {!isLandingOrAuth && <ReadingRuler />}

      {/* Zen Sensory Calming Break Modal */}
      <ZenSensoryModal
        isOpen={zenBreakOpen}
        onClose={() => setZenBreakOpen(false)}
      />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1400,
            display: 'flex',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppShellLayout />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
