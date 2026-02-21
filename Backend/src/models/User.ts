import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      match: [/^[0-9]{10,12}$/, 'Please enter a valid phone number'],
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true,
      sparse: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    landSize: {
      type: Number,
      min: [0, 'Land size cannot be negative'],
    },
    cropType: {
      type: String,
      trim: true,
      lowercase: true,
    },
    farmerCategory: {
      type: String,
      enum: {
        values: ['small', 'marginal', 'large'],
        message: 'Farmer category must be small, marginal, or large',
      },
    },
    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
      max: [120, 'Age cannot exceed 120'],
    },
    incomeRange: {
      type: String,
      enum: {
        values: ['below_1L', '1_3L', '3_8L', 'above_8L'],
        message: 'Invalid income range',
      },
    },
    farmerType: {
      type: String,
      enum: {
        values: ['crop_farmer', 'dairy', 'fisherman', 'labourer', 'entrepreneur', 'other'],
        message: 'Invalid farmer type',
      },
    },
    landOwnership: {
      type: String,
      enum: {
        values: ['owned', 'none', 'leased'],
        message: 'Invalid land ownership value',
      },
    },
    ageRange: {
      type: String,
      enum: {
        values: ['below_18', '18_40', '41_60', 'above_60'],
        message: 'Invalid age range',
      },
    },
    caste: {
      type: String,
      enum: {
        values: ['general', 'sc', 'st', 'obc', 'not_disclosed'],
        message: 'Invalid caste category',
      },
    },
    isBPL: {
      type: Boolean,
    },
    specialCategory: {
      type: [String],
      default: [],
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation: At least one of phone or email is required
userSchema.pre('validate', function(next) {
  if (!this.phone && !this.email) {
    this.invalidate('phone', 'Either phone number or email is required');
    this.invalidate('email', 'Either phone number or email is required');
  }
  next();
});

// Indexes for faster queries
userSchema.index({ state: 1, district: 1 });
userSchema.index({ cropType: 1 });
userSchema.index({ farmerCategory: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
