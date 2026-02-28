import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const schoolId = localStorage.getItem('schoolId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (schoolId) config.headers['School-ID'] = schoolId;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Marksheets
export const listMarksheets = async (params = {}) => {
  const res = await api.get('/api/marksheets', { params });
  return res.data;
};

export const getMarksheetById = async (id) => {
  const res = await api.get(`/api/marksheets/${id}`);
  return res.data;
};

export const createMarksheet = async (data) => {
  // Remove schoolId from payload before sending
  const { schoolId, ...payload } = data;
  const res = await api.post('/api/marksheets', payload);
  return res.data;
};

export const updateMarksheet = async (id, data) => {
  const res = await api.put(`/api/marksheets/${id}`, data);
  return res.data;
};

export const deleteMarksheet = async (id) => {
  const res = await api.delete(`/api/marksheets/${id}`);
  return res.data;
};

export const downloadMarksheetPdf = async (id) => {
  const res = await api.get(`/api/marksheets/${id}/pdf`, { responseType: 'blob' });
  return res.data; // blob
};

// Supporting dropdowns
export const getStudents = async (params = {}) => {
  const res = await api.get('/api/students', { params });
  return res.data;
};

export const getExams = async (params = {}) => {
  const res = await api.get('/api/exams', { params });
  return res.data;
};

export const getClasses = async () => {
  const res = await api.get('/api/classes');
  return res.data;
};

export const getSections = async (classId, schoolId) => {
  const res = await api.get('/api/sections', { params: { classId, schoolId } });
  return res.data;
};

export const getSessions = async () => {
  const res = await api.get('/api/sessions');
  return res.data;
};

export const getSubjects = async (classId, sectionId, schoolId) => {
  const res = await api.get('/api/subjects', { params: { classId, sectionId, schoolId } });
  return res.data;
};
// ✅ Fetch Max Marks Configuration
export const getMaxMarksConfig = async (examId, classId, sectionId) => {
  try {
    const res = await api.get(`/api/marksheets/max-marks-config`, {
      params: { examId, classId, sectionId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching max marks config:', error);
    throw error.response?.data || { message: 'Server error' };
  }
};

export default {
  listMarksheets,
  getMarksheetById,
  createMarksheet,
  updateMarksheet,
  deleteMarksheet,
  downloadMarksheetPdf,
  getStudents,
  getExams,
  getClasses,
  getSections,
  getSessions,
  getSubjects,
  getMaxMarksConfig // ✅ added here
};
