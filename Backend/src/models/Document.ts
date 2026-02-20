import mongoose, { Schema } from 'mongoose';
import { IDocument } from '../types';

const documentSchema = new Schema<IDocument>(
  {
    applicationId: {
      type: String,
      required: [true, 'Application ID is required'],
      ref: 'Application',
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true,
      enum: {
        values: [
          'Aadhaar Card',
          'Bank Account Details',
          'Land Records',
          'Sowing Certificate',
          'Passport Size Photo',
          'Electricity Bill',
          'Project Report',
          'Other',
        ],
        message: 'Invalid document type',
      },
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
documentSchema.index({ applicationId: 1, documentType: 1 });
documentSchema.index({ userId: 1, uploadedAt: -1 });

const Document = mongoose.model<IDocument>('Document', documentSchema);

export default Document;
