import axiosInstance from './axiosInstance';

const API_URL = '/api/student-fees'; // Base URL for student fee endpoints

// Assign Fee to Student(s)
export const assignStudentFee = async (feeAssignmentData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/assign`, feeAssignmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all Student Fees for a School
export const getAllStudentFees = async (schoolId, queryParams = {}) => {
  try {
    // Explicitly request population for studentId, feeStructureId, and classId
    const defaultPopulate = 'studentId,feeStructureId,classId';
    // Also request only the key fields we need (backend should safely ignore if unsupported)
    // Include 'name' for schemas that store full name in a single field
    const defaultPopulateFields = 'studentId:name,firstName,lastName,admissionNumber;feeStructureId:name,academicYear;classId:className';
    const finalQueryParams = {
      ...queryParams,
      populate: queryParams.populate ? `${queryParams.populate},${defaultPopulate}` : defaultPopulate,
      populateFields: queryParams.populateFields ? `${queryParams.populateFields};${defaultPopulateFields}` : defaultPopulateFields,
    };
    const queryString = new URLSearchParams(finalQueryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/all/${schoolId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get specific Student’s Fee Records
export const getStudentFees = async (studentId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString
      ? `${API_URL}/student/${studentId}?${queryString}`
      : `${API_URL}/student/${studentId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add Payment (updates paid, due, status)
export const addStudentPayment = async (studentFeeId, paymentData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/${studentFeeId}/pay`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate Receipt (PDF/Print)
export const generateReceiptPdf = async (studentFeeId, receiptNumber) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${studentFeeId}/receipt/${receiptNumber}`, {
      responseType: 'blob', // Important for handling PDF
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get Fee Defaulters Report
export const getFeeDefaulters = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/defaulters/${schoolId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate Fee Defaulters PDF
export const generateFeeDefaultersPdf = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/defaulters/${schoolId}/pdf?${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get Monthly Collection Summary Report
export const getMonthlyCollectionSummary = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/monthly-summary/${schoolId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Send Due Fee Notifications
export const sendDueFeeNotifications = async (schoolId, notificationData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/notifications/${schoolId}`, notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate Monthly Collection Summary PDF
export const generateMonthlyCollectionPdf = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/monthly-summary/${schoolId}/pdf?${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get Class/Section-wise Revenue Report
export const getClassWiseRevenue = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/class-revenue/${schoolId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate Class/Section-wise Revenue PDF
export const generateClassWiseRevenuePdf = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/class-revenue/${schoolId}/pdf?${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get Pending vs Collected Report
export const getPendingVsCollectedReport = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/pending-vs-collected/${schoolId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate Pending vs Collected Report PDF
export const generatePendingVsCollectedPdf = async (schoolId, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/pending-vs-collected/${schoolId}/pdf?${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
