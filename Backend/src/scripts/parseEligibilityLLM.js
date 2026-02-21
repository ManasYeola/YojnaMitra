'use strict';
/**
 * parseEligibilityLLM.js
 *
 * Uses Gemini API to convert each scheme's natural-language eligibility_md text
 * into the EXACT same structured field format used by the user profile.
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║  PRIVACY: Only scheme TEXT is sent to Gemini.           ║
 * ║  No user data ever leaves the server.                   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Processing: 5 schemes per Gemini call, 8 calls/min (free-tier safe)
 * ~770 schemes ≈ 154 batches ≈ 20 minutes total (safe pace)
 *
 * Run:  npm run parse-eligibility:llm
 * Safe to re-run — only processes schemes where structured.parsedBy !== 'gemini'
 * To force full re-parse: npm run parse-eligibility:llm -- --force
 */

const path = require('path');
// Backend/src/scripts/ → Backend/src/.env is one level up
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios    = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const BATCH_SIZE       = 3;    // 3 schemes per call — fewer tokens, safer on TPM limit
const CALLS_PER_MINUTE = 5;    // very conservative — free tier is 15 RPM
const CALL_INTERVAL_MS = Math.ceil(60_000 / CALLS_PER_MINUTE); // 12000ms
const MAX_RETRIES      = 4;

const FORCE = process.argv.includes('--force');

// Global adaptive delay — increases when 429s are detected, resets on success
let globalDelayMs = 0;

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `\
You are a government scheme eligibility classifier for Indian agriculture schemes.
Your job is to read a scheme's eligibility criteria text and convert it into a
structured format that EXACTLY matches user profile fields.

ALLOWED ENUM VALUES — use ONLY these exact strings:

  farmerTypes        : "crop_farmer" | "dairy" | "fisherman" | "labourer" | "entrepreneur" | "other"
  landOwnership      : "owned" | "leased" | "none"
  ageRanges          : "below_18" | "18_40" | "41_60" | "above_60"
  castes             : "general" | "sc" | "st" | "obc"
  incomeRanges       : "below_1L" | "1_3L" | "3_8L" | "above_8L"
  specialCategories  : "disability" | "woman" | "youth"

RULES (read carefully):

1.  Use ["all"] when a field has NO restriction — scheme is open to everyone for that field.

2.  allowedFarmerTypes:
    - ["all"] unless the scheme explicitly restricts to certain occupations
    - e.g. "scheme for fishermen only" → ["fisherman"]
    - "scheme for farmers" (generic) → ["all"]

3.  allowedLandOwnership:
    - ["all"] unless land ownership is explicitly required/excluded
    - "must own agricultural land" → ["owned"]
    - "landless farmers eligible" → ["none","leased","owned"] = ["all"]

4.  allowedAgeRanges — include ALL ranges the eligibility window covers:
    - "18 to 40 years" → ["18_40"]
    - "18 to 60 years" → ["18_40","41_60"]
    - "above 18 years" → ["18_40","41_60","above_60"]
    - "above 60 years" → ["above_60"]
    - no restriction   → ["all"]

5.  allowedCastes — include ALL castes explicitly mentioned as ELIGIBLE:
    - "SC/ST applicants" → ["sc","st"]
    - "SC/ST/OBC/General" or "all categories" → ["all"]
    - no caste mention  → ["all"]

6.  allowedIncomeRanges — include ALL ranges whose UPPER BOUND is within the income limit:
    - "income below ₹1 lakh"   → ["below_1L"]
    - "income below ₹3 lakh"   → ["below_1L","1_3L"]
    - "income below ₹8 lakh"   → ["below_1L","1_3L","3_8L"]
    - no income restriction    → ["all"]

7.  bplRequired: true ONLY when a BPL card is a MANDATORY requirement to apply.
    "BPL families are eligible" → false (they qualify, but others may too)
    "Applicant must hold BPL ration card" → true

8.  womanOnly: true ONLY when the scheme is EXCLUSIVELY for women.
    "priority to women" → false
    "only women farmers can apply" → true

9.  allowedSpecialCategories:
    - ["all"] unless scheme is EXCLUSIVELY for a special group
    - "only for persons with disability" → ["disability"]
    - "scheme for youth (18-35)" exclusively → ["youth"]
    - "priority to disabled/women" (open to all) → ["all"]

Return a JSON array with exactly one object per scheme, in the same order as input.`;

// Gemini response schema — forces valid JSON output
const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      allowedFarmerTypes:       { type: 'ARRAY', items: { type: 'STRING' } },
      allowedLandOwnership:     { type: 'ARRAY', items: { type: 'STRING' } },
      allowedAgeRanges:         { type: 'ARRAY', items: { type: 'STRING' } },
      allowedCastes:            { type: 'ARRAY', items: { type: 'STRING' } },
      allowedIncomeRanges:      { type: 'ARRAY', items: { type: 'STRING' } },
      bplRequired:              { type: 'BOOLEAN' },
      womanOnly:                { type: 'BOOLEAN' },
      allowedSpecialCategories: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: [
      'allowedFarmerTypes', 'allowedLandOwnership', 'allowedAgeRanges',
      'allowedCastes', 'allowedIncomeRanges', 'bplRequired',
      'womanOnly', 'allowedSpecialCategories',
    ],
  },
};

