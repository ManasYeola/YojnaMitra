/**
 * eligibility.service.ts — Intelligent eligibility checking for farmers
 * 
 * Parses eligibility criteria from scheme data (both structured and markdown)
 * and matches against farmer profiles to determine eligibility.
 */

import { IScheme, IUser, IEligibilityCheck } from '../types';

interface ParsedEligibility {
  states: string[];
  crops: string[];
  categories: string[];
  ageRange: { min?: number; max?: number };
  landSize: { min?: number; max?: number };
  income: { min?: number; max?: number };
  other: string[];
}

/**
 * Parse eligibility markdown into structured criteria
 */
export const parseEligibilityMarkdown = (eligibilityMd: string): ParsedEligibility => {
  const parsed: ParsedEligibility = {
    states: [],
    crops: [],
    categories: [],
    ageRange: {},
    landSize: {},
    income: {},
    other: [],
  };

  if (!eligibilityMd) return parsed;

  const text = eligibilityMd.toLowerCase();

  // ── Parse States ───────────────────────────────────────────────
  const indianStates = [
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
    'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
    'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
  ];

  indianStates.forEach((state) => {
    if (text.includes(state)) {
      parsed.states.push(state);
    }
  });

  // Check for "all states" or "pan india"
  if (
    text.includes('all states') ||
    text.includes('pan india') ||
    text.includes('all india') ||
    text.includes('entire country') ||
    text.includes('throughout india')
  ) {
    parsed.states.push('All States');
  }

  // ── Parse Crops ────────────────────────────────────────────────
  const commonCrops = [
    'rice', 'wheat', 'maize', 'bajra', 'jowar', 'ragi', 'barley',
    'cotton', 'sugarcane', 'jute', 'tea', 'coffee', 'rubber',
    'coconut', 'areca nut', 'cashew', 'groundnut', 'soybean',
    'sunflower', 'safflower', 'mustard', 'sesame', 'linseed',
    'potato', 'onion', 'tomato', 'brinjal', 'cabbage', 'cauliflower',
    'mango', 'banana', 'orange', 'apple', 'grapes', 'pomegranate',
  ];

  commonCrops.forEach((crop) => {
    if (text.includes(crop)) {
      parsed.crops.push(crop);
    }
  });

  // ── Parse Farmer Categories ────────────────────────────────────
  if (text.includes('small farmer') || text.includes('small and marginal')) {
    parsed.categories.push('small');
  }
  if (text.includes('marginal farmer') || text.includes('small and marginal')) {
    parsed.categories.push('marginal');
  }
  if (text.includes('large farmer') || text.includes('all farmers')) {
    parsed.categories.push('large');
  }
  if (
    text.includes('all farmers') ||
    text.includes('all categories') ||
    (parsed.categories.length === 0 && !text.includes('only small') && !text.includes('only marginal'))
  ) {
    parsed.categories = ['small', 'marginal', 'large'];
  }

  // ── Parse Age Range ────────────────────────────────────────────
  const agePatterns = [
    /age.*?(\d{2})\s*(?:to|-)\s*(\d{2})/i,
    /between\s*(\d{2})\s*(?:and|to|-)\s*(\d{2})\s*years/i,
    /minimum age.*?(\d{2})/i,
    /above\s*(\d{2})\s*years/i,
    /below\s*(\d{2})\s*years/i,
  ];

  for (const pattern of agePatterns) {
    const match = eligibilityMd.match(pattern);
    if (match) {
      if (match[2]) {
        parsed.ageRange.min = parseInt(match[1]);
        parsed.ageRange.max = parseInt(match[2]);
      } else {
        if (text.includes('minimum') || text.includes('above')) {
          parsed.ageRange.min = parseInt(match[1]);
        } else if (text.includes('below') || text.includes('maximum')) {
          parsed.ageRange.max = parseInt(match[1]);
        }
      }
      break;
    }
  }

  // ── Parse Land Size ────────────────────────────────────────────
  const landPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/i,
    /up to\s*(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/i,
    /maximum\s*(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/i,
    /minimum\s*(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/i,
    /less than\s*(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/i,
    /more than\s*(\d+(?:\.\d+)?)\s*(?:hectare|ha|acre)/i,
  ];

  for (const pattern of landPatterns) {
    const match = eligibilityMd.match(pattern);
    if (match) {
      let value1 = parseFloat(match[1]);
      let value2 = match[2] ? parseFloat(match[2]) : undefined;

      // Convert acres to hectares if needed
      if (eligibilityMd.toLowerCase().includes('acre')) {
        value1 = value1 * 0.404686;
        if (value2) value2 = value2 * 0.404686;
      }

      if (value2) {
        parsed.landSize.min = value1;
        parsed.landSize.max = value2;
      } else if (text.includes('maximum') || text.includes('up to') || text.includes('less than')) {
        parsed.landSize.max = value1;
      } else if (text.includes('minimum') || text.includes('more than')) {
        parsed.landSize.min = value1;
      }
      break;
    }
  }

  // ── Parse Income Range ─────────────────────────────────────────
  const incomePatterns = [
    /income.*?(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lakhs|l)?/i,
    /(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lakhs)?\s*(?:to|-)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lakhs)?/i,
  ];

  for (const pattern of incomePatterns) {
    const match = eligibilityMd.match(pattern);
    if (match) {
      let value1 = parseFloat(match[1].replace(/,/g, ''));
      let value2 = match[2] ? parseFloat(match[2].replace(/,/g, '')) : undefined;

      // Convert to standard format (in lakhs)
      if (text.includes('lakh')) {
        // Already in lakhs
      } else if (value1 > 1000) {
        // Assume it's in thousands, convert to lakhs
        value1 = value1 / 100;
        if (value2) value2 = value2 / 100;
      }

      if (value2) {
        parsed.income.min = value1;
        parsed.income.max = value2;
      } else if (text.includes('maximum') || text.includes('up to')) {
        parsed.income.max = value1;
      } else if (text.includes('minimum') || text.includes('above')) {
        parsed.income.min = value1;
      }
      break;
    }
  }

  return parsed;
};

/**
 * Check eligibility of a user for a specific scheme
 */
export const checkEligibility = (
  scheme: IScheme,
  user: Partial<IUser>
): IEligibilityCheck => {
  const result: IEligibilityCheck = {
    isEligible: true,
    matchScore: 0,
    matchedCriteria: [],
    unmatchedCriteria: [],
    warnings: [],
  };

  // Parse eligibility from markdown if available
  let parsedEligibility: ParsedEligibility | undefined;
  if (scheme.eligibility_md) {
    parsedEligibility = parseEligibilityMarkdown(scheme.eligibility_md);
    result.parsedEligibility = parsedEligibility;
  }

  const maxScore = 100;
  let totalChecks = 0;
  let passedChecks = 0;

  // ── Check State Eligibility ────────────────────────────────────
  totalChecks++;
  const statesList =
    parsedEligibility?.states ||
    scheme.eligibility?.states ||
    [];

  if (statesList.length === 0 || statesList.includes('All States')) {
    passedChecks++;
    result.matchedCriteria.push('✓ Available in all states');
  } else if (user.state) {
    const normalizedUserState = user.state.toLowerCase();
    const isStateMatch = statesList.some(
      (s) => s.toLowerCase() === normalizedUserState
    );

    if (isStateMatch) {
      passedChecks++;
      result.matchedCriteria.push(`✓ Available in ${user.state}`);
    } else {
      result.isEligible = false;
      result.unmatchedCriteria.push(`✗ Not available in ${user.state}`);
    }
  } else {
    result.warnings.push('⚠ State information not provided');
  }

  // ── Check Crop Type ────────────────────────────────────────────
  if (user.cropType) {
    totalChecks++;
    const cropsList =
      parsedEligibility?.crops ||
      scheme.eligibility?.crops ||
      [];

    if (cropsList.length === 0) {
      passedChecks++;
      result.matchedCriteria.push('✓ Available for all crops');
    } else {
      const normalizedUserCrop = user.cropType.toLowerCase();
      const isCropMatch = cropsList.some(
        (c) => c.toLowerCase() === normalizedUserCrop || normalizedUserCrop.includes(c.toLowerCase())
      );

      if (isCropMatch) {
        passedChecks++;
        result.matchedCriteria.push(`✓ Suitable for ${user.cropType}`);
      } else {
        result.warnings.push(`⚠ Specific to certain crops, ${user.cropType} may not be covered`);
      }
    }
  }

  // ── Check Farmer Category ──────────────────────────────────────
  if (user.farmerCategory) {
    totalChecks++;
    const categoriesList =
      parsedEligibility?.categories ||
      scheme.eligibility?.farmerCategory ||
      ['small', 'marginal', 'large'];

    if (categoriesList.includes(user.farmerCategory)) {
      passedChecks++;
      result.matchedCriteria.push(`✓ Suitable for ${user.farmerCategory} farmers`);
    } else {
      result.isEligible = false;
      result.unmatchedCriteria.push(`✗ Not available for ${user.farmerCategory} farmers`);
    }
  }

  // ── Check Land Size ────────────────────────────────────────────
  if (user.landSize !== undefined) {
    const landSizeCheck =
      parsedEligibility?.landSize ||
      {
        min: scheme.eligibility?.minLandSize,
        max: scheme.eligibility?.maxLandSize,
      };

    if (landSizeCheck.min !== undefined || landSizeCheck.max !== undefined) {
      totalChecks++;
      let landEligible = true;

      if (landSizeCheck.min !== undefined && user.landSize < landSizeCheck.min) {
        landEligible = false;
        result.unmatchedCriteria.push(
          `✗ Minimum land required: ${landSizeCheck.min} hectares (you have ${user.landSize})`
        );
      }

      if (landSizeCheck.max !== undefined && user.landSize > landSizeCheck.max) {
        landEligible = false;
        result.unmatchedCriteria.push(
          `✗ Maximum land allowed: ${landSizeCheck.max} hectares (you have ${user.landSize})`
        );
      }

      if (landEligible) {
        passedChecks++;
        result.matchedCriteria.push(`✓ Land size requirement met (${user.landSize} hectares)`);
      } else {
        result.isEligible = false;
      }
    }
  }

  // ── Check Age ──────────────────────────────────────────────────
  if (user.age && parsedEligibility?.ageRange) {
    const { min, max } = parsedEligibility.ageRange;
    if (min !== undefined || max !== undefined) {
      totalChecks++;
      let ageEligible = true;

      if (min !== undefined && user.age < min) {
        ageEligible = false;
        result.unmatchedCriteria.push(`✗ Minimum age required: ${min} years`);
      }

      if (max !== undefined && user.age > max) {
        ageEligible = false;
        result.unmatchedCriteria.push(`✗ Maximum age allowed: ${max} years`);
      }

      if (ageEligible) {
        passedChecks++;
        result.matchedCriteria.push(`✓ Age requirement met (${user.age} years)`);
      } else {
        result.isEligible = false;
      }
    }
  }

  // ── Calculate Match Score ──────────────────────────────────────
  if (totalChecks > 0) {
    result.matchScore = Math.round((passedChecks / totalChecks) * maxScore);
  } else {
    result.matchScore = maxScore; // No specific criteria to check
    result.matchedCriteria.push('✓ No specific restrictions');
  }

  return result;
};

/**
 * Get all eligible schemes for a user
 */
export const getEligibleSchemes = (
  schemes: IScheme[],
  user: Partial<IUser>,
  minScore: number = 50
): Array<{ scheme: IScheme; eligibility: IEligibilityCheck }> => {
  const results: Array<{ scheme: IScheme; eligibility: IEligibilityCheck }> = [];

  for (const scheme of schemes) {
    if (!scheme.isActive) continue;

    const eligibility = checkEligibility(scheme, user);

    // Only include schemes that are eligible and meet minimum score
    if (eligibility.isEligible && eligibility.matchScore >= minScore) {
      results.push({ scheme, eligibility });
    }
  }

  // Sort by match score (highest first)
  results.sort((a, b) => b.eligibility.matchScore - a.eligibility.matchScore);

  return results;
};
