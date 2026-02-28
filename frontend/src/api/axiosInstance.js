import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Use environment variable or default
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    const schoolId = localStorage.getItem('schoolId'); // Assuming schoolId is stored in localStorage

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login
      console.error('Unauthorized: Invalid or expired token. Redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('schoolId');
      // You might want to use a more robust navigation solution here,
      // like a history object from react-router-dom or a global state.
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