// ── Gemini call (with retry) ──────────────────────────────────────────────────

async function callGemini(schemeBatch, attempt = 1) {
  const userContent = schemeBatch
    .map((s, i) =>
      `--- SCHEME ${i + 1} ---\nName: ${s.name}\nEligibility:\n${s.eligibility_md || '(not specified)'}`
    )
    .join('\n\n');

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: userContent }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema:   RESPONSE_SCHEMA,
      temperature:      0.1,
    },
  };

  try {
    const res = await axios.post(GEMINI_URL, body, { timeout: 60_000 });
    const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('Empty response from Gemini');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Gemini did not return an array');
    if (parsed.length !== schemeBatch.length) {
      throw new Error(`Expected ${schemeBatch.length} results, got ${parsed.length}`);
    }
    // Successful call — gradually reduce global delay
    if (globalDelayMs > 0) {
      globalDelayMs = Math.max(0, globalDelayMs - 2000);
    }
    return parsed;
  } catch (err) {
    const status   = err?.response?.status;
    const errBody  = err?.response?.data?.error || {};
    const is429    = status === 429;
    const is503    = status === 503;

    // Always log the raw Gemini error for visibility
    if (status) console.error(`\n  [Gemini ${status}]`, JSON.stringify(errBody).slice(0, 300));

    if (attempt <= MAX_RETRIES && (is429 || is503 || !status)) {
      // Use Retry-After header if present, otherwise exponential backoff
      const retryAfterSec = parseInt(err?.response?.headers?.['retry-after'] || '0');
      const baseWait = retryAfterSec > 0
        ? retryAfterSec * 1000
        : Math.min(30_000 * attempt, 120_000);   // 30s, 60s, 90s, 120s

      if (is429) globalDelayMs = Math.min(globalDelayMs + 10_000, 60_000);

      console.warn(`\n  ⚠ HTTP ${status || 'ERR'} — retry ${attempt}/${MAX_RETRIES} after ${baseWait / 1000}s`);
      await sleep(baseWait);
      return callGemini(schemeBatch, attempt + 1);
    }
    // All retries exhausted — throw so the batch is skipped and we continue
    throw err;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function chunks(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  const uri = process.env.SCHEMES_MONGO_URI || process.env.MONGO_URI;
  if (!uri) { console.error('❌ Set SCHEMES_MONGO_URI in Backend/src/.env'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const col = mongoose.connection.collection('schemes');

  // Only process unparsed schemes unless --force
  const filter = FORCE
    ? { isActive: true }
    : { isActive: true, 'structured.parsedBy': { $ne: 'gemini' } };

  const schemes = await col
    .find(filter, { projection: { _id: 1, name: 1, eligibility_md: 1 } })
    .toArray();

  if (schemes.length === 0) {
    console.log('✅ All schemes already parsed by Gemini. Use --force to re-parse.');
    await mongoose.disconnect();
    return;
  }

  console.log(`📋 ${schemes.length} schemes to process (batch size: ${BATCH_SIZE})`);
  const batches = chunks(schemes, BATCH_SIZE);
  console.log(`🔄 ${batches.length} Gemini calls @ ${CALLS_PER_MINUTE}/min ≈ ${Math.ceil(batches.length / CALLS_PER_MINUTE)} min\n`);

  let processed = 0;
  let failed    = 0;

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const start = Date.now();

    try {
      const results = await callGemini(batch);

      const bulkOps = batch.map((scheme, i) => ({
        updateOne: {
          filter: { _id: scheme._id },
          update: {
            $set: {
              structured: {
                ...results[i],
                parsedBy: 'gemini',
                parsedAt: new Date().toISOString(),
              },
            },
          },
        },
      }));

      await col.bulkWrite(bulkOps);
      processed += batch.length;

    } catch (err) {
      console.error(`  ✗ Batch ${bi + 1} failed after all retries: ${err.message}`);
      failed += batch.length;
    }

    process.stdout.write(
      `  [${bi + 1}/${batches.length}] ${processed} done, ${failed} failed\r`
    );

    // Rate limiting — base interval + any active global backoff from 429s
    const elapsed = Date.now() - start;
    const totalWait = CALL_INTERVAL_MS + globalDelayMs;
    if (bi < batches.length - 1 && elapsed < totalWait) {
      if (globalDelayMs > 0) process.stdout.write(`\n  ⏳ Backing off ${(totalWait - elapsed) / 1000}s...\r`);
      await sleep(totalWait - elapsed);
    }
  }

  // ── Final stats ─────────────────────────────────────────────────────────────
  const total       = await col.countDocuments({ isActive: true });
  const withGemini  = await col.countDocuments({ isActive: true, 'structured.parsedBy': 'gemini' });
  const unparsed    = total - withGemini;

  console.log(`\n\n✅ Done — ${processed} processed, ${failed} failed`);
  console.log(`   Gemini-parsed : ${withGemini}/${total}`);
  if (unparsed > 0) console.log(`   Still unparsed: ${unparsed} (run again or check errors)`);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
