import { useState, useEffect } from 'react';
import type { Farmer, Scheme, Application } from '../types';
import { schemes } from '../data/schemesData';
import SchemeCard from './SchemeCard';

interface DashboardProps {
  farmer: Farmer;
  onLogout: () => void;
}

export default function Dashboard({ farmer, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'applications'>('recommended');
  const [recommendedSchemes, setRecommendedSchemes] = useState<Array<{ scheme: Scheme; score: number }>>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    // Match schemes based on farmer profile
    const matched = schemes.map(scheme => {
      let score = 0;
      
      // State matching
      if (!scheme.eligibility.states || scheme.eligibility.states.includes('All States') || 
          scheme.eligibility.states.includes(farmer.state)) {
        score += 30;
      }
      
      // Crop matching
      if (!scheme.eligibility.crops || scheme.eligibility.crops.includes(farmer.cropType)) {
        score += 25;
      }
      
      // Farmer category matching
      if (!scheme.eligibility.farmerCategory || 
          scheme.eligibility.farmerCategory.includes(farmer.farmerCategory)) {
        score += 25;
      }
      
      // Land size matching
      if (scheme.eligibility.minLandSize && farmer.landSize >= scheme.eligibility.minLandSize) {
        score += 10;
      }
      if (scheme.eligibility.maxLandSize && farmer.landSize <= scheme.eligibility.maxLandSize) {
        score += 10;
      }
      
      return { scheme, score };
    }).filter(item => item.score >= 50)
      .sort((a, b) => b.score - a.score);

    setRecommendedSchemes(matched);
  }, [farmer]);

  const handleApply = (schemeId: string) => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (scheme) {
      const newApplication: Application = {
        id: `app-${Date.now()}`,
        schemeId: scheme.id,
        schemeName: scheme.name,
        status: 'pending',
        appliedDate: new Date().toLocaleDateString(),
        lastUpdated: new Date().toLocaleDateString()
      };
      setApplications(prev => [newApplication, ...prev]);
      alert(`Application submitted for ${scheme.name}! Check Applications tab for status.`);
    }
  };

  const filteredSchemes = filterCategory === 'all' 
    ? schemes 
    : schemes.filter(s => s.category === filterCategory);

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
            <h1>Welcome, {farmer.name}! 🙏</h1>
            <p className="farmer-info">
              📍 {farmer.district}, {farmer.state} | 🌾 {farmer.cropType} | 📏 {farmer.landSize} acres
            </p>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div>
            <div className="stat-value">{recommendedSchemes.length}</div>
            <div className="stat-label">Recommended Schemes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div>
            <div className="stat-value">{schemes.length}</div>
            <div className="stat-label">Total Schemes Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">Applications Submitted</div>
          </div>
        </div>
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
            <h2>🎯 Schemes Matched to Your Profile</h2>
            {recommendedSchemes.length > 0 ? (
              <div className="schemes-grid">
                {recommendedSchemes.map(({ scheme, score }) => (
                  <SchemeCard 
                    key={scheme.id} 
                    scheme={scheme} 
                    matchScore={score}
                    onApply={handleApply}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No schemes matched your profile at this time.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="schemes-section">
            <div className="section-header">
              <h2>All Available Schemes</h2>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">All Categories</option>
                <option value="insurance">Insurance</option>
                <option value="subsidy">Subsidy</option>
                <option value="loan">Loan</option>
                <option value="training">Training</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div className="schemes-grid">
              {filteredSchemes.map(scheme => (
                <SchemeCard 
                  key={scheme.id} 
                  scheme={scheme}
                  onApply={handleApply}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>📋 My Applications</h2>
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
                <p>🎯 You haven't applied to any schemes yet.</p>
                <p>Browse recommended schemes and start applying!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
