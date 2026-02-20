// TypeScript interfaces for the farmer support system

export interface Farmer {
  id?: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  landSize: number;
  cropType: string;
  farmerCategory: 'small' | 'marginal' | 'large';
  age?: number;
  incomeRange?: string;
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
