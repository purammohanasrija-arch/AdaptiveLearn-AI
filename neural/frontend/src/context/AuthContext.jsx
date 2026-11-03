import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, API_BASE } from '../services/api';

export const demoProfiles = {
  'learner-a': {
    id: 'user-student-a',
    name: 'Aarav Patel',
    email: 'aarav@student.adaptlearn.ai',
    role: 'student',
    avatar: '👦🏽',
    ageRange: '13-15',
    profile: {
      preferredLanguage: 'English',
      learningLevel: 'beginner',
      preferredFormat: 'simplified',
      textSize: 'large',
      speechRate: 0.85,
      explanationStyle: 'simple',
      quizDifficulty: 'easy',
      readingSpeed: 'slow',
      accessibilityPreferences: {
        dyslexicFont: true,
        highContrast: false,
        reducedMotion: true,
        lineSpacing: 'relaxed',
        audioNarration: true,
        visualDiagrams: true,
        screenReaderOptimized: false,
      },
      disabilityContext: 'Learner A: Reading difficulty & ADHD (prefers simplified text, large font, audio narration)',
      streakDays: 4,
      dailyGoalMinutes: 20,
      todayMinutesSpent: 16,
    },
  },
  'learner-b': {
    id: 'user-student-b',
    name: 'Maya Lin',
    email: 'maya@student.adaptlearn.ai',
    role: 'student',
    avatar: '👧🏻',
    ageRange: '15-17',
    profile: {
      preferredLanguage: 'English',
      learningLevel: 'intermediate',
      preferredFormat: 'visual',
      textSize: 'normal',
      speechRate: 1.0,
      explanationStyle: 'detailed',
      quizDifficulty: 'hard',
      readingSpeed: 'fast',
      accessibilityPreferences: {
        dyslexicFont: false,
        highContrast: true,
        reducedMotion: false,
        lineSpacing: 'normal',
        audioNarration: false,
        visualDiagrams: true,
        screenReaderOptimized: false,
      },
      disabilityContext: 'Learner B: Hearing impairment (prefers visual concept maps, flowcharts, detailed depth, standard text)',
      streakDays: 7,
      dailyGoalMinutes: 30,
      todayMinutesSpent: 28,
    },
  },
  teacher: {
    id: 'user-teacher-1',
    name: 'Dr. Elena Sharma',
    email: 'teacher@adaptlearn.ai',
    role: 'teacher',
    avatar: '👩🏻‍🏫',
    designation: 'Faculty Mentor',
    profile: {
      department: 'Special Education & Adaptive Curriculum',
      institution: 'Inclusive Academy of Learning',
      roleTitle: 'Faculty Mentor',
    },
  },
  parent: {
    id: 'user-parent-1',
    name: 'Priya Patel',
    email: 'parent@adaptlearn.ai',
    role: 'parent',
    avatar: '👨‍👩‍👧',
    studentName: 'Aarav Patel',
    studentId: 'user-student-a',
    designation: 'Parent / Guardian',
    profile: {
      relationship: 'Parent / Guardian',
      studentName: 'Aarav Patel',
      institution: 'Parent & Family Learning Portal',
    },
  },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeDemoId, setActiveDemoId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Auth Check on Mount (Uses secure HttpOnly cookies via /api/auth/me)
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        // First check if an explicit demo persona was selected
        const savedDemo = localStorage.getItem('adaptlearn_active_demo');
        if (savedDemo && demoProfiles[savedDemo]) {
          if (isMounted) {
            setUser(demoProfiles[savedDemo]);
            setActiveDemoId(savedDemo);
            setToken(`demo-token-${savedDemo}`);
            setLoading(false);
          }
          return;
        }

        // Verify real session via secure HttpOnly cookie
        const res = await api.authGetMe();
        if (isMounted && res.success && res.user) {
          setUser(res.user);
          setActiveDemoId(null);
        }
      } catch (err) {
        // Not authenticated
        if (isMounted) {
          setUser(null);
          setActiveDemoId(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Switch demo user explicitly (for evaluators / judges testing Section 15 / HI-03)
  const switchDemoUser = (demoKey) => {
    const selected = demoProfiles[demoKey];
    if (selected) {
      setUser(selected);
      setActiveDemoId(demoKey);
      localStorage.setItem('adaptlearn_active_demo', demoKey);
      setToken(`demo-token-${demoKey}`);
      return selected;
    }
    return null;
  };

  // Real Secure Login
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const res = await api.authLogin({ email, password, rememberMe });
      if (res.user) {
        setUser(res.user);
        setToken(res.token || null);
        setActiveDemoId(null);
        localStorage.removeItem('adaptlearn_active_demo');
        return res.user;
      }
      throw new Error(res.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Real Secure Registration
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.authRegister(userData);
      if (res.user) {
        setUser(res.user);
        setToken(res.token || null);
        setActiveDemoId(null);
        localStorage.removeItem('adaptlearn_active_demo');
        return res.user;
      }
      throw new Error(res.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Set session authentication directly (e.g. from OAuth callbacks or OTP)
  const setSessionAuth = (authUser, authToken = null) => {
    setUser(authUser);
    setToken(authToken);
    setActiveDemoId(null);
    localStorage.removeItem('adaptlearn_active_demo');
  };

  // Logout / Destroy Session
  const logout = async () => {
    try {
      await api.authLogout();
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    setActiveDemoId(null);
    localStorage.removeItem('adaptlearn_active_demo');
    localStorage.removeItem('adaptlearn_token');
    localStorage.removeItem('adaptlearn_active_user');
  };

  // Update Profile
  const updateLearnerProfile = async (profileUpdates) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      name: profileUpdates.name || user.name,
      profile: {
        ...user.profile,
        ...profileUpdates,
        accessibilityPreferences: {
          ...(user.profile?.accessibilityPreferences || {}),
          ...(profileUpdates.accessibilityPreferences || {}),
        },
      },
    };
    setUser(updatedUser);

    try {
      await fetch(`${API_BASE}/students/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User-Id': user.id,
        },
        credentials: 'include',
        body: JSON.stringify(profileUpdates),
      });
    } catch (e) {
      // Safe fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentStudent: user,
        token,
        role: user?.role || 'student',
        isGuest: !user,
        isAuthenticated: !!user,
        activeDemoId,
        isDemoUser: !!activeDemoId,
        loading,
        switchDemoUser,
        setSessionAuth,
        login,
        register,
        logout,
        updateLearnerProfile,
        demoProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
