import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';


export default function StudentProfile() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Assuming studentId is stored in localStorage after login
        const studentId = localStorage.getItem('studentId'); // Or get from context/auth state

        if (!studentId) {
          setError("Student ID not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/students/getById/${studentId}`);

        // Assuming the response structure is { message: '...', student: { ... } }
        setStudentData(response.data.student);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student data.");
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="bg-white p-8 rounded-xl shadow-md">Loading student profile...</div>;
  }

  if (error) {
    return <div className="bg-white p-8 rounded-xl shadow-md text-red-600">{error}</div>;
  }

  if (!studentData) {
    return <div className="bg-white p-8 rounded-xl shadow-md">No student data found.</div>;
  }

  // Prepare data for display, including parent info if populated
  const profileInfo = {
    name: studentData.name,
    gender: studentData.gender,
    dob: studentData.dob,
    religion: studentData.religion,
    email: studentData.email,
    admissionDate: studentData.admissionDate,
    class: studentData.class,
    section: studentData.section,
    roll: studentData.rollNumber, // Assuming roll number field name
    address: studentData.address,
    phone: studentData.phoneNumber, // Assuming phone number field name
    // Include parent info if available
    father: studentData.parentId?.father?.name || 'N/A',
    mother: studentData.parentId?.mother?.name || 'N/A',
    fatherOccupation: studentData.parentId?.father?.occupation || 'N/A',
    motherOccupation: studentData.parentId?.mother?.occupation || 'N/A',
    parentEmail: studentData.parentId?.father?.email || studentData.parentId?.mother?.email || 'N/A',
    parentPhone: studentData.parentId?.father?.mobile || studentData.parentId?.mother?.mobile || 'N/A',
  };


  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="font-bold text-3xl mb-6">About Me</h2>
      <div className="flex items-start gap-6">
        {/* <img
          src={studentData.profilePhoto || "https://i.ibb.co/YWqDPHb/avatar.png"} // Use fetched photo or default
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover" // Added object-cover for better image display
        /> */}
        <div>
          <h3 className="font-bold text-3xl mb-2">{profileInfo.name}</h3>
          {/* You might want to add a dynamic description here if available in data */}
          <p className="text-lg text-gray-600">
            Student Profile Information
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-6"> {/* Increased space between sections */}
        {/* Personal Information Section */}
        <div>
          <h3 className="font-bold text-2xl mb-4 border-b pb-2">Personal Information</h3> {/* Section title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg"> {/* Grid layout */}
            {/* Map over personal info keys */}
            {Object.entries(profileInfo)
              .filter(([key]) => ['name', 'gender', 'dob', 'religion', 'email', 'admissionDate', 'class', 'section', 'roll', 'address', 'phone'].includes(key))
              .map(([label, value]) => (
                <div key={label} className="flex flex-col"> {/* Use flex-col for label above value */}
                  <span className="font-semibold text-gray-600 capitalize">{label.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Parent/Guardian Information Section */}
        <div>
          <h3 className="font-bold text-2xl mb-4 border-b pb-2">Parent/Guardian Information</h3> {/* Section title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg"> {/* Grid layout */}
            {/* Map over parent info keys */}
            {Object.entries(profileInfo)
              .filter(([key]) => ['father', 'mother', 'fatherOccupation', 'motherOccupation', 'parentEmail', 'parentPhone'].includes(key))
              .map(([label, value]) => (
                <div key={label} className="flex flex-col"> {/* Use flex-col for label above value */}
                  <span className="font-semibold text-gray-600 capitalize">{label.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
