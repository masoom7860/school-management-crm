import axiosInstance from './axiosInstance';
import { getSessions } from './sessionsApi';

const API_URL = '/api/fee-structures'; // Base URL for fee structure endpoints

// Create Fee Structure
export const createFeeStructure = async (feeStructureData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/create`, feeStructureData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all Fee Structures for a School
export const getFeeStructures = async (schoolId, queryParams = {}) => {
  try {
    // Explicitly request population for classId and sectionId
    const defaultPopulate = 'classId,sectionId';
    const finalQueryParams = {
      ...queryParams,
      populate: queryParams.populate ? `${queryParams.populate},${defaultPopulate}` : defaultPopulate
    };
    const queryString = new URLSearchParams(finalQueryParams).toString();
    const response = await axiosInstance.get(`${API_URL}/list/${schoolId}?${queryString}`);
    return response.data; // { success, data }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update Fee Structure
export const updateFeeStructure = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/update/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete Fee Structure
export const deleteFeeStructure = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default { createFeeStructure, getFeeStructures, updateFeeStructure, deleteFeeStructure };
