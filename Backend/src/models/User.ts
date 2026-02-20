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
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
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
      required: [true, 'District is required'],
      trim: true,
    },
    landSize: {
      type: Number,
      required: [true, 'Land size is required'],
      min: [0, 'Land size cannot be negative'],
    },
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
      lowercase: true,
    },
    farmerCategory: {
      type: String,
      required: [true, 'Farmer category is required'],
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
      trim: true,
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
