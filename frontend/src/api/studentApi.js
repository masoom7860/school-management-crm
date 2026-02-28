import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add token to headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getStudentsBySchoolId = async (schoolId) => {
  if (!schoolId) {
    throw new Error('School ID is required to fetch students.');
  }
  const response = await api.get(`/api/students/get/${schoolId}`);
  return response.data;
};

export const getStudentsByClass = async (classId, schoolId) => {
  if (!classId) {
    throw new Error('Class ID is required to fetch students by class.');
  }
  // Assuming getStudentsByQuery can handle classId as a parameter
  const response = await getStudentsByQuery({ classId, schoolId });
  return response.data;
};

export const getStudentsByQuery = async (params = {}) => {
  const queryParams = new URLSearchParams();

  // Add query parameters
  if (params.classId) queryParams.append('classId', params.classId);
  if (params.section) queryParams.append('section', params.section);
  if (params.academicYear) queryParams.append('academicYear', params.academicYear);
  if (params.teacherId) queryParams.append('teacherId', params.teacherId);

  const queryString = queryParams.toString();
  const url = `/api/students${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.data;
};
