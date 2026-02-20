'use strict';

/**
 * SyncLog.js — Mongoose model for sync run history
 *
 * Maps to the `sync_logs` collection. Each document represents
 * one complete synchronisation run with its outcome and statistics.
 */

const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema(
  {
    // ── Timing ────────────────────────────────────────────────────────
    syncedAt:        { type: Date,   default: Date.now, index: true },
    durationSeconds: { type: Number, default: 0 },

    // ── Counts ────────────────────────────────────────────────────────
    totalSchemes: { type: Number, default: 0 },
    totalSynced:  { type: Number, default: 0 },
    failedCount:  { type: Number, default: 0 },

    // ── Details ───────────────────────────────────────────────────────
    /** Slugs that failed even after retry */
    failedSlugs: { type: [String], default: [] },

    /** Run mode when this sync was triggered */
    mode: {
      type: String,
      enum: ['production', 'test', 'dry-run'],
      default: 'production',
    },

    /** Overall outcome of this sync run */
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },

    /** Any top-level error message if the run crashed */
    errorMessage: { type: String, default: null },
  },
  {
    collection: 'sync_logs',
  }
);

const SyncLog = mongoose.models.SyncLog || mongoose.model('SyncLog', syncLogSchema);

module.exports = SyncLog;
