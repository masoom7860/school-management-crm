import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import useSchoolClasses from '../../hooks/useSchoolClasses'; // Import the hook

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formFields = [
  { label: 'First Name', name: 'firstName', type: 'text', required: true },
  { label: 'Last Name', name: 'lastName', type: 'text', required: true },
  { label: 'Gender', name: 'gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
  { label: 'Date Of Birth', name: 'dob', type: 'date', required: true },
  { label: 'Roll', name: 'roll', type: 'text' },
  { label: 'Blood Group', name: 'bloodGroup', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  { label: 'Religion', name: 'religion', type: 'select', required: true, options: ['Hindu', 'Muslim', 'Christian', 'Other'] },
  { label: 'E-Mail', name: 'email', type: 'email' },
  { label: 'Class', name: 'classId', type: 'select', required: true, options: [] }, // Changed name to classId and removed hardcoded options
  { label: 'Section', name: 'section', type: 'select', required: true, options: ['A', 'B', 'C'] },
  { label: 'Assign Teacher', name: 'classTeacherId', type: 'select', required: false, options: [] }, // Added field for teacher assignment
  { label: 'Admission ID', name: 'admissionId', type: 'text' },
  { label: 'Phone', name: 'phone', type: 'tel' },
  { label: 'Short BIO', name: 'bio', type: 'textarea' },
  { label: 'Student Photo', name: 'photo', type: 'file' }
];

const StudentForm = () => {
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [teachers, setTeachers] = useState([]); // State to store teachers
  const [teacherLoading, setTeacherLoading] = useState(true); // State for teacher loading
  const [teacherError, setTeacherError] = useState(null); // State for teacher error
  const { classes, loading: classesLoading, error: classesError } = useSchoolClasses(); // Use the hook
  const [sections, setSections] = useState([]); // <-- Add state for sections
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);
  const [schoolId, setSchoolId] = useState('');

  // Combine loading and error states
  const loading = classesLoading || teacherLoading;
  const error = classesError || teacherError;

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const logoRaw = localStorage.getItem("schoolLogo");
  const logo = logoRaw ? (logoRaw.startsWith("http") ? logoRaw : `${baseURL}/${logoRaw}`) : null;

  useEffect(() => {
    fetchTeachers();
    // Get schoolId from token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        setSchoolId(decoded.schoolId);
      } catch (err) {
        setSchoolId('');
      }
    }
  }, []);

  // Fetch sections when classId changes
  useEffect(() => {
    if (formData.classId && schoolId) {
      setSectionsLoading(true);
      setSectionsError(null);
      axiosInstance.get(`/api/sections`, {
        params: { classId: formData.classId, schoolId }
      })
        .then(res => setSections(res.data))
        .catch(err => {
          setSections([]);
          setSectionsError('Failed to load sections');
        })
        .finally(() => setSectionsLoading(false));
    } else {
      setSections([]);
    }
  }, [formData.classId, schoolId]);

  const fetchTeachers = async () => {
    setTeacherLoading(true);
    setTeacherError(null);
    const storedToken = localStorage.getItem('token');
    const schoolId = localStorage.getItem('schoolId'); // Assuming schoolId is also in localStorage or derived from token elsewhere if needed

    if (!storedToken || !schoolId) {
      setTeacherLoading(false);
      setTeacherError("Authentication token or School ID not found.");
      toast.error("Authentication token or School ID not found. Please log in again.");
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/teachers/all/${schoolId}`);
      setTeachers(res.data.teachers);
      setTeacherLoading(false);
    } catch (err) {
      console.error('Error fetching teachers:', err?.response?.data || err.message);
      toast.error('Error fetching teachers: ' + (err?.response?.data?.message || err.message));
      setTeacherError('Failed to load teachers.');
      setTeacherLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (e.target.type === 'file') {
      setFile(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submission = new FormData();
    for (let key in formData) submission.append(key, formData[key]);
    if (file) submission.append('photo', file);

    // Include schoolId and parentData (assuming parent data is collected elsewhere or handled by backend)
    // The backend createStudent expects studentData, parentData, adminId, schoolId
    // This frontend form only collects studentData. Need to adjust or ensure backend handles this.
    // For now, adding schoolId and classTeacherId to the submission.
    submission.append('schoolId', schoolId);
    // Assuming adminId is needed by backend, but not collected in this form.
    // You might need to get adminId from the token or context if required by the backend.
    // submission.append('adminId', adminId); // Uncomment if adminId is needed

    // The backend expects studentData and parentData as nested objects in req.body
    // This form sends flattened data. The backend createStudent controller needs adjustment
    // to handle flattened data or the frontend needs to structure it correctly.
    // Let's adjust the frontend to send nested studentData and a placeholder parentData for now.
    // A more robust solution would involve a separate parent form or collecting parent data here.

    const studentDataToSend = {};
    const parentDataToSend = { father: {}, mother: {}, guardian: {} }; // Placeholder parent data

    for (let key in formData) {
        // Assuming keys like 'firstName', 'lastName', 'classTeacherId' belong to studentData
        // and keys like 'father.name', 'mother.phone' would belong to parentData
        // This current form only has student-like fields and classTeacherId.
        // Need to confirm how parent data is handled or add parent fields to this form.
        // For now, put all collected formData into studentDataToSend.
        studentDataToSend[key] = formData[key];
    }

    // Append studentData and parentData as JSON strings (or adjust backend to parse)
    submission.append('studentData', JSON.stringify(studentDataToSend));
    submission.append('parentData', JSON.stringify(parentDataToSend)); // Send placeholder parent data

    try {
      // Update the fetch URL to the correct backend endpoint
      const res = await axiosInstance.post(`/api/students/create`, submission);
      const result = res.data; // axios puts response data in .data
      console.log('Student Added:', result);
      toast.success('Student added successfully!'); // Use toast for success
      handleReset(); // Reset form on success
    } catch (err) {
      console.error('Error adding student:', err?.response?.data || err.message);
      toast.error('Error adding student: ' + (err?.response?.data?.message || err.message)); // Use toast for error
    }
  };

  const handleReset = () => {
    setFormData({});
    setFile(null);
  };

    if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center">Loading form data...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 p-8 text-center text-red-500">Error loading form data: {error}</div>;
  }


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {logo && (
        <img src={logo} alt="School Logo" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border border-gray-200" onError={e => { e.target.onerror = null; e.target.src = "/default-logo.png"; }} />
      )}
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Add New Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {formFields.map((field) => (
            <div key={field.name} className="col-span-1">
              <label className="block text-sm font-medium mb-1">
                {field.label} {field.required && '*'}
              </label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  required={field.required}
                  onChange={handleChange}
                  className="w-full h-14 text-base rounded px-4 outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-100"
                  value={formData[field.name] || ''}
                >
                  {field.name === 'section' ? (
                    sectionsLoading ? (
                      <option>Loading sections...</option>
                    ) : sectionsError ? (
                      <option>Error loading sections</option>
                    ) : (
                      <>
                        <option value="">Please Select Section</option>
                        {sections.map(section => (
                          <option key={section._id} value={section.name}>{section.name}</option>
                        ))}
                      </>
                    )
                  ) : field.name === 'classId' ? (
                    classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.className}</option>
                    ))
                  ) : field.name === 'classTeacherId' ? (
                    teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                    ))
                  ) : (
                    // Otherwise, map options from the formFields definition
                    field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))
                  )}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  rows={4}
                  onChange={handleChange}
                  value={formData[field.name] || ''}
                  className="w-full h-32 text-base rounded px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-100"
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  onChange={handleChange}
                  value={formData[field.name] || ''} // Add value prop for controlled input
                  className="w-full h-14 text-base rounded px-4 outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-100"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-red-900 text-white px-6 py-2 rounded hover:bg-red-950"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
