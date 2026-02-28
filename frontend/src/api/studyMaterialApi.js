import axiosInstance from './axiosInstance';

export const uploadStudyMaterial = async ({ title, description, subject, classId, sectionId, type, dueDate, targetStudentId, file }) => {
  const form = new FormData();
  form.append('title', title);
  if (description) form.append('description', description);
  form.append('subject', subject);
  if (classId) form.append('classId', classId);
  if (sectionId) form.append('sectionId', sectionId);
  if (type) form.append('type', type);
  if (dueDate) form.append('dueDate', dueDate);
  if (targetStudentId) form.append('targetStudentId', targetStudentId);
  form.append('file', file);
  const res = await axiosInstance.post('/api/study-materials', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getTeacherMaterials = async () => {
  const res = await axiosInstance.get('/api/study-materials/teacher');
  return res.data.materials || [];
};

export const getByClass = async ({ classId, sectionId }) => {
  const res = await axiosInstance.get('/api/study-materials', { params: { classId, sectionId } });
  return res.data.materials || [];
};

export const getStudentMaterials = async () => {
  const res = await axiosInstance.get('/api/study-materials/student');
  return res.data.materials || [];
};

export const deleteMaterial = async (id) => {
  const res = await axiosInstance.delete(`/api/study-materials/${id}`);
  return res.data;
};
