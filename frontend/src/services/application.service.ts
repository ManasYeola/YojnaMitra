import { apiService } from './api.service';
import API_CONFIG from '../config/api.config';
import type { Scheme } from './scheme.service';
import type { UserProfile } from './auth.service';

// Types
export interface Application {
  _id: string;
  userId: string | UserProfile;
  schemeId: string | Scheme;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  applicationDate: string;
  lastUpdated: string;
  documents?: string[];
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  schemeId: string;
}

export interface UpdateApplicationStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  remarks?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
}

// Application Service
export const applicationService = {
  // Create new application
  createApplication: async (schemeId: string): Promise<Application> => {
    try {
      const response = await apiService.post<{ success: boolean; data: Application }>(
        API_CONFIG.ENDPOINTS.CREATE_APPLICATION,
        { schemeId }
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get all applications for logged-in user
  getUserApplications: async (): Promise<Application[]> => {
    try {
      const response = await apiService.get<ApplicationsResponse>(
        API_CONFIG.ENDPOINTS.GET_USER_APPLICATIONS
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get application by ID
  getApplicationById: async (id: string): Promise<Application> => {
    try {
      const response = await apiService.get<{ success: boolean; data: Application }>(
        API_CONFIG.ENDPOINTS.GET_APPLICATION_BY_ID(id)
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Update application status (Admin)
  updateApplicationStatus: async (
    id: string,
    statusData: UpdateApplicationStatusRequest
  ): Promise<Application> => {
    try {
      const response = await apiService.patch<{ success: boolean; data: Application }>(
        API_CONFIG.ENDPOINTS.UPDATE_APPLICATION_STATUS(id),
        statusData
      );
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete application
  deleteApplication: async (id: string): Promise<void> => {
    try {
      await apiService.delete<{ success: boolean; message: string }>(
        API_CONFIG.ENDPOINTS.DELETE_APPLICATION(id)
      );
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get applications by status
  getApplicationsByStatus: async (status: string): Promise<Application[]> => {
    try {
      const allApplications = await applicationService.getUserApplications();
      return allApplications.filter((app) => app.status === status);
    } catch (error: any) {
      throw error;
    }
  },

  // Check if user has already applied to a scheme
  hasAppliedToScheme: async (schemeId: string): Promise<boolean> => {
    try {
      const applications = await applicationService.getUserApplications();
      return applications.some(
        (app) =>
          (typeof app.schemeId === 'string' ? app.schemeId : app.schemeId._id) === schemeId
      );
    } catch (error: any) {
      return false;
    }
  },
};

export default applicationService;
