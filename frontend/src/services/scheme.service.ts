import { apiService } from './api.service';
import API_CONFIG from '../config/api.config';

// Types
export interface Scheme {
  _id: string;
  name: string;
  category: 'insurance' | 'subsidy' | 'loan' | 'training' | 'equipment';
  description: string;
  benefits: string[];
  eligibilityCriteria: {
    minLandSize?: number;
    maxLandSize?: number;
    farmerCategory?: string[];
    cropType?: string[];
    state?: string[];
    minAge?: number;
    maxAge?: number;
  };
  documents: string[];
  applicationProcess: string;
  amount?: {
    min: number;
    max: number;
    unit: string;
  };
  duration?: string;
  provider: string;
  applicationDeadline?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeFilter {
  category?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SchemesResponse {
  success: boolean;
  data: Scheme[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

// Scheme Service
export const schemeService = {
  // Get all schemes with filters
  getAllSchemes: async (filters?: SchemeFilter): Promise<SchemesResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const url = `${API_CONFIG.ENDPOINTS.GET_ALL_SCHEMES}?${params.toString()}`;
      const response = await apiService.get<SchemesResponse>(url);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get scheme by ID
  getSchemeById: async (id: string): Promise<Scheme> => {
    try {
      const response = await apiService.get<{ success: boolean; data: Scheme }>(
        API_CONFIG.ENDPOINTS.GET_SCHEME_BY_ID(id)
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get recommended schemes for logged-in user
  getRecommendedSchemes: async (): Promise<Scheme[]> => {
    try {
      const response = await apiService.get<{ success: boolean; data: Scheme[] }>(
        API_CONFIG.ENDPOINTS.GET_RECOMMENDED_SCHEMES
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get schemes by category
  getSchemesByCategory: async (category: string): Promise<Scheme[]> => {
    try {
      const response = await schemeService.getAllSchemes({ category });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Search schemes
  searchSchemes: async (searchTerm: string): Promise<Scheme[]> => {
    try {
      const response = await schemeService.getAllSchemes({ search: searchTerm });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default schemeService;
