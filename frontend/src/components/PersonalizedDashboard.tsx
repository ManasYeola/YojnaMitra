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

const MOCK_SCHEMES: Scheme[] = [
  { _id: '1', name: 'PM-KISAN', level: 'Central', state: null, category: ['Income Support'], amount: '₹6,000/year', description: 'Direct income support of ₹6000 per year to all landholding farmer families in three equal instalments of ₹2000 each.', applyUrl: 'https://pmkisan.gov.in' },
  { _id: '2', name: 'PMFBY – Pradhan Mantri Fasal Bima Yojana', level: 'Central', state: null, category: ['Crop Insurance'], amount: 'Upto full sum insured', description: 'Provides financial support to farmers suffering crop loss/damage due to unforeseen events like natural calamities, pests & diseases.', applyUrl: 'https://pmfby.gov.in' },
  { _id: '3', name: 'Kisan Credit Card (KCC)', level: 'Central', state: null, category: ['Credit & Loans'], amount: 'Upto ₹3 Lakh @ 4% p.a.', description: 'Provides farmers with timely and adequate credit for their agricultural operations at subsidised interest rates.', applyUrl: 'https://www.rbi.org.in' },
  { _id: '4', name: 'Soil Health Card Scheme', level: 'Central', state: null, category: ['Soil & Fertiliser'], amount: 'Free soil testing', description: 'Issues soil health cards to farmers with crop-wise recommendations of nutrients and fertilisers required for individual farms.', applyUrl: 'https://soilhealth.dac.gov.in' },
  { _id: '5', name: 'PM Kisan Maan Dhan Yojana', level: 'Central', state: null, category: ['Pension'], amount: '₹3,000/month pension', description: 'Voluntary and contributory pension scheme for small and marginal farmers to ensure social security after the age of 60.', applyUrl: 'https://pmkmy.gov.in' },
];

export default function PersonalizedDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const preview = urlParams.get('preview') === '1';
  
  const [loading, setLoading] = useState(!preview);
  const [schemes, setSchemes] = useState<Scheme[]>(preview ? MOCK_SCHEMES : []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preview) return; // mock data already set
    if (token) {
      fetchEligibleSchemes(token);
    } else {
      setError('Invalid access. Please use the link sent to your WhatsApp.');
      setLoading(false);
    }
  }, [token, preview]);

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
          <div className="error-icon"></div>
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
              <h2>Your Personalized Schemes</h2>
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
            <div className="empty-icon"></div>
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
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo.png" alt="Yojna Mitra" className="footer-logo" />
            <span className="footer-brand-name">Yojna Mitra</span>
          </div>
          <p className="footer-note">
            Schemes are curated based on your profile. Always verify eligibility on the official scheme website before applying.
          </p>
          <p className="footer-copy">&copy; 2026 Yojna Mitra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
