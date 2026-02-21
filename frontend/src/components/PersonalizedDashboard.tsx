import { useState, useEffect } from 'react';
import '../styles/PersonalizedDashboard.css';

interface Scheme {
  _id: string;
  name: string;
  level?: string;
  state?: string | null;
  category?: any[];
  tags?: any[];
  description_md?: string;
  benefits_md?: string;
  eligibility_md?: string;
  applicationProcess_md?: string;
  documentsRequired_md?: string;
  applyUrl?: string;
  amount?: string;
  basicDetails?: any;
}

interface PersonalizedDashboardProps {
  token: string;
}

export default function PersonalizedDashboard({ token }: PersonalizedDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [view, setView] = useState('all');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, [token]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/session/${token}`);
      const data = await response.json();

      if (data.success) {
        setSchemes(data.schemes || []);
        setView(data.view || 'all');
      } else {
        setError(data.message || 'Session not found or expired.');
      }
    } catch {
      setError('Could not connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDescription = (scheme: Scheme): string => {
    const text = scheme.description_md || '';
    return text.length > 200 ? text.substring(0, 200) + '...' : text || 'Government welfare scheme.';
  };

  const getBenefits = (scheme: Scheme): string => {
    return scheme.benefits_md || scheme.amount || '';
  };

  const getCategories = (scheme: Scheme): string[] => {
    if (!scheme.category || !Array.isArray(scheme.category)) return [];
    return scheme.category
      .slice(0, 3)
      .map((c: any) => (typeof c === 'string' ? c : c?.schemeCategoryName || c?.label || ''))
      .filter(Boolean);
  };

  const getApplyUrl = (scheme: Scheme): string => {
    return scheme.applyUrl ||
      scheme.basicDetails?.schemeUrl ||
      scheme.basicDetails?.applyUrl ||
      `https://www.myscheme.gov.in/schemes/${scheme._id}`;
  };

  const viewLabel: Record<string, string> = {
    schemes: 'Eligible Schemes',
    insurance: 'Insurance Schemes',
    financial: 'Financial Support',
    all: 'Personalized Schemes',
  };

  if (error) {
    return (
      <div className="personalized-dashboard">
        <header className="dashboard-header">
          <div className="header-logo">
            <img src="/logo.png" alt="Yojna Mitra" className="logo-img" />
            <h1 className="logo-text">Yojna Mitra</h1>
          </div>
        </header>
        <div className="dashboard-container">
          <div className="empty-state pd-error-card">
            <div className="empty-icon">⏳</div>
            <h3>Link Expired or Invalid</h3>
            <p>{error}</p>
            <p className="pd-error-options-label">Get your schemes in two ways:</p>
            <div className="pd-error-options">
              <div className="pd-option">
                <span className="pd-option-icon">💻</span>
                <div>
                  <strong>Sign up on the website</strong>
                  <p>Create a free account to access your personalised dashboard anytime.</p>
                  <a href="/" className="pd-option-link">Go to YojanaMitra.in →</a>
                </div>
              </div>
              <div className="pd-option">
                <span className="pd-option-icon">💬</span>
                <div>
                  <strong>WhatsApp — get a fresh link</strong>
                  <p>Send <strong>"Hi"</strong> to our bot to re-run the quiz and receive a new link.</p>
                  <a
                    href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_BOT_NUMBER || ''}?text=Hi`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-option-link pd-option-wa"
                  >
                    Open WhatsApp →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="personalized-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <img src="/logo.png" alt="Yojna Mitra" className="logo-img" />
          <h1 className="logo-text">Yojna Mitra</h1>
        </div>
        <div className="header-subtitle">
          <p>{viewLabel[view] || 'Your Schemes'}</p>
        </div>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading your matched schemes...</p>
          </div>
        ) : schemes.length > 0 ? (
          <>
            <div className="schemes-header">
              <h2>Your Matched Schemes</h2>
              <p className="schemes-count">
                <strong>{schemes.length}</strong> schemes matched to your profile
              </p>
            </div>

            <div className="schemes-grid">
              {schemes.map((scheme) => (
                <div key={scheme._id} className="scheme-card">

                  <div className="scheme-header">
                    <h3 className="scheme-name">{scheme.name}</h3>
                    <div className="scheme-badges">
                      {scheme.level && <span className="scheme-level">{scheme.level}</span>}
                      {scheme.state && <span className="scheme-state">{scheme.state}</span>}
                    </div>
                  </div>

                  {getCategories(scheme).length > 0 && (
                    <div className="scheme-tags">
                      {getCategories(scheme).map((cat, idx) => (
                        <span key={idx} className="tag">{cat}</span>
                      ))}
                    </div>
                  )}

                  <p className="scheme-desc">{getDescription(scheme)}</p>

                  {getBenefits(scheme) && (
                    <div className="scheme-benefit">
                      <span className="benefit-label">Benefit:</span>
                      <span className="benefit-value">
                        {getBenefits(scheme).replace(/[#*`]/g, '').substring(0, 120)}
                      </span>
                    </div>
                  )}

                  {/* Expandable details */}
                  {scheme.eligibility_md && (
                    <details
                      className="scheme-details-section"
                      open={expanded === scheme._id + '_elig'}
                      onToggle={(e) =>
                        setExpanded((e.target as HTMLDetailsElement).open ? scheme._id + '_elig' : null)
                      }
                    >
                      <summary>Eligibility Criteria</summary>
                      <p className="details-content">
                        {scheme.eligibility_md.replace(/[#*`]/g, '').substring(0, 400)}...
                      </p>
                    </details>
                  )}

                  {scheme.applicationProcess_md && (
                    <details className="scheme-details-section">
                      <summary>How to Apply</summary>
                      <p className="details-content">
                        {scheme.applicationProcess_md.replace(/[#*`]/g, '').substring(0, 400)}...
                      </p>
                    </details>
                  )}

                  <button
                    className="btn-apply"
                    onClick={() => window.open(getApplyUrl(scheme), '_blank', 'noopener,noreferrer')}
                  >
                    Apply on Official Website
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Matching Schemes Found</h3>
            <p>No schemes matched your current profile.</p>
            <div className="pd-error-options" style={{marginTop:'1.5rem'}}>
              <div className="pd-option">
                <span className="pd-option-icon">💬</span>
                <div>
                  <strong>Update profile on WhatsApp</strong>
                  <p>Send <strong>"Hi"</strong> and select "Update Profile" to re-answer the questions.</p>
                  <a
                    href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_BOT_NUMBER || ''}?text=Hi`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-option-link pd-option-wa"
                  >
                    Open WhatsApp →
                  </a>
                </div>
              </div>
              <div className="pd-option">
                <span className="pd-option-icon">💻</span>
                <div>
                  <strong>Try signing up on the website</strong>
                  <p>Use our web app to fill your full profile and get instant scheme matches.</p>
                  <a href="/" className="pd-option-link">Go to YojanaMitra.in →</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="dashboard-footer">
        <p>Powered by Yojna Mitra • Data from MyScheme.gov.in</p>
      </footer>
    </div>
  );
}
