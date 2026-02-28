import axiosInstance from './axiosInstance';

const API_URL = '/api/fees';

const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  const query = new URLSearchParams();
  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          query.append(key, item);
        }
      });
    } else {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Fee Months
export const createFeeMonth = async (payload) => {
  const { schoolId, sessionId, name, code, order, dueDate, isActive, metadata } = payload;
  return axiosInstance.post(`${API_URL}/months`, {
    schoolId,
    sessionId,
    name,
    code,
    order,
    dueDate,
    isActive,
    metadata,
  }).then((res) => res.data);
};

export const getFeeMonths = async (schoolId, params = {}) => {
  const queryString = buildQueryString(params);
  return axiosInstance
    .get(`${API_URL}/months/${schoolId}${queryString}`)
    .then((res) => res.data);
};

export const updateFeeMonth = async (id, payload) => {
  return axiosInstance.put(`${API_URL}/months/${id}`, payload).then((res) => res.data);
};

export const deleteFeeMonth = async (id) => {
  return axiosInstance.delete(`${API_URL}/months/${id}`).then((res) => res.data);
};

// Class Monthly Fees
export const saveClassMonthlyFee = async (payload) => {
  return axiosInstance.post(`${API_URL}/class-fees`, payload).then((res) => res.data);
};

export const getClassMonthlyFees = async (schoolId, params = {}) => {
  const queryString = buildQueryString(params);
  return axiosInstance
    .get(`${API_URL}/class-fees/${schoolId}${queryString}`)
    .then((res) => res.data);
};

export const deleteClassMonthlyFee = async (id) => {
  return axiosInstance.delete(`${API_URL}/class-fees/${id}`).then((res) => res.data);
};

// Student Ledgers
export const getStudentFeeLedgers = async (schoolId, params = {}) => {
  const queryString = buildQueryString(params);
  return axiosInstance
    .get(`${API_URL}/ledgers/${schoolId}${queryString}`)
    .then((res) => res.data);
};

export const createStudentFeeLedger = async (payload) => {
  return axiosInstance.post(`${API_URL}/ledgers`, payload).then((res) => res.data);
};

export const addLedgerPayment = async (ledgerId, payload) => {
  return axiosInstance
    .post(`${API_URL}/ledgers/${ledgerId}/payments`, payload)
    .then((res) => res.data);
};

export const downloadLedgerReceipt = async (ledgerId, receiptNumber) => {
  return axiosInstance
    .get(`${API_URL}/ledgers/${ledgerId}/receipts/${receiptNumber}`, {
      responseType: 'blob',
    })
    .then((res) => res.data);
};

export const deleteLedger = async (id) => {
  return axiosInstance.delete(`${API_URL}/ledgers/${id}`).then((res) => res.data);
};

// Supporting lookups
export const getFeeSessions = async (schoolId) => {
  return axiosInstance.get(`${API_URL}/sessions/${schoolId}`).then((res) => res.data);
};

export const getFeeDependencies = async (schoolId) => {
  return axiosInstance.get(`${API_URL}/dependencies/${schoolId}`).then((res) => res.data);
};
