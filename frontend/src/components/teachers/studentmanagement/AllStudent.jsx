import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentProfile from '../../students/StudentProfile'; // Import StudentProfile
import axiosInstance from '../../../api/axiosInstance';
import jwtDecode from 'jwt-decode'; // Keep jwtDecode for delete
import { toast } from 'react-hot-toast';

const AllStudent = ({ students, loading, error, setStudents }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null); // State to hold selected student ID
  const navigate = useNavigate();

  const handleEdit = (studentId) => {
    console.log(`Edit student with ID: ${studentId}`);
    // TODO: Implement navigation to edit page or open edit modal
    // navigate(`/edit-student/${studentId}`);
  };

  const handleView = (studentId) => {
    console.log(`View student with ID: ${studentId}`);
    // Set the selected student ID to display the profile on the same page
    setSelectedStudentId(studentId);
  };

  const handleCloseProfile = () => {
    setSelectedStudentId(null); // Clear selected student ID to hide the profile
  };

  const handleDelete = async (studentId) => {
    console.log(`Delete student with ID: ${studentId}`);
    // TODO: Implement delete API call and update state
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      navigate('/login');
      return;
    }
    try {
      const response = await axiosInstance.delete(`/api/students/delete/${studentId}`);
      if (response.data.message) {
        toast.success(response.data.message);
        setStudents(students.filter(student => student._id !== studentId));
      }
    } catch (err) {
      console.error('Error deleting student:', err?.response?.data || err.message);
      toast.error(`Failed to delete student: ${err?.response?.data?.message || err.message}`);
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/login');
      }
    }
  };

  // Loading and error handling will be done in the parent component
  // No need for local loading/error state or initial empty check here

  const isAbsoluteUrl = (url) => /^(https?:\/\/)/i.test(url || '');
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (isAbsoluteUrl(url)) return url;
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const clean = url.replace(/^\//, '');
    return `${BASE_URL}/${clean}`;
  };

  return (
    <div className="p-4">
      {selectedStudentId ? (
        // Render StudentProfile if a student is selected
        <div className="relative">
          <button
            onClick={handleCloseProfile}
            className="absolute top-0 right-0 mt-2 mr-2 bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
          >
            Close
          </button>
          <StudentProfile studentId={selectedStudentId} />
        </div>
      ) : (
        // Render the student list if no student is selected
        <>
          <h2 className="text-2xl font-bold mb-4">All Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Photo</th>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Mobile / Email</th>
                  <th className="py-2 px-4 border-b text-left">RegNo/DOB</th>
                  <th className="py-2 px-4 border-b text-left">ACTIONS</th> {/* Changed header to match image */}
                </tr>
              </thead>
              <tbody>
                {(students || []).map((student) => (
                  <tr key={student._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">
                      {student.profilePhoto && (
                        <div className="relative group inline-block">
                          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                          <img
                            src={getAbsoluteUrl(student.profilePhoto)}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border"
                            onError={(e)=>{e.currentTarget.style.display='none'}}
                          />
                          <div className="absolute z-50 hidden group-hover:block -top-2 left-12">
                            <img
                              src={getAbsoluteUrl(student.profilePhoto)}
                              alt="Profile Large"
                              className="w-40 h-40 rounded-lg object-cover border shadow-xl bg-white"
                              onError={(e)=>{e.currentTarget.style.display='none'}}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {student.name}
                      {/* TODO: Add student role/tag if available in data */}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {/* Added styling for phone number to resemble button */}
                      <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-1">{student.phone}</span><br />{student.email}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {/* Assuming RegNo is available as student.regNo */}
                      {student.regNo || 'N/A'}<br />{student.dob ? new Date(student.dob).toLocaleDateString() : ''}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {/* Replaced buttons with icons */}
                      {/* TODO: Replace with actual icon components (e.g., Font Awesome) */}
                      <button
                        onClick={() => handleView(student._id)}
                        className="text-green-600 hover:text-green-800 mr-2"
                        title="View"
                      >
                        👁️ {/* Placeholder for View icon */}
                      </button>
                      <button
                        // Uncommented Edit handler
                        onClick={() => handleEdit(student._id)}
                        className="text-red-600 hover:text-red-800 mr-2"
                        title="Edit"
                      >
                        Edit
                      </button>

                      ✏️ {/* Placeholder for Edit icon */}
                    {/* </button> */}
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️ {/* Placeholder for Delete icon */}
                    </button>
                  </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
    </>
  )
}
    </div >
  );
};

export default AllStudent;
