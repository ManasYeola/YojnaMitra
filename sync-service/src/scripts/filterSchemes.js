'use strict';

/**
 * filterSchemes.js — Tag-based agriculture filter for the schemes collection
 *
 * Iterates every scheme in MongoDB and sets isActive based on whether
 * ANY of its tags appear in the ALL_AGRI_TAGS set.
 *
 * Safe to re-run at any time — it is fully idempotent.
 *
 * Usage:
 *   node src/scripts/filterSchemes.js           # live run
 *   DRY_RUN=true node src/scripts/filterSchemes.js   # preview only
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose            = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Scheme              = require('../models/Scheme');
const { ALL_AGRI_TAGS }   = require('../config/agricultureTags');
const logger              = require('../utils/logger');

const DRY_RUN = process.env.DRY_RUN === 'true';

const run = async () => {
  await connectDB();

  const total   = await Scheme.countDocuments();
  logger.info(`filterSchemes: scanning ${total} schemes (DRY_RUN=${DRY_RUN})`);

  const cursor = Scheme.find({}, { _id: 1, slug: 1, name: 1, tags: 1, isActive: 1 }).cursor();

  let active   = 0;
  let inactive = 0;
  let changed  = 0;

  for await (const scheme of cursor) {
    const tags   = Array.isArray(scheme.tags) ? scheme.tags : [];
    const isAgri = tags.some((t) => ALL_AGRI_TAGS.has(t));

    // Only write if the flag actually needs to change
    if (scheme.isActive !== isAgri) {
      changed++;
      if (!DRY_RUN) {
        await Scheme.updateOne({ _id: scheme._id }, { $set: { isActive: isAgri } });
      }
      logger.info(
        `  ${DRY_RUN ? '[DRY RUN] would set' : 'set'} isActive=${isAgri} — "${scheme.name}" (tags: [${tags.join(', ')}])`
      );
    }

    if (isAgri) active++; else inactive++;
  }

  logger.info('─'.repeat(60));
  logger.info(`  Total scanned : ${total}`);
  logger.info(`  Active (agri) : ${active}`);
  logger.info(`  Inactive      : ${inactive}`);
  logger.info(`  Changed       : ${changed}${DRY_RUN ? ' (dry run — no writes)' : ''}`);
  logger.info('─'.repeat(60));

  await disconnectDB();
};

run().catch((err) => {
  logger.error(`filterSchemes failed: ${err.message}`);
  process.exit(1);
});
