'use strict';
/**
 * parseEligibilityGroq.js
 *
 * Same job as parseEligibilityLLM.js (Gemini) but uses Groq API instead.
 * Groq free tier: 30 RPM, ~14,400 req/day — much more generous than Gemini.
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║  PRIVACY: Only scheme TEXT is sent to Groq.             ║
 * ║  No user data ever leaves the server.                   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Processing: 3 schemes per call, 20 calls/min → ~770 schemes ≈ 13 min
 *
 * Run:         npm run parse-eligibility:groq
 * Force re-run: npm run parse-eligibility:groq:force
 * Safe to re-run — skips schemes already marked parsedBy:'groq'
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios    = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

const BATCH_SIZE       = 3;    // schemes per call
const CALLS_PER_MINUTE = 20;   // Groq free tier allows 30 RPM — stay at 20 to be safe
const CALL_INTERVAL_MS = Math.ceil(60_000 / CALLS_PER_MINUTE); // 3000ms
const MAX_RETRIES      = 4;

const FORCE = process.argv.includes('--force');

// Global adaptive delay — increases when rate-limited, resets on success
let globalDelayMs = 0;

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `\
You are a government scheme eligibility classifier for Indian agriculture schemes.
Read the eligibility criteria text for each scheme and return a JSON object.

ALLOWED ENUM VALUES — use ONLY these exact strings:

  farmerTypes        : "crop_farmer" | "dairy" | "fisherman" | "labourer" | "entrepreneur" | "other"
  landOwnership      : "owned" | "leased" | "none"
  ageRanges          : "below_18" | "18_40" | "41_60" | "above_60"
  castes             : "general" | "sc" | "st" | "obc"
  incomeRanges       : "below_1L" | "1_3L" | "3_8L" | "above_8L"
  specialCategories  : "disability" | "woman" | "youth"

RULES:

1.  Use ["all"] when a field has NO restriction — scheme is open to everyone for that field.

2.  allowedFarmerTypes:
    - ["all"] unless the scheme explicitly restricts to certain occupations
    - "scheme for fishermen only" → ["fisherman"]
    - "scheme for farmers" (generic) → ["all"]

3.  allowedLandOwnership:
    - ["all"] unless land ownership is explicitly required or excluded
    - "must own agricultural land" → ["owned"]
    - "landless farmers eligible" → ["all"]

4.  allowedAgeRanges — include ALL ranges the eligibility window covers:
    - "18 to 40 years" → ["18_40"]
    - "18 to 60 years" → ["18_40","41_60"]
    - "above 18 years" → ["18_40","41_60","above_60"]
    - no restriction   → ["all"]

5.  allowedCastes — include ALL castes explicitly mentioned as ELIGIBLE:
    - "SC/ST applicants" → ["sc","st"]
    - "all categories" or SC/ST/OBC/General all mentioned → ["all"]
    - no caste mention  → ["all"]

6.  allowedIncomeRanges — include ALL ranges whose upper bound fits within the limit:
    - "income below 1 lakh"  → ["below_1L"]
    - "income below 3 lakh"  → ["below_1L","1_3L"]
    - "income below 8 lakh"  → ["below_1L","1_3L","3_8L"]
    - no income restriction  → ["all"]

7.  bplRequired: true ONLY when BPL card is a MANDATORY requirement.
    "BPL families are eligible" → false
    "must hold BPL ration card" → true

8.  womanOnly: true ONLY when scheme is EXCLUSIVELY for women.
    "priority to women" → false
    "only women farmers can apply" → true

9.  allowedSpecialCategories:
    - ["all"] unless scheme is EXCLUSIVELY for a special group
    - "only for persons with disability" → ["disability"]
    - "priority to disabled/women" (open to all) → ["all"]

Return ONLY a valid JSON object in this exact shape (no extra text):
{
  "schemes": [
    {
      "allowedFarmerTypes": [...],
      "allowedLandOwnership": [...],
      "allowedAgeRanges": [...],
      "allowedCastes": [...],
      "allowedIncomeRanges": [...],
      "bplRequired": false,
      "womanOnly": false,
      "allowedSpecialCategories": [...]
    }
  ]
}

The "schemes" array must have exactly as many items as schemes given in the input, in the same order.`;

// ── Groq call (with retry) ────────────────────────────────────────────────────

async function callGroq(schemeBatch, attempt = 1) {
  const userContent = schemeBatch
    .map((s, i) =>
      `--- SCHEME ${i + 1} ---\nName: ${s.name}\nEligibility:\n${s.eligibility_md || '(not specified)'}`
    )
    .join('\n\n');

  const body = {
    model:           GROQ_MODEL,
    temperature:     0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userContent   },
    ],
  };

  try {
    const res = await axios.post(GROQ_URL, body, {
      timeout: 60_000,
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type':  'application/json',
      },
    });

    const raw = res.data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response from Groq');

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Groq returned invalid JSON: ${raw.slice(0, 200)}`);
    }

    const results = parsed?.schemes;
    if (!Array.isArray(results)) {
      throw new Error(`Expected { schemes: [...] }, got: ${raw.slice(0, 200)}`);
    }
    if (results.length !== schemeBatch.length) {
      throw new Error(`Expected ${schemeBatch.length} results, got ${results.length}`);
    }

    // Successful — ease off global delay
    if (globalDelayMs > 0) globalDelayMs = Math.max(0, globalDelayMs - 2000);
    return results;

  } catch (err) {
    const status  = err?.response?.status;
    const errBody = err?.response?.data?.error || {};
    const is429   = status === 429;

    // Always log raw Groq error for visibility
    if (status) console.error(`\n  [Groq ${status}]`, JSON.stringify(errBody).slice(0, 300));

    if (attempt <= MAX_RETRIES && (is429 || status === 503 || !status)) {
      const retryAfterSec = parseInt(err?.response?.headers?.['retry-after'] || '0');
      const baseWait = retryAfterSec > 0
        ? retryAfterSec * 1000
        : Math.min(20_000 * attempt, 90_000);  // 20s, 40s, 60s, 80s

      if (is429) globalDelayMs = Math.min(globalDelayMs + 8_000, 60_000);

      console.warn(`\n  ⚠ HTTP ${status || 'ERR'} — retry ${attempt}/${MAX_RETRIES} after ${baseWait / 1000}s`);
      await sleep(baseWait);
      return callGroq(schemeBatch, attempt + 1);
    }
    // All retries exhausted — throw so the batch is skipped and we continue
    throw err;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is not set in Backend/src/.env');
    process.exit(1);
  }

  const uri = process.env.SCHEMES_MONGO_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ SCHEMES_MONGO_URI is not set in Backend/src/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
  console.log(`🤖 Model: ${GROQ_MODEL}`);

  const col = mongoose.connection.collection('schemes');

  // Skip already-parsed unless --force
  const filter = FORCE
    ? { isActive: true }
    : { isActive: true, 'structured.parsedBy': { $nin: ['groq', 'gemini'] } };

  const schemes = await col
    .find(filter, { projection: { _id: 1, name: 1, eligibility_md: 1 } })
    .toArray();

  if (schemes.length === 0) {
    console.log('✅ All schemes already parsed. Use --force to re-parse.');
    await mongoose.disconnect();
    return;
  }

  const batches = chunks(schemes, BATCH_SIZE);
  console.log(`📋 ${schemes.length} schemes → ${batches.length} batches @ ${CALLS_PER_MINUTE}/min ≈ ${Math.ceil(batches.length / CALLS_PER_MINUTE)} min\n`);

  let processed = 0;
  let failed    = 0;

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const start = Date.now();

    try {
      const results = await callGroq(batch);

      const bulkOps = batch.map((scheme, i) => ({
        updateOne: {
          filter: { _id: scheme._id },
          update: {
            $set: {
              structured: {
                ...results[i],
                parsedBy: 'groq',
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

    process.stdout.write(`  [${bi + 1}/${batches.length}] ${processed} done, ${failed} failed\r`);

    // Wait: base interval + any active global backoff
    const elapsed   = Date.now() - start;
    const totalWait = CALL_INTERVAL_MS + globalDelayMs;
    if (bi < batches.length - 1 && elapsed < totalWait) {
      if (globalDelayMs > 0) process.stdout.write(`\n  ⏳ Backing off ${((totalWait - elapsed) / 1000).toFixed(1)}s...\r`);
      await sleep(totalWait - elapsed);
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total      = await col.countDocuments({ isActive: true });
  const withGroq   = await col.countDocuments({ isActive: true, 'structured.parsedBy': 'groq'   });
  const withGemini = await col.countDocuments({ isActive: true, 'structured.parsedBy': 'gemini' });
  const unparsed   = total - withGroq - withGemini;

  console.log(`\n\n✅ Done — ${processed} processed, ${failed} failed`);
  console.log(`   Groq-parsed  : ${withGroq}`);
  console.log(`   Gemini-parsed: ${withGemini}`);
  console.log(`   Unparsed     : ${unparsed}`);
  if (unparsed > 0) console.log(`   → Run again to parse remaining ${unparsed}`);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
