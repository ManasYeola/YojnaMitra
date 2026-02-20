'use strict';

/**
 * Scheme.js — Mongoose model for government schemes
 *
 * Maps to the `schemes` collection in the `yojanamitra` database.
 * Uses { strict: false } to preserve all raw API fields without defining
 * every sub-field — keeps the model future-proof as the API evolves.
 */

const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────
    /** Slug — used as the MongoDB _id (guaranteed unique across all schemes) */
    _id: { type: String, required: true },

    /** URL-friendly slug (mirrors _id, kept for readability in queries) */
    slug: { type: String, index: true },

    /** Original _id from the MyScheme API (may collide across slugs) */
    apiId: { type: String, index: true },

    // ── Core display fields ───────────────────────────────────────────
    name:  { type: String, index: true },
    level: { type: String },          // e.g. "Central" | "State"
    state: { type: String, index: true },

    category: { type: [mongoose.Schema.Types.Mixed], default: [] },
    tags:     { type: [mongoose.Schema.Types.Mixed], default: [] },

    // ── Raw API payload ───────────────────────────────────────────────
    /** Full basicDetails block as returned by the API */
    basicDetails: { type: mongoose.Schema.Types.Mixed },

    // ── Markdown content ──────────────────────────────────────────────
    description_md:        { type: String, default: '' },
    benefits_md:           { type: String, default: '' },
    eligibility_md:        { type: String, default: '' },
    exclusions_md:         { type: String, default: '' },
    applicationProcess_md: { type: String, default: '' },
    documentsRequired_md:  { type: String, default: '' },

    // ── Documents & FAQs ─────────────────────────────────────────────
    documents: { type: [mongoose.Schema.Types.Mixed], default: [] },
    faqs:      { type: [mongoose.Schema.Types.Mixed], default: [] },

    // ── Sync metadata ─────────────────────────────────────────────────
    lastSyncedAt:  { type: Date, default: Date.now, index: true },
    sourceVersion: { type: String, default: 'v6' },
    isActive:      { type: Boolean, default: true, index: true },
  },
  {
    /**
     * strict: false lets MongoDB store any extra fields the API returns
     * (new API versions may add fields we haven't mapped yet).
     */
    strict: false,
    collection: 'schemes',

    /**
     * _id: false disables Mongoose's auto-generated ObjectId so our
     * string _id from the API is used directly.
     */
    _id: false,
  }
);

// ── Compound indexes for common queries ──────────────────────────────
schemeSchema.index({ state: 1, isActive: 1 });
schemeSchema.index({ category: 1, isActive: 1 });
schemeSchema.index({ lastSyncedAt: -1 });

/**
 * Use mongoose.models cache to prevent OverwriteModelError
 * when this file is required multiple times (e.g. hot reloads, tests).
 */
const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
