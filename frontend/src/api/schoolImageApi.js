import axiosInstance from './axiosInstance';

export const getSchoolImages = async (schoolId) => {
  if (!schoolId) throw new Error('schoolId is required');
  const res = await axiosInstance.get(`/api/school-images/${schoolId}`);
  return res.data; // { success: true, data: [ { type, imageUrl, ... } ] }
};

export const getSchoolImageByType = async (schoolId, type) => {
  const res = await getSchoolImages(schoolId);
  const images = res?.data || [];
  return images.find((img) => img.type === type) || null;
};

export const uploadSchoolImage = async (schoolId, type, file) => {
  if (!schoolId || !type || !file) throw new Error('schoolId, type and file are required');
  const formData = new FormData();
  formData.append('image', file);
  const res = await axiosInstance.post(`/api/school-images/${schoolId}/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { success, message, data }
};

export const deleteSchoolImage = async (schoolId, type) => {
  if (!schoolId || !type) throw new Error('schoolId and type are required');
  const res = await axiosInstance.delete(`/api/school-images/${schoolId}/${type}`);
  return res.data; // { success, message }
};
