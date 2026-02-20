// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Auth endpoints
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    GET_PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile',
    
    // Scheme endpoints
    GET_ALL_SCHEMES: '/api/schemes',
    GET_SCHEME_BY_ID: (id: string) => `/api/schemes/${id}`,
    GET_RECOMMENDED_SCHEMES: '/api/schemes/user/recommended',
    
    // Application endpoints
    CREATE_APPLICATION: '/api/applications',
    GET_USER_APPLICATIONS: '/api/applications',
    GET_APPLICATION_BY_ID: (id: string) => `/api/applications/${id}`,
    UPDATE_APPLICATION_STATUS: (id: string) => `/api/applications/${id}/status`,
    DELETE_APPLICATION: (id: string) => `/api/applications/${id}`,
    
    // Document endpoints
    UPLOAD_DOCUMENT: '/api/documents/upload',
    GET_USER_DOCUMENTS: '/api/documents',
    DELETE_DOCUMENT: (id: string) => `/api/documents/${id}`,
  },
};

export default API_CONFIG;
