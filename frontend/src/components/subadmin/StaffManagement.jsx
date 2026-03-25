import { useEffect, useState, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import { LucideEye, LucideTrash2, LucideEdit } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Use default if not set

const steps = ["Personal Details", "Address & Contact", "Account Setup"];

// Updated identity validators to match backend enum values and StaffManagement's 'Other' option
const identityValidators = {
  'Aadhar Card': value => /^[2-9]{1}[0-9]{3}-?[0-9]{4}-?[0-9]{4}$/.test(value),
  'Passport': value => /^[A-PR-WYa-pr-wy][0-9]{7}$/.test(value),
  'Driving License': value => /^[A-Z]{2}[0-9]{2}[0-9]{11,13}$/.test(value),
  'PAN Card': value => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
  'Other': value => /^[a-zA-Z0-9\s\-_,.]{3,50}$/.test(value), // Keep 'Other' validation
};

const StaffManagement = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [staff, setStaff] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Add loading state for actions (create, update, delete)
  const [isNext, setIsNext] = useState(false);


  const [showStaffDetails, setShowStaffDetails] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // New: designation list and image upload state
  const [designations, setDesignations] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');


  // State for delete confimation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDeleteId, setItemToDeleteId] = useState(null)

  const token = localStorage.getItem('token');
  const schoolId = localStorage.getItem('schoolId');

  let adminId = null;
  try {
    const decoded = jwtDecode(token);
    adminId = decoded.adminId || decoded.staffId; // Use adminId or staffId from token
  } catch (error) {
    console.error('Invalid token or admin/staff ID not found in token');
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

  const [form, setForm] = useState(initialFormData);


  const fetchStaff = useCallback(async () => {
    if (!schoolId || !token) {
      toast.error('Missing school ID or token');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/staffs/getstaff/${schoolId}`);
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      toast.error(err?.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [schoolId, token]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Fetch designations for dropdown
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        if (!schoolId) return;
        const res = await axiosInstance.get('/api/designations', { params: { schoolId } });
        setDesignations(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Error fetching designations:', e);
        setDesignations([]);
      }
    };
    fetchDesignations();
  }, [schoolId]);

  useEffect(() => {
    setIsNext(false);
  }, [activeStep]);

  const validateStep = (step) => {
    // Skip validation when editing existing staff
    if (editingStaffId) {
      return true;
    }
    
    // Only validate for new staff creation
    const newErrors = {};
    
    if (step === 0) {
      if (!form.name.trim()) {
        newErrors.name = "Full Name is required";
      }
      if (!form.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        newErrors.email = "Invalid email format";
      }
      if (!form.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(form.phone.trim())) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
      if (!form.gender.trim()) {
        newErrors.gender = "Gender is required";
      }
      if (!form.dob.trim()) {
        newErrors.dob = "Date of birth is required";
      }
    } else if (step === 1) {
      if (!form.address.street.trim()) {
        newErrors.addressStreet = "Street address is required";
      }
      if (!form.address.city.trim()) {
        newErrors.addressCity = "City is required";
      }
      if (!form.address.state.trim()) {
        newErrors.addressState = "State is required";
      }
      if (!form.address.pincode.trim()) {
        newErrors.addressPincode = "Pincode is required";
      }
      if (!form.address.country.trim()) {
        newErrors.addressCountry = "Country is required";
      }
      // Emergency contact validation removed (fields are optional)
    } else if (step === 2) {
      if (!form.identityType.trim()) {
        newErrors.identityType = "Identity type is required";
      }
      if (form.identityType && form.identityType !== 'Other' && !form.identityNumber.trim()) {
        newErrors.identityNumber = "Identity number is required";
      }
      if (form.identityType && form.identityNumber.trim()) {
        const validator = identityValidators[form.identityType];
        if (validator && !validator(form.identityNumber.trim())) {
          newErrors.identityNumber = `Invalid ${form.identityType} format`;
        }
      }
      if (!form.designation.trim()) {
        newErrors.designation = "Designation is required";
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
      setForm(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else if (name.startsWith('address.')) { // Handle nested address fields
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name === 'identityNumber' && form.identityType === 'Aadhar Card') {
      // Format Aadhar number: add hyphen after every 4 digits
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');
      setForm(prev => ({ ...prev, [name]: formattedValue }));
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle photo selection & preview
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = useCallback(async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    if (!adminId) {
      toast.error('Admin/Staff ID is missing. Please re-login.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...form,
      adminId,
    };

    try {
      let res;
      if (editingStaffId) {
        // First, update core fields via JSON
        res = await axiosInstance.put(
          `/api/staffs/update/${editingStaffId}`,
          payload
        );
        toast.success(res.data.message || 'Staff updated successfully');

        // If a new photo is selected, upload it via multipart/form-data
        if (photoFile) {
          const fd = new FormData();
          fd.append('photo', photoFile);
          await axiosInstance.put(
            `/api/staffs/update/${editingStaffId}`,
            fd
          );
          toast.success('Photo uploaded successfully');
        }
      } else {
        // Create with JSON body (keeps nested objects intact)
        res = await axiosInstance.post(
          `/api/staffs/create/${schoolId}`,
          payload
        );
        toast.success(res.data.message || 'Staff added successfully');

        // If photo selected, upload it in a follow-up request
        if (photoFile && res?.data?.staff?._id) {
          const createdId = res.data.staff._id;
          const fd = new FormData();
          fd.append('photo', photoFile);
          await axiosInstance.put(
            `/api/staffs/update/${createdId}`,
            fd
          );
          toast.success('Photo uploaded successfully');
        }
      }

      fetchStaff();
      // Reset form and state
      setForm(initialFormData);
      setActiveStep(0);
      setErrors({});
      setEditingStaffId(null);
      setShowAddStaffModal(false);
      setPhotoFile(null);
      setPhotoPreview('');

    } catch (err) {
      console.error('Error submitting staff data:', err);
      let errorMessage = "Error submitting staff data";

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
  }, [activeStep, form, adminId, schoolId, fetchStaff, validateStep, editingStaffId, token]);


  const handleDelete = async (staffId) => {
    setActionLoading(true); // Set action loading before API call


    try {
      await axiosInstance.delete(`/api/staffs/delete/${staffId}`, {
        params: { adminId },
      });
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete staff');
    } finally {
      setActionLoading(false)// Set action loading to false on error or success
      setShowDeleteModal(false)// close modal for action
      setItemToDeleteId(null) // Clear item to delete
    }
  };

  const openDeletModal = (id) => {
    setItemToDeleteId(id)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setItemToDeleteId(null)
  }

  const handleEditClick = (staffMember) => {
    setEditingStaffId(staffMember._id);
    setForm({
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      password: '', // Password is not typically pre-filled for security reasons
      identityType: staffMember.identityType || '',
      identityNumber: staffMember.identityNumber || '',
      gender: staffMember.gender || '',
      dob: staffMember.dob ? staffMember.dob.split('T')[0] : '', // Format date for input
      address: staffMember.address || { street: '', city: '', state: '', pincode: '', country: '' }, // Populate as object, default to empty object
      designation: staffMember.designation || '',
      emergencyContact: staffMember.emergencyContact || { name: '', relation: '', phone: '' }, // Populate as object, default to empty object
    });
    setErrors({});
    setActiveStep(0); // Go back to the first step
    setShowAddStaffModal(true);

    // Prepare image preview if existing
    if (staffMember.photoUrl) {
      const isAbsolute = /^https?:\/\//i.test(staffMember.photoUrl);
      setPhotoPreview(isAbsolute ? staffMember.photoUrl : `${BASE_URL}/${staffMember.photoUrl}`);
    } else {
      setPhotoPreview('');
    }
    setPhotoFile(null);
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setForm(initialFormData); // Reset form
    setActiveStep(0); // Go back to the first step
    setErrors({}); // Clear errors
    setShowAddStaffModal(false);
  };


  const handleShowDetails = (staff) => {
    setShowStaffDetails(staff);
  };

  const closeModal = () => {
    setShowStaffDetails(null);
  };

  // Helper to ensure photo URLs are absolute for display
  const getPhotoSrc = (url) => {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `${BASE_URL}/${url}`;
  };

  const filteredStaff = staff.filter((s) => {
    const q = (search || '').toLowerCase();
    const name = String(s?.name || '').toLowerCase();
    const phone = String(s?.phone || '').toLowerCase();
    const email = String(s?.email || '').toLowerCase();
    const role = String(s?.role || '');
    return (name.includes(q) || phone.includes(q) || email.includes(q)) && (roleFilter === '' || role === roleFilter);
  });

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
                value={form.name}
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
                value={form.email}
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
                value={form.phone}
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
                value={form.gender}
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
                value={form.dob}
                onChange={handleInputChange}
                placeholder="Select date of birth"
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* Photo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black-700 mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full p-2 border rounded border-black-300"
              />
              {photoPreview && (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-full border"
                  />
                </div>
              )}
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
                value={form.address.street}
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
                value={form.address.city}
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
                value={form.address.state}
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
                value={form.address.pincode}
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
                value={form.address.country}
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
              <label className="block text-sm font-medium text-black-700 mb-1">Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                className={`w-full p-2 border rounded ${errors.emergencyContactName ? 'border-red-500' : 'border-black-300'}`}
                value={form.emergencyContact.name}
                onChange={handleInputChange}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Relation</label>
              <input
                type="text"
                name="emergencyContact.relation"
                className={`w-full p-2 border rounded ${errors.emergencyContactRelation ? 'border-red-500' : 'border-black-300'}`}
                value={form.emergencyContact.relation}
                onChange={handleInputChange}
                placeholder="Enter emergency contact relation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Phone</label>
              <input
                type="text"
                name="emergencyContact.phone"
                className={`w-full p-2 border rounded ${errors.emergencyContactPhone ? 'border-red-500' : 'border-black-300'}`}
                value={form.emergencyContact.phone}
                onChange={handleInputChange}
                placeholder="Enter emergency contact phone"
              />
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
                value={form.identityType}
                onChange={handleInputChange}
              >
                <option value="">Select Identity Type</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Other">Other</option>
              </select>
              {errors.identityType && <p className="text-red-500 text-xs mt-1">{errors.identityType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Identity Number*</label>
              <input
                type="text"
                name="identityNumber"
                className={`w-full p-2 border rounded ${errors.identityNumber ? 'border-red-500' : 'border-black-300'}`}
                value={form.identityNumber}
                onChange={handleInputChange}
                placeholder={
                  form.identityType === 'Aadhar Card' ? 'e.g., 1234-5678-9012' :
                    form.identityType === 'Passport' ? 'e.g., A1234567' :
                      form.identityType === 'Driving License' ? 'e.g., DL0120190123456' :
                        form.identityType === 'PAN Card' ? 'e.g., ABCDE1234F' :
                          'Enter Identity Number'
                }
              />
              {form.identityType === 'Aadhar Card' && <span className="text-xs text-black-500 mt-1">Format: XXXX-XXXX-XXXX</span>}
              {form.identityType === 'Passport' && <span className="text-xs text-black-500 mt-1">Format: 1 letter, 7 digits</span>}
              {form.identityType === 'Driving License' && <span className="text-xs text-black-500 mt-1">Format: 2 letters, 2 digits, 11-13 digits</span>}
              {form.identityType === 'PAN Card' && <span className="text-xs text-black-500 mt-1">Format: 5 letters, 4 digits, 1 letter</span>}
              {errors.identityNumber && <p className="text-red-500 text-xs mt-1">{errors.identityNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black-700 mb-1">Designation*</label>
              <select
                name="designation"
                className={`w-full p-2 border rounded ${errors.designation ? 'border-red-500' : 'border-black-300'}`}
                value={form.designation}
                onChange={handleInputChange}
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
            </div>

            {!editingStaffId && (
              <div>
                <label className="block text-sm font-medium text-black-700 mb-1">Password*</label>
                <input
                  type="password"
                  name="password"
                  className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-black-300'}`}
                  value={form.password}
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
  <div className="p-6 space-y-6 max-w-screen-2xl mx-auto w-full">
        <h1 className="text-2xl font-semibold">Staff Management</h1>

        <div className="flex flex-wrap gap-4">
          <input
            className="px-4 py-2 border rounded-md"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Filter by Role</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => {
              setEditingStaffId(null);
              setForm(initialFormData);
              setErrors({});
              setActiveStep(0);
              setShowAddStaffModal(true);
              setPhotoFile(null);
              setPhotoPreview('');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Add Staff
          </button>
        </div>

        {loading ? (
          <p>Loading staff...</p>
        ) : (
          <div className="overflow-x-auto text-sm">
            {filteredStaff.length > 0 ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
             
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-black uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-black uppercase tracking-wider">Mobile / Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-black uppercase tracking-wider">RegNo / DOB</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-black uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            {member.photoUrl ? (
                              <img
                                src={getPhotoSrc(member.photoUrl)}
                                alt={`${member.name} photo`}
                                className="w-10 h-10 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-base font-semibold text-gray-600">
                                {(member.name || '').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-base">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          <div className="font-medium">{member.phone}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          <div className="font-medium">{member.identityNumber}</div>
                          <div className="text-sm text-gray-500">{member.dob ? new Date(member.dob).toLocaleDateString() : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleShowDetails(member)}
                              className="text-green-600 hover:text-green-800"
                              title="View"
                            >
                              <LucideEye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDeletModal(member._id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={actionLoading}
                              title="Delete"
                            >
                              <LucideTrash2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditClick(member)}
                              className="text-red-600 hover:text-red-800"
                              title="Edit"
                            >
                              <LucideEdit className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No staff members found.</p>
            )}
          </div>
        )}
      </div>

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-6 rounded-lg shadow-md space-y-4 w-[90%] max-w-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowAddStaffModal(false);
                if (editingStaffId) handleCancelEdit(); // Reset if cancelling edit
                else { // Reset if cancelling add
                  setForm(initialFormData);
                  setErrors({});
                  setActiveStep(0);
                }
                setPhotoFile(null);
                setPhotoPreview('');
              }}
              className="absolute top-2 right-2 bg-red-600 text-white hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center text-lg"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold">{editingStaffId ? 'Edit Staff' : 'Add New Staff'}</h2>

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


            <form>
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
                  {editingStaffId && (
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
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                    >
                      {isSubmitting ? (editingStaffId ? 'Updating...' : 'Submitting...') : (editingStaffId ? 'Update Staff' : 'Submit')}
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
      {showStaffDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"> {/* Added padding */}
          <div className="relative bg-white p-10 rounded-lg shadow-xl space-y-6 w-[95%] max-w-3xl overflow-y-auto max-h-[90vh]"> {/* Increased max-width, added shadow, increased padding, added overflow and max-height */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 bg-red-600 text-white hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" /* Adjusted position, added font-bold */
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 pb-3 mb-4">{showStaffDetails.name} - Details</h2> {/* Increased text size, bold, thicker border */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap, added two columns for larger screens */}
              <div className="flex flex-col items-center md:items-start"> {/* Centered photo on small screens */}
                <p className="font-semibold text-gray-700 mb-2">Photo:</p> {/* Styled label */}
                {showStaffDetails.photoUrl ? (
                  <img src={getPhotoSrc(showStaffDetails.photoUrl)} alt={`${showStaffDetails.name}'s photo`} className="w-32 h-32 object-cover rounded-full border-2 border-gray-300" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600">
                    {(showStaffDetails.name || '').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-4"> {/* Added space between items in this column */}
                <div>
                  <p className="font-semibold text-gray-700">Email:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.email}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Phone:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.phone}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Role:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.role}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Identity Type:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.identityType}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Identity Number:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.identityNumber}</p> {/* Styled value */}
                </div>
                {showStaffDetails.identityDocumentUrl && (
                  <div>
                    <p className="font-semibold text-gray-700">Identity Document:</p> {/* Styled label */}
                    <a href={getPhotoSrc(showStaffDetails.identityDocumentUrl)} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">{showStaffDetails.identityType} Document</a> {/* Styled link */}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-700">Gender:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.gender}</p> {/* Styled value */}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Date of Birth:</p> {/* Styled label */}
                  <p className="text-gray-900">{showStaffDetails.dob ? new Date(showStaffDetails.dob).toLocaleDateString() : ''}</p> {/* Styled value */}
                </div>
              </div> {/* Closing div for column */}

              {/* Display Address fields if address is an object */}
              {showStaffDetails.address && typeof showStaffDetails.address === 'object' ? (
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Address</h3> {/* Styled sub-heading */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Nested grid for address details */}
                    <div>
                      <p className="font-semibold text-gray-700">Street:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.address.street}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">City:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.address.city}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">State:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.address.state}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Pincode:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.address.pincode}</p> {/* Styled value */}
                    </div>
                    <div className="md:col-span-2"> {/* Span two columns for country */}
                      <p className="font-semibold text-gray-700">Country:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.address.country}</p> {/* Styled value */}
                    </div>
                  </div>
                </div>
              ) : (
                // Display Address as string if it's not an object
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Address</h3> {/* Styled sub-heading */}
                  <div>
                    <p className="font-semibold text-gray-700">Address:</p> {/* Styled label */}
                    <p className="text-gray-900">{showStaffDetails.address}</p> {/* Styled value */}
                  </div>
                </div>
              )}

              <div className="md:col-span-2"> {/* Span two columns */}
                <p className="font-semibold text-gray-700">Designation:</p> {/* Styled label */}
                <p className="text-gray-900">{showStaffDetails.designation}</p> {/* Styled value */}
              </div>
              {/* Emergency Contact Details */}
              {showStaffDetails.emergencyContact && typeof showStaffDetails.emergencyContact === 'object' ? (
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact</h3> {/* Styled sub-heading */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Nested grid for emergency contact details */}
                    <div>
                      <p className="font-semibold text-gray-700">Name:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.emergencyContact.name}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Relation:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.emergencyContact.relation}</p> {/* Styled value */}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Phone:</p> {/* Styled label */}
                      <p className="text-gray-900">{showStaffDetails.emergencyContact.phone}</p> {/* Styled value */}
                    </div>
                  </div>
                </div>
              ) : (
                // Display Emergency Contact as string if it's not an object
                <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200"> {/* Span two columns, added border */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact</h3> {/* Styled sub-heading */}
                  <div>
                    <p className="font-semibold text-gray-700">Emergency Contact:</p> {/* Styled label */}
                    <p className="text-gray-900">{showStaffDetails.emergencyContact}</p> {/* Styled value */}
                  </div>
                </div>
              )}
              <div className="md:col-span-2"> {/* Span two columns */}
                <p className="font-semibold text-gray-700">Active Status:</p> {/* Styled label */}
                <p className="text-gray-900">{showStaffDetails.isActive ? 'Active' : 'Inactive'}</p> {/* Styled value */}
              </div>
            </div> {/* Closing div for main grid */}


            <div className="flex justify-end gap-2 border-t pt-4 mt-4 border-gray-200"> {/* Added border */}
              <button onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Close</button> {/* Styled button */}
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        itemToDelete={itemToDeleteId}
      />
    </>
  );
};

export default StaffManagement;
