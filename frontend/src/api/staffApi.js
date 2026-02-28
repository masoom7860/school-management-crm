import axiosInstance from './axiosInstance';

export const getStaffBySchoolId = async (schoolId) => {
  if (!schoolId) throw new Error('schoolId is required');
  const res = await axiosInstance.get(`/api/staffs/getstaff/${schoolId}`);
  // Backend returns { staff: [...] }
  return res.data;
};
