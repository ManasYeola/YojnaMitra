import { useState, useEffect } from 'react';
import type { Farmer } from '../types';
import authService from '../services/auth.service';
import '../styles/Dashboard.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardProps {
  farmer: Farmer;
  onLogout: () => void;
}

interface EligibleScheme {
  scheme: {
    _id: string;
    name: string;
    category: any[];
    level: string;
    state: string | null;
    description: string;
    description_md?: string;
    benefits_md?: string;
    eligibility_md?: string;
    applicationProcess_md?: string;
    amount: string;
    applyUrl: string;
    basicDetails?: any;
  };
  eligibility: {
    isEligible: boolean;
    matchScore: number;
    matchedCriteria: string[];
    unmatchedCriteria: string[];
    warnings: string[];
  };
}

// ── Label helpers ──────────────────────────────────────────────────────────────

const farmerTypeLabel: Record<string, string> = {
  crop_farmer: 'Crop Farmer',
  dairy: 'Dairy Farmer',
  fisherman: 'Fisherman',
  labourer: 'Agriculture Labourer',
  entrepreneur: 'Agri Entrepreneur',
  other: 'Other',
};

const ageRangeLabel: Record<string, string> = {
  below_18: 'Below 18',
  '18_40': '18 – 40 years',
  '41_60': '41 – 60 years',
  above_60: 'Above 60',
};

