import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  Laptop,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Trash2,
  Copy,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  User,
  Mail,
  Calendar,
} from 'lucide-react';

export const AccountSecurityPage = () => {
  const { user, token, logout } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // 2FA state
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, [user]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [meRes, sessRes, logsRes] = await Promise.all([
        api.authGetMe(token),
        api.authGetSessions(token),
        api.authGetSecurityLogs(token),
      ]);
      if (meRes.success) setProfileData(meRes.user);
      if (sessRes.success) setSessions(sessRes.sessions);
      if (logsRes.success) setSecurityLogs(logsRes.logs);
    } catch (err) {
      console.error(err);
      // Fallback display from context
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setPasswordUpdating(true);
    playChime('click');
    try {
      const res = await api.authChangePassword(currentPassword, newPassword, token);
      if (res.success) {
        showToast(res.message, 'success');
        playChime('celebration');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleInitiate2FA = async () => {
    setTwoFactorLoading(true);
    playChime('click');
    try {
      const res = await api.auth2FAEnable(token);
      if (res.success) {
        setTwoFactorSetup(res);
        playChime('chime');
      }
    } catch (err) {
      showToast(err.message || 'Failed to initiate 2FA setup.', 'error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyAndActivate2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorVerifyCode.trim()) return;
    setTwoFactorLoading(true);
    playChime('click');
    try {
      const res = await api.auth2FAVerify(twoFactorVerifyCode.trim(), token);
      if (res.success) {
        showToast(res.message, 'success');
        playChime('celebration');
        setTwoFactorSetup(null);
        setTwoFactorVerifyCode('');
        loadSecurityData();
      }
    } catch (err) {
      showToast(err.message || 'Invalid verification code.', 'error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    playChime('click');
    try {
      const res = await api.auth2FADisable(disablePassword, token);
      if (res.success) {
        showToast(res.message, 'info');
        loadSecurityData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to disable 2FA.', 'error');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    playChime('click');
    try {
      const res = await api.authRevokeSession(sessionId, token);
      if (res.success) {
        showToast('Session terminated.', 'info');
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (err) {
      showToast('Failed to revoke session.', 'error');
    }
  };

  const handleLogoutAll = async () => {
    playChime('click');
    try {
      await api.authLogout(token);
      showToast('Logged out from all active devices.', 'info');
      logout();
    } catch (err) {
      logout();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h2>Loading Account Security Dashboard...</h2>
      </div>
    );
  }

  const currentUser = profileData || user || {};

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1080px', margin: '0 auto' }}>
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
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px var(--primary-glow)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={36} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              ACCOUNT PRIVACY & SECURITY
            </div>
            <h1 style={{ margin: '0.2rem 0', fontSize: '1.85rem', fontWeight: 800 }}>
              Security & Identity Center
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Manage password credentials, two-factor authentication, active login sessions, and audit events.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogoutAll}
          className="btn btn-secondary"
          style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444' }}
        >
          <LogOut size={16} /> Log Out from All Devices
        </button>
      </div>

      {/* Grid: Profile Overview + Two-Factor Authentication */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* User Identity Card */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--primary)' }} /> Profile & Provider
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(232, 59, 100, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
              }}
            >
              {currentUser.avatar || '🎓'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentUser.name || currentUser.fullName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} /> {currentUser.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email Verification:</span>
              <span style={{ fontWeight: 700, color: currentUser.emailVerified ? '#10B981' : '#F59E0B' }}>
                {currentUser.emailVerified ? '✓ Verified' : 'Pending Verification'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account Role:</span>
              <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{currentUser.role || 'Student'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Linked Providers:</span>
              <span style={{ fontWeight: 700 }}>
                {(currentUser.linkedProviders && currentUser.linkedProviders.length > 0)
                  ? currentUser.linkedProviders.join(', ')
                  : 'Email & Password'}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Card */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={20} style={{ color: 'var(--primary)' }} /> Two-Factor Authentication (2FA)
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: currentUser.twoFactorEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                color: currentUser.twoFactorEnabled ? '#10B981' : 'var(--text-muted)',
              }}
            >
              {currentUser.twoFactorEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>

          <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Protect your learning records with an additional security layer using Google Authenticator or compatible TOTP apps.
          </p>

          {!currentUser.twoFactorEnabled && !twoFactorSetup && (
            <button
              onClick={handleInitiate2FA}
              disabled={twoFactorLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontWeight: 700 }}
            >
              {twoFactorLoading ? 'Initiating...' : 'Enable Two-Factor Authentication'}
            </button>
          )}

          {/* 2FA Setup Flow */}
          {twoFactorSetup && (
            <form onSubmit={handleVerifyAndActivate2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-subtle, rgba(0,0,0,0.02))', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Secret Key (Manual Entry):</div>
                <code style={{ fontSize: '0.85rem', color: 'var(--primary)', wordBreak: 'break-all' }}>{twoFactorSetup.totpSecret}</code>
              </div>

              {twoFactorSetup.currentCode && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(232, 59, 100, 0.08)',
                  borderRadius: '12px',
                  border: '1px dashed var(--primary)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Server Sync Code (Active TOTP)
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
                      {twoFactorSetup.currentCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorVerifyCode(twoFactorSetup.currentCode);
                      playChime('click');
                      showToast(`Filled current code: ${twoFactorSetup.currentCode}`, 'info');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', fontWeight: 700 }}
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {twoFactorSetup.backupCodes && twoFactorSetup.backupCodes.length > 0 && (
                <details style={{ background: 'var(--bg-subtle, rgba(0,0,0,0.02))', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-muted)' }}>
                    View 8 Backup Recovery Codes
                  </summary>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {twoFactorSetup.backupCodes.map((code, i) => (
                      <code key={i} style={{ background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                        {code}
                      </code>
                    ))}
                  </div>
                </details>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Enter 6-digit Code from Authenticator:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={twoFactorVerifyCode}
                  onChange={(e) => setTwoFactorVerifyCode(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={twoFactorLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700 }}
                >
                  Verify & Activate
                </button>
                <button
                  type="button"
                  onClick={() => setTwoFactorSetup(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1rem', borderRadius: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {currentUser.twoFactorEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> 2FA is actively protecting your account logins.
              </div>
              <button
                type="button"
                onClick={handleDisable2FA}
                className="btn btn-secondary"
                style={{ padding: '0.65rem', borderRadius: '10px', color: '#EF4444', fontSize: '0.82rem' }}
              >
                Disable Two-Factor Authentication
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Form */}
      <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <KeyRound size={22} style={{ color: 'var(--primary)' }} /> Update Password
        </h2>

        <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Current Password</label>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>New Secure Password</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={passwordUpdating}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', borderRadius: '12px', fontWeight: 700 }}
            >
              {passwordUpdating ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Sessions & Security Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Active Sessions */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Laptop size={20} style={{ color: 'var(--primary)' }} /> Active Sessions ({sessions.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sessions.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No other active sessions.</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{sess.deviceName || 'Web Browser'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      IP: {sess.ipAddress} &bull; Started: {sess.createdAt ? sess.createdAt.split('T')[0] : 'Today'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Audit Logs */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} style={{ color: 'var(--primary)' }} /> Security Audit Logs
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
            {securityLogs.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent security events recorded.</div>
            ) : (
              securityLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span style={{ color: 'var(--primary)' }}>{log.eventType}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      {log.timestamp ? log.timestamp.split('T')[0] : 'Recent'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                    IP: {log.ipAddress}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurityPage;

