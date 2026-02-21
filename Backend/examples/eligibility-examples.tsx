/**
 * Eligibility Check Examples
 * 
 * These examples show how to use the eligibility checking API
 * in your frontend application.
 */

// ══════════════════════════════════════════════════════════════════
// Example 1: Check eligibility for a specific scheme (authenticated)
// ══════════════════════════════════════════════════════════════════

const checkMyEligibility = async (schemeId: string, token: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/schemes/${schemeId}/check-eligibility`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      const { eligibility } = result.data;
      
      console.log('Eligibility Check Result:');
      console.log('- Eligible:', eligibility.isEligible);
      console.log('- Match Score:', eligibility.matchScore + '%');
      console.log('\nMatched Criteria:');
      eligibility.matchedCriteria.forEach(c => console.log('  ' + c));
      
      if (eligibility.unmatchedCriteria.length > 0) {
        console.log('\nUnmatched Criteria:');
        eligibility.unmatchedCriteria.forEach(c => console.log('  ' + c));
      }
      
      if (eligibility.warnings.length > 0) {
        console.log('\nWarnings:');
        eligibility.warnings.forEach(w => console.log('  ' + w));
      }

      return eligibility;
    }
  } catch (error) {
    console.error('Error checking eligibility:', error);
  }
};

// ══════════════════════════════════════════════════════════════════
// Example 2: Check eligibility without authentication (with user data)
// ══════════════════════════════════════════════════════════════════

const checkEligibilityAnonymous = async (schemeId: string) => {
  const userData = {
    state: 'Maharashtra',
    district: 'Pune',
    landSize: 2.5,
    cropType: 'rice',
    farmerCategory: 'small',
    age: 35,
  };

  const response = await fetch(
    `http://localhost:5000/api/schemes/${schemeId}/check-eligibility`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userData }),
    }
  );

  const result = await response.json();
  return result.data.eligibility;
};

// ══════════════════════════════════════════════════════════════════
// Example 3: Get all eligible schemes for logged-in user
// ══════════════════════════════════════════════════════════════════

const getAllEligibleSchemes = async (token: string) => {
  const response = await fetch(
    'http://localhost:5000/api/schemes/eligible?minScore=60&limit=20',
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`Found ${result.data.count} eligible schemes out of ${result.data.totalEligible} total`);
    
    result.data.schemes.forEach(item => {
      console.log(`\n${item.scheme.name}`);
      console.log(`  Score: ${item.eligibility.matchScore}%`);
      console.log(`  Amount: ${item.scheme.amount || 'N/A'}`);
      console.log(`  Reasons: ${item.eligibility.matchedCriteria.slice(0, 2).join(', ')}`);
    });

    return result.data.schemes;
  }
};

// ══════════════════════════════════════════════════════════════════
// Example 4: Batch check eligibility for multiple schemes
// ══════════════════════════════════════════════════════════════════

const checkMultipleSchemes = async (schemeIds: string[]) => {
  const userData = {
    state: 'Punjab',
    landSize: 5,
    cropType: 'wheat',
    farmerCategory: 'marginal',
  };

  const response = await fetch(
    'http://localhost:5000/api/schemes/check-eligibility-batch',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeIds, userData }),
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log('Batch Eligibility Check Results:\n');
    
    result.data.results.forEach(item => {
      console.log(`${item.schemeName}:`);
      console.log(`  Eligible: ${item.eligibility.isEligible}`);
      console.log(`  Score: ${item.eligibility.matchScore}%`);
    });

    return result.data.results;
  }
};

// ══════════════════════════════════════════════════════════════════
// Example 5: React Component - Eligibility Widget
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';

interface EligibilityWidgetProps {
  schemeId: string;
  token?: string;
}

const EligibilityWidget: React.FC<EligibilityWidgetProps> = ({ schemeId, token }) => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/schemes/${schemeId}/check-eligibility`,
          {
            method: 'POST',
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();
        if (result.success) {
          setEligibility(result.data.eligibility);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [schemeId, token]);

  if (loading) return <div>Checking eligibility...</div>;
  if (!eligibility) return <div>Could not check eligibility</div>;

  return (
    <div className="eligibility-widget">
      <div className={`status ${eligibility.isEligible ? 'eligible' : 'not-eligible'}`}>
        {eligibility.isEligible ? '✓ You are eligible' : '✗ Not eligible'}
      </div>
      
      <div className="match-score">
        Match Score: {eligibility.matchScore}%
      </div>

      {eligibility.matchedCriteria.length > 0 && (
        <div className="matched-criteria">
          <h4>Why you qualify:</h4>
          <ul>
            {eligibility.matchedCriteria.map((criteria, idx) => (
              <li key={idx}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}

      {eligibility.unmatchedCriteria.length > 0 && (
        <div className="unmatched-criteria">
          <h4>Why you don't qualify:</h4>
          <ul>
            {eligibility.unmatchedCriteria.map((criteria, idx) => (
              <li key={idx}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}

      {eligibility.warnings.length > 0 && (
        <div className="warnings">
          {eligibility.warnings.map((warning, idx) => (
            <div key={idx}>{warning}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// Example 6: Testing with Mock Data
// ══════════════════════════════════════════════════════════════════

const testEligibilitySystem = async () => {
  console.log('Testing Eligibility System\n');
  console.log('='.repeat(60));

  // Test Case 1: Small farmer from Maharashtra growing rice
  console.log('\nTest Case 1: Small farmer, Maharashtra, Rice, 2.5 hectares');
  const test1 = await checkEligibilityAnonymous('pm-kisan');
  console.log('Result:', test1?.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE');

  // Test Case 2: Large farmer from Punjab growing wheat
  console.log('\nTest Case 2: Large farmer, Punjab, Wheat, 15 hectares');
  const userData2 = {
    state: 'Punjab',
    landSize: 15,
    cropType: 'wheat',
    farmerCategory: 'large',
  };
  // ... continue with test

  // Test Case 3: Marginal farmer from Tamil Nadu
  console.log('\nTest Case 3: Marginal farmer, Tamil Nadu, Cotton, 0.8 hectares');
  // ... continue with test
};

// ══════════════════════════════════════════════════════════════════
// Example 7: Filter schemes by eligibility on frontend
// ══════════════════════════════════════════════════════════════════

const filterEligibleSchemes = async (allSchemes: any[], token: string) => {
  // Get pre-filtered eligible schemes from backend
  const response = await fetch(
    'http://localhost:5000/api/schemes/eligible?minScore=70',
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );

  const result = await response.json();
  
  // These schemes are already sorted by match score
  const eligibleSchemes = result.data.schemes;

  return eligibleSchemes;
};

// Export for use
export {
  checkMyEligibility,
  checkEligibilityAnonymous,
  getAllEligibleSchemes,
  checkMultipleSchemes,
  EligibilityWidget,
  testEligibilitySystem,
  filterEligibleSchemes,
};
