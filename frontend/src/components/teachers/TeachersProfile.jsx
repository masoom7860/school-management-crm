import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";

const TeachersProfile = () => {
  // Assuming teacherId is stored in localStorage after login
  const teacherId = localStorage.getItem('teacherId'); // Or get from context/auth state
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const schoolId = localStorage.getItem("schoolId");
  const token = localStorage.getItem("token");

  const fetchTeacherData = useCallback(async () => {
    if (!teacherId) {
      setError("Teacher ID not found in local storage. Please log in.");
      setLoading(false);
      return;
    }
    if (!schoolId || !token) {
      setError("Missing school ID or authentication token in local storage.");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/teachers/single/${teacherId}`);
      setTeacherData(res.data.teacher);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teacher data:", err);
      setError(err.response?.data?.message || "Error fetching teacher data.");
      setLoading(false);
    }
  }, [teacherId, schoolId, token]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  if (loading) {
    return <div className="text-center text-gray-600">Loading teacher profile...</div>;
  }

  if (error) {
    return <div className="text-center text-blue-500">Error: {error}</div>;
  }

  if (!teacherData) {
    return <div className="text-center text-gray-600">Teacher data not found.</div>;
  }

  const showAddress = false;
  const showEmergency = false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Teacher Profile</h1>

      <div className="space-y-6 text-gray-700">
        {/* Personal Details Section */}
        <motion.div className="border-b pb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h4 className="text-xl font-semibold mb-3 text-gray-800">Personal Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherData.name && <div><span className="font-semibold">Full Name:</span> {teacherData.name}</div>}
            {teacherData.gender && <div><span className="font-semibold">Gender:</span> {teacherData.gender}</div>}
            {teacherData.dob && <div><span className="font-semibold">Date of Birth:</span> {new Date(teacherData.dob).toLocaleDateString()}</div>}
            {teacherData.identityType && <div><span className="font-semibold">Identity Type:</span> {teacherData.identityType}</div>}
            {teacherData.nationalId && <div><span className="font-semibold">National ID:</span> {teacherData.nationalId}</div>}
            {teacherData.email && <div><span className="font-semibold">Email:</span> {teacherData.email}</div>}
            {teacherData.phone && <div><span className="font-semibold">Phone:</span> {teacherData.phone}</div>}
          </div>
        </motion.div>

        {/* Address Section */}
        {showAddress && teacherData.address && (
          <motion.div className="border-b pb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherData.address.street && <div><span className="font-semibold">Street:</span> {teacherData.address.street}</div>}
              {teacherData.address.city && <div><span className="font-semibold">City:</span> {teacherData.address.city}</div>}
              {teacherData.address.state && <div><span className="font-semibold">State:</span> {teacherData.address.state}</div>}
              {teacherData.address.pincode && <div><span className="font-semibold">Pincode:</span> {teacherData.address.pincode}</div>}
              {teacherData.address.country && <div><span className="font-semibold">Country:</span> {teacherData.address.country}</div>}
            </div>
          </motion.div>
        )}

        {/* Emergency Contact Section */}
        {showEmergency && teacherData.emergencyContact && (
          <motion.div className="border-b pb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherData.emergencyContact.name && <div><span className="font-semibold">Name:</span> {teacherData.emergencyContact.name}</div>}
              {teacherData.emergencyContact.relation && <div><span className="font-semibold">Relation:</span> {teacherData.emergencyContact.relation}</div>}
              {teacherData.emergencyContact.phone && <div><span className="font-semibold">Phone:</span> {teacherData.emergencyContact.phone}</div>}
            </div>
          </motion.div>
        )}

        {/* Professional Info Section */}
        <motion.div className="pb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h4 className="text-xl font-semibold mb-3 text-gray-800">Professional Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherData.qualification && <div><span className="font-semibold">Qualification:</span> {teacherData.qualification}</div>}
            {teacherData.experience !== undefined && teacherData.experience !== null && <div><span className="font-semibold">Experience:</span> {teacherData.experience} years</div>}
            {teacherData.designation && <div><span className="font-semibold">Designation:</span> {teacherData.designation}</div>}
            {teacherData.employeeId && <div><span className="font-semibold">Employee ID:</span> {teacherData.employeeId}</div>}
            {teacherData.joiningDate && <div><span className="font-semibold">Joining Date:</span> {new Date(teacherData.joiningDate).toLocaleDateString()}</div>}
            {teacherData.subjects && teacherData.subjects.length > 0 && (
              <div className="md:col-span-2">
                <span className="font-semibold">Subjects:</span> {teacherData.subjects.join(', ')}
              </div>
            )}
            {teacherData.classesAssigned && teacherData.classesAssigned.length > 0 && (
               <div className="md:col-span-2">
                 <span className="font-semibold">Classes Assigned:</span> {teacherData.classesAssigned.join(', ')} {/* Assuming classesAssigned are IDs, you might want to fetch class names */}
               </div>
             )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeachersProfile;