const incomeLabel: Record<string, string> = {
  below_1L: 'Below ₹1 Lakh',
  '1_3L': '₹1 – 3 Lakh',
  '3_8L': '₹3 – 8 Lakh',
  above_8L: 'Above ₹8 Lakh',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard({ farmer, onLogout }: DashboardProps) {
  const [schemes, setSchemes] = useState<EligibleScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'national' | 'state'>('all');

  useEffect(() => {
    fetchEligibleSchemes();
  }, []);

  const fetchEligibleSchemes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = authService.getToken();
      if (!token) {
        setError('Session expired. Please sign in again.');
        return;
      }
      const res = await fetch(
        'http://localhost:5000/api/schemes/eligible?minScore=0&limit=100',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setSchemes(data.data?.schemes || []);
      } else {
        setError(data.message || 'Could not load schemes.');
      }
    } catch {
      setError('Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = schemes.filter((s) => {
    if (activeFilter === 'national') return s.scheme.level === 'National' || s.scheme.level === 'Central';
    if (activeFilter === 'state') return s.scheme.level !== 'National' && s.scheme.level !== 'Central';
    return true;
  });

  const getApplyUrl = (scheme: EligibleScheme['scheme']): string =>
    scheme.applyUrl ||
    scheme.basicDetails?.schemeUrl ||
    `https://www.myscheme.gov.in/schemes/${scheme._id}`;

  const getCategories = (cat: any[]): string[] => {
    if (!Array.isArray(cat)) return [];
    return cat
      .slice(0, 3)
      .map((c) => (typeof c === 'string' ? c : c?.schemeCategoryName || ''))
      .filter(Boolean);
  };

  const getDescription = (s: EligibleScheme['scheme']): string => {
    const text = s.description_md || s.description || '';
    return text.replace(/[#*`]/g, '').substring(0, 200) || 'Government welfare scheme.';
  };

  const scoreColor = (score: number) =>
    score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : '#d97706';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="web-dashboard">

      {/* ── Header ── */}
      <header className="wd-header">
        <div className="wd-header-inner">
          <div className="wd-logo">
            <img src="/logo.png" alt="YojanaMitra" />
            <span>YojanaMitra</span>
          </div>
          <div className="wd-user">
            <div className="wd-avatar">{farmer.name?.[0] ?? '?'}</div>
            <div>
              <p className="wd-user-name">{farmer.name}</p>
              <p className="wd-user-sub">
                {farmer.state}
                {farmer.farmerType ? ` · ${farmerTypeLabel[farmer.farmerType] ?? farmer.farmerType}` : ''}
              </p>
            </div>
          </div>
          <button className="wd-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      {/* ── Profile summary pill row ── */}
      <div className="wd-profile-bar">
        <div className="wd-profile-inner">
          {farmer.ageRange && (
            <span className="wd-pill">🎂 {ageRangeLabel[farmer.ageRange] ?? farmer.ageRange}</span>
          )}
          {farmer.incomeRange && (
            <span className="wd-pill">💰 {incomeLabel[farmer.incomeRange] ?? farmer.incomeRange}</span>
          )}
          {farmer.landOwnership && (
            <span className="wd-pill">🌾 Land: {farmer.landOwnership}</span>
          )}
          {farmer.caste && farmer.caste !== 'not_disclosed' && (
            <span className="wd-pill">🏷 {farmer.caste.toUpperCase()}</span>
          )}
          {farmer.isBPL && <span className="wd-pill wd-pill-red">BPL</span>}
          {farmer.specialCategory && farmer.specialCategory.length > 0 && (
            <span className="wd-pill wd-pill-blue">{farmer.specialCategory.join(', ')}</span>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="wd-main">

        {/* Section title + filter tabs */}
        <div className="wd-section-head">
          <div>
            <h2 className="wd-title">Your Eligible Schemes</h2>
            {!loading && !error && (
              <p className="wd-subtitle">
                <strong>{filtered.length}</strong> scheme{filtered.length !== 1 ? 's' : ''} matched
                to your profile
              </p>
            )}
          </div>
          <div className="wd-tabs">
            {(['all', 'national', 'state'] as const).map((f) => (
              <button
                key={f}
                className={`wd-tab${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'national' ? 'National' : 'State'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="wd-loading">
            <div className="wd-spinner"></div>
            <p>Finding schemes matched to your profile…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="wd-error-card">
            <div className="wd-error-icon">⚠️</div>
            <h3>Could not load schemes</h3>
            <p>{error}</p>
            <button className="wd-retry-btn" onClick={fetchEligibleSchemes}>Retry</button>
          </div>
        )}

        {/* Scheme cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="wd-schemes-grid">
            {filtered.map(({ scheme, eligibility }) => (
              <div key={scheme._id} className="wd-card">

                {/* Top colour bar */}
                <div
                  className="wd-card-bar"
                  style={{ background: scoreColor(eligibility.matchScore) }}
                />

                <div className="wd-card-body">
                  {/* Title row */}
                  <div className="wd-card-title-row">
                    <h3 className="wd-card-name">{scheme.name}</h3>
                    <span
                      className="wd-match-badge"
                      style={{ background: scoreColor(eligibility.matchScore) }}
                    >
                      {eligibility.matchScore}% match
                    </span>
                  </div>

                  {/* Level + state badges */}
                  <div className="wd-card-meta">
                    {scheme.level && <span className="wd-badge wd-badge-green">{scheme.level}</span>}
                    {scheme.state && <span className="wd-badge wd-badge-blue">{scheme.state}</span>}
                  </div>

                  {/* Category tags */}
                  {getCategories(scheme.category).length > 0 && (
                    <div className="wd-tags">
                      {getCategories(scheme.category).map((cat, i) => (
                        <span key={i} className="wd-tag">{cat}</span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <p className="wd-card-desc">{getDescription(scheme)}…</p>

                  {/* Benefit amount */}
                  {(scheme.amount || scheme.benefits_md) && (
                    <div className="wd-benefit-row">
                      <span className="wd-benefit-label">Benefit</span>
                      <span className="wd-benefit-val">
                        {(scheme.amount || scheme.benefits_md || '')
                          .replace(/[#*`]/g, '')
                          .substring(0, 120)}
                      </span>
                    </div>
                  )}

                  {/* Why you qualify */}
                  {eligibility.matchedCriteria.length > 0 && (
                    <div className="wd-criteria">
                      <p className="wd-criteria-label">Why you qualify:</p>
                      <ul>
                        {eligibility.matchedCriteria.slice(0, 3).map((c, i) => (
                          <li key={i} className="wd-criteria-item wd-criteria-pass">✓ {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expandable: Eligibility */}
                  {scheme.eligibility_md && (
                    <details
                      className="wd-expander"
                      open={expanded === scheme._id + '_elig'}
                      onToggle={(e) =>
                        setExpanded(
                          (e.target as HTMLDetailsElement).open
                            ? scheme._id + '_elig'
                            : null,
                        )
                      }
                    >
                      <summary>Eligibility Criteria</summary>
                      <p className="wd-expander-body">
                        {scheme.eligibility_md.replace(/[#*`]/g, '').substring(0, 500)}…
                      </p>
                    </details>
                  )}

                  {/* Expandable: How to Apply */}
                  {scheme.applicationProcess_md && (
                    <details className="wd-expander">
                      <summary>How to Apply</summary>
                      <p className="wd-expander-body">
                        {scheme.applicationProcess_md.replace(/[#*`]/g, '').substring(0, 500)}…
                      </p>
                    </details>
                  )}

                  {/* Apply button */}
                  <button
                    className="wd-apply-btn"
                    onClick={() =>
                      window.open(getApplyUrl(scheme), '_blank', 'noopener,noreferrer')
                    }
                  >
                    Apply on Official Website ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty — filter but schemes exist */}
        {!loading && !error && filtered.length === 0 && schemes.length > 0 && (
          <div className="wd-empty">
            <div className="wd-empty-icon">📋</div>
            <h3>No {activeFilter !== 'all' ? activeFilter : ''} schemes found</h3>
            <p>Switch to "All" to see every matched scheme.</p>
            <button className="wd-retry-btn" onClick={() => setActiveFilter('all')}>
              Show All
            </button>
          </div>
        )}

        {/* Empty — nothing matched at all */}
        {!loading && !error && schemes.length === 0 && (
          <div className="wd-empty">
            <div className="wd-empty-icon">🌱</div>
            <h3>No schemes matched yet</h3>
            <p>
              Complete your profile to get personalised matches. You can also use WhatsApp to
              answer our 8-question survey and receive an instant personalised link.
            </p>
          </div>
        )}

      </main>

      <footer className="wd-footer">
        <p>Powered by YojanaMitra · Data from MyScheme.gov.in</p>
      </footer>
    </div>
  );
}
