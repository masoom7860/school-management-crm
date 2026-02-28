import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const schoolId = localStorage.getItem('schoolId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (schoolId) config.headers['School-ID'] = schoolId;
  return config;
});

api.interceptors.response.use((res) => res, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const getSessions = async () => {
  const res = await api.get('/api/sessions');
  return res.data;
};

export const getSessionById = async (id) => {
  const res = await api.get(`/api/sessions/${id}`);
  return res.data;
};

export const createSession = async (payload) => {
  const res = await api.post('/api/sessions', payload);
  return res.data;
};

export const updateSession = async (id, payload) => {
  const res = await api.put(`/api/sessions/${id}`, payload);
  return res.data;
};

export const deleteSession = async (id) => {
  const res = await api.delete(`/api/sessions/${id}`);
  return res.data;
};

export const activateSession = async (id) => {
  const res = await api.post(`/api/sessions/${id}/activate`);
  return res.data;
};

export default {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  activateSession,
};

