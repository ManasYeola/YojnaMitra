import type { Scheme } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
  onApply?: (schemeId: string) => void;
  matchScore?: number;
}

export default function SchemeCard({ scheme, onApply, matchScore }: SchemeCardProps) {
  const categoryIcons = {
    insurance: '🛡️',
    subsidy: '💰',
    loan: '🏦',
    training: '📚',
    equipment: '⚙️'
  };

  const categoryColors = {
    insurance: '#3b82f6',
    subsidy: '#10b981',
    loan: '#f59e0b',
    training: '#8b5cf6',
    equipment: '#ef4444'
  };

  return (
    <div className="scheme-card">
      {matchScore && (
        <div className="match-badge" style={{ backgroundColor: categoryColors[scheme.category] }}>
          {matchScore}% Match
        </div>
      )}
      
      <div className="scheme-header">
        <span className="scheme-icon">{categoryIcons[scheme.category]}</span>
        <div>
          <h3>{scheme.name}</h3>
          <span 
            className="scheme-category"
            style={{ color: categoryColors[scheme.category] }}
          >
            {scheme.category.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="scheme-description">{scheme.description}</p>

      {scheme.amount && (
        <div className="scheme-amount">
          <strong>Amount:</strong> {scheme.amount}
        </div>
      )}

      <div className="scheme-benefits">
        <strong>Benefits:</strong>
        <ul>
          {scheme.benefits.slice(0, 3).map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>

      <div className="scheme-documents">
        <strong>Required Documents:</strong>
        <div className="document-tags">
          {scheme.documents.map((doc, index) => (
            <span key={index} className="doc-tag">{doc}</span>
          ))}
        </div>
      </div>

      <div className="scheme-actions">
        {scheme.applyUrl ? (
          <a 
            href={scheme.applyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="apply-btn primary"
          >
            Apply Online
          </a>
        ) : (
          <button 
            onClick={() => onApply && onApply(scheme.id)}
            className="apply-btn primary"
          >
            Apply Now
          </button>
        )}
        <button className="apply-btn secondary">Learn More</button>
      </div>
    </div>
  );
}
