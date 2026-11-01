import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Award,
  ShieldCheck,
  Download,
  Share2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Flame,
  Target,
  GraduationCap,
  RefreshCw,
  Printer,
  Copy,
} from 'lucide-react';

export const AchievementPassportPage = () => {
  const { user } = useAuth();
  const { playChime, speakText } = useAccessibility();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [passport, setPassport] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedResourceType, setSelectedResourceType] = useState('');

  const studentId = user?.id || 'user-student-a';

  useEffect(() => {
    loadPassportData();
  }, [studentId, selectedResourceType]);

  const loadPassportData = async () => {
    setLoading(true);
    try {
      const [passRes, resRes] = await Promise.all([
        api.getAchievementPassport(studentId),
        api.getResourceRecommendations({ studentId, resourceType: selectedResourceType }),
      ]);

      if (passRes.success) setPassport(passRes.passport);
      if (resRes.success) setResources(resRes.resources);
    } catch (err) {
      console.error(err);
      showToast('Loaded offline credentials', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (resource) => {
    playChime('click');
    try {
      const res = await api.toggleResourceBookmark({
        studentId,
        resourceId: resource.id,
        title: resource.title,
        url: resource.url,
        resourceType: resource.resourceType,
        topic: resource.topic,
      });

      if (res.success) {
        showToast(res.message, 'success');
        setResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, isBookmarked: res.bookmarked } : r))
        );
      }
    } catch (err) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handlePrint = () => {
    playChime('click');
    window.print();
  };

  const handleCopyPassportNumber = () => {
    if (passport?.passportNumber) {
      navigator.clipboard.writeText(passport.passportNumber);
      showToast('Passport ID copied to clipboard!', 'success');
      playChime('chime');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h2>Generating Verified Achievement Passport...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Top Banner with Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>Learning Achievement Passport</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verified digital portfolio documenting competencies, accredited credentials, and learning mastery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleCopyPassportNumber}
            className="btn btn-secondary"
            style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Copy size={16} /> Copy ID
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Official Passport Card */}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          borderRadius: '24px',
          border: '2px solid rgba(232, 59, 100, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 249, 245, 0.95) 0%, rgba(254, 242, 242, 0.8) 100%)',
          boxShadow: '0 12px 36px rgba(232, 59, 100, 0.08)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Verification Watermark */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            opacity: 0.06,
            pointerEvents: 'none',
          }}
        >
          <Award size={260} />
        </div>

        {/* Passport Identity Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #FB7185 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px var(--primary-glow)',
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                OFFICIAL DIGITAL CREDENTIAL
              </div>
              <h2 style={{ margin: '0.2rem 0', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {passport?.studentName || 'Aarav Patel'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>ID: {passport?.passportNumber}</span>
                &bull;
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Verified Student
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                background: 'var(--primary)',
                color: '#FFFFFF',
                padding: '0.35rem 0.9rem',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Level {passport?.level || 3}: {passport?.levelTitle}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Issued: {passport?.issueDate} &bull; Total XP: {passport?.totalXp}
            </div>
          </div>
        </div>

        {/* 4 Quantitative Competency Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Mastery</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{passport?.overallMastery}%</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Learning Velocity</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{passport?.learningVelocity}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cognitive Archetype</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366F1' }}>{passport?.twinArchetype}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Accredited Certificates</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{passport?.verifiedCertificates?.length} Active</div>
          </div>
        </div>

        {/* Verified Certificates */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} /> Verified Digital Certificates
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {(passport?.verifiedCertificates || []).map((cert, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '1px solid rgba(232, 59, 100, 0.25)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{cert.issuer}</span>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ShieldCheck size={12} /> {cert.status}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {cert.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Issued: {cert.issuedDate} &bull; Seal: <code style={{ fontSize: '0.7rem' }}>{cert.verificationSeal}</code>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {cert.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        background: 'rgba(232, 59, 100, 0.08)',
                        color: 'var(--primary)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Badges Showcase */}
        <div>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: '#F59E0B' }} /> Earned Milestone Badges
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            {(passport?.earnedBadges || []).map((badge, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: badge.rarity === 'epic' ? '#F59E0B' : 'rgba(232, 59, 100, 0.1)',
                    color: badge.rarity === 'epic' ? '#FFFFFF' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{badge.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curated AI Learning Resource Recommender & Bookmarking */}
      <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={24} style={{ color: 'var(--primary)' }} /> Curated Inclusive Learning Resources
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Interactive simulations, video tutorials, and printable worksheets tailored to your learning twin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['', 'simulation', 'video', 'worksheet'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedResourceType(type)}
                className={`btn ${selectedResourceType === type ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
              >
                {type || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {resources.map((res) => (
            <div
              key={res.id}
              style={{
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      background: 'rgba(232, 59, 100, 0.08)',
                      color: 'var(--primary)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {res.resourceType}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(res)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: res.isBookmarked ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                    title={res.isBookmarked ? 'Bookmarked' : 'Save bookmark'}
                  >
                    <Bookmark size={18} fill={res.isBookmarked ? 'var(--primary)' : 'none'} />
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  {res.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {res.provider} &bull; Topic: {res.topic}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '0.5rem', borderRadius: '8px' }}>
                  💡 {res.recommendedFor}
                </div>
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  marginTop: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                Launch Simulation / Resource <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementPassportPage;

