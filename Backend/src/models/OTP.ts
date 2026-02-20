import mongoose, { Schema } from 'mongoose';
import { IOTP } from '../types';

const otpSchema = new Schema<IOTP>(
  {
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true,
      sparse: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for efficient lookup
otpSchema.index({ phone: 1, isUsed: 1, expiresAt: 1 });
otpSchema.index({ email: 1, isUsed: 1, expiresAt: 1 });

const OTP = mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;
