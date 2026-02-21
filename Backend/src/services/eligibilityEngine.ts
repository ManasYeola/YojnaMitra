import Scheme from '../models/Scheme';
import { IScheme } from '../types';

interface FarmerInputs {
  state: string;
  occupationType: string;
  landOwnership: string;
  age: string;
  casteCategory: string;
  income: string;
  bplCard: string;
  specialCategories: string[];
}

interface MatchedScheme {
  scheme: IScheme;
  matchScore: number;
  matchReasons: string[];
}

/**
 * Eligibility Matching Engine (Enhanced)
 * Matches farmer profile with schemes based on 8 comprehensive criteria
 */
export class EligibilityEngine {
  /**
   * Find schemes matching farmer's comprehensive profile
   */
  async findMatchingSchemes(inputs: FarmerInputs): Promise<MatchedScheme[]> {
    try {
      // Fetch all active schemes
      const schemes = await Scheme.find({ isActive: true }).lean();

      const matchedSchemes: MatchedScheme[] = [];

      for (const scheme of schemes) {
        const { matchScore, matchReasons } = this.calculateMatch(scheme, inputs);

        // Only include schemes with score >= 60 (stricter threshold)
        if (matchScore >= 60) {
          matchedSchemes.push({
            scheme: scheme as unknown as IScheme,
            matchScore,
            matchReasons,
          });
        }
      }

      // Sort by match score (highest first)
      matchedSchemes.sort((a, b) => b.matchScore - a.matchScore);

      // Return top 5 matches
      return matchedSchemes.slice(0, 5);
    } catch (error) {
      console.error('Error in findMatchingSchemes:', error);
      throw error;
    }
  }

  /**
   * Calculate match score (0-100) based on 8 eligibility criteria
   */
  private calculateMatch(
    scheme: any,
    inputs: FarmerInputs
  ): { matchScore: number; matchReasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Check if eligibility object exists
    if (!scheme.eligibility) {
      console.warn(`Scheme "${scheme.name}" missing eligibility field`);
      return { matchScore: 0, matchReasons: [] };
    }

    // 1. State matching (20 points) - CRITICAL
    if (
      scheme.eligibility.states?.includes('All States') ||
      scheme.eligibility.states?.some((s: string) => s.toLowerCase() === inputs.state.toLowerCase())
    ) {
      score += 20;
      reasons.push('✓ Available in your state');
    } else {
      // If state doesn't match, scheme is ineligible
      return { matchScore: 0, matchReasons: ['Not available in your state'] };
    }

    // 2. Occupation type matching (15 points)
    if (
      !scheme.eligibility.occupationType ||
      scheme.eligibility.occupationType.includes('all') ||
      scheme.eligibility.occupationType.includes(inputs.occupationType)
    ) {
      score += 15;
      reasons.push('✓ Matches your occupation');
    }

    // 3. Land ownership matching (10 points)
    if (
      !scheme.eligibility.landOwnership ||
      scheme.eligibility.landOwnership.includes('all') ||
      scheme.eligibility.landOwnership.includes(inputs.landOwnership)
    ) {
      score += 10;
      reasons.push('✓ Matches land ownership status');
    }

    // 4. Age range matching (10 points)
    if (
      !scheme.eligibility.ageRange ||
      scheme.eligibility.ageRange.includes('all') ||
      scheme.eligibility.ageRange.includes(inputs.age)
    ) {
      score += 10;
      reasons.push('✓ Age eligible');
    }

    // 5. Caste category matching (15 points)
    if (
      !scheme.eligibility.casteCategory ||
      scheme.eligibility.casteCategory.includes('all') ||
      scheme.eligibility.casteCategory.includes(inputs.casteCategory)
    ) {
      score += 15;
      if (
        scheme.eligibility.casteCategory?.length > 0 &&
        !scheme.eligibility.casteCategory.includes('all')
      ) {
        reasons.push('✓ Category-specific benefit');
      }
    }

    // 6. Income range matching (10 points)
    if (
      !scheme.eligibility.incomeRange ||
      scheme.eligibility.incomeRange.includes('all') ||
      scheme.eligibility.incomeRange.includes(inputs.income)
    ) {
      score += 10;
      reasons.push('✓ Income eligible');
    }

    // 7. BPL card matching (10 points)
    if (scheme.eligibility.bplCard === 'required' && inputs.bplCard === 'yes') {
      score += 10;
      reasons.push('✓ BPL card holder benefit');
    } else if (scheme.eligibility.bplCard === 'preferred' && inputs.bplCard === 'yes') {
      score += 5;
      reasons.push('✓ Preferred for BPL');
    } else if (scheme.eligibility.bplCard === 'not_required') {
      score += 10;
    } else if (scheme.eligibility.bplCard === 'required' && inputs.bplCard === 'no') {
      // BPL required but farmer doesn't have it
      return { matchScore: 0, matchReasons: ['Requires BPL card'] };
    } else {
      score += 10; // Default: no BPL requirement
    }

    // 8. Special category matching (10 points)
    if (
      !scheme.eligibility.specialCategories ||
      scheme.eligibility.specialCategories.includes('all') ||
      scheme.eligibility.specialCategories.includes('none')
    ) {
      score += 10;
    } else {
      // Check if farmer belongs to any special category required by scheme
      const matchingCategories = inputs.specialCategories.filter((cat) =>
        scheme.eligibility.specialCategories?.includes(cat)
      );

      if (matchingCategories.length > 0) {
        score += 10;
        const categoryLabels = matchingCategories
          .map((c) => {
            if (c === 'pwd') return 'PWD';
            if (c === 'woman') return 'Woman Farmer';
            if (c === 'youth') return 'Youth';
            return c;
          })
          .join(', ');
        reasons.push(`✓ Special category: ${categoryLabels}`);
      }
    }

    return { matchScore: score, matchReasons: reasons };
  }

  /**
   * Format schemes for WhatsApp message
   */
  formatSchemesForWhatsApp(matchedSchemes: MatchedScheme[]): string {
    if (matchedSchemes.length === 0) {
      return '';
    }

    let message = `🎯 *${matchedSchemes.length} Best Schemes For You*\n\n`;

    matchedSchemes.forEach((matched, index) => {
      const scheme = matched.scheme;
      const emoji = this.getCategoryEmoji(scheme.category);

      message += `${emoji} *${index + 1}. ${scheme.name}*\n`;
      message += `📊 Match: ${matched.matchScore}%\n`;
      message += `📝 ${this.capitalizeFirst(scheme.category)}\n`;

      // Show top 3 match reasons
      if (matched.matchReasons.length > 0) {
        const topReasons = matched.matchReasons.slice(0, 3);
        topReasons.forEach((reason) => {
          message += `${reason}\n`;
        });
      }

      if (scheme.amount) {
        message += `💰 ${scheme.amount}\n`;
      }

      if (scheme.benefits && scheme.benefits.length > 0) {
        message += `📌 ${scheme.benefits[0]}\n`;
      }

      if (scheme.applyUrl) {
        message += `🔗 Apply: ${scheme.applyUrl}\n`;
      }

      message += '\n';
    });

    message += '━━━━━━━━━━━━━━━━━\n';
    message += '💡 _These schemes match your profile best_\n\n';
    message += '_Type *restart* to search again_';

    return message;
  }

  /**
   * Get emoji for scheme category
   */
  private getCategoryEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      insurance: '🛡️',
      subsidy: '💵',
      loan: '🏦',
      training: '📚',
      equipment: '🚜',
    };

    return emojiMap[category] || '📋';
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

export default new EligibilityEngine();
