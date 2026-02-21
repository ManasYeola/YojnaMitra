'use strict';

/**
 * syncSchemes.js — Main orchestration for the YojanaMitra sync service
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Full data flow per run:                                        │
 * │  1. Fetch all slugs via paginated Search API                    │
 * │  2. For each slug (max 3 concurrent, 2 s between batches):      │
 * │     a. Fetch scheme details  →  transform                       │
 * │     b. Fetch documents       →  merge                           │
 * │     c. Fetch FAQs            →  merge                           │
 * │     d. Upsert into MongoDB `schemes` collection                 │
 * │  3. Mark slugs no longer in the API as isActive=false           │
 * │  4. Persist run statistics to `sync_logs` collection            │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Environment flags (set via .env or CLI env vars):
 *   TEST_MODE=true   Process only 5 schemes  (for quick verification)
 *   DRY_RUN=true     No DB writes at all     (for safe inspection)
 */

// ── Load environment variables FIRST — before any other require ──────
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('./config/db');
const Scheme    = require('./models/Scheme');
const SyncLog   = require('./models/SyncLog');

const { fetchAllSlugs }                    = require('./services/fetchSearch');
const { fetchSchemeBySlug, transformScheme } = require('./services/fetchScheme');
const { fetchDocuments }                   = require('./services/fetchDocuments');
const { fetchFaqs }                        = require('./services/fetchFaqs');
const { ALL_AGRI_TAGS }                    = require('./config/agricultureTags');

const { delay }     = require('./utils/delay');
const logger        = require('./utils/logger');
const { withRetry } = require('./utils/retry');

// ── Runtime flags ─────────────────────────────────────────────────────
const TEST_MODE     = process.env.TEST_MODE     === 'true';
const DRY_RUN       = process.env.DRY_RUN       === 'true';
const SYNC_CATEGORY = process.env.SYNC_CATEGORY ?? 'Agriculture'; // Filter keyword

// ── Tuning constants ─────────────────────────────────────────────────
// Conservative settings — this job runs once a day at 2 AM IST so
// there is no reason to rush.  Slow & steady avoids 429s entirely.
const MAX_CONCURRENCY   = 3;     // 3 schemes per batch (Promise.all)
const BATCH_DELAY_MS    = 2000;  // 2 s pause between batches
const SUB_CALL_DELAY_MS = 800;   // 800 ms between scheme → docs → faqs calls
const RETRY_ATTEMPTS    = 3;     // total attempts per sub-call
const RETRY_BASE_DELAY  = 2000;  // ms before first non-429 retry

// ═════════════════════════════════════════════════════════════════════
//  processSingleScheme
// ═════════════════════════════════════════════════════════════════════

/**
 * Fetch, transform, and upsert a single scheme identified by `slug`.
 * Errors are caught and recorded in `stats` — they do NOT propagate so
 * that the rest of the batch can continue.
 *
 * @param {string} slug
 * @param {object} stats - Mutable stats object (synced / failed / failedSlugs)
 */
