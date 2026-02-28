import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { toast } from 'react-toastify'; // Import toast
import { motion } from 'framer-motion';
import ImageUploader from '../../common/ImageUploader';
import { getSectionsByClass } from "../../../api/classesApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Define BASE_URL

const steps = [
  "Basic Info",
  "Personal Info",
  "Family Info",
  "Medical Info",
  "Sibling Info",
  "Previous School Info",
  "Insight Form",
  "Parent Info",
  "Guardian Info",
  "Emergency Contact"
];

const fieldsByStep = [
  // Step 1 - Basic Admission Info
  [
    { name: "applicationNumber", label: "Application Number", type: "text", readOnly: true },
    { name: "name", label: "Name", type: "text", required: true, validation: { required: true, minLength: 2 } },
    { name: "email", label: "Email", type: "email", required: true, validation: { required: true, email: true }, placeholder: "e.g., student@example.com" },
    { name: "password", label: "Password", type: "password", required: true, validation: { required: true, minLength: 8 }, placeholder: "Min 8 characters" },
    { name: "scholarNumber", label: "Scholar Number", type: "text" },
    {
      name: "className",
      label: "Class",
      type: "dropdown",
      options: [],
      required: true
    },
    {
      name: "sectionName",
      label: "Section",
      type: "dropdown",
      options: [],
      required: true
    },
    { name: "classTeacherId", label: "Assign Teacher", type: "dropdown", options: [], required: false }, // Added Assign Teacher field
    { name: "admissionDate", label: "Admission Date", type: "date", required: true, validation: { required: true }, placeholder: "Select Admission Date" },
    { name: "profilePhoto", label: "Profile Photo", type: "image" }
  ],
  // Step 2 - Personal Info
  [
    { name: "dob", label: "Date of Birth", type: "date", required: true, validation: { required: true } },
    { name: "gender", label: "Gender", type: "dropdown", options: ["Male", "Female", "Other"], required: true, validation: { required: true } },
    { name: "bloodGroup", label: "Blood Group", type: "dropdown", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    { name: "placeOfBirth", label: "Place of Birth", type: "text" },
    { name: "nationality", label: "Nationality", type: "dropdown", options: ["Indian", "American", "British", "Canadian", "Australian", "Other"], required: true, validation: { required: true }, placeholder: "Select Nationality" },
    { name: "religion", label: "Religion", type: "dropdown", options: ["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"], required: true, validation: { required: true }, placeholder: "Select Religion" }
  ],
  // Step 3 - Family Info
  [
    { name: "category", label: "Category", type: "dropdown", options: ["General", "OBC", "SC", "ST"], required: true, validation: { required: true }, placeholder: "Select Category" },
    { name: "aadharNumber", label: "Aadhar Number", type: "tel", required: true, validation: { required: true, pattern: /^\d{12}$/, message: "Aadhar Number must be 12 digits" }, placeholder: "e.g., 123456789012" },
    { name: "residentialAddress", label: "Residential Address", type: "text", required: true, validation: { required: true }, placeholder: "Enter Residential Address" },
    { name: "permanentAddress", label: "Permanent Address", type: "text", required: true, validation: { required: true }, placeholder: "Enter Permanent Address" },
    { name: "legalCustodian", label: "Legal Custodian", type: "dropdown", options: ["Father", "Mother", "Guardian", "Other"], required: true, validation: { required: true }, placeholder: "Select Legal Custodian" },
    { name: "languagesSpoken.primary", label: "Primary Language", type: "dropdown", options: ["English", "Spanish", "French", "German", "Chinese", "Hindi", "Other"] },
    { name: "languagesSpoken.secondary", label: "Secondary Language", type: "dropdown", options: ["English", "Spanish", "French", "German", "Chinese", "Hindi", "Other"] }
  ],
  // Step 4 - Medical Info
  [
    { name: "medicalInfo.hasCondition", label: "Has Medical Condition", type: "checkbox" },
    { name: "medicalInfo.needsUrgentCare", label: "Needs Urgent Care", type: "checkbox" },
    { name: "medicalInfo.conditionDetails", label: "Condition Details", type: "text" },
    { name: "medicalInfo.schoolSupportNeeded", label: "School Support Needed", type: "text" },
    { name: "medicalInfo.bloodGroup", label: "Medical Blood Group", type: "dropdown", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] }
  ],
  // Step 5 - Sibling Info
  [
    { name: "siblingInfo.name", label: "Sibling Name", type: "text" },
    { name: "siblingInfo.scholarNumber", label: "Sibling Scholar Number", type: "text" },
    { name: "siblingInfo.class", label: "Sibling Class", type: "dropdown", options: [] }, // Removed hardcoded options
    { name: "siblingInfo.joiningYear", label: "Sibling Joining Year", type: "dropdown", options: Array.from({ length: 26 }, (_, i) => (2000 + i).toString()) },
    { name: "siblingInfo.currentSchool", label: "Sibling Current School", type: "text" }
  ],
  // Step 6 - Previous School Info
  [
    { name: "previousSchools[0].year", label: "Previous School Year", type: "dropdown", options: Array.from({ length: 26 }, (_, i) => (2000 + i).toString()) },
    { name: "previousSchools[0].name", label: "Previous School Name", type: "text" },
    { name: "previousSchools[0].classAttended", label: "Previous Class Attended", type: "dropdown", options: [] }, // Removed hardcoded options
    { name: "previousSchools[0].reasonForLeaving", label: "Reason for Leaving", type: "dropdown", options: ["Relocation", "Academic Reasons", "Personal Reasons", "Other"] },
    { name: "previousSchools[0].leavingDate", label: "Leaving Date", type: "date" }
  ],
  // Step 7 - Insight Form
  [
    { name: "insightForm.physicalBeing", label: "Physical Being", type: "text" },
    { name: "insightForm.languageRole", label: "Language Role", type: "text" },
    { name: "insightForm.emotionalSupport", label: "Emotional Support", type: "text" },
    { name: "insightForm.coCurricularOpinion", label: "Co-Curricular Opinion", type: "text" },
    { name: "insightForm.collaborationOpinion", label: "Collaboration Opinion", type: "text" }
  ],
  // Step 8 - Parent Info
  [
    { name: "parentData.father.name", label: "Father's Name", type: "text", required: true, validation: { required: true, minLength: 2 } },
    { name: "parentData.father.email", label: "Father's Email", type: "email", required: true, validation: { required: true, email: true }, placeholder: "e.g., father@example.com" },
    { name: "parentData.father.mobile", label: "Father's Mobile", type: "tel", required: true, validation: { required: true, pattern: /^\d{10}$/, message: "Mobile number must be 10 digits" }, placeholder: "e.g., 9876543210" },
    { name: "parentData.mother.name", label: "Mother's Name", type: "text", required: true, validation: { required: true, minLength: 2 } },
    { name: "parentData.mother.email", label: "Mother's Email", type: "email", required: true, validation: { required: true, email: true }, placeholder: "e.g., mother@example.com" },
    { name: "parentData.mother.mobile", label: "Mother's Mobile", type: "tel", required: true, validation: { required: true, pattern: /^\d{10}$/, message: "Mobile number must be 10 digits" }, placeholder: "e.g., 9876543210" }
  ],
  // Step 9 - Guardian Info
  [
    { name: "parentData.guardian.name", label: "Guardian Name", type: "text" },
    { name: "parentData.guardian.relation", label: "Guardian Relation", type: "dropdown", options: ["Parent", "Grandparent", "Aunt", "Uncle", "Other"] },
    { name: "parentData.guardian.email", label: "Guardian Email", type: "email", validation: { email: true } },
    { name: "parentData.guardian.mobile", label: "Guardian Mobile", type: "text", validation: { pattern: /^\d{10}$/, message: "Mobile number must be 10 digits" } },
    { name: "parentData.guardian.bloodGroup", label: "Guardian Blood Group", type: "dropdown", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] }
  ],
  // Step 10 - Emergency Contact
  [
    { name: "parentData.emergencyContact.name", label: "Emergency Contact Name", type: "text", validation: { required: true, minLength: 2 } },
    { name: "parentData.emergencyContact.relation", label: "Emergency Contact Relation", type: "dropdown", options: ["Parent", "Grandparent", "Aunt", "Uncle", "Other"], validation: { required: true } },
    { name: "parentData.emergencyContact.phone", label: "Emergency Contact Phone", type: "text", validation: { required: true, pattern: /^\d{10}$/, message: "Phone number must be 10 digits" } }
  ]
];

const StudentRegistrationStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    applicationNumber: "", // Add applicationNumber to state
    insightForm: {},
    parentData: {
      father: {},
      mother: {},
      guardian: {},
      emergencyContact: {}
    },
    medicalInfo: {},
    siblingInfo: {},
    previousSchools: [{}],
    classTeacherId: '', // Initialize classTeacherId
    sectionId: '', // Add sectionId to state
    profilePhoto: null,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [teachers, setTeachers] = useState([]); // State to store teachers
  const [sections, setSections] = useState([]); // Add sections state
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(null);
  const [uniqueClassNames, setUniqueClassNames] = useState([]); // Add this state
  const navigate = useNavigate();
  const [profilePreview, setProfilePreview] = useState("");

  function getLocalStorageData() { // Helper function for local storage data
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No token found in localStorage.");
      return null;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        // console.error("Token has expired.");
        localStorage.removeItem("token");
        navigate('/login');
        return null;
      }
      return { token, schoolId: decoded.schoolId, adminId: decoded.adminId, id: decoded.id, role: decoded.role };
    } catch (error) {
      // console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate('/login');
      return null;
    }
  };
  
  const localStorageData = getLocalStorageData(); // Get data once

  // Helper function to generate a short unique ID
  const generateShortUniqueId = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  // 1. Initial setup: Application Number and Fetch Teachers
  useEffect(() => {
    // Generate a short unique ID with capital letters and numbers
    const uniqueId = generateShortUniqueId(8); // Generate an 8-character ID
    setFormData(prev => ({
      ...prev,
      applicationNumber: uniqueId
    }));

    // Fetch teachers when component mounts
    const fetchTeachers = async () => {
      if (!localStorageData?.schoolId || !localStorageData?.token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/teachers/all/${localStorageData.schoolId}`, {
          headers: { Authorization: `Bearer ${localStorageData.token}` }
        });
        setTeachers(res.data.teachers || []);
      } catch (err) {
        console.error('Error fetching teachers:', err?.response?.data || err.message);
      }
    };
    
    fetchTeachers(); // Execute the teacher fetch

  }, []); // Run only once on mount

  // 2. Fetch classes and sections together
  useEffect(() => {
    const fetchClassesAndSections = async () => {
      if (!localStorageData?.token) return;
      setClassesLoading(true);
      setClassesError(null);
      try {
        // NOTE: The next line is external to this component and relies on local setup. 
        // Assuming '../../../api/classesApi' is correctly implemented and available.
        const { getClassesWithSections } = await import('../../../api/classesApi');
        const classesWithSectionsData = await getClassesWithSections();
        setClasses(classesWithSectionsData || []);

        // Extract unique class names for the dropdown
        const uniqueClassNames = Array.isArray(classesWithSectionsData)
          ? [...new Set(classesWithSectionsData.filter(cls => cls?.className).map(cls => cls.className))]
          : [];
        setUniqueClassNames(uniqueClassNames);
      } catch (err) {
        setClassesError(err?.message || 'Error fetching classes');
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClassesAndSections();
  }, [localStorageData?.token]);

  // 3. Update sections when class changes
  useEffect(() => {
    const updateSections = () => {
      if (!formData.className) {
        setSections([]);
        // Reset section name if no class is selected
        setFormData(prev => ({ ...prev, sectionName: '' }));
        return;
      }

      // Find the selected class (formData.className holds the class ID)
      const selectedClass = classes.find(cls => cls._id === formData.className);
      if (selectedClass && selectedClass.sections) {
        setSections(selectedClass.sections);
        setSectionsLoading(false);
        setSectionsError(null);
      } else {
        setSections([]);
        setSectionsLoading(false);
        setSectionsError(null);
      }
    };

    updateSections();
  }, [formData.className, classes]); // Depend on formData.className and classes state


  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested objects with dot notation
    const updateNestedState = (name, value) => {
      const keys = name.split('.');
      setFormData(prev => {
        const newState = { ...prev };
        let current = newState;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // Handle array indices (e.g., previousSchools[0].year)
          if (key.includes('[') && key.includes(']')) {
            const arrayKey = key.substring(0, key.indexOf('['));
            const index = key.match(/\[(\d+)\]/)[1];
            current[arrayKey] = current[arrayKey] || [];
            current[arrayKey][index] = current[arrayKey][index] || {};
            current = current[arrayKey][index];
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        }

        const lastKey = keys[keys.length - 1];
        current[lastKey] = type === "checkbox" ? checked : value;
        return newState;
      });
    };

    updateNestedState(name, value);
  };

  const handleFileChange = (e) => {
    const file = (e?.target?.files && e.target.files[0]) || e?.target?.value || null;
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }));
    } else {
      setFormData(prev => ({ ...prev, profilePhoto: null }));
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => {
      // Handle array indices (e.g., previousSchools[0].year)
      if (p.includes('[') && p.includes(']')) {
        const arrayKey = p.substring(0, p.indexOf('['));
        const index = p.match(/\[(\d+)\]/)[1];
        return (o && o[arrayKey] && o[arrayKey][index]) ? o[arrayKey][index] : undefined;
      }
      return (o && o[p] !== undefined) ? o[p] : undefined;
    }, obj);
  };
  
  const validateCurrentStep = () => {
    const currentFields = fieldsByStep[currentStep];
    const newErrors = {};

    currentFields.forEach(field => {
      const value = getNestedValue(formData, field.name);

      if (field.validation) {
        // Required validation
        if (field.validation.required && (!value && typeof value !== 'boolean')) {
          newErrors[field.name] = `${field.label} is required`;
          return; 
        }

        // Email validation
        if (field.validation.email && value && !/\S+@\S+\.\S+/.test(value)) {
          newErrors[field.name] = `Invalid email format for ${field.label}`;
          return;
        }

        // MinLength validation
        if (field.validation.minLength && value && typeof value === 'string' && value.length < field.validation.minLength) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
          return;
        }

        // Pattern validation
        if (field.validation.pattern && value && !field.validation.pattern.test(value)) {
          newErrors[field.name] = field.validation.message || `Invalid format for ${field.label}`;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    // Resolve class and section IDs (formData.className holds the class _id)
    const classIdToSend = formData.className || null;
    const sectionIdToSend = formData.sectionName || null; // sectionName holds the section ID

    const studentDataToSend = {
      ...formData,
      classId: classIdToSend,
      sectionId: sectionIdToSend,
      profilePhoto: undefined // Remove file object from JSON body
    };
    
    // Ensure we don't send temporary helper fields or nested objects in the main student object
    delete studentDataToSend.className; 
    delete studentDataToSend.sectionName;
    delete studentDataToSend.parentData;
    delete studentDataToSend.medicalInfo;
    delete studentDataToSend.siblingInfo;
    delete studentDataToSend.previousSchools;
    delete studentDataToSend.insightForm;

    // Ensure classTeacherId is null if it's an empty string
    if (studentDataToSend.classTeacherId === '') {
      studentDataToSend.classTeacherId = null;
    }

    const requestData = {
      studentData: studentDataToSend,
      parentData: formData.parentData,
      medicalInfo: formData.medicalInfo,
      siblingInfo: formData.siblingInfo,
      previousSchools: formData.previousSchools,
      insightForm: formData.insightForm,
      schoolId: localStorageData?.schoolId,
      adminId: localStorageData?.adminId || localStorageData?.id
    };

    console.log("Submitting data:", JSON.stringify(requestData, null, 2)); 

    if (!localStorageData?.token || !localStorageData?.schoolId) {
      console.error("Error: User authentication details missing. Please log in again.");
      toast.error("User authentication details missing. Please log in again.");
      return;
    }

    try {
      // Build multipart form data with JSON fields + optional file
      const formDataToSend = new FormData();
      formDataToSend.append('studentData', JSON.stringify(requestData.studentData));
      formDataToSend.append('parentData', JSON.stringify(requestData.parentData));
      formDataToSend.append('medicalInfo', JSON.stringify(requestData.medicalInfo));
      formDataToSend.append('siblingInfo', JSON.stringify(requestData.siblingInfo));
      formDataToSend.append('previousSchools', JSON.stringify(requestData.previousSchools));
      formDataToSend.append('insightForm', JSON.stringify(requestData.insightForm));
      formDataToSend.append('schoolId', requestData.schoolId);
      formDataToSend.append('adminId', requestData.adminId);
      if (formData.profilePhoto) {
        // Backend expects 'studentPhoto' on create
        formDataToSend.append('studentPhoto', formData.profilePhoto);
      }

      const res = await fetch(`${BASE_URL}/api/students/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorageData.token}`,
        },
        body: formDataToSend,
      });

      const result = await res.json();
      if (res.ok) {
        setSuccess(true);
        // Reset form data and generate a new application number for the next student
        setFormData({
          applicationNumber: generateShortUniqueId(8), // New ID
          insightForm: {},
          parentData: {
            father: {},
            mother: {},
            guardian: {},
            emergencyContact: {}
          },
          medicalInfo: {},
          siblingInfo: {},
          previousSchools: [{}],
          classTeacherId: '',
          sectionId: '',
          profilePhoto: null,
        });
        setProfilePreview("");
        setCurrentStep(0);
        
        if (result.student && result.student.applicationNumber) { 
          toast.success(`Student registration successful! Application Number: ${result.student.applicationNumber}`);
        } else {
          toast.success('Student registration successful, but application number was not returned.');
        }
      } else {
        console.error("Error submitting form:", result.message || "Unknown error");
        toast.error(`Registration failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error); 
      toast.error(`Registration failed: ${error.message || 'An unexpected error occurred.'}`); 
    }
  };

  const renderField = (field) => {
    const fieldId = `field-${field.name.replace(/\./g, '-')}`;
    const value = getNestedValue(formData, field.name);
    const error = errors[field.name];

    if (field.type === "dropdown") {
      // Determine options based on field name
      let optionsToRender = field.options;
      let disabled = false;

      if (field.name === 'className' || field.name === 'siblingInfo.class' || field.name === 'previousSchools[0].classAttended') {
        // Class selection: use unique class *names* for rendering the options, value is the class ID
        optionsToRender = uniqueClassNames; 
        disabled = classesLoading; 
      } else if (field.name === 'classTeacherId') {
        optionsToRender = teachers;
      } else if (field.name === 'sectionName') {
        // Section selection: options are section objects, value is the section ID
        optionsToRender = sections;
        disabled = !formData.className || classesLoading || sectionsLoading;
      }


      return (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <label htmlFor={fieldId} style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
          </label>
          <select
            id={fieldId}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", border: `1px solid ${error ? 'red' : '#ccc'}`, borderRadius: "4px" }}
            disabled={disabled}
          >
            <option value="">Select {field.label}</option>
            {field.name === 'className' || field.name === 'siblingInfo.class' || field.name === 'previousSchools[0].classAttended' ? (
              // Class Dropdown
              uniqueClassNames.map((className) => {
                const classObj = classes.find(cls => cls.className === className);
                return (
                  <option key={classObj?._id || className} value={classObj?._id || className}>
                    {className}
                  </option>
                );
              })
            ) : field.name === 'sectionName' ? (
              // Section Dropdown
              <>
                {sections.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
                {(!formData.className || sectionsLoading) && (
                  <option disabled value="">
                    {sectionsLoading ? 'Loading sections...' : 'Select a class first'}
                  </option>
                )}
              </>
            ) : field.name === 'classTeacherId' ? (
              // Teacher Dropdown
              teachers.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name}
                </option>
              ))
            ) : (
              // Generic Dropdown
              optionsToRender.map((option, idx) => {
                if (typeof option === 'string' || typeof option === 'number') {
                  return (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  );
                } else if (option && typeof option === 'object') {
                  const key = option._id || option.id || idx;
                  const label = option.name || option.className || option.label || JSON.stringify(option);
                  return (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  );
                } else {
                  return null;
                }
              })
            )}
          </select>
          {error && <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>{error}</div>}
          {/* Display loading/error for classes */}
          {(field.name === 'className' || field.name === 'siblingInfo.class' || field.name === 'previousSchools[0].classAttended') && classesLoading && (
            <div style={{ fontSize: "0.8em", marginTop: "4px", color: "#555" }}>Loading classes...</div>
          )}
          {(field.name === 'className' || field.name === 'siblingInfo.class' || field.name === 'previousSchools[0].classAttended') && classesError && (
            <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>Error loading classes: {classesError}</div>
          )}
        </div>
      );
    } else if (field.type === "checkbox") {
      return (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            <input
              id={fieldId}
              type="checkbox"
              name={field.name}
              checked={value || false}
              onChange={handleChange}
              style={{ marginRight: "8px" }}
            />
            {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
          </label>
          {error && <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>{error}</div>}
        </div>
      );
    } else if (field.type === "date") {
      return (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <label htmlFor={fieldId} style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
          </label>
          <input
            id={fieldId}
            type="date"
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", border: `1px solid ${error ? 'red' : '#ccc'}`, borderRadius: "4px" }}
          />
          {error && <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>{error}</div>}
        </div>
      );
    } else if (field.type === "image") {
      return (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <ImageUploader 
            label="Profile Photo"
            name="profilePhoto"
            onChange={handleFileChange}
            previewUrl={profilePreview}
            setPreviewUrl={setProfilePreview}
          />
        </div>
      );
    } else {
      return (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <label htmlFor={fieldId} style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
          </label>
          <input
            id={fieldId}
            type={field.type}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", border: `1px solid ${error ? 'red' : '#ccc'}`, borderRadius: "4px" }}
            readOnly={field.readOnly}
            placeholder={field.placeholder} // Added placeholder prop
          />
          {error && <div style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>{error}</div>}
        </div>
      );
    }
  };

  return (
    <div style={{ width: "97%",  margin: "0 auto", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        {steps.map((label, index) => (
          <div key={label} style={{ flex: 1, textAlign: "center", position: "relative" }}>
            <div
              style={{
                backgroundColor: index <= currentStep ? "red" : "#ccc",
                color: index <= currentStep ? "white" : "black",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px auto",
              }}
            >
              {index + 1}
            </div>
            <div style={{ fontSize: "0.8em" }}>{label}</div>
            {index < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "calc(100% - 60px)",
                  height: "2px",
                  backgroundColor: index < currentStep ? "red" : "#ccc",
                  zIndex: -1,
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "32px" }}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {fieldsByStep[currentStep].map((field) => renderField(field))}
        </motion.div>
        
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            style={{ padding: "10px 15px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
          >
            Back
          </button>
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              style={{ padding: "10px 15px", backgroundColor: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              disabled={classesLoading} // Disable submit while classes are loading
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{ padding: "10px 15px", backgroundColor: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              disabled={classesLoading} // Disable next while classes are loading
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationStepper