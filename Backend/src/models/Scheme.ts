import mongoose, { Schema } from 'mongoose';
import { IScheme } from '../types';

const schemeSchema = new Schema<IScheme>(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['insurance', 'subsidy', 'loan', 'training', 'equipment'],
        message: 'Category must be insurance, subsidy, loan, training, or equipment',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    benefits: {
      type: [String],
      required: [true, 'Benefits are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one benefit must be specified',
      },
    },
    eligibility: {
      states: {
        type: [String],
        default: ['All States'],
      },
      occupationType: {
        type: [String],
        enum: ['crop_farmer', 'dairy_farmer', 'fisherman', 'agri_labourer', 'agri_entrepreneur', 'other', 'all'],
        default: ['all'],
      },
      landOwnership: {
        type: [String],
        enum: ['owned', 'landless', 'leased', 'all'],
        default: ['all'],
      },
      ageRange: {
        type: [String],
        enum: ['below_18', '18_40', '41_60', 'above_60', 'all'],
        default: ['all'],
      },
      casteCategory: {
        type: [String],
        enum: ['general', 'sc', 'st', 'obc', 'not_specified', 'all'],
        default: ['all'],
      },
      incomeRange: {
        type: [String],
        enum: ['below_1l', '1l_3l', '3l_8l', 'above_8l', 'all'],
        default: ['all'],
      },
      bplCard: {
        type: String,
        enum: ['required', 'not_required', 'preferred'],
        default: 'not_required',
      },
      specialCategories: {
        type: [String],
        enum: ['pwd', 'woman', 'youth', 'none', 'all'],
        default: ['all'],
      },
      crops: {
        type: [String],
        default: [],
      },
      farmerCategory: {
        type: [String],
        enum: ['small', 'marginal', 'large'],
        default: ['small', 'marginal', 'large'],
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
    documents: {
      type: [String],
      required: [true, 'Required documents must be specified'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one document must be required',
      },
    },
    applyUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'Apply URL must be a valid URL',
      },
    },
    amount: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
schemeSchema.index({ category: 1, isActive: 1 });
schemeSchema.index({ 'eligibility.states': 1 });
schemeSchema.index({ 'eligibility.crops': 1 });

const Scheme = mongoose.model<IScheme>('Scheme', schemeSchema);

export default Scheme;
