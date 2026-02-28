import { useEffect, useState, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import { LucideEye, LucideTrash2, LucideEdit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Use default if not set

const steps = ["Personal Details", "Address & Contact", "Account Setup"];

// Updated identity validators to match backend enum values
const identityValidators = {
  'Aadhar': value => /^[2-9]{1}[0-9]{3}-?[0-9]{4}-?[0-9]{4}$/.test(value),
  'Passport': value => /^[A-PR-WYa-pr-wy][0-9]{7}$/.test(value),
  'Driving License': value => /^[A-Z]{2}[0-9]{2}[0-9]{11,13}$/.test(value),
  'PAN': value => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
};

const SubAdminManagement = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [subadmins, setSubadmins] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubAdminId, setEditingSubAdminId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSubAdminDetails, setShowSubAdminDetails] = useState(null);
  const [showAddSubAdminModal, setShowAddSubAdminModal] = useState(false);


  const token = localStorage.getItem('token');
  const schoolId = localStorage.getItem('schoolId');

  let adminId = null;
  try {
    const decoded = jwtDecode(token);
    adminId = decoded.adminId;
  } catch (error) {
    console.error('Invalid token or adminId not found in token');
  }

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    identityType: '',
    identityNumber: '',
    gender: '',
    dob: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    designation: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
  };

  const [formData, setFormData] = useState(initialFormData);


  const fetchSubAdmins = useCallback(async () => {
    if (!schoolId || !token) {
      toast.error('Missing school ID or token');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/subadmins/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubadmins(res.data.subadmins || []);
    } catch (err) {
      console.error('Error fetching subadmins:', err);
      toast.error(err?.response?.data?.message || 'Failed to load subadmins');
    } finally {
      setLoading(false);
    }
  }, [schoolId, token]);

  useEffect(() => {
    fetchSubAdmins();
  }, [fetchSubAdmins]);

  const validateStep = (step) => {
    // Skip validation when editing existing subadmin
    if (isEditing) {
      return true;
    }
    
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of day for comparison

    if (step === 0) { // Personal Details
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
      if (!formData.dob.trim()) {
        newErrors.dob = 'Date of Birth is required';
      } else {
        const dobDate = new Date(formData.dob);
        if (isNaN(dobDate.getTime())) {
          newErrors.dob = "Invalid date format";
        } else if (dobDate > today) {
          newErrors.dob = "Date of birth cannot be in the future";
        }
      }

    } else if (step === 1) { // Address & Contact
      // Validation for address fields
      if (!formData.address.street.trim()) newErrors.addressStreet = 'Street is required';
      if (!formData.address.city.trim()) newErrors.addressCity = 'City is required';
      if (!formData.address.state.trim()) newErrors.addressState = 'State is required';
      if (!formData.address.pincode.trim()) newErrors.addressPincode = 'Pincode is required';
      if (!formData.address.country.trim()) newErrors.addressCountry = 'Country is required';

      // Validation for emergency contact fields
      if (!formData.emergencyContact.name.trim()) newErrors.emergencyContactName = 'Emergency Contact Name is required';
      if (!formData.emergencyContact.relation.trim()) newErrors.emergencyContactRelation = 'Emergency Contact Relation is required';
      if (!formData.emergencyContact.phone.trim()) {
        newErrors.emergencyContactPhone = 'Emergency Contact Phone is required';
      } else if (!/^\d{10}$/.test(formData.emergencyContact.phone.trim())) {
        newErrors.emergencyContactPhone = 'Emergency Contact Phone must be 10 digits';
      }

    } else if (step === 2) { // Account Setup
      // Validation for identity fields
      if (!formData.identityType.trim()) {
        newErrors.identityType = 'Identity Type is required';
      }
      if (!formData.identityNumber.trim()) {
        newErrors.identityNumber = 'Identity Number is required';
      } else if (formData.identityType && identityValidators[formData.identityType] && !identityValidators[formData.identityType](formData.identityNumber.trim())) {
        newErrors.identityNumber = `Invalid ${formData.identityType} format`;
      }
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';

      // Password is required only for adding new subadmin
      if (!isEditing) {
        if (!formData.password.trim()) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
    } else if (name === 'identityNumber' && formData.identityType === 'Aadhar') {
      // Format Aadhar number: add hyphen after every 4 digits
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = useCallback(async () => {
    if (activeStep !== steps.length - 1) {
      return; // Only submit if on the last step
    }

    if (!validateStep(activeStep)) {
      return;
    }

    if (!adminId) {
      toast.error('Admin ID is missing. Please re-login.');
      return;
    }

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    // Append form data fields to the FormData object
    for (const key in formData) {
      // Handle nested objects by appending their fields individually
      if (key === 'address' || key === 'emergencyContact') {
        for (const nestedKey in formData[key]) {
          formDataToSend.append(`${key}[${nestedKey}]`, formData[key][nestedKey]);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    formDataToSend.append('adminId', adminId);

    try {
      let res;
      if (isEditing) {
        if (!editingSubAdminId) {
          toast.error('Subadmin ID is missing for update.');
          setIsSubmitting(false);
          return;
        }
        res = await axios.put(
          `${BASE_URL}/subadmins/update/${adminId}/${editingSubAdminId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(res.data.message || 'Subadmin updated successfully');
      } else {
        res = await axios.post(
          `${BASE_URL}/subadmins/create/${schoolId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(res.data.message || 'Subadmin added successfully');
      }

      fetchSubAdmins();
      // Reset form and state
      setFormData(initialFormData);
      setActiveStep(0);
      setErrors({});
      setIsEditing(false);
      setEditingSubAdminId(null);
      setShowAddSubAdminModal(false);

    } catch (err) {
      console.error('Error submitting subadmin data:', err);
      let errorMessage = "Error submitting subadmin data";

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
  }, [activeStep, formData, adminId, schoolId, fetchSubAdmins, validateStep, isEditing, editingSubAdminId, token]);


  const handleDelete = async (subadminId) => {
    try {
      await axios.delete(`${BASE_URL}/subadmins/delete/${subadminId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { adminId },
      });
      toast.success('Subadmin deleted successfully');
      fetchSubAdmins();
    } catch (err) {
      console.error('Error deleting subadmin:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete subadmin');
    }
  };

  const handleEditClick = (subadminMember) => {
    setIsEditing(true);
    setEditingSubAdminId(subadminMember._id);
    setFormData({
      name: subadminMember.name || '',
      email: subadminMember.email || '',
      phone: subadminMember.phone || '',
      password: '', // Password is not typically pre-filled for security reasons
      identityType: subadminMember.identityType || '',
      identityNumber: subadminMember.identityNumber || '',
      gender: subadminMember.gender || '',
      dob: subadminMember.dob ? subadminMember.dob.split('T')[0] : '', // Format date for input
      address: subadminMember.address || { street: '', city: '', state: '', pincode: '', country: '' }, // Populate as object, default to empty object
      designation: subadminMember.designation || '',
      emergencyContact: subadminMember.emergencyContact || { name: '', relation: '', phone: '' }, // Populate as object, default to empty object
    });
    setErrors({});
    setActiveStep(0); // Go back to the first step
    setShowAddSubAdminModal(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSubAdminId(null);
    setFormData(initialFormData); // Reset form
    setActiveStep(0); // Go back to the first step
    setErrors({}); // Clear errors
    setShowAddSubAdminModal(false);
  };


  const handleShowDetails = (subadmin) => {
    setShowSubAdminDetails(subadmin);
  };

  const closeModal = () => {
    setShowSubAdminDetails(null);
  };


  const filteredSubAdmins = subadmins.filter((s) =>
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === '' || s.role === roleFilter)
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Personal Details
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-black-300'}`}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-black-300'}`}
                value={formData.email}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Gender*</label>
              <select
                name="gender"
                className={`w-full p-2 border rounded ${errors.gender ? 'border-red-500' : 'border-black-300'}`}
                value={formData.gender}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Select date of birth"
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>
          </div>
        );

      case 1: // Address & Contact
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address Fields */}
            <div className="md:col-span-2">
              <h3 className="text-md font-semibold mb-2">Address</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Street Address*</label>
              <input
                type="text"
                name="address.street"
                className={`w-full p-2 border rounded ${errors.addressStreet ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Enter street address"
              />
              {errors.addressStreet && <p className="text-red-500 text-xs mt-1">{errors.addressStreet}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">City*</label>
              <input
                type="text"
                name="address.city"
                className={`w-full p-2 border rounded ${errors.addressCity ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="Enter city"
              />
              {errors.addressCity && <p className="text-red-500 text-xs mt-1">{errors.addressCity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">State*</label>
              <input
                type="text"
                name="address.state"
                className={`w-full p-2 border rounded ${errors.addressState ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="Enter state"
              />
              {errors.addressState && <p className="text-red-500 text-xs mt-1">{errors.addressState}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Pincode*</label>
              <input
                type="text"
                name="address.pincode"
                className={`w-full p-2 border rounded ${errors.addressPincode ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.pincode}
                onChange={handleInputChange}
                placeholder="Enter pincode"
              />
              {errors.addressPincode && <p className="text-red-500 text-xs mt-1">{errors.addressPincode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Country*</label>
              <input
                type="text"
                name="address.country"
                className={`w-full p-2 border rounded ${errors.addressCountry ? 'border-red-500' : 'border-black-300'}`}
                value={formData.address.country}
                onChange={handleInputChange}
                placeholder="Enter country"
              />
              {errors.addressCountry && <p className="text-red-500 text-xs mt-1">{errors.addressCountry}</p>}
            </div>

            {/* Emergency Contact Fields */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-md font-semibold mb-2">Emergency Contact</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Contact Name*</label>
              <input
                type="text"
                name="emergencyContact.name"
                className={`w-full p-2 border rounded ${errors.emergencyContactName ? 'border-red-500' : 'border-black-300'}`}
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Relation*</label>
              <input
                type="text"
                name="emergencyContact.relation"
                className={`w-full p-2 border rounded ${errors.emergencyContactRelation ? 'border-red-500' : 'border-black-300'}`}
                value={formData.emergencyContact.relation}
                onChange={handleInputChange}
                placeholder="Enter emergency contact relation"
              />
              {errors.emergencyContactRelation && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Phone*</label>
              <input
                type="text"
                name="emergencyContact.phone"
                className={`w-full p-2 border rounded ${errors.emergencyContactPhone ? 'border-red-500' : 'border-black-300'}`}
                value={formData.emergencyContact.phone}
                onChange={handleInputChange}
                placeholder="Enter emergency contact phone"
              />
              {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
            </div>
          </div>
        );

      case 2: // Account Setup
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Identity Type*</label>
              <select
                name="identityType"
                className={`w-full p-2 border rounded ${errors.identityType ? 'border-red-500' : 'border-black-300'}`}
                value={formData.identityType}
                onChange={handleInputChange}
              >
                <option value="">Select Identity Type</option>
                <option value="Aadhar">Aadhar</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="PAN">PAN</option>
              </select>
              {errors.identityType && <p className="text-red-500 text-xs mt-1">{errors.identityType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Identity Number*</label>
              <input
                type="text"
                name="identityNumber"
                className={`w-full p-2 border rounded ${errors.identityNumber ? 'border-red-500' : 'border-black-300'}`}
                value={formData.identityNumber}
                onChange={handleInputChange}
                placeholder={
                  formData.identityType === 'Aadhar' ? 'e.g., 1234-5678-9012' :
                    formData.identityType === 'Passport' ? 'e.g., A1234567' :
                      formData.identityType === 'Driving License' ? 'e.g., DL0120190123456' :
                        formData.identityType === 'PAN' ? 'e.g., ABCDE1234F' :
                          'Enter Identity Number'
                }
              />
              {formData.identityType === 'Aadhar' && <span className="text-xs text-black-500 mt-1">Format: XXXX-XXXX-XXXX</span>}
              {formData.identityType === 'Passport' && <span className="text-xs text-black-500 mt-1">Format: 1 letter, 7 digits</span>}
              {formData.identityType === 'Driving License' && <span className="text-xs text-black-500 mt-1">Format: 2 letters, 2 digits, 11-13 digits</span>}
              {formData.identityType === 'PAN' && <span className="text-xs text-black-500 mt-1">Format: 5 letters, 4 digits, 1 letter</span>}
              {errors.identityNumber && <p className="text-red-500 text-xs mt-1">{errors.identityNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Designation*</label>
              <input
                type="text"
                name="designation"
                className={`w-full p-2 border rounded ${errors.designation ? 'border-red-500' : 'border-black-300'}`}
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Enter designation"
              />
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Password*</label>
                <input
                  type="password"
                  name="password"
                  className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-black-300'}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
          </div>
        );

      default:
        return "Unknown step";
    }
  };


  return (
    <> {/* Wrap in Fragment */}
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Subadmin Management</h1>

        <div className="flex flex-wrap gap-4">
          <input
            className="px-4 py-2 border rounded-md"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingSubAdminId(null);
              setFormData(initialFormData);
              setErrors({});
              setActiveStep(0);
              setShowAddSubAdminModal(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Add Subadmin
          </button>
        </div>

        {loading ? (
          <p>Loading subadmins...</p>
        ) : (
          <div className="overflow-x-auto">
            {filteredSubAdmins.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border-b text-left font-medium">NAME</th>
                    <th className="py-3 px-4 border-b text-left font-medium">MOBILE / EMAIL</th>
                    <th className="py-3 px-4 border-b text-left font-medium">REGNO/DOB</th>
                    <th className="py-3 px-4 border-b text-left font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubAdmins.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.designation}</div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="font-medium">{member.phone}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="font-medium">{member.identityNumber}</div>
                        <div className="text-sm text-gray-600">
                          {member.dob ? new Date(member.dob).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleShowDetails(member)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <LucideEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <LucideTrash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(member)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <LucideEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No subadmin members found.</p>
            )}
          </div>
        )}
      </div>

      {showAddSubAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-6 rounded-lg shadow-md space-y-4 w-[90%] max-w-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowAddSubAdminModal(false);
                if (isEditing) handleCancelEdit(); // Reset if cancelling edit
                else { // Reset if cancelling add
                  setFormData(initialFormData);
                  setErrors({});
                  setActiveStep(0);
                }
              }}
              className="absolute top-2 right-2 bg-red-600 text-white hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center text-lg"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold">{editingSubAdminId ? 'Edit Subadmin' : 'Add New Subadmin'}</h2>

            {/* Stepper */}
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


            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {getStepContent(activeStep)}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  className={`px-4 py-2 rounded-md ${activeStep === 0 ? 'bg-black-300 cursor-not-allowed' : 'bg-black-200 hover:bg-black-300'}`}
                >
                  Back
                </button>

                <div className="flex space-x-4">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-black-500 text-white rounded-md hover:bg-black-600"
                    >
                      Cancel Edit
                    </button>
                  )}
                  {activeStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                    >
                      {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Subadmin' : 'Submit')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Details Modal - Updated to show nested emergency contact and other fields */}
      {showSubAdminDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"> {/* Added padding */}
          <div className="relative bg-white p-10 rounded-lg shadow-xl space-y-6 w-[95%] max-w-3xl overflow-y-auto max-h-[90vh]"> {/* Increased max-width, added shadow, increased padding, added overflow and max-height */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 bg-red-600 text-white hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" /* Adjusted position, added font-bold */
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 pb-3 mb-4">{showSubAdminDetails.name} - Details</h2> {/* Increased text size, bold, thicker border */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap, added two columns for larger screens */}
              {showSubAdminDetails.photoUrl && (
                <div className="flex flex-col items-center md:items-start"> {/* Centered photo on small screens */}
                  <p className="font-semibold text-gray-700 mb-2">Photo:</p> {/* Styled label */}
                  <img src={showSubAdminDetails.photoUrl} alt={`${showSubAdminDetails.name}'s photo`} className="w-32 h-32 object-cover rounded-full border-2 border-gray-300" /> {/* Increased size, rounded, added border */}
                </div>
              )}
              <div className="space-y-4"> {/* Added space between items in this column */}
                <div>
                  <p className="font-semibold text-gray-700">Email:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.email}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Phone:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.phone}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Role:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.role}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Identity Type:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.identityType}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Identity Number:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.identityNumber}</p> {/* Styled value */}
                </div>
                {showSubAdminDetails.identityDocumentUrl && (
                  <div>
                    <p className="font-semibold text-gray-700">Identity Document:</p> {/* Styled label */}
                    <a href={showSubAdminDetails.identityDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">{showSubAdminDetails.identityType} Document</a> {/* Styled link */}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-700">Gender:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.gender}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Date of Birth:</p> {/* Styled label */}
                  <p className="text-gray-900">{showSubAdminDetails.dob ? new Date(showSubAdminDetails.dob).toLocaleDateString() : ''}</p> {/* Styled value */}
                </div>
              </div> {/* Closing div for column */}

              {/* Display Address fields if address is an object */}
              {showSubAdminDetails.address && typeof showSubAdminDetails.address === 'object' ? (
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Address</h3> {/* Styled sub-heading */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Nested grid for address details */}
                    <div>
                      <p className="font-semibold text-gray-700">Street:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.address.street}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">City:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.address.city}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">State:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.address.state}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Pincode:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.address.pincode}</p> {/* Styled value */}
                    </div>
                    <div className="md:col-span-2"> {/* Span two columns for country */}
                      <p className="font-semibold text-gray-700">Country:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.address.country}</p> {/* Styled value */}
                    </div>
                  </div>
                </div>
              ) : (
                // Display Address as string if it's not an object
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Address</h3> {/* Styled sub-heading */}
                  <div>
                    <p className="font-semibold text-gray-700">Address:</p> {/* Styled label */}
                    <p className="text-gray-900">{showSubAdminDetails.address}</p> {/* Styled value */}
                  </div>
                </div>
              )}

              <div className="md:col-span-2"> {/* Span two columns */}
                <p className="font-semibold text-gray-700">Designation:</p> {/* Styled label */}
                <p className="text-gray-900">{showSubAdminDetails.designation}</p> {/* Styled value */}
              </div>
              {/* Emergency Contact Details */}
              {showSubAdminDetails.emergencyContact && (
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact</h3> {/* Styled sub-heading */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Nested grid for emergency contact details */}
                    <div>
                      <p className="font-semibold text-gray-700">Name:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.emergencyContact.name}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Relation:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.emergencyContact.relation}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Phone:</p> {/* Styled label */}
                      <p className="text-gray-900">{showSubAdminDetails.emergencyContact.phone}</p> {/* Styled value */}
                    </div>
                  </div>
                </div>
              )}
              <div className="md:col-span-2"> {/* Span two columns */}
                <p className="font-semibold text-gray-700">Active Status:</p> {/* Styled label */}
                <p className="text-gray-900">{showSubAdminDetails.isActive ? 'Active' : 'Inactive'}</p> {/* Styled value */}
              </div>
            </div> {/* Closing div for main grid */}


            <div className="flex justify-end gap-2 border-t pt-4 mt-4 border-gray-200"> {/* Added border */}
              <button onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Close</button> {/* Styled button */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubAdminManagement;
