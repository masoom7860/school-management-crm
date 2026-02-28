import { useState, useEffect, useCallback } from "react";
import Select from 'react-select';
import axios from "axios";
import jwtDecode from "jwt-decode";
import DeleteConfirmationModal from '../common/DeleteConfirmationModal'; // Import the modal component
import ImageUploader from '../common/ImageUploader'; // Import ImageUploader component
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const steps = ["Personal Details", "Professional Info", "Account Setup"];

const identityValidators = {
  'Aadhar Card': value => /^[2-9]{1}[0-9]{3}-?[0-9]{4}-?[0-9]{4}$/.test(value),
  'Passport': value => /^[A-PR-WYa-pr-wy][0-9]{7}$/.test(value),
  'Driving License': value => /^[A-Z]{2}[0-9]{2}[0-9]{11,13}$/.test(value),
  'PAN Card': value => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
  'Other': value => /^[a-zA-Z0-9\s\-_,.]{3,50}$/.test(value),
};

const TeacherRegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherData, setSelectedTeacherData] = useState(null);
  const [modalBackgroundColor, setModalBackgroundColor] = useState('');

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  // State for photo preview
  const [previewUrl, setPreviewUrl] = useState('');

  const schoolId = localStorage.getItem("schoolId");
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const adminId = decoded.adminId;

  const initialFormData = {
    name: "",
    gender: "",
    dob: "",
    identityType: "", // Added identityType
    nationalId: "",
    email: "",
    phone: "",
    photo: null, // Added photo field for image upload
    address: { // Changed to object
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    emergencyContact: { // Changed to object
      name: '',
      relation: '',
      phone: ''
    },
    qualification: "",
    experience: "",
    // designation field removed - now using school-scoped designations
    employeeId: "",
    joiningDate: "",
    "subjects[]": [],
    classesAssigned: [],
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchTeachers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/teachers/all/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error(err.response?.data?.message || "Error fetching teachers.");
      setTeachers([]);
    }
  }, [schoolId]);

  const fetchClasses = useCallback(async () => {
    try {
      const { getClasses } = await import('../../api/classesApi');
      const response = await getClasses();
      setClasses(response || []); // getClasses returns the array directly
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
    }
  }, []); // Removed schoolId from dependency array as it's not used in the URL

  useEffect(() => {
    if (!schoolId) {
      toast.error("School ID missing. Please login.");
      return;
    }
    fetchTeachers();
    fetchClasses();
    // Fetch subject catalog for options
    axios
      .get(`${BASE_URL}/api/subjects/catalog`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const catalog = Array.isArray(res.data) ? res.data : [];
        setSubjectOptions(catalog.map((s) => ({ value: s.name, label: `${s.name} (${s.code})` })));
      })
      .catch(() => setSubjectOptions([]));
  }, [schoolId, fetchTeachers, fetchClasses]);

  // Function to generate Employee ID based on school name and category
  // Format: [SchoolCode][CategoryCode][SequentialNumber]
  // Example: FPIC101 (FP=School, IC=Teacher, 101=Sequence)
  // Can be reused for staff by changing category to 'STAFF' -> FPST101
  const generateEmployeeId = (schoolName, category = 'TEACHER') => {
    if (!schoolName) return '';

    // Get school code from school name (first 2 letters, uppercase)
    const schoolCode = schoolName.substring(0, 2).toUpperCase();

    // Category codes based on your example "FPIC101"
    const categoryCodes = {
      'TEACHER': 'IC',  // IC for Instructor/Teacher
      'STAFF': 'ST',    // ST for Staff
      'ADMIN': 'AD',    // AD for Admin
      'PRINCIPAL': 'PR' // PR for Principal
    };

    const categoryCode = categoryCodes[category] || 'IC';

    // Generate random number (3 digits for 6-character total)
    const randomNum = Math.floor(100 + Math.random() * 900); // 100-999

    return `${schoolCode}${categoryCode}${randomNum}`;
  };

  // Generate Employee ID when component mounts or schoolId changes
  useEffect(() => {
    if (schoolId && !formData.employeeId) {
      // Get school name from localStorage or API
      const schoolName = localStorage.getItem('schoolName') || 'School';

      // For teachers, use 'TEACHER' category (generates IC code)
      const newEmployeeId = generateEmployeeId(schoolName, 'TEACHER');

      setFormData(prev => ({
        ...prev,
        employeeId: newEmployeeId
      }));
    }
  }, [schoolId, formData.employeeId]);

  const validateStep = (step) => {
    // Skip validation when editing existing teacher
    if (isEditing) {
      return true;
    }

    console.log('Validating step:', step);
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of day for comparison

    if (step === 0) {
      console.log('Validating step 0 (Personal Details)');
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!formData.gender.trim()) {
        newErrors.gender = "Gender is required";
      }
      if (!formData.dob.trim()) {
        newErrors.dob = "Date of birth is required";
      } else {
        const dobDate = new Date(formData.dob);
        if (isNaN(dobDate.getTime())) {
          newErrors.dob = "Invalid date format";
        } else if (dobDate > today) {
          newErrors.dob = "Date of birth cannot be in the future";
        }
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Invalid email format";
      }

      if (!formData.identityType.trim()) {
        newErrors.identityType = "Identity Type is required";
      } else if (formData.identityType !== 'Other' && !formData.nationalId.trim()) {
        // Identity number is required for specific types, but not 'Other'
        newErrors.nationalId = 'Identity Number is required';
      }

      // Validate identity number based on type
      if (formData.identityType && formData.nationalId.trim()) {
        const validator = identityValidators[formData.identityType];
        if (validator && !validator(formData.nationalId.trim())) {
          newErrors.nationalId = `Invalid ${formData.identityType} format`;
        } else if (!validator && formData.identityType !== 'Other') {
          // Fallback validation for types not explicitly listed but not 'Other'
          if (!/^[a-zA-Z0-9\s\-_,.]{3,50}$/.test(formData.nationalId.trim())) {
            newErrors.nationalId = `Invalid ${formData.identityType} format`;
          }
        } else if (formData.identityType === 'Other' && !identityValidators['Other'](formData.nationalId.trim())) {
          newErrors.nationalId = `Invalid format for Other identity type`;
        }
      }

      // Validation for address fields (assuming all are required if address object exists)
      if (!formData.address.street.trim()) newErrors.addressStreet = 'Street is required';
      if (!formData.address.city.trim()) newErrors.addressCity = 'City is required';
      if (!formData.address.state.trim()) newErrors.addressState = 'State is required';
      if (!formData.address.pincode.trim()) newErrors.addressPincode = 'Pincode is required';
      if (!formData.address.country.trim()) newErrors.addressCountry = 'Country is required';

      // Validation for emergency contact fields - REMOVED as requested
      // if (!formData.emergencyContact.name.trim()) newErrors.emergencyContactName = 'Emergency Contact Name is required';
      // if (!formData.emergencyContact.relation.trim()) newErrors.emergencyContactRelation = 'Emergency Contact Relation is required';
      // if (!formData.emergencyContact.phone.trim()) {
      //   newErrors.emergencyContactPhone = 'Emergency Contact Phone is required';
      // } else if (!/^\d{10}$/.test(formData.emergencyContact.phone.trim())) {
      //   newErrors.emergencyContactPhone = 'Emergency Contact Phone must be exactly 10 digits';
      // }


    } else if (step === 1) {
      if (!formData.qualification.trim()) {
        newErrors.qualification = "Qualification is required";
      }
      if (formData.experience && (isNaN(formData.experience) || parseFloat(formData.experience) < 0)) {
        newErrors.experience = "Experience must be a non-negative number";
      }

      // Employee ID validation - only validate if field has a value (auto-generated by backend)
      if (formData.employeeId && formData.employeeId.trim()) {
        if (formData.employeeId.length < 6) {
          console.log('Employee ID too short:', formData.employeeId.length, 'characters (minimum 6)');
          newErrors.employeeId = "Employee ID must be at least 6 characters long";
        } else {
          // Check if it has at least 3 letters OR 3 numbers
          const letters = (formData.employeeId.match(/[a-zA-Z]/g) || []).length;
          const numbers = (formData.employeeId.match(/[0-9]/g) || []).length;
          console.log('Employee ID:', formData.employeeId, 'Letters:', letters, 'Numbers:', numbers);

          if (letters < 3 && numbers < 3) {
            console.log('Employee ID validation failed: not enough letters or numbers');
            newErrors.employeeId = "Employee ID must contain at least 3 letters or 3 numbers";
          } else {
            console.log('Employee ID validation passed');
          }
        }
      }

      if (!formData.joiningDate.trim()) {
        newErrors.joiningDate = "Joining date is required";
      } else {
        const joiningDate = new Date(formData.joiningDate);
        if (isNaN(joiningDate.getTime())) {
          newErrors.joiningDate = "Invalid date format";
        } else if (joiningDate > today) {
          newErrors.joiningDate = "Joining date cannot be in the future";
        }
      }
      // Add validation for subjects and classes assigned
      if (formData["subjects[]"].length === 0) {
        newErrors["subjects[]"] = "At least one subject is required";
      }
      if (formData.classesAssigned.length === 0) {
        newErrors.classesAssigned = "At least one class is required";
      }
    } else if (step === 2) {
      // Password is required only for adding new teacher
      if (!isEditing) {
        if (!formData.password.trim()) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
      }
    }
    console.log('Validation completed. Errors found:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Handle nested emergencyContact fields
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else if (name.startsWith('address.')) { // Handle nested address fields
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name === 'nationalId' && formData.identityType === 'Aadhar Card') {
      // Format Aadhar number: add hyphen after every 4 digits
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] })); // Store the file object
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (selectedOptions, name) => {
    let value = [];
    if (selectedOptions) {
      value = selectedOptions.map(option => option.value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    console.log('handleNext called for step:', activeStep);
    console.log('Current formData:', formData);
    console.log('Current errors:', errors);

    if (validateStep(activeStep)) {
      console.log('Validation passed, moving to next step');
      setActiveStep(prev => prev + 1);
    } else {
      console.log('Validation failed, staying on current step');
      // Show all current errors in console for debugging
      console.log('Current validation errors:', errors);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = useCallback(async () => {
    if (!validateStep(activeStep)) {
      return;
    }
    // Validate schoolId and adminId from localStorage
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!schoolId || !adminId || !objectIdRegex.test(schoolId) || !objectIdRegex.test(adminId)) {
      toast.error("Invalid or missing School ID or Admin ID. Please log in again to ensure correct credentials are loaded.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataPayload = new FormData();
      console.log("formData", formData);
      // Append form data fields to the FormData object
      for (const key in formData) {
        // Skip designation field as it's no longer used
        if (key === 'designation') continue;

        // Normalize fields for backend
        if (key === 'classesAssigned') {
          formDataPayload.append('classesAssigned', JSON.stringify(formData.classesAssigned || []));
        } else if (key === 'subjects[]') {
          formDataPayload.append('subjects', JSON.stringify(formData['subjects[]'] || []));
        } else if (key === 'address' || key === 'emergencyContact') {
          formDataPayload.append(key, JSON.stringify(formData[key] || {}));
        } else if (key === 'photo') {
          const file = formData.photo;
          if (file instanceof File || (typeof Blob !== 'undefined' && file instanceof Blob)) {
            formDataPayload.append('photo', file);
          }
        } else if (Array.isArray(formData[key])) {
          formData[key].forEach(item => {
            formDataPayload.append(key, item);
          });
        } else {
          formDataPayload.append(key, formData[key]);
        }
      }
      formDataPayload.append("adminId", adminId); // Append adminId to formData

      const token = localStorage.getItem("token"); // Assuming the token is stored under 'token'
      let response;

      if (isEditing) {
        // Update existing teacher
        response = await axios.put(
          `${BASE_URL}/api/teachers/update/${editingTeacherId}`,
          formDataPayload, // Use FormData
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(response.data.message || "Teacher updated successfully");
      } else {
        // Create new teacher
        response = await axios.post(
          `${BASE_URL}/api/teachers/create/${schoolId}`,
          formDataPayload, // Use FormData
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(response.data.message || "Teacher created successfully");
      }


      fetchTeachers();

      // Reset form and state
      setFormData(initialFormData);
      setActiveStep(0);
      setErrors({});
      setIsEditing(false);
      setEditingTeacherId(null);
      setPreviewUrl(''); // Clear preview URL

    } catch (err) {
      console.error("Error submitting teacher data:", err);
      let errorMessage = "Error submitting teacher data";

      if (err.response) {
        if (err.response.data) {
          errorMessage = err.response.data.message ||
            JSON.stringify(err.response.data);
        }
        errorMessage += ` (Status: ${err.response.status})`;
      } else {
        errorMessage += `: ${err.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStep, formData, schoolId, adminId, fetchTeachers, validateStep, isEditing, editingTeacherId]);


  const handleEditTeacher = (teacher) => {
    setIsEditing(true);
    setEditingTeacherId(teacher._id);

    // Set preview URL if teacher has a photo
    if (teacher.photo) {
      setPreviewUrl(`${BASE_URL}/uploads/teachers/${teacher.photo}`);
    } else {
      setPreviewUrl('');
    }

    // Populate form with teacher data
    setFormData({
      name: teacher.name || "",
      gender: teacher.gender || "",
      dob: teacher.dob ? teacher.dob.split('T')[0] : "", // Format date for input
      identityType: teacher.identityType || "",
      nationalId: teacher.nationalId || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      photo: teacher.photo || null, // Include photo field
      address: {
        street: teacher.address?.street || "",
        city: teacher.address?.city || "",
        state: teacher.address?.state || "",
        pincode: teacher.address?.pincode || "",
        country: teacher.address?.country || "",
      },
      emergencyContact: {
        name: teacher.emergencyContact?.name || "",
        relation: teacher.emergencyContact?.relation || "",
        phone: teacher.emergencyContact?.phone || "",
      },
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      // designation field removed - using school-scoped designations
      employeeId: teacher.employeeId || "", // Keep for display but not editable
      joiningDate: teacher.joiningDate ? teacher.joiningDate.split('T')[0] : "", // Format date for input
      "subjects[]": teacher.subjects || [],
      classesAssigned: teacher.classesAssigned || [],
      password: "", // Password should not be pre-filled for security
    });
    setActiveStep(0); // Go back to the first step of the form
    setErrors({}); // Clear previous errors
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTeacherId(null);
    setFormData(initialFormData); // Reset form
    setActiveStep(0); // Go back to the first step
    setErrors({}); // Clear errors
    setPreviewUrl(''); // Clear preview URL
  };

  const handleViewDetails = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    if (teacher) {
      setSelectedTeacherData(teacher);
      setShowModal(true);
      setModalBackgroundColor('rgba(0, 0, 0, 0.5)');
    } else {
      toast.error("Teacher details not found.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeacherData(null);
  };

  const deleteTeacher = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${BASE_URL}/api/teachers/delete/${id}?adminId=${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTeachers();
      toast.success("Teacher deleted successfully");
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error(err.response?.data?.message || "Error deleting teacher.");
    } finally {
      setShowDeleteModal(false); // Close modal after action
      setItemToDeleteId(null); // Clear item to delete
    }
  };

  const openDeleteModal = (id) => {
    setItemToDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDeleteId(null);
  };


  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Name*</label>
              <input
                type="text"
                name="name"
                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-black-300'}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Gender*</label>
              <select
                name="gender"
                className={`w-full p-2 border rounded ${errors.gender ? 'border-red-500' : 'border-black-300'}`}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Date of Birth*</label>
              <input
                type="date"
                name="dob"
                className={`w-full p-2 border rounded ${errors.dob ? 'border-red-500' : 'border-black-300'}`}
                value={formData.dob}
                onChange={handleChange}
                placeholder="Select date of birth"
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Identity Type*</label> {/* Added Identity Type Label */}
              <select
                name="identityType" // Added name
                className={`w-full p-2 border rounded ${errors.identityType ? 'border-red-500' : 'border-black-300'}`} // Added class and error handling
                value={formData.identityType} // Added value
                onChange={handleChange} // Added onChange
              >
                <option value="">Select Identity Type</option> {/* Added default option */}
                <option value="Aadhar Card">Aadhar Card</option> {/* Added options */}
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Other">Other</option>
              </select>
              {errors.identityType && <p className="text-red-500 text-xs mt-1">{errors.identityType}</p>} {/* Added error message */}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">National ID</label>
              <input
                type="text"
                name="nationalId"
                className="w-full p-2 border border-black-300 rounded"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder={
                  formData.identityType === 'Aadhar Card'
                    ? 'e.g., 1234-5678-9012'
                    : formData.identityType === 'Passport'
                      ? 'e.g., A1234567'
                      : formData.identityType === 'Driving License'
                        ? 'e.g., AB01123456789'
                        : formData.identityType === 'PAN Card'
                          ? 'e.g., ABCDE1234F'
                          : 'Enter national ID'
                }
              />
              {formData.identityType === 'Aadhar Card' && <span className="text-xs text-black-500 mt-1">Format: XXXX-XXXX-XXXX</span>}
              {formData.identityType === 'Passport' && <span className="text-xs text-black-500 mt-1">Format: A1234567 (1 letter, 7 digits)</span>}
              {formData.identityType === 'Driving License' && <span className="text-xs text-black-500 mt-1">Format: AB01123456789 (2 letters, 2 digits, 11-13 digits)</span>}
              {formData.identityType === 'PAN Card' && <span className="text-xs text-black-500 mt-1">Format: ABCDE1234F (5 letters, 4 digits, 1 letter)</span>}
              {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-black-300'}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Phone*</label>
              <input
                type="text"
                name="phone"
                className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-black-300'}`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <ImageUploader
                label="Profile Photo"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Street Address</label>
              <input
                type="text"
                name="address.street"
                className={`w-full p-2 border rounded ${errors.addressStreet ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Enter street address"
              />
              {errors.addressStreet && <p className="text-red-500 text-xs mt-1">{errors.addressStreet}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                className={`w-full p-2 border rounded ${errors.emergencyContactName ? 'border-red-500' : 'border-black-300'}`}
                value={formData.emergencyContact.name}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Emergency Contact Relation</label>
              <input
                type="text"
                name="emergencyContact.relation"
                className={`w-full p-2 border rounded ${errors.emergencyContactRelation ? 'border-red-500' : 'border-black-300'}`}
                value={formData.emergencyContact.relation}
                onChange={handleChange}
                placeholder="Enter emergency contact relation"
              />
              {errors.emergencyContactRelation && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                name="emergencyContact.phone"
                className={`w-full p-2 border rounded ${errors.emergencyContactPhone ? 'border-red-500' : 'border-black-300'}`}
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                placeholder="Enter emergency contact phone"
              />
              {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">City</label>
              <input
                type="text"
                name="address.city"
                className={`w-full p-2 border rounded ${errors.addressCity ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
              {errors.addressCity && <p className="text-red-500 text-xs mt-1">{errors.addressCity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">State</label>
              <input
                type="text"
                name="address.state"
                className={`w-full p-2 border rounded ${errors.addressState ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
              {errors.addressState && <p className="text-red-500 text-xs mt-1">{errors.addressState}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                className={`w-full p-2 border rounded ${errors.addressPincode ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
              />
              {errors.addressPincode && <p className="text-red-500 text-xs mt-1">{errors.addressPincode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Country</label>
              <input
                type="text"
                name="address.country"
                className={`w-full p-2 border rounded ${errors.addressCountry ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
              {errors.addressCountry && <p className="text-red-500 text-xs mt-1">{errors.addressCountry}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Qualification*</label>
              <input
                type="text"
                name="qualification"
                className={`w-full p-2 border rounded ${errors.qualification ? 'border-red-500' : 'border-black-300'}`}
                value={formData.qualification}
                onChange={handleChange}
                placeholder="Enter qualification"
              />
              {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                className="w-full p-2 border border-black-300 rounded"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Enter years of experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                className="w-full p-2 border border-black-300 rounded bg-gray-100 text-gray-600"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Auto-generated by system"
                disabled
                title="Employee ID will be generated automatically"
              />
              <span className="text-xs text-gray-500 mt-1">Auto-generated ID (format: [School][IC][Number])</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Joining Date*</label>
              <input
                type="date"
                name="joiningDate"
                className={`w-full p-2 border rounded ${errors.joiningDate ? 'border-red-500' : 'border-black-300'}`}
                value={formData.joiningDate}
                onChange={handleChange}
              />
              {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black-700 mb-1">Subjects*</label>
              <Select
                isMulti
                name="subjects[]"
                options={subjectOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) => handleArrayChange(selectedOptions, "subjects[]")}
                value={formData["subjects[]"].map(subject => ({ value: subject, label: subject }))}
              />
              {errors["subjects[]"] && <p className="text-red-500 text-xs mt-1">{errors["subjects[]"]}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black-700 mb-1">Classes Assigned*</label>
              <Select
                isMulti
                name="classesAssigned"
                options={classes.map(classItem => ({ value: classItem._id, label: classItem.className }))}
                className={`basic-multi-select ${errors.classesAssigned ? 'border-red-500' : ''}`}
                classNamePrefix="select"
                onChange={(selectedOptions) => handleArrayChange(selectedOptions, "classesAssigned")}
                value={formData.classesAssigned.map(classId => {
                  const classItem = classes.find(c => c._id === classId);
                  return classItem ? { value: classId, label: classItem.className } : null;
                }).filter(Boolean)}
              />
              {errors.classesAssigned && <p className="text-red-500 text-xs mt-1">{errors.classesAssigned}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Password*</label>
              <input
                type="password"
                name="password"
                className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-black-300'}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-black-900 mb-6">Teacher Registration</h1>

      <div className="flex justify-between items-center mb-6">
        {steps.map((label, index) => (
          <div key={label} className="flex-1">
            <div className={`flex flex-col items-center ${index <= activeStep ? 'text-red-600' : 'text-black-500'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${index <= activeStep ? 'bg-red-600 text-white' : 'bg-black-200'}`}>
                {index + 1}
              </div>
              <span className="text-sm mt-2">{label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 flex-1 mx-2 ${index < activeStep ? 'bg-red-600' : 'bg-black-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {getStepContent(activeStep)}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className={`px-4 py-2 rounded-md ${activeStep === 0 ? 'bg-black-300 cursor-not-allowed' : 'bg-black-200 hover:bg-black-300'}`}
        >
          Back
        </button>

        <div className="flex space-x-4">
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-black-500 text-white rounded-md hover:bg-black-600"
            >
              Cancel Edit
            </button>
          )}
          {activeStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Teacher' : 'Submit')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-black-900 mt-10 mb-4">Registered Teachers</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-black-200">
          <thead className="bg-black-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Mobile / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">RegNo/DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black-200">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-black-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {teacher.photo ? (
                      <img
                        src={`${BASE_URL}/uploads/teachers/${teacher.photo}`}
                        alt={`${teacher.name}'s photo`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Photo</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black-900">
                    {teacher.name}
                    {/* Assuming teacher object has a 'role' property, e.g., 'Teacher' */}
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {teacher.designation || 'Teacher'} {/* Using designation as role for now */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500">
                    {/* Display phone number as a button */}
                    {teacher.phone && (
                      <button className="px-2 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700">
                        +{teacher.phone}
                      </button>
                    )}
                    <p>{teacher.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500">
                    {/* Assuming teacher object has regNo or using employeeId and dob */}
                    <p>{teacher.employeeId || 'N/A'}</p>
                    <p>{teacher.dob ? teacher.dob.split('T')[0] : 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500 flex space-x-2">
                    <button
                      onClick={() => handleEditTeacher(teacher)}
                      className="text-red-600 hover:text-red-900 pr-4"
                      title="Edit Teacher"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewDetails(teacher._id)}
                      className={`text-red-600 hover:text-red-900 bg-gray-200 rounded-md p-1 ${showModal ? 'bg-gray-300' : ''} ${selectedTeacherData?._id === teacher._id && showModal ? 'bg-gray-400' : ''}`}
                      title="View Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(teacher._id)}
                      className="text-red-600 hover:text-red-900 pl-3"
                      title="Delete Teacher"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553l-.724 1.447H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedTeacherData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 h-full w-full flex justify-center items-center p-4 overflow-y-auto"> {/* Added p-4 for padding */}
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full"> {/* Increased max-w-md to max-w-lg */}
            <h3 className="text-2xl font-bold mb-6 text-black-800 text-center">Teacher Details</h3> {/* Increased bottom margin and changed text color */}
            <div className="space-y-6 text-black-700"> {/* Increased space-y */}

              {/* Personal Details Section */}
              <div className="border-b pb-4">
                <h4 className="text-xl font-semibold mb-3 text-black-800">Personal Details</h4>

                {/* Display teacher photo if available */}
                {selectedTeacherData.photo && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={`${BASE_URL}/uploads/teachers/${selectedTeacherData.photo}`}
                      alt={`${selectedTeacherData.name}'s photo`}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeacherData.name && <div><span className="font-semibold">Full Name:</span> {selectedTeacherData.name}</div>}
                  {selectedTeacherData.gender && <div><span className="font-semibold">Gender:</span> {selectedTeacherData.gender}</div>}
                  {selectedTeacherData.dob && <div><span className="font-semibold">Date of Birth:</span> {selectedTeacherData.dob.split('T')[0]}</div>}
                  {selectedTeacherData.identityType && <div><span className="font-semibold">Identity Type:</span> {selectedTeacherData.identityType}</div>}
                  {selectedTeacherData.nationalId && <div><span className="font-semibold">National ID:</span> {selectedTeacherData.nationalId}</div>}
                  {selectedTeacherData.email && <div><span className="font-semibold">Email:</span> {selectedTeacherData.email}</div>}
                  {selectedTeacherData.phone && <div><span className="font-semibold">Phone:</span> {selectedTeacherData.phone}</div>}
                </div>
              </div>

              {/* Address Section */}
              {selectedTeacherData.address && (
                <div className="border-b pb-4">
                  <h4 className="text-xl font-semibold mb-3 text-black-800">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeacherData.address.street && <div><span className="font-semibold">Street:</span> {selectedTeacherData.address.street}</div>}
                    {selectedTeacherData.address.city && <div><span className="font-semibold">City:</span> {selectedTeacherData.address.city}</div>}
                    {selectedTeacherData.address.state && <div><span className="font-semibold">State:</span> {selectedTeacherData.address.state}</div>}
                    {selectedTeacherData.address.pincode && <div><span className="font-semibold">Pincode:</span> {selectedTeacherData.address.pincode}</div>}
                    {selectedTeacherData.address.country && <div><span className="font-semibold">Country:</span> {selectedTeacherData.address.country}</div>}
                  </div>
                </div>
              )}

              {/* Emergency Contact Section */}
              {selectedTeacherData.emergencyContact && (
                <div className="border-b pb-4">
                  <h4 className="text-xl font-semibold mb-3 text-black-800">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeacherData.emergencyContact.name && <div><span className="font-semibold">Name:</span> {selectedTeacherData.emergencyContact.name}</div>}
                    {selectedTeacherData.emergencyContact.relation && <div><span className="font-semibold">Relation:</span> {selectedTeacherData.emergencyContact.relation}</div>}
                    {selectedTeacherData.emergencyContact.phone && <div><span className="font-semibold">Phone:</span> {selectedTeacherData.emergencyContact.phone}</div>}
                  </div>
                </div>
              )}

              {/* Professional Info Section */}
              <div className="pb-4">
                <h4 className="text-xl font-semibold mb-3 text-black-800">Professional Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeacherData.qualification && <div><span className="font-semibold">Qualification:</span> {selectedTeacherData.qualification}</div>}
                  {selectedTeacherData.experience && <div><span className="font-semibold">Experience:</span> {selectedTeacherData.experience} years</div>}
                  {/* designation field removed - using school-scoped designations */}
                  {selectedTeacherData.employeeId && <div><span className="font-semibold">Employee ID:</span> {selectedTeacherData.employeeId}</div>}
                  {selectedTeacherData.joiningDate && <div><span className="font-semibold">Joining Date:</span> {selectedTeacherData.joiningDate.split('T')[0]}</div>}
                  {selectedTeacherData.subjects && selectedTeacherData.subjects.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="font-semibold">Subjects:</span> {selectedTeacherData.subjects.join(', ')}
                    </div>
                  )}
                  {selectedTeacherData.classesAssigned && selectedTeacherData.classesAssigned.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="font-semibold">Classes Assigned:</span>
                      {selectedTeacherData.classesAssigned.map(classId => {
                        const classItem = classes.find(c => c._id === classId);
                        return classItem ? classItem.className : 'N/A';
                      }).join(', ')}
                    </div>
                  )}
                </div>
              </div>

            </div>
            <div className="mt-8 flex justify-end"> {/* Increased top margin */}
              {/* Increased padding and added transition */}
              {/* Increased padding and added transition */}
              <button
                onClick={closeModal}
                className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={deleteTeacher}
        itemToDelete={itemToDeleteId}
      />
    </div>
  );
};

export default TeacherRegistrationForm;
