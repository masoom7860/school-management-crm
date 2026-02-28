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
 * Get all classes for the authenticated school
 */
export const getClasses = async () => {
  try {
    const response = await api.get('/api/classes');
    // Backend returns { success: true, data: classes }
    return response.data.success ? response.data.data : [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single class by ID
 */
export const getClassById = async (id) => {
  try {
    const response = await api.get(`/api/classes/${id}`);
    // Backend returns { class: classData }
    return response.data?.class || response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a new class
 */
export const createClass = async (classData) => {
  try {
    const response = await api.post('/api/classes', classData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update a class by ID
 */
export const updateClass = async (id, updateData) => {
  try {
    const response = await api.put(`/api/classes/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a class by ID
 */
export const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/api/classes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get sections for a specific class
 */
export const getSectionsByClass = async (classId) => {
  try {
    const response = await api.get(`/api/classes/sections?classId=${classId}`);
    return response.data.success ? response.data.sections : []; // Handle the correct response structure
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Add a section to a class
 */
export const addSectionToClass = async (classId, sectionData) => {
  try {
    const response = await api.post(`/api/classes/${classId}/sections`, sectionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update a section in a class
 */
export const updateSectionInClass = async (classId, sectionName, updateData) => {
  try {
    const response = await api.put(`/api/classes/${classId}/sections/${sectionName}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a section from a class
 */
export const deleteSectionFromClass = async (classId, sectionName) => {
  try {
    const response = await api.delete(`/api/classes/${classId}/sections/${sectionName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all classes with their sections
 */
export const getClassesWithSections = async () => {
  try {
    const response = await api.get('/api/classes/with-sections');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get classes assigned to the logged-in teacher
 */
export const getAssignedClasses = async () => {
  try {
    const response = await api.get('/api/classes/assigned');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get classes with sections assigned to the logged-in teacher
 */
export const getAssignedClassesWithSections = async () => {
  try {
    const response = await api.get('/api/classes/assigned-with-sections');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get class options for dropdowns
 */
export const getClassOptions = async () => {
  try {
    const classes = await getClasses(); // getClasses now returns the array directly
    return classes.map(cls => ({
      value: cls._id,
      label: cls.className
    }));
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get section options for a specific class
 */
export const getSectionOptions = async (classId) => {
  try {
    const sections = await getSectionsByClass(classId); // getSectionsByClass now returns the array directly
    return sections.map(section => ({
      value: section._id || section.name,
      label: section.name
    }));
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllClasses = async (schoolId) => {
  try {
    const response = await axios.get(`/api/classes/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

export const getStudentsByClassAndSection = async (classId, sectionId) => {
  try {
    const response = await api.get('/api/classes/students', {
      params: { classId, sectionId },
    });
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export default {
  getClasses,
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getSectionsByClass,
  addSectionToClass,
  updateSectionInClass,
  deleteSectionFromClass,
  getClassesWithSections,
  getClassOptions,
  getSectionOptions,
  getStudentsByClassAndSection,
  getAssignedClasses,
  getAssignedClassesWithSections
};
