// Example student fetch API

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getStudentsBySchool = (schoolId) =>
    axios.get(`${BASE_URL}/students/school/${schoolId}`);
  