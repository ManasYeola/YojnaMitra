/**
 * matchingEngine.ts
 *
 * Strict eligibility matching — ALL conditions must pass (AND logic).
 * Returns eligible scheme IDs + near-miss schemes (fail on 1-2 non-structural fields).
 *
 * Architecture:
 *   - Scheme structured data is pre-built by parseEligibilityLLM.js (Gemini/Groq)
 *   - User data NEVER leaves this server
 *   - Matching is pure field comparison — no regex, no NLP
 *
 * Two-pass:
 *   Pass 1 — MongoDB pre-filter  : isActive + state/level
 *   Pass 2 — JS field comparison : each structured field vs user profile
 */

import schemesDb from '../config/schemesDb';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  state:            string;
  farmerType?:      string;    // 'crop_farmer'|'dairy'|'fisherman'|'labourer'|'entrepreneur'|'other'
  ageRange?:        string;    // 'below_18'|'18_40'|'41_60'|'above_60'
  incomeRange?:     string;    // 'below_1L'|'1_3L'|'3_8L'|'above_8L'
  caste?:           string;    // 'general'|'sc'|'st'|'obc'|'not_disclosed'
  landOwnership?:   string;    // 'owned'|'leased'|'none'
  isBPL?:           boolean;
  specialCategory?: string[];  // ['disability','woman','youth']
}

export interface NearMiss {
  schemeId:     string;
  failedFields: string[];  // e.g. ['bplRequired', 'allowedAgeRanges']
  failedCount:  number;
}

export interface MatchResult {
  eligible: string[];    // scheme _id strings — all checks passed
  nearMiss: NearMiss[];  // failed 1–2 non-structural checks
}

// Structured eligibility as written by Gemini (parseEligibilityLLM.js)
interface StructuredEligibility {
  allowedFarmerTypes:       string[];
  allowedLandOwnership:     string[];
  allowedAgeRanges:         string[];
  allowedCastes:            string[];
  allowedIncomeRanges:      string[];
  bplRequired:              boolean;
  womanOnly:                boolean;
  allowedSpecialCategories: string[];
  parsedBy?:                string;
}

interface SyncedScheme {
  _id:         string;
  level?:      string;
  state?:      string;
  structured?: StructuredEligibility;
}

// ── Field tier classification ─────────────────────────────────────────────────
//
// fixable    → farmer can take action to meet this requirement
// timebased  → farmer will naturally age into eligibility
// ambiguous  → situation may change but no clear actionable step
// structural → permanently ineligible, never show in near-miss
//
type FieldTier = 'fixable' | 'timebased' | 'ambiguous' | 'structural';

const FIELD_TIER: Record<string, FieldTier> = {
  allowedFarmerTypes:       'fixable',     // re-register as different farmer type
  allowedLandOwnership:     'fixable',     // lease land to qualify
  bplRequired:              'fixable',     // apply for BPL card at Gram Panchayat
  allowedAgeRanges:         'timebased',   // will naturally qualify with age
  allowedIncomeRanges:      'ambiguous',   // income can change, no clear action
  allowedCastes:            'structural',  // immutable — never show
  womanOnly:                'structural',  // immutable — never show
  allowedSpecialCategories: 'structural',  // evaluated per sub-category below
};

/**
 * Get the tier for allowedSpecialCategories based on which categories are required.
 * disability → structural | woman → structural | youth → timebased
 */
function specialCatTier(requiredCats: string[]): FieldTier {
  if (requiredCats.some(c => c === 'disability' || c === 'woman')) return 'structural';
  if (requiredCats.includes('youth')) return 'timebased';
  return 'ambiguous';
}

/** True if this field tier should block near-miss display */
function isStructural(field: string, s: StructuredEligibility): boolean {
  if (field === 'allowedSpecialCategories') {
    return specialCatTier(s.allowedSpecialCategories) === 'structural';
  }
  return FIELD_TIER[field] === 'structural';
}

// ── Human-readable failure reasons ───────────────────────────────────────────

