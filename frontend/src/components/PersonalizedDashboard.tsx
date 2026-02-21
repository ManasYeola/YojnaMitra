import { useState, useEffect } from 'react';
import '../styles/PersonalizedDashboard.css';

interface EligibleScheme {
  scheme: {
    _id: string;
    name: string;
    category: any[];
    level: string;
    state: string | null;
    description: string;
    description_md?: string;
    amount: string;
    applyUrl: string;
  };
  eligibility: {
    isEligible: boolean;
    matchScore: number;
    matchedCriteria: string[];
    unmatchedCriteria: string[];
    warnings: string[];
  };
}

interface UserProfile {
  name: string;
  phone?: string;
  state: string;
  district: string;
  landSize: number;
  cropType: string;
  farmerCategory: string;
}

export default function PersonalizedDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [schemes, setSchemes] = useState<EligibleScheme[]>([]);
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
      // TODO: Replace with actual API endpoint that uses token
      const response = await fetch(
        `http://localhost:5000/api/schemes/eligible?token=${token}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUser(data.data.user || null);
        setSchemes(data.data.schemes || []);
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

  const handleViewDetails = (applyUrl: string) => {
    if (applyUrl) {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
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
        {user && (
          <div className="user-info">
            <h2>Welcome, {user.name}!</h2>
            <p className="user-details">
              {user.district}, {user.state} • {user.cropType} • {user.landSize} acres
            </p>
          </div>
        )}
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
              {schemes.map(({ scheme, eligibility }) => (
                <div key={scheme._id} className="scheme-card">
                  <div className="match-score-badge" style={{ backgroundColor: getMatchScoreColor(eligibility.matchScore) }}>
                    {eligibility.matchScore}% Match
                  </div>

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
                    {scheme.description?.substring(0, 150) ||
                     scheme.description_md?.substring(0, 150) ||
                     'Government welfare scheme'}
                    {((scheme.description?.length ?? 0) > 150 || (scheme.description_md?.length ?? 0) > 150) && '...'}
                  </p>

                  {scheme.amount && (
                    <div className="scheme-benefit">
                      <span className="benefit-label">Benefit:</span>
                      <span className="benefit-value">{scheme.amount}</span>
                    </div>
                  )}

                  {eligibility.matchedCriteria.length > 0 && (
                    <div className="eligibility-info">
                      <h4>✓ Why You Qualify:</h4>
                      <ul className="criteria-list">
                        {eligibility.matchedCriteria.slice(0, 3).map((criteria, idx) => (
                          <li key={idx} className="matched-criteria">
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {eligibility.unmatchedCriteria.length > 0 && (
                    <details className="limitations">
                      <summary>⚠️ Limitations ({eligibility.unmatchedCriteria.length})</summary>
                      <ul className="criteria-list">
                        {eligibility.unmatchedCriteria.map((criteria, idx) => (
                          <li key={idx} className="unmatched-criteria">
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  <button
                    className="btn-apply"
                    onClick={() => handleViewDetails(scheme.applyUrl)}
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
