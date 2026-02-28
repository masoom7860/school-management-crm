// StudentFeeManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import StudentFeeManagementView from './studenFeeManagement/StudentFeeManagementView';
import { getAllStudentFees } from '../../api/studentFeeApi';
import { getSessions } from '../../api/sessionsApi'; // Import getSessions
import { getStudentsBySchoolId } from '../../api/studentApi';

const StudentFeeManagement = () => {
  const navigate = useNavigate();
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const [filter, setFilter] = useState({
    classId: '',
    academicYear: '',
    status: '',
    studentId: '',
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setSchoolId(decoded.schoolId);
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSessionsData = async () => {
      if (!schoolId) return;
      setLoadingAcademicYears(true);
      try {
        const sessionsResponse = await getSessions();
        const sessions = sessionsResponse.data || []; // Assuming getSessions returns { data: [...] }
        // Transform sessions into the format expected by the components: { value: string, label: string, isActive: boolean }
        const academicYearsData = sessions.map(session => ({
          value: session._id, // Use _id as the value
          label: session.yearRange, // Use yearRange as the label
          isActive: session.isActive || false, // Assuming sessions might have an isActive flag
        }));
        setAcademicYears(academicYearsData);
      } catch (error) {
        console.error('Error fetching academic years from sessions:', error);
        toast.error('Failed to load academic years');
      } finally {
        setLoadingAcademicYears(false);
      }
    };
    fetchSessionsData();
  }, [schoolId]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      if (!schoolId) return;
      setLoadingStudents(true);
      try {
        const res = await getStudentsBySchoolId(schoolId);
        // Backend returns shape: { message, students: [...] }
        setStudents(res?.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudentsData();
  }, [schoolId]);

  const fetchStudentFees = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const response = await getAllStudentFees(schoolId, filter);
      setStudentFees(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch student fees');
      console.error('Fetch student fees error:', error);
    } finally {
      setLoading(false);
    }
  }, [schoolId, filter]);

  useEffect(() => {
    fetchStudentFees();
  }, [fetchStudentFees]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilter({
      classId: '',
      academicYear: '',
      status: '',
      studentId: '',
    });
  };

  return (
    <StudentFeeManagementView
      studentFees={studentFees}
      loading={loading}
      filter={filter}
      handleFilterChange={handleFilterChange}
      clearFilters={clearFilters}
      academicYears={academicYears}
      loadingAcademicYears={loadingAcademicYears}
      students={students}
      loadingStudents={loadingStudents}
      schoolId={schoolId}
      fetchStudentFees={fetchStudentFees}
    />
  );
};

export default StudentFeeManagement;
