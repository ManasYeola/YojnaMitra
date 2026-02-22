import { useState, useEffect } from 'react';
import '../styles/FindSchemes.css';
import authService from '../services/auth.service';

interface FindSchemesProps {
  onBack: () => void;
  farmer?: { name?: string; state?: string; farmerType?: string } | null;
}

interface Scheme {
  _id: string;
  name: string;
  category: any[];
  level: string;
  state: string | null;
  description: string;
  description_md?: string;
  amount: string;
  applyUrl: string;
}

export default function FindSchemes({ onBack, farmer }: FindSchemesProps) {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();

      if (token) {
        // Try personalized eligible schemes first
        const res = await fetch('http://localhost:5000/api/schemes/eligible', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && (data.data?.schemes || data.data?.eligibleSchemes)) {
          setSchemes(data.data?.schemes || data.data?.eligibleSchemes || []);
          setIsPersonalized(true);
          return;
        }
      }

      // Fallback to all schemes
      const response = await fetch('http://localhost:5000/api/schemes');
      const data = await response.json();
      if (data.success) {
        setSchemes(data.data?.schemes || []);
        setIsPersonalized(false);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (applyUrl: string) => {
    if (applyUrl) {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="find-schemes-page">
      {/* Header */}
      <header className="find-schemes-header">
        <button onClick={onBack} className="back-button">
          ← 
        </button>
        <div className="header-content">
          <h1>Government Schemes</h1>
          {isPersonalized && (
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#a7f3d0' }}>
              Showing schemes eligible for{farmer?.name ? ` ${farmer.name}` : ' you'}
              {farmer?.state ? ` · ${farmer.state}` : ''}
              {farmer?.farmerType ? ` · ${farmer.farmerType.replace(/_/g, ' ')}` : ''}
            </p>
          )}
        </div>
      </header>

      <div className="schemes-container-main">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading schemes...</p>
          </div>
        ) : schemes.length > 0 ? (
          <div className="schemes-grid-main">
            {schemes.map((scheme) => (
              <div key={scheme._id} className="scheme-card-main">
                <div className="scheme-card-header">
                  <h3 className="scheme-title">{scheme.name}</h3>
                  {scheme.level && (
                    <span className="scheme-level-badge">{scheme.level}</span>
                  )}
                </div>

                {scheme.category && Array.isArray(scheme.category) && scheme.category.length > 0 && (
                  <div className="scheme-categories">
                    {scheme.category.slice(0, 3).map((cat: any, idx: number) => (
                      <span key={idx} className="category-badge">
                        {typeof cat === 'string' ? cat : cat.schemeCategoryName || 'General'}
                      </span>
                    ))}
                  </div>
                )}

                <p className="scheme-description">
                  {scheme.description?.substring(0, 180) ||
                   scheme.description_md?.substring(0, 180) ||
                   'Government welfare scheme for farmers'}
                  {((scheme.description?.length ?? 0) > 180 || (scheme.description_md?.length ?? 0) > 180) && '...'}
                </p>

                {scheme.amount && (
                  <div className="scheme-benefit">
                    <span className="benefit-label">Benefit:</span>
                    <span className="benefit-value">{scheme.amount}</span>
                  </div>
                )}

                {scheme.state && (
                  <div className="scheme-state">
                    <span className="state-label">State:</span>
                    <span className="state-value">{scheme.state}</span>
                  </div>
                )}

                <button
                  className="btn-view-details"
                  onClick={() => handleViewDetails(scheme.applyUrl)}
                  disabled={!scheme.applyUrl}
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No schemes available</h3>
            <p>Please check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
