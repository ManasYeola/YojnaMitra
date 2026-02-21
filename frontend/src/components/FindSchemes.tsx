import { useState, useEffect } from 'react';
import '../styles/FindSchemes.css';

interface FindSchemesProps {
  onBack: () => void;
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

export default function FindSchemes({ onBack }: FindSchemesProps) {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  useEffect(() => {
    fetchAllSchemes();
  }, []);

  const fetchAllSchemes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/schemes');
      const data = await response.json();
      if (data.success) {
        setSchemes(data.data?.schemes || []);
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
