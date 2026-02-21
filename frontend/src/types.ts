// TypeScript interfaces for the farmer support system

export type FarmerType = 'crop_farmer' | 'dairy' | 'fisherman' | 'labourer' | 'entrepreneur' | 'other';
export type LandOwnership = 'owned' | 'none' | 'leased';
export type AgeRange = 'below_18' | '18_40' | '41_60' | 'above_60';
export type CasteCategory = 'general' | 'sc' | 'st' | 'obc' | 'not_disclosed';
export type IncomeRange = 'below_1L' | '1_3L' | '3_8L' | 'above_8L';

export interface Farmer {
  id?: string;
  name: string;
  phone: string;
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
}

export interface Scheme {
  id: string;
  name: string;
  category: 'insurance' | 'subsidy' | 'loan' | 'training' | 'equipment';
  description: string;
  benefits: string[];
  eligibility: {
    states?: string[];
    crops?: string[];
    farmerCategory?: string[];
    maxLandSize?: number;
    minLandSize?: number;
  };
  documents: string[];
  applyUrl?: string;
  amount?: string;
}

export interface Application {
  id: string;
  schemeId: string;
  schemeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  appliedDate: string;
  lastUpdated: string;
}
