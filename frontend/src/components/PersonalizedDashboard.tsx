import { useState, useEffect } from 'react';
import '../styles/PersonalizedDashboard.css';

interface Scheme {
  _id: string;
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

export default function PersonalizedDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
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
      const response = await fetch(
        `http://localhost:5000/api/session/${token}`
      );

      const data = await response.json();
      if (data.success) {
        setSchemes(data.schemes || []);
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

            <div className="schemes-grid">
              {schemes.map((scheme) => (
                <div key={scheme._id} className="scheme-card">
                  <div className="scheme-header">
                    <h3 className="scheme-name">{scheme.name}</h3>
                    {scheme.level && (
                      <span className="scheme-level">{scheme.level}</span>
                    )}
                  </div>

                  {scheme.category && Array.isArray(scheme.category) && scheme.category.length > 0 && (
                    <div className="scheme-tags">
                      {scheme.category.slice(0, 3).map((cat: any, idx: number) => (
                        <span key={idx} className="tag">
                          {typeof cat === 'string' ? cat : cat.schemeCategoryName || 'General'}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="scheme-desc">
                    {(scheme.description_md || scheme.description || 'Government welfare scheme').substring(0, 150)}
                    {((scheme.description_md?.length ?? 0) > 150 || (scheme.description?.length ?? 0) > 150) && '...'}
                  </p>

                  {scheme.amount && (
                    <div className="scheme-benefit">
                      <span className="benefit-label">Benefit:</span>
                      <span className="benefit-value">{scheme.amount}</span>
                    </div>
                  )}

                  <button
                    className="btn-apply"
                    onClick={() => scheme.applyUrl && window.open(scheme.applyUrl, '_blank', 'noopener,noreferrer')}
                    disabled={!scheme.applyUrl}
                  >
                    Apply Now →
                  </button>
                </div>
              ))}
            </div>
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