export const FIELD_REASON: Record<string, string> = {
  allowedFarmerTypes:       'Farmer type requirement not met',
  allowedLandOwnership:     'Land ownership requirement not met',
  allowedAgeRanges:         'Age range requirement not met',
  allowedCastes:            'Caste category requirement not met',
  allowedIncomeRanges:      'Income limit requirement not met',
  bplRequired:              'Requires a BPL (Below Poverty Line) card',
  womanOnly:                'Available for women only',
  allowedSpecialCategories: 'Restricted to a specific beneficiary group',
};

export const FIELD_ACTION: Partial<Record<string, string>> = {
  allowedFarmerTypes:   'You can re-register your farmer type with your local agriculture office',
  allowedLandOwnership: 'Leasing land may make you eligible for this scheme',
  bplRequired:          'You can apply for a BPL card at your Gram Panchayat or Tehsil office',
};

// ── Core matching logic ───────────────────────────────────────────────────────

function allows(schemeList: string[], userValue: string | undefined | null): boolean {
  if (!userValue) return true;
  return schemeList.includes('all') || schemeList.includes(userValue);
}

/**
 * Runs all 8 eligibility checks and returns which ones failed.
 * Returns [] for fully eligible, or list of failed field names.
 */
function checkEligibility(scheme: SyncedScheme, user: UserProfile): string[] {
  const s = scheme.structured;
  // Not yet parsed → benefit of the doubt, always eligible
  if (!s || !['gemini', 'groq'].includes(s.parsedBy ?? '')) return [];

  const failed: string[] = [];

  if (!allows(s.allowedFarmerTypes, user.farmerType))       failed.push('allowedFarmerTypes');
  if (!allows(s.allowedLandOwnership, user.landOwnership))  failed.push('allowedLandOwnership');
  if (!allows(s.allowedAgeRanges, user.ageRange))           failed.push('allowedAgeRanges');

  if (user.caste !== 'not_disclosed') {
    if (!allows(s.allowedCastes, user.caste))               failed.push('allowedCastes');
  }

  if (!allows(s.allowedIncomeRanges, user.incomeRange))     failed.push('allowedIncomeRanges');
  if (s.bplRequired === true && user.isBPL !== true)        failed.push('bplRequired');
  if (s.womanOnly === true && !user.specialCategory?.includes('woman')) failed.push('womanOnly');

  if (!s.allowedSpecialCategories.includes('all')) {
    const userCats = user.specialCategory ?? [];
    if (!userCats.some(c => s.allowedSpecialCategories.includes(c))) {
      failed.push('allowedSpecialCategories');
    }
  }

  return failed;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Run matching engine for a user profile.
 * @param user         User profile fields
 * @param limit        Max eligible schemes (default 200)
 * @param nearMissMax  Max near-miss entries (default 30)
 * @returns            { eligible: string[], nearMiss: NearMiss[] }
 */
export async function matchSchemes(
  user: UserProfile,
  limit = 200,
  nearMissMax = 30,
): Promise<MatchResult> {
  const col = schemesDb.db!.collection<SyncedScheme>('schemes');

  // Pass 1 — MongoDB pre-filter: active + (Central-level OR matches user's state)
  const statePattern = new RegExp(
    user.state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'i',
  );

  const candidates = await col
    .find(
      {
        isActive: true,
        $or: [
          { level: { $in: ['Central', 'All', 'central', 'all'] } },
          { state: { $regex: statePattern } },
        ],
      },
      { projection: { _id: 1, level: 1, state: 1, structured: 1 } },
    )
    .limit(5000)
    .toArray();

  // Pass 2 — check each scheme and classify as eligible / near-miss / skip
  const eligible: string[] = [];
  const nearMiss: NearMiss[] = [];

  for (const scheme of candidates) {
    const failedFields = checkEligibility(scheme, user);

    if (failedFields.length === 0) {
      // Fully eligible
      eligible.push(String(scheme._id));
      if (eligible.length >= limit) continue;
    } else if (failedFields.length <= 2) {
      // Near-miss candidate — only keep if NO structural failures
      const hasStructural = failedFields.some(f => isStructural(f, scheme.structured!));
      if (!hasStructural && nearMiss.length < nearMissMax) {
        nearMiss.push({
          schemeId:     String(scheme._id),
          failedFields,
          failedCount:  failedFields.length,
        });
      }
    }
    // ≥3 failures → discard completely
  }

  return { eligible, nearMiss };
}
