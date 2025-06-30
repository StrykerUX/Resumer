import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://resumer.novalabss.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
};

// Profile API
export const profileAPI = {
  saveBasicData: (data) => api.post('/api/profile/basic-data', data),
  getBasicData: () => api.get('/api/profile/basic-data'),
};

// CV API
export const cvAPI = {
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post('/api/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getParsedData: () => api.get('/api/cv/parsed-data'),
  getRecommendations: () => api.get('/api/cv/recommendations'),
  getPreview: (id) => api.get(`/api/cv/preview/${id}`),
  download: (id) => api.get(`/api/cv/download/${id}`, { 
    responseType: 'blob' 
  }),
};

// Generate API
export const generateAPI = {
  analyzeJob: (jobDescription) => api.post('/api/generate/analyze-job', { jobDescription }),
  adaptCV: (data) => api.post('/api/generate/adapt-cv', data),
  getGeneration: (id) => api.get(`/api/generate/${id}`),
};

// Health API
export const healthAPI = {
  status: () => api.get('/api/status'),
  health: () => api.get('/health'),
};

export default api;