import axiosInstance from './axiosInstance';

export const getSubjects = async ({ classId, sectionId } = {}) => {
  const res = await axiosInstance.get('/api/subjects', { params: { classId, sectionId } });
  return res.data?.data || [];
};

export default { getSubjects };
