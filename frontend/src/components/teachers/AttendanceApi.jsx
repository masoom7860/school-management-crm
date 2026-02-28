import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const markAttendance = (data) => axios.post(`${BASE_URL}/attenddance/mark`, data);
export const getAttendanceBySchool = (schoolId) => axios.get(`${BASE_URL}/attenddance/school/${schoolId}`);
export const getStudentAttendance = (studentId) => axios.get(`${BASE_URL}/attenddance/student/${studentId}`);
export const updateAttendance = (attendanceId, data) => axios.put(`${BASE_URL}/attenddance/update/${attendanceId}`, data);
export const deleteAttendance = (attendanceId) => axios.delete(`${BASE_URL}/attenddance/delete/${attendanceId}`);
