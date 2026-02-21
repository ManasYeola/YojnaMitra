/**
 * matchingEngine.ts
 *
 * Strict eligibility matching — ALL conditions must pass (AND logic).
 * Returns array of scheme _id strings the user is eligible for.
 *
 * Architecture:
 *   - Scheme structured data is pre-built by parseEligibilityLLM.js (Gemini)
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

// Structured eligibility as written by Gemini (parseEligibilityLLM.js)
interface StructuredEligibility {
  allowedFarmerTypes:       string[];   // ["all"] or subset of farmerType enums
  allowedLandOwnership:     string[];   // ["all"] or ["owned","leased","none"]
  allowedAgeRanges:         string[];   // ["all"] or subset of ageRange enums
  allowedCastes:            string[];   // ["all"] or ["general","sc","st","obc"]
  allowedIncomeRanges:      string[];   // ["all"] or subset of incomeRange enums
  bplRequired:              boolean;
  womanOnly:                boolean;
  allowedSpecialCategories: string[];   // ["all"] or ["disability","woman","youth"]
  parsedBy?:                string;     // 'gemini'
}

interface SyncedScheme {
  _id:         string;
  level?:      string;
  state?:      string;
  structured?: StructuredEligibility;
}

// ── Core matching logic ───────────────────────────────────────────────────────

/**
 * Returns true if the user value is allowed by the scheme's allowed list.
 * ["all"] in the list means no restriction → always passes.
 * If userValue is undefined/null → passes (can't disqualify on missing data).
 */
function allows(schemeList: string[], userValue: string | undefined | null): boolean {
  if (!userValue) return true;
  return schemeList.includes('all') || schemeList.includes(userValue);
}

function isEligible(scheme: SyncedScheme, user: UserProfile): boolean {
  const s = scheme.structured;

  // Not yet parsed by Gemini/Groq → benefit of the doubt, include scheme
  if (!s || !['gemini', 'groq'].includes(s.parsedBy ?? '')) return true;

  // 1. Farmer type
  if (!allows(s.allowedFarmerTypes, user.farmerType)) return false;

  // 2. Land ownership
  if (!allows(s.allowedLandOwnership, user.landOwnership)) return false;

  // 3. Age range
  if (!allows(s.allowedAgeRanges, user.ageRange)) return false;

  // 4. Caste — skip check if user chose not_disclosed
  if (user.caste !== 'not_disclosed') {
    if (!allows(s.allowedCastes, user.caste)) return false;
  }

  // 5. Income range
  if (!allows(s.allowedIncomeRanges, user.incomeRange)) return false;

  // 6. BPL required
  if (s.bplRequired === true && user.isBPL !== true) return false;

  // 7. Woman only
  if (s.womanOnly === true && !(user.specialCategory?.includes('woman'))) return false;

  // 8. Special categories — if scheme is restricted to specific groups,
  //    user must belong to at least one of them
  if (!s.allowedSpecialCategories.includes('all')) {
    const userCats = user.specialCategory ?? [];
    const hasMatch = userCats.some(c => s.allowedSpecialCategories.includes(c));
    if (!hasMatch) return false;
  }

  return true;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Run matching engine for a user profile.
 * @param user   User profile fields
 * @param limit  Max schemes to return (default 200)
 * @returns      Array of matching scheme _id strings
 */
export async function matchSchemes(
  user: UserProfile,
  limit = 200,
): Promise<string[]> {
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

  // Pass 2 — strict field comparison (no regex, no NLP — pure array membership)
  const eligible: string[] = [];
  for (const scheme of candidates) {
    if (isEligible(scheme, user)) {
      eligible.push(String(scheme._id));
      if (eligible.length >= limit) break;
    }
  }

  return eligible;
}

