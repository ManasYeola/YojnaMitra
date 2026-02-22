import { useState, useEffect } from 'react';
import '../styles/PersonalizedDashboard.css';

interface Scheme {
  _id: string;
  slug?: string;
  name: string;
  category?: any[];
  level?: string;
  state?: string | null;
  description?: string;
  description_md?: string;
  benefits_md?: string;
  eligibility_md?: string;
  applicationProcess_md?: string;
  documentsRequired_md?: string;
  amount?: string;
  applyUrl?: string;
  basicDetails?: any;
}

interface FailedReason {
  field:  string;
  reason: string;
  action: string | null;
}

interface NearMissScheme extends Scheme {
  failedFields: string[];
  failedCount:  number;
  reasons:      FailedReason[];
}

const AGRICULTURE_CAT = 'Agriculture,Rural & Environment';

/** Decode HTML entities like &amp; &quot; &#x27; etc. from raw DB text.
 *  Loops until stable to handle double-encoded strings (e.g. &amp;quot; → &quot; → "). */
function decodeHtml(text: string): string {
  if (!text) return '';
  const txt = document.createElement('textarea');
  let decoded = text;
  for (let i = 0; i < 3; i++) {
    txt.innerHTML = decoded;
    const next = txt.value;
    if (next === decoded) break; // stable — no more entities
    decoded = next;
  }
  return decoded;
}

/** Extract the display name from a category entry (string or object) */
function getCatName(cat: any): string {
  return typeof cat === 'string' ? cat : cat?.schemeCategoryName || 'General';
}

/**
 * Returns the "primary grouping category" for a scheme:
 * — the first non-Agriculture category, or AGRICULTURE_CAT if all are Agriculture.
 */
function getPrimaryCategory(scheme: Scheme): string {
  if (!scheme.category || scheme.category.length === 0) return 'Other';
  const nonAgri = scheme.category
    .map(getCatName)
    .find((c) => c !== AGRICULTURE_CAT);
  return nonAgri ?? AGRICULTURE_CAT;
}

/**
 * Groups schemes by primary category.
 * Agriculture always appears last (it's the catch-all fallback).
 */
function groupSchemes(schemes: Scheme[]): { category: string; schemes: Scheme[] }[] {
  const map = new Map<string, Scheme[]>();

  for (const scheme of schemes) {
    const cat = getPrimaryCategory(scheme);
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(scheme);
  }

  // Sort: Agriculture last, rest alphabetically
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === AGRICULTURE_CAT) return 1;
      if (b === AGRICULTURE_CAT) return -1;
      return a.localeCompare(b);
    })
    .map(([category, schemes]) => ({ category, schemes }));
}

/** Build the MyScheme apply URL from slug. Falls back to _id (which is also the slug). */
function getApplyUrl(scheme: Scheme): string {
  const slug = scheme.slug || scheme._id;
  return `https://www.myscheme.gov.in/schemes/${slug}`;
}

/** Small card component — keeps category chips intact */
function SchemeCard({ scheme }: { scheme: Scheme }) {
  const rawDesc = scheme.description_md || scheme.description || 'Government welfare scheme';
  const cleanDesc = decodeHtml(rawDesc);
  const descText = cleanDesc.substring(0, 150);
  const isTruncated = cleanDesc.length > 150;

  return (
    <div className="scheme-card">
      <div className="card-body">
        <div className="scheme-header">
          <h3 className="scheme-name">{decodeHtml(scheme.name)}</h3>
          {scheme.level && <span className="scheme-level">{scheme.level}</span>}
        </div>

        {scheme.category && Array.isArray(scheme.category) && scheme.category.length > 0 && (
          <div className="scheme-tags">
            {scheme.category.slice(0, 3).map((cat: any, idx: number) => (
              <span key={idx} className="tag">{getCatName(cat)}</span>
            ))}
          </div>
        )}

        <p className="scheme-desc">
          {descText}{isTruncated && '...'}
        </p>

        {scheme.amount && (
          <div className="scheme-benefit">
            <span className="benefit-label">Benefit:</span>
            <span className="benefit-value">{decodeHtml(scheme.amount)}</span>
          </div>
        )}
      </div>

      <button
        className="btn-apply"
        onClick={() => window.open(getApplyUrl(scheme), '_blank', 'noopener,noreferrer')}
      >
        Apply Now →
      </button>
    </div>
  );
}

