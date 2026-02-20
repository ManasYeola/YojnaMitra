import mongoose, { Schema } from 'mongoose';
import { IApplication } from '../types';

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    schemeId: {
      type: String,
      required: [true, 'Scheme ID is required'],
      ref: 'Scheme',
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'approved', 'rejected', 'under-review'],
        message: 'Status must be pending, approved, rejected, or under-review',
      },
      default: 'pending',
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    documentsUploaded: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, schemeId: 1 });
applicationSchema.index({ status: 1, appliedDate: -1 });

// Update lastUpdated on save
applicationSchema.pre('save', function (next: () => void) {
  this.lastUpdated = new Date();
  next();
});

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
