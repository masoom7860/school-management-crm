import axiosInstance from './axiosInstance';

const normalizeTemplateResponse = (payload) => {
  if (!payload) return null;

  const data = payload.data ?? payload.template ?? payload.templateJson ?? payload;

  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse ID card template JSON string:', err);
      return null;
    }
  }

  if (data?.templateJson) {
    try {
      return JSON.parse(data.templateJson);
    } catch (err) {
      console.error('Failed to parse ID card template templateJson:', err);
      return data;
    }
  }

  return data;
};

export const getIdCardTemplate = async (type = 'student') => {
  try {
    const response = await axiosInstance.get('/api/id-card-templates', {
      params: { type },
    });
    if (!response) return null;
    const raw = response.data?.data ?? response.data;
    return normalizeTemplateResponse(raw);
  } catch (error) {
    console.error('Failed to fetch ID card template:', error);
    return null;
  }
};

export const saveIdCardTemplate = async ({ type = 'student', template }) => {
  const payload = typeof template === 'string' ? template : JSON.stringify(template ?? {});
  const body = { type, templateJson: payload };
  const response = await axiosInstance.put('/api/id-card-templates', body);
  return response.data;
};