const processSingleScheme = async (slug, stats) => {
  try {
    // ── Step 1: Fetch scheme detail ─────────────────────────────────
    const rawScheme = await withRetry(
      () => fetchSchemeBySlug(slug),
      { maxAttempts: RETRY_ATTEMPTS, baseDelayMs: RETRY_BASE_DELAY, context: `fetchScheme:${slug}` }
    );

    const schemeId = rawScheme._id;
    const scheme   = transformScheme(rawScheme, slug);

    // ── Step 2: Fetch documents (soft fail — non-critical) ───────────
    await delay(SUB_CALL_DELAY_MS);
    try {
      const { documents_required, documentsRequired_md } = await withRetry(
        () => fetchDocuments(schemeId),
        { maxAttempts: RETRY_ATTEMPTS, baseDelayMs: RETRY_BASE_DELAY, context: `fetchDocs:${schemeId}` }
      );
      scheme.documents            = documents_required;
      scheme.documentsRequired_md = documentsRequired_md;
    } catch (err) {
      logger.warn(`  [${slug}] Documents unavailable: ${err.message}`);
    }

    // ── Step 3: Fetch FAQs (soft fail — non-critical) ────────────────
    await delay(SUB_CALL_DELAY_MS);
    try {
      const faqs = await withRetry(
        () => fetchFaqs(schemeId),
        { maxAttempts: RETRY_ATTEMPTS, baseDelayMs: RETRY_BASE_DELAY, context: `fetchFaqs:${schemeId}` }
      );
      scheme.faqs = faqs;
    } catch (err) {
      logger.warn(`  [${slug}] FAQs unavailable: ${err.message}`);
    }

    // ── Step 4: Compute isActive from tag matching ───────────────────
    const tags      = Array.isArray(scheme.tags) ? scheme.tags : [];
    const isAgri    = tags.some((t) => ALL_AGRI_TAGS.has(t));
    scheme.isActive = isAgri;

    // ── Step 5: Upsert ──────────────────────────────────────────────────
    if (DRY_RUN) {
      logger.info(`  [DRY RUN] Would upsert: ${slug} — "${scheme.name}" (isActive=${isAgri})`);
    } else {
      await Scheme.updateOne(
        { _id: slug },
        { $set: scheme },
        { upsert: true }
      );
      logger.info(`  ✓ Synced: ${slug} — "${scheme.name}" [isActive=${isAgri}]`);
    }

    stats.synced++;
    if (isAgri) stats.active++; else stats.inactive++;

  } catch (error) {
    // Capture failure — log and continue with next scheme
    logger.error(`  ✗ Failed: "${slug}" — ${error.message}`);
    stats.failed++;
    stats.failedSlugs.push(slug);
  }
};

// ═════════════════════════════════════════════════════════════════════
//  processBatch — run MAX_CONCURRENCY slugs in parallel
// ═════════════════════════════════════════════════════════════════════

/**
 * Process a batch of slugs concurrently (max MAX_CONCURRENCY at once).
 *
 * @param {string[]} slugBatch
 * @param {object}   stats
 */
const processBatch = async (slugBatch, stats) => {
  await Promise.all(slugBatch.map((slug) => processSingleScheme(slug, stats)));
};

// ═════════════════════════════════════════════════════════════════════
//  markInactiveSchemes
// ═════════════════════════════════════════════════════════════════════

/**
 * Any scheme in the DB whose slug is no longer returned by the API
 * is marked isActive=false (not deleted — keeps historical data).
 *
 * @param {string[]} activeSlugs - All slugs returned by the API in this run
 */
const markInactiveSchemes = async (activeSlugs) => {
  const result = await Scheme.updateMany(
    { slug: { $nin: activeSlugs }, isActive: true },
    { $set: { isActive: false, lastSyncedAt: new Date() } }
  );

  if (result.modifiedCount > 0) {
    logger.info(`Marked ${result.modifiedCount} scheme(s) as inactive (not in latest API response)`);
  }
};

// ═════════════════════════════════════════════════════════════════════
//  syncSchemes — entry point
// ═════════════════════════════════════════════════════════════════════

/**
 * Run a full synchronisation pass.
 *
 * @returns {Promise<object>} Final stats: { total, synced, failed, failedSlugs, durationSeconds }
 */
