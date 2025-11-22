import axios from 'axios';

// Backend Express API (port 5001)
const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================
// AUTH APIs
// ========================
export const authAPI = {
  register: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true }; // Always succeed
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// ========================
// PREDICTION APIs
// ========================
export const predictionAPI = {
  makePrediction: async (medicalData) => {
    try {
      const response = await apiClient.post('/predict', medicalData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getHistory: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/predict/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getPatientPredictions: async (patientId) => {
    try {
      const response = await apiClient.get(`/predict/patient/${patientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getPredictionById: async (id) => {
    try {
      const response = await apiClient.get(`/predict/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  verifyPrediction: async (id) => {
    try {
      const response = await apiClient.post(`/predict/verify/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
};

// ========================
// BLOCKCHAIN APIs
// ========================
export const blockchainAPI = {
  getLatestBlock: async () => {
    try {
      const response = await apiClient.get('/blockchain/latest');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getFullBlockchain: async () => {
    try {
      const response = await apiClient.get('/blockchain/full');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getPatientHistory: async (patientId) => {
    try {
      const response = await apiClient.get(`/blockchain/patient/${patientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  validateBlockchain: async () => {
    try {
      const response = await apiClient.post('/blockchain/validate');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
};

// ========================
// FEATURES APIs
// ========================
export const featuresAPI = {
  getInfo: async () => {
    try {
      const response = await apiClient.get('/features/info');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
};

// ========================
// HEALTH CHECK API
// ========================
export const healthAPI = {
  check: async () => {
    try {
      const response = await axios.get('http://localhost:5001/health');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  checkMLAPI: async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/health', { timeout: 5000 });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: 'ML API unavailable'
      };
    }
  }
};

export default {
  auth: authAPI,
  prediction: predictionAPI,
  blockchain: blockchainAPI,
  features: featuresAPI,
  health: healthAPI
};
