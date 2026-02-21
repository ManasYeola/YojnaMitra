import { apiService } from './api.service';
import API_CONFIG from '../config/api.config';

// Types
export interface SendOTPRequest {
  phone: string;
}

export interface SendEmailOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyEmailOTPRequest {
  email: string;
  otp: string;
  userData?: any;
}

export interface UserProfile {
  _id: string;
  phone: string;
  email?: string;
  name?: string;
  state?: string;
  district?: string;
  farmerType?: 'crop_farmer' | 'dairy' | 'fisherman' | 'labourer' | 'entrepreneur' | 'other';
  landOwnership?: 'owned' | 'none' | 'leased';
  ageRange?: 'below_18' | '18_40' | '41_60' | 'above_60';
  caste?: 'general' | 'sc' | 'st' | 'obc' | 'not_disclosed';
  incomeRange?: 'below_1L' | '1_3L' | '3_8L' | 'above_8L';
  isBPL?: boolean;
  specialCategory?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  state?: string;
  district?: string;
  farmerType?: 'crop_farmer' | 'dairy' | 'fisherman' | 'labourer' | 'entrepreneur' | 'other';
  landOwnership?: 'owned' | 'none' | 'leased';
  ageRange?: 'below_18' | '18_40' | '41_60' | 'above_60';
  caste?: 'general' | 'sc' | 'st' | 'obc' | 'not_disclosed';
  incomeRange?: 'below_1L' | '1_3L' | '3_8L' | 'above_8L';
  isBPL?: boolean;
  specialCategory?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: UserProfile;
  };
}

// Auth Service
export const authService = {
  // Send OTP to phone number
  sendOTP: async (phone: string): Promise<AuthResponse> => {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.SEND_OTP,
        { phone }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Verify OTP and login/register
  verifyOTP: async (phone: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.VERIFY_OTP,
        { phone, otp }
      );
      
      // Store token and user data
      if (response.data.success && response.data.data) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Send OTP to email (FREE!)
  sendEmailOTP: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.SEND_EMAIL_OTP,
        { email }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Verify Email OTP and login/register
  verifyEmailOTP: async (email: string, otp: string, userData?: any): Promise<AuthResponse> => {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.VERIFY_EMAIL_OTP,
        { email, otp, userData }
      );
      
      // Store token and user data
      if (response.data.success && response.data.data) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiService.get<{ success: boolean; data: UserProfile }>(
        API_CONFIG.ENDPOINTS.GET_PROFILE
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const response = await apiService.patch<{ success: boolean; data: UserProfile }>(
        API_CONFIG.ENDPOINTS.UPDATE_PROFILE,
        profileData
      );
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Get current user from localStorage
  getCurrentUser: (): UserProfile | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
