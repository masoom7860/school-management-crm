import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const schoolId = localStorage.getItem('schoolId');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (schoolId) {
      config.headers['School-ID'] = schoolId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get all exams for the authenticated school
 */
export const getAllExams = async (schoolId) => {
  try {
    const response = await api.get(`/api/exams/all/${schoolId}`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getAllExams
};
