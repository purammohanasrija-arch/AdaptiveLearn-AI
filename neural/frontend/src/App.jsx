import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
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
            {/* Auth appears before cover page as requested */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cover" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/courses" element={<CourseExplorerPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/learn/:lessonId" element={<LessonPlayerPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/lessons" element={<LessonLibraryPage />} />
            <Route path="/lessons/:id" element={<AdaptiveLessonPlayerPage />} />
            <Route path="/lab" element={<AdaptiveLabPage />} />
            <Route path="/tutor" element={<AITutorPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/accessibility" element={<AccessibilitySettingsPage />} />
            <Route path="/teacher" element={<TeacherDashboardPage />} />
            <Route path="/teacher/student/:id" element={<StudentAnalyticsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/videos" element={<VideoLibraryPage />} />
            <Route path="/twin" element={<LearningTwinPage />} />
            <Route path="/exams" element={<ExamGeneratorPage />} />
            <Route path="/passport" element={<AchievementPassportPage />} />
            <Route path="/parent" element={<ParentDashboardPage />} />
            <Route path="/security" element={<AccountSecurityPage />} />
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