/** Near-miss card — shows why the farmer just missed eligibility */
function NearMissCard({ scheme }: { scheme: NearMissScheme }) {
  const rawDesc = scheme.description_md || scheme.description || 'Government welfare scheme';
  const cleanDesc = decodeHtml(rawDesc);

  return (
    <div className="scheme-card near-miss-card">
      <div className="card-body">
        <div className="scheme-header">
          <h3 className="scheme-name">{decodeHtml(scheme.name)}</h3>
          {scheme.level && <span className="scheme-level">{scheme.level}</span>}
        </div>

        {scheme.category && Array.isArray(scheme.category) && scheme.category.length > 0 && (
          <div className="scheme-tags">
            {scheme.category.slice(0, 3).map((cat: any, idx: number) => (
              <span key={idx} className="tag">{getCatName(cat)}</span>
            ))}
          </div>
        )}

        <p className="scheme-desc">
          {cleanDesc.substring(0, 120)}{cleanDesc.length > 120 && '...'}
        </p>

        {/* Why you missed */}
        <div className="near-miss-reasons">
          {scheme.reasons.map((r, i) => (
            <div key={i} className="near-miss-reason">
              <span className="near-miss-icon">⚠️</span>
              <div>
                <span className="near-miss-text">{r.reason}</span>
                {r.action && <p className="near-miss-action">{r.action}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn-apply btn-apply-nearMiss"
        onClick={() => window.open(getApplyUrl(scheme), '_blank', 'noopener,noreferrer')}
      >
        View Scheme →
      </button>
    </div>
  );
}

export default function PersonalizedDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [nearMissSchemes, setNearMissSchemes] = useState<NearMissScheme[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchEligibleSchemes(token);
    } else {
      setError('Invalid access. Please use the link sent to your WhatsApp.');
      setLoading(false);
    }
  }, [token]);

  const fetchEligibleSchemes = async (token: string) => {
    try {
      setLoading(true);

      // Check sessionStorage cache first (clears when tab closes)
      const cacheKey = `session_${token}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { schemes, nearMiss } = JSON.parse(cached);
        setSchemes(schemes || []);
        setNearMissSchemes(nearMiss || []);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/session/${token}`);
      const data = await response.json();

      if (data.success) {
        const schemes = data.schemes || [];
        const nearMiss = data.nearMissSchemes || [];
        setSchemes(schemes);
        setNearMissSchemes(nearMiss);
        sessionStorage.setItem(cacheKey, JSON.stringify({ schemes, nearMiss }));
      } else {
        setError(data.message || 'Failed to load schemes');
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setError('Failed to load your personalized schemes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="personalized-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Access Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const groups = groupSchemes(schemes);

  return (
    <div className="personalized-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <img src="/logo.png" alt="Yojna Mitra" className="logo-img" />
          <h1 className="logo-text">Yojna Mitra</h1>
        </div>
        <div className="user-info">
          <h2>Your Eligible Schemes</h2>
          <p className="user-details">Personalized based on your profile</p>
        </div>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Finding schemes matched to your profile...</p>
          </div>
        ) : schemes.length > 0 ? (
          <>
            <div className="schemes-header">
              <h2>🎯 Your Personalized Schemes</h2>
              <p className="schemes-count">
                We found <strong>{schemes.length}</strong> schemes matching your profile
              </p>
            </div>

            {groups.map(({ category, schemes: groupSchemes }) => (
              <section key={category} className="scheme-group">
                <div className="scheme-group-heading">
                  <h3 className="scheme-group-title">{category}</h3>
                  <span className="scheme-group-count">{groupSchemes.length} scheme{groupSchemes.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="schemes-grid">
                  {groupSchemes.map((scheme) => (
                    <SchemeCard key={scheme._id} scheme={scheme} />
                  ))}
                </div>
              </section>
            ))}

            {/* Near-miss section */}
            {nearMissSchemes.length > 0 && (
              <section className="scheme-group near-miss-section">
                <div className="scheme-group-heading near-miss-heading">
                  <h3 className="scheme-group-title">⚡ You&apos;re Close to Qualifying</h3>
                  <span className="scheme-group-count near-miss-badge">{nearMissSchemes.length} scheme{nearMissSchemes.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="near-miss-subtitle">
                  These schemes have 1–2 requirements you currently don&apos;t meet. See what&apos;s blocking you.
                </p>
                <div className="schemes-grid">
                  {nearMissSchemes.map((scheme) => (
                    <NearMissCard key={scheme._id} scheme={scheme} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Matching Schemes Found</h3>
            <p>We couldn't find any schemes matching your current profile.</p>
            <p className="help-text">
              Our team will review your profile and update you if new schemes become available.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Powered by Yojna Mitra</p>
        <p className="footer-note">
          These schemes are curated based on your profile. For official information, visit the respective scheme websites.
        </p>
      </footer>
    </div>
  );
}
