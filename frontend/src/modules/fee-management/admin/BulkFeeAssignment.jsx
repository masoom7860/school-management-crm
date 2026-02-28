import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import jwt_decode from 'jwt-decode';
import { toast } from 'react-hot-toast';
import useSchoolClasses from '../../hooks/useSchoolClasses'; // Import the custom hook

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BulkFeeAssignment = () => {
  const [loading, setLoading] = useState(false); // Local loading for assignment action
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);
  const { classes, loading: classesLoading, error: classesError } = useSchoolClasses(); // Use the custom hook
  const [students, setStudents] = useState([]); // To potentially select specific students
  const [selectedFeeStructure, setSelectedFeeStructure] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of student IDs
  const [academicYear, setAcademicYear] = useState('');
  const [assignmentType, setAssignmentType] = useState('class'); // 'class' or 'students'
  const [schoolId, setSchoolId] = useState(null);
  const [token, setToken] = useState(null);


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedSchoolId = localStorage.getItem('schoolId');

    if (!storedToken || !storedSchoolId) {
      setError("Authentication token or School ID not found. Please log in again.");
      return;
    }
    setToken(storedToken);
    setSchoolId(storedSchoolId);

    try {
      const decodedToken = jwt_decode(storedToken);
      const userRole = decodedToken.role;

      if (!['admin', 'subadmin', 'staff'].includes(userRole)) {
        setError("Access denied. This page is for authorized staff/admins only.");
        return;
      }

      const fetchData = async () => {
        // setLoading(true); // Use local loading for assignment, not initial data fetch
        setError(null);
        try {
          // Fetch Fee Structures
          const feeStructuresResponse = await axiosInstance.get(`/api/fee-structures/list/${storedSchoolId}`);
          setFeeStructures(feeStructuresResponse.data?.data || feeStructuresResponse.data?.structures || []);

          // Fetch Students (optional, only if assigning to specific students)
          // Using the existing endpoint to get all students by school
           const studentsResponse = await axiosInstance.get(`/api/students/get/${storedSchoolId}`);
           setStudents(studentsResponse.data?.students || studentsResponse.data || []);


          // setLoading(false); // Use local loading for assignment
        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err.response?.data?.message || "Failed to load data for assignment.");
          // setLoading(false); // Use local loading for assignment
        }
      };

      fetchData();

    } catch (err) {
      console.error("Failed to decode token", err);
      setError("Invalid authentication token. Please log in again.");
      // setLoading(false); // Use local loading for assignment
    }
  }, []); // Depend on empty array to run once on mount


  const handleAssignment = async () => {
    setLoading(true); // Set local loading for assignment
    setError(null);
    setMessage(null);

    if (!selectedFeeStructure || !academicYear) {
      setError("Please select a Fee Structure and Academic Year.");
      setLoading(false);
      return;
    }

    const payload = {
      feeStructureId: selectedFeeStructure,
      academicYear: academicYear,
      schoolId: schoolId // Include schoolId in payload
    };

    if (assignmentType === 'class') {
      if (!selectedClass) {
        setError("Please select a Class for assignment.");
        setLoading(false);
        return;
      }
      payload.class = selectedClass;
    } else if (assignmentType === 'students') {
      if (selectedStudents.length === 0) {
        setError("Please select at least one student for assignment.");
        setLoading(false);
        return;
      }
      payload.studentIds = selectedStudents;
    }

    try {
      const response = await axiosInstance.post(`/api/student-fees/assign`, payload);

      setMessage(response.data.message);
      // Optionally clear form or update UI
      setSelectedFeeStructure('');
      setSelectedClass('');
      setSelectedStudents([]);
      setAcademicYear('');
      setLoading(false); // Unset local loading

    } catch (err) {
      console.error("Error during bulk fee assignment:", err);
      setError(err.response?.data?.message || "Failed to perform bulk fee assignment.");
      setLoading(false); // Unset local loading
    }
  };

  // Combine loading states for initial data fetch
  const initialLoading = loading || classesLoading;

  if (initialLoading) {
    return <div className="text-center py-8">Loading data...</div>;
  }

  if (error || classesError) {
    return <div className="text-red-500 text-center py-8">{error || classesError}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Bulk Fee Assignment</h1>

      {message && <div className="bg-green-200 text-green-800 p-3 rounded mb-4">{message}</div>}
      {error && <div className="text-red-500 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feeStructure">
            Select Fee Structure:
          </label>
          <select
            id="feeStructure"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedFeeStructure}
            onChange={(e) => setSelectedFeeStructure(e.target.value)}
            required
          >
            <option value="">-- Select Fee Structure --</option>
            {feeStructures.map(structure => (
              <option key={structure._id} value={structure._id}>
                {/* Assuming structure.class is the class ID, need to display class name */}
                {`Fee Structure for Class ID: ${structure.class} - Total: ₹${structure.tuitionFee + structure.examFee + structure.transportFee + structure.hostelFee + structure.otherCharges}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="academicYear">
            Academic Year:
          </label>
          <input
            type="text"
            id="academicYear"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g., 2023-2024"
            required
          />
        </div>

        <div className="mb-4">
           <label className="block text-gray-700 text-sm font-bold mb-2">
             Assign To:
           </label>
           <div className="mt-2">
             <label className="inline-flex items-center mr-6">
               <input
                 type="radio"
                 className="form-radio"
                 name="assignmentType"
                 value="class"
                 checked={assignmentType === 'class'}
                 onChange={() => setAssignmentType('class')}
               />
               <span className="ml-2">Entire Class</span>
             </label>
             <label className="inline-flex items-center">
               <input
                 type="radio"
                 className="form-radio"
                 name="assignmentType"
                 value="students"
                 checked={assignmentType === 'students'}
                 onChange={() => setAssignmentType('students')}
               />
               <span className="ml-2">Specific Students</span>
             </label>
           </div>
        </div>

        {assignmentType === 'class' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="class">
              Select Class:
            </label>
            <select
              id="class"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required={assignmentType === 'class'}
              disabled={classesLoading} // Disable while classes are loading
            >
              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}> {/* Use _id as value */}
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
        )}

        {assignmentType === 'students' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="students">
              Select Students:
            </label>
            {/* This could be a multi-select dropdown or a list with checkboxes */}
            {/* For simplicity, let's use a basic select for now, but a proper multi-select component would be better */}
             <select
               id="students"
               className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               multiple // Enable multi-select
               value={selectedStudents}
               onChange={(e) => {
                 const options = e.target.options;
                 const value = [];
                 for (let i = 0, l = options.length; i < l; i++) {
                   if (options[i].selected) {
                     value.push(options[i].value);
                   }
                 }
                 setSelectedStudents(value);
               }}
               required={assignmentType === 'students'}
               size={students.length > 5 ? 10 : students.length + 1} // Adjust size based on number of students
             >
               <option value="" disabled>-- Select Students --</option>
               {students.map(student => (
                 <option key={student._id} value={student._id}>
                   {`${student.name} (Class: ${student.class})`} {/* Assuming student object has _id, name, and class */}
                 </option>
               ))}
             </select>
             <p className="text-sm text-gray-600 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple students.</p>
          </div>
        )}


        <button
          onClick={handleAssignment}
          disabled={loading || !selectedFeeStructure || !academicYear || (assignmentType === 'class' && !selectedClass) || (assignmentType === 'students' && selectedStudents.length === 0)}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-red-600 transition"
        >
          {loading ? 'Assigning...' : 'Assign Fees'}
        </button>
      </div>
    </div>
  );
};

export default BulkFeeAssignment;
