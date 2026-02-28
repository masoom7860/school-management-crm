import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with auth and School-ID headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const schoolId = localStorage.getItem("schoolId");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (schoolId) config.headers["School-ID"] = schoolId;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const fetchCertificatesBySchool = async (schoolId) => {
  const res = await api.get(`/api/certificates/school/${schoolId}`);
  return res.data;
};

export const fetchStudentsByClassAndSection = async (params) => {
  const res = await api.get(`/api/certificates/students`, { params });
  return res.data; // { success, data, count }
};

export const createCertificate = async (data) => {
  const res = await api.post(`/api/certificates/create`, data);
  return res.data;
};

export const updateCertificate = async (id, data) => {
  const res = await api.put(`/api/certificates/update/${id}`, data);
  return res.data;
};

export const deleteCertificate = async (id) => {
  const res = await api.delete(`/api/certificates/delete/${id}`);
  return res.data;
};

export const fetchHouses = async () => {
  const res = await api.get(`/api/certificates/houses`);
  return res.data; // { success, data }
};
