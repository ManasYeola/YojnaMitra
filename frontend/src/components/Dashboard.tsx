import { useState, useEffect } from 'react';
import type { Farmer, Application } from '../types';
import schemeService from '../services/scheme.service';
import authService from '../services/auth.service';

interface DashboardProps {
  farmer: Farmer;
  onLogout: () => void;
  onFindSchemes: () => void;
}

interface EligibilityResult {
  scheme: {
    _id: string;
    name: string;
    category: any[];
    level: string;
    state: string | null;
    description: string;
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

interface FilterCriteria {
  state: string;
  landSize: number;
  cropType: string;
  farmerCategory: string;
  minScore: number;
}

export default function Dashboard({ farmer, onLogout, onFindSchemes }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'applications'>('recommended');
  const [eligibleSchemes, setEligibleSchemes] = useState<EligibilityResult[]>([]);
  const [allSchemes, setAllSchemes] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter criteria state
  const [filters, setFilters] = useState<FilterCriteria>({
    state: farmer.state,
    landSize: farmer.landSize ?? 0,
    cropType: farmer.cropType ?? '',
    farmerCategory: farmer.farmerCategory || 'small',
    minScore: 50,
  });

  // Fetch eligible schemes on mount and when filters change
  useEffect(() => {
    fetchEligibleSchemes();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllSchemes();
    }
  }, [activeTab]);

  const fetchEligibleSchemes = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/schemes/eligible?minScore=${filters.minScore}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setEligibleSchemes(data.data.schemes || []);
      }
    } catch (error) {
      console.error('Error fetching eligible schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchemes = async () => {
    try {
      const response: any = await schemeService.getAllSchemes();
      // Backend returns {success, message, data: {count, schemes}}
      setAllSchemes(response.data?.schemes || response.data || []);
    } catch (error) {
      console.error('Error fetching all schemes:', error);
    }
  };

  const checkCustomEligibility = async () => {
    try {
      setLoading(true);
      const userData = {
        state: filters.state,
        landSize: filters.landSize,
        cropType: filters.cropType,
        farmerCategory: filters.farmerCategory,
      };

      // Fetch all schemes and check eligibility for each
      const response: any = await schemeService.getAllSchemes();
      const schemes = response.data?.schemes || response.data || [];

      const eligibilityResults: EligibilityResult[] = [];

      for (const scheme of schemes.slice(0, 20)) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/schemes/${scheme._id}/check-eligibility`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userData }),
            }
          );

          const data = await response.json();
          if (data.success && data.data.eligibility.isEligible && 
              data.data.eligibility.matchScore >= filters.minScore) {
            eligibilityResults.push(data.data);
          }
        } catch (err) {
          console.error(`Error checking eligibility for ${scheme.name}:`, err);
        }
      }

      // Sort by match score
      eligibilityResults.sort((a, b) => b.eligibility.matchScore - a.eligibility.matchScore);
      setEligibleSchemes(eligibilityResults);
    } catch (error) {
      console.error('Error checking custom eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (schemeId: string) => {
    const scheme = eligibleSchemes.find(s => s.scheme._id === schemeId)?.scheme ||
                   allSchemes.find(s => s._id === schemeId);
    if (scheme) {
      const newApplication: Application = {
        id: `app-${Date.now()}`,
        schemeId: scheme._id,
        schemeName: scheme.name,
        status: 'pending',
        appliedDate: new Date().toLocaleDateString(),
        lastUpdated: new Date().toLocaleDateString()
      };
      setApplications(prev => [newApplication, ...prev]);
      alert(`Application submitted for ${scheme.name}! Check Applications tab for status.`);
    }
  };

  const getStatusColor = (status: Application['status']) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      'under-review': '#3b82f6'
    };
    return colors[status];
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, {farmer.name}!</h1>
            <p className="farmer-info">
              {farmer.district}, {farmer.state} | {farmer.cropType} | {farmer.landSize} acres
            </p>
          </div>
          <div className="header-actions">
            <button onClick={onFindSchemes} className="find-schemes-btn">Find Schemes</button>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div>
            <div className="stat-value">{eligibleSchemes.length}</div>
            <div className="stat-label">Recommended Schemes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div>
            <div className="stat-value">{allSchemes.length || '8'}</div>
            <div className="stat-label">Total Schemes Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">Applications Submitted</div>
          </div>
        </div>
      </div>

      {/* Smart Filter Panel */}
      <div className="filter-panel">
        <div className="filter-header">
          <div className="filter-title">
            <span className="filter-icon"></span>
            <h3>Find Schemes Tailored for You</h3>
          </div>
          <button 
            className="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="filter-content">
            <div className="filter-grid">
              <div className="filter-group">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="landSize">Land Size (acres)</label>
                <input
                  type="number"
                  id="landSize"
                  min="0"
                  step="0.1"
                  value={filters.landSize}
                  onChange={(e) => setFilters({ ...filters, landSize: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter land size"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="cropType">Crop Type</label>
                <input
                  type="text"
                  id="cropType"
                  value={filters.cropType}
                  onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
                  placeholder="e.g., rice, wheat, cotton"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="farmerCategory">Farmer Category</label>
                <select
                  id="farmerCategory"
                  value={filters.farmerCategory}
                  onChange={(e) => setFilters({ ...filters, farmerCategory: e.target.value })}
                >
                  <option value="marginal">Marginal Farmer</option>
                  <option value="small">Small Farmer</option>
                  <option value="large">Large Farmer</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="minScore">Minimum Match Score (%)</label>
                <div className="range-container">
                  <input
                    type="range"
                    id="minScore"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                  />
                  <span className="range-value">{filters.minScore}%</span>
                </div>
              </div>

              <div className="filter-actions">
                <button 
                  className="btn-apply-filters"
                  onClick={checkCustomEligibility}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find Matching Schemes'}
                </button>
                <button 
                  className="btn-reset-filters"
                  onClick={() => {
                    setFilters({
                      state: farmer.state,
                      landSize: farmer.landSize ?? 0,
                      cropType: farmer.cropType ?? '',
                      farmerCategory: farmer.farmerCategory || 'small',
                      minScore: 50,
                    });
                    fetchEligibleSchemes();
                  }}
                >
                  Reset to Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'recommended' ? 'active' : ''}
          onClick={() => setActiveTab('recommended')}
        >
          Recommended for You
        </button>
        <button 
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All Schemes
        </button>
        <button 
          className={activeTab === 'applications' ? 'active' : ''}
          onClick={() => setActiveTab('applications')}
        >
          My Applications
        </button>
      </nav>

      <div className="dashboard-content">
        {activeTab === 'recommended' && (
          <div className="schemes-section">
            <h2>Schemes Matched to Your Profile</h2>
            {loading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Finding the best schemes for you...</p>
              </div>
            ) : eligibleSchemes.length > 0 ? (
              <div className="schemes-grid">
                {eligibleSchemes.map(({ scheme, eligibility }) => (
                  <div key={scheme._id} className="enhanced-scheme-card">
                    <div className="scheme-card-header">
                      <div className="scheme-title-section">
                        <h3>{scheme.name}</h3>
                        {scheme.level && (
                          <span className="scheme-level">{scheme.level}</span>
                        )}
                      </div>
                      <div className="match-badge" style={{
                        background: eligibility.matchScore >= 80 ? '#10b981' : 
                                   eligibility.matchScore >= 60 ? '#3b82f6' : '#f59e0b'
                      }}>
                        {eligibility.matchScore}% Match
                      </div>
                    </div>

                    {scheme.category && Array.isArray(scheme.category) && scheme.category.length > 0 && (
                      <div className="scheme-categories">
                        {scheme.category.slice(0, 2).map((cat: any, idx: number) => (
                          <span key={idx} className="category-tag">
                            {typeof cat === 'string' ? cat : cat.schemeCategoryName || 'General'}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="scheme-description">
                      {scheme.description?.substring(0, 150) || 'Government scheme details'}...
                    </p>

                    {scheme.amount && (
                      <div className="scheme-amount">
                        <span className="amount-label">Amount:</span>
                        <span className="amount-value">{scheme.amount}</span>
                      </div>
                    )}

                    <div className="eligibility-criteria">
                      <h4>Why you qualify:</h4>
                      <ul className="criteria-list">
                        {eligibility.matchedCriteria.slice(0, 3).map((criteria, idx) => (
                          <li key={idx} className="criteria-matched">
                            {criteria}
                          </li>
                        ))}
                      </ul>
                      {eligibility.unmatchedCriteria.length > 0 && (
                        <details className="unmatched-details">
                          <summary>View limitations ({eligibility.unmatchedCriteria.length})</summary>
                          <ul className="criteria-list">
                            {eligibility.unmatchedCriteria.map((criteria, idx) => (
                              <li key={idx} className="criteria-unmatched">
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>

                    <div className="scheme-actions">
                      <button 
                        className="btn-apply"
                        onClick={() => handleApply(scheme._id)}
                      >
                        Apply Now
                      </button>
                      {scheme.applyUrl && (
                        <a 
                          href={scheme.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-learn-more"
                        >
                          Learn More →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>No matching schemes found</h3>
                <p>Try adjusting your filters above to find more schemes</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setFilters({ ...filters, minScore: 30 });
                    setTimeout(() => checkCustomEligibility(), 100);
                  }}
                >
                  Lower Match Requirements
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="schemes-section">
            <div className="section-header">
              <h2>All Available Schemes</h2>
            </div>
            {allSchemes.length > 0 ? (
              <div className="schemes-grid">
                {allSchemes.map(scheme => (
                  <div key={scheme._id} className="enhanced-scheme-card">
                    <div className="scheme-card-header">
                      <div className="scheme-title-section">
                        <h3>{scheme.name}</h3>
                        {scheme.level && (
                          <span className="scheme-level">{scheme.level}</span>
                        )}
                      </div>
                    </div>

                    {scheme.category && Array.isArray(scheme.category) && (
                      <div className="scheme-categories">
                        {scheme.category.slice(0, 2).map((cat: any, idx: number) => (
                          <span key={idx} className="category-tag">
                            {typeof cat === 'string' ? cat : cat.schemeCategoryName || 'General'}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="scheme-description">
                      {scheme.description?.substring(0, 150) || 
                       scheme.description_md?.substring(0, 150) || 
                       'Government scheme details'}...
                    </p>

                    {scheme.amount && (
                      <div className="scheme-amount">
                        <span className="amount-label">Amount:</span>
                        <span className="amount-value">{scheme.amount}</span>
                      </div>
                    )}

                    <div className="scheme-actions">
                      <button 
                        className="btn-apply"
                        onClick={() => handleApply(scheme._id)}
                      >
                        Apply Now
                      </button>
                      {scheme.applyUrl && (
                        <a 
                          href={scheme.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-learn-more"
                        >
                          Learn More →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Loading schemes...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>My Applications</h2>
            {applications.length > 0 ? (
              <div className="applications-list">
                {applications.map(app => (
                  <div key={app.id} className="application-card">
                    <div className="app-header">
                      <h3>{app.schemeName}</h3>
                      <span 
                        className="app-status"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="app-details">
                      <p><strong>Application ID:</strong> {app.id}</p>
                      <p><strong>Applied On:</strong> {app.appliedDate}</p>
                      <p><strong>Last Updated:</strong> {app.lastUpdated}</p>
                    </div>
                    <button className="track-btn">Track Application</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't applied to any schemes yet.</p>
                <p>Browse recommended schemes and start applying!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
