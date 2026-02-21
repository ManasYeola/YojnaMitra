import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export type FarmerType = 'crop_farmer' | 'dairy' | 'fisherman' | 'labourer' | 'entrepreneur' | 'other';
export type LandOwnership = 'owned' | 'none' | 'leased';
export type AgeRange = 'below_18' | '18_40' | '41_60' | 'above_60';
export type CasteCategory = 'general' | 'sc' | 'st' | 'obc' | 'not_disclosed';
export type IncomeRange = 'below_1L' | '1_3L' | '3_8L' | 'above_8L';

export interface IUser extends Document {
  name: string;
  phone?: string;
  email?: string;
  state: string;
  district?: string;
  landSize?: number;
  cropType?: string;
  farmerCategory?: 'small' | 'marginal' | 'large';
  age?: number;
  // 8-question profile fields
  farmerType?: FarmerType;
  landOwnership?: LandOwnership;
  ageRange?: AgeRange;
  caste?: CasteCategory;
  incomeRange?: IncomeRange;
  isBPL?: boolean;
  specialCategory?: string[];
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Scheme Types
export type SchemeCategory = 'insurance' | 'subsidy' | 'loan' | 'training' | 'equipment';

export interface IScheme extends Document {
  _id: any; // Slug-based ID from sync-service (string slug, not ObjectId)
  slug?: string;
  apiId?: string;
  name: string;
  level?: string; // "Central" | "State"
  state?: string;
  category?: any[]; // Mixed type from API
  tags?: any[];
  
  // Legacy fields (backward compatible)
  description?: string;
  benefits?: string[];
  
  // Rich markdown content from sync-service
  description_md?: string;
  benefits_md?: string;
  eligibility_md?: string;
  exclusions_md?: string;
  applicationProcess_md?: string;
  documentsRequired_md?: string;
  
  // Raw API data
  basicDetails?: any;
  
  eligibility?: {
    states?: string[];
    occupationType?: string[];
    landOwnership?: string[];
    ageRange?: string[];
    casteCategory?: string[];
    incomeRange?: string[];
    bplCard?: string;
    specialCategories?: string[];
    crops?: string[];
    farmerCategory?: string[];
    maxLandSize?: number;
    minLandSize?: number;
  };
  documents?: any[]; // Can be string[] or object[]
  faqs?: any[];
  applyUrl?: string;
  amount?: string;
  
  // Sync metadata
  lastSyncedAt?: Date;
  sourceVersion?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Eligibility Check Types
export interface IEligibilityCheck {
  isEligible: boolean;
  matchScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  warnings: string[];
  parsedEligibility?: {
    states?: string[];
    crops?: string[];
    categories?: string[];
    ageRange?: { min?: number; max?: number };
    landSize?: { min?: number; max?: number };
    income?: { min?: number; max?: number };
    other?: string[];
  };
}

export interface IEligibilityRequest {
  schemeId: string;
  userData?: {
    state?: string;
    district?: string;
    landSize?: number;
    cropType?: string;
    farmerCategory?: string;
    age?: number;
    incomeRange?: string;
  };
}

// Application Types
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'under-review';

export interface IApplication extends Document {
  userId: string;
  schemeId: string;
  status: ApplicationStatus;
  appliedDate: Date;
  lastUpdated: Date;
  remarks?: string;
  documentsUploaded: string[];
}

// Document Types
export interface IDocument extends Document {
  applicationId: string;
  userId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isVerified: boolean;
  uploadedAt: Date;
}

// OTP Types
export interface IOTP extends Document {
  phone?: string;
  email?: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  phone: string;
}

// Extended Request with auth
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phone: string;
  };
  body: any;
  params: any;
  query: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Scheme Recommendation
export interface SchemeRecommendation {
  scheme: IScheme;
  matchScore: number;
  matchReasons: string[];
}
