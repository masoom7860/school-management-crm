import React, { useState, useEffect } from 'react'; // Import React, useState, useEffect
import axios from 'axios'; // Import axios
import jwtDecode from 'jwt-decode'; // Import jwtDecode
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';

import StudentStatsNotifications from './StudentStatsNotifications'
import StudentList from './StudentList'
import TeachersProfile from './TeachersProfile'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Define BASE_URL

const TeacherData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const schoolId = decoded.schoolId;
        const role = localStorage.getItem('role');
        const teacherId = localStorage.getItem('teacherId');

        if (!schoolId) {
          setError("School ID not found in token.");
          setLoading(false);
          return;
        }

        let response;
        if (role === 'teacher' && teacherId) {
          response = await axios.get(`${BASE_URL}/api/students/teacher/${teacherId}/students`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'School-ID': schoolId
            }
          });
        } else {
          response = await axios.get(`${BASE_URL}/api/students/get/${schoolId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        if (response.data && response.data.students) {
          setStudents(response.data.students);
        } else {
          setStudents([]);
        }
        setLoading(false);

      } catch (err) {
        console.error('Error fetching students:', err.response || err.message);
        setError("Failed to fetch students.");
        setLoading(false);
        if (err?.response?.status === 401) {
             localStorage.removeItem("token");
             navigate('/login');
        }
      }
    };

    fetchStudents();
  }, [navigate]); // Add navigate to dependency array

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
        <TeachersProfile />
      </motion.div>
      {/* Pass students, loading, and error as props */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <StudentStatsNotifications students={students} loading={loading} error={error} />
      </motion.div>
      {/* Uncomment and pass students, loading, and error as props */}
      {/* <StudentList students={students} loading={loading} error={error} /> */}
    </motion.div>
  )
}

export default TeacherData
