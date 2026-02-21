import mongoose, { Schema } from 'mongoose';
import { IScheme } from '../types';

/**
 * Scheme model - compatible with sync-service synced data
 * Uses slug as _id to match MyScheme API structure
 */
const schemeSchema = new Schema<IScheme>(
  {
    // ── Identity (from sync-service) ─────────────────────────────
    _id: { type: String, required: true },
    slug: { type: String, index: true },
    apiId: { type: String, index: true },

    // ── Core display fields ──────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      index: true,
    },
    level: { type: String }, // e.g., "Central" | "State"
    state: { type: String, index: true },
    
    category: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    tags: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    // ── Legacy description field (backward compatible) ───────────
    description: {
      type: String,
      trim: true,
    },

    // ── Rich content from sync-service (markdown) ────────────────
    description_md: { type: String, default: '' },
    benefits_md: { type: String, default: '' },
    eligibility_md: { type: String, default: '' },
    exclusions_md: { type: String, default: '' },
    applicationProcess_md: { type: String, default: '' },
    documentsRequired_md: { type: String, default: '' },

    // ── Legacy benefits array (backward compatible) ──────────────
    benefits: {
      type: [String],
      default: [],
    },

    // ── Raw API payload from sync-service ────────────────────────
    basicDetails: { type: Schema.Types.Mixed },

    // ── Documents & FAQs from sync-service ───────────────────────
    documents: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    faqs: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    // ── Legacy structured eligibility (for backward compatibility)
    eligibility: {
      states: {
        type: [String],
        default: [],
      },
      crops: {
        type: [String],
        default: [],
      },
      farmerCategory: {
        type: [String],
        default: [],
      },
      maxLandSize: {
        type: Number,
        min: 0,
      },
      minLandSize: {
        type: Number,
        min: 0,
      },
    },

    // ── Application info ─────────────────────────────────────────
    applyUrl: {
      type: String,
      trim: true,
    },
    amount: {
      type: String,
      trim: true,
    },

    // ── Sync metadata from sync-service ──────────────────────────
    lastSyncedAt: { type: Date, default: Date.now, index: true },
    sourceVersion: { type: String, default: 'v6' },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow extra fields from API
    collection: 'schemes', // Share collection with sync-service
  }
);

// Indexes for faster queries
schemeSchema.index({ category: 1, isActive: 1 });
schemeSchema.index({ 'eligibility.states': 1 });
schemeSchema.index({ 'eligibility.crops': 1 });
schemeSchema.index({ level: 1, isActive: 1 });
schemeSchema.index({ state: 1, isActive: 1 });

const Scheme = mongoose.model<IScheme>('Scheme', schemeSchema);

export default Scheme;