const syncSchemes = async () => {
  const startTime = Date.now();

  const stats = {
    total:       0,
    synced:      0,
    active:      0,   // schemes where tag matched agriculture
    inactive:    0,   // schemes where no tag matched
    failed:      0,
    failedSlugs: [],
  };

  // ── Banner ─────────────────────────────────────────────────────────
  logger.info('═'.repeat(64));
  logger.info('  YojanaMitra — Scheme Sync Started');
  logger.info(`  Mode     : ${TEST_MODE ? 'TEST (5 schemes)' : 'PRODUCTION'}`);
  logger.info(`  Category : ${SYNC_CATEGORY || '(all)'}`);
  logger.info(`  Dry Run  : ${DRY_RUN ? 'YES — no DB writes' : 'NO'}`);
  logger.info(`  Started: ${new Date().toISOString()}`);
  logger.info('═'.repeat(64));

  let overallStatus = 'success';

  try {
    // ── Connect DB (skip in dry-run) ─────────────────────────────────
    if (!DRY_RUN) {
      await connectDB();
    }

    // ── Fetch slugs (with early-stop limit in TEST_MODE) ──────────────
    const slugs = await fetchAllSlugs({
      limit:    TEST_MODE ? 5 : 0,          // 0 = no limit (fetch all)
      category: SYNC_CATEGORY,              // e.g. "Agriculture"
    });

    stats.total = slugs.length;
    logger.info(`Processing ${stats.total} schemes (${MAX_CONCURRENCY} concurrent, ${BATCH_DELAY_MS}ms batch delay)…`);

    // ── Process in batches ────────────────────────────────────────────
    for (let i = 0; i < slugs.length; i += MAX_CONCURRENCY) {
      const batch       = slugs.slice(i, i + MAX_CONCURRENCY);
      const batchNumber = Math.floor(i / MAX_CONCURRENCY) + 1;
      const totalBatches = Math.ceil(slugs.length / MAX_CONCURRENCY);

      logger.info(`Batch ${batchNumber}/${totalBatches} — slugs [${i}…${i + batch.length - 1}]`);

      await processBatch(batch, stats);

      // Rate-limit delay between batches (skip after last batch)
      if (i + MAX_CONCURRENCY < slugs.length) {
        await delay(BATCH_DELAY_MS);
      }
    }

    // ── Mark removed schemes inactive ────────────────────────────────
    if (!DRY_RUN && !TEST_MODE) {
      await markInactiveSchemes(slugs);
    }

    // ── Determine status ─────────────────────────────────────────────
    if (stats.failed === stats.total) {
      overallStatus = 'failed';
    } else if (stats.failed > 0) {
      overallStatus = 'partial';
    }

  } catch (criticalError) {
    overallStatus = 'failed';
    logger.error(`Critical sync error: ${criticalError.message}`, { stack: criticalError.stack });
    throw criticalError; // re-throw so scheduler can handle it

  } finally {
    const durationSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    stats.durationSeconds = durationSeconds;

    // ── Summary banner ───────────────────────────────────────────────
    logger.info('═'.repeat(64));
    logger.info('  Sync Summary');
    logger.info(`  Status   : ${overallStatus.toUpperCase()}`);
    logger.info(`  Total    : ${stats.total}`);
    logger.info(`  Synced   : ${stats.synced}`);
    logger.info(`  Active   : ${stats.active}   (tag matched — agriculture)`);
    logger.info(`  Inactive : ${stats.inactive}  (no tag match — non-agriculture)`);
    logger.info(`  Failed   : ${stats.failed}`);
    logger.info(`  Duration : ${durationSeconds}s`);
    if (stats.failedSlugs.length > 0) {
      logger.warn(`  Failed slugs: ${stats.failedSlugs.join(', ')}`);
    }
    logger.info('═'.repeat(64));

    // ── Persist sync log ─────────────────────────────────────────────
    if (!DRY_RUN) {
      try {
        await SyncLog.create({
          syncedAt:        new Date(),
          durationSeconds,
          totalSchemes:    stats.total,
          totalSynced:     stats.synced,
          activeCount:     stats.active,
          inactiveCount:   stats.inactive,
          failedCount:     stats.failed,
          failedSlugs:     stats.failedSlugs,
          mode:            TEST_MODE ? 'test' : 'production',
          status:          overallStatus,
        });
        logger.info('Sync log persisted to `sync_logs` collection');
      } catch (logErr) {
        logger.warn(`Could not persist sync log: ${logErr.message}`);
      }

      await disconnectDB();
    }
  }

  return stats;
};

// ═════════════════════════════════════════════════════════════════════
//  Standalone execution  (node src/syncSchemes.js)
// ═════════════════════════════════════════════════════════════════════
if (require.main === module) {
  syncSchemes()
    .then(() => {
      logger.info('Standalone sync completed — exiting');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Fatal error during standalone sync', { message: err.message });
      process.exit(1);
    });
}

module.exports = { syncSchemes };
