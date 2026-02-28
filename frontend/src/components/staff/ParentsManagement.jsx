import { useEffect, useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { LucideEdit, LucideTrash2, Plus, UserCheck } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  let schoolId = '';
  let adminId = '';

  try {
    if (token) {
      const decoded = jwtDecode(token);
      schoolId = decoded.schoolId;
      adminId = decoded.adminId;
    }
  } catch (err) {
    console.error('Invalid token');
  }

  // Fetch Parents
  const fetchParents = async () => {
    try {
              const res = await axios.get(`${BASE_URL}/api/parents/getAllParent/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParents(res.data.parents || []);
    } catch (err) {
      console.error('Error fetching parents:', err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (token && schoolId) {
      fetchParents();
    }
  }, [token]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email || !emailRegex.test(formData.email)) errors.email = 'Valid email required';
    if (!formData.phone || !phoneRegex.test(formData.phone)) errors.phone = '10-digit phone required';
    if (!formData.password || formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    return errors;
  };

  // Handle Create/Update
  const handleCreateOrUpdate = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let response;
      if (editId) {
        response = await axios.put(`${BASE_URL}/parents/updateParent/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParents((prev) => prev.map((p) => (p._id === editId ? { ...p, ...formData } : p)));
        setEditId(null);
      } else {
        response = await axios.post(`${BASE_URL}/parents/create`, {
          ...formData,
          schoolId,
          adminId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParents((prev) => [...prev, response.data.parent]);
      }

      setFormOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      setFormErrors({});
    } catch (err) {
      console.error('Error creating/updating parent:', err?.response?.data || err.message);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/parents/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParents((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Error deleting parent:', err?.response?.data || err.message);
    }
  };

  // OTP request
  const requestOtp = async (email) => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/otp/send-otp`, { email });
      setOtpEmail(email);
      setPasswordUpdateMessage('OTP sent to email');
    } catch (err) {
      setPasswordUpdateMessage('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP verification and password update
  const verifyOtpAndUpdatePassword = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${BASE_URL}/parents/updatepassword`, {
        email: otpEmail,
        otp: otpCode,
        newPassword,
      });
      setPasswordUpdateMessage(res.data.message || 'Password updated successfully');
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordUpdateMessage(err?.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Parent Management</h1>
        <button
          onClick={() => {
            setFormOpen(true);
            setEditId(null);
            setFormData({ name: '', email: '', phone: '', password: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          <Plus className="w-5 h-5" /> Add Parent
        </button>
      </div>

      {/* Search */}
      <input
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md"
        placeholder="Search parents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Update Password</h3>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <div className="mt-2 text-sm text-red-600">{passwordUpdateMessage}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={verifyOtpAndUpdatePassword} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {formOpen && (
        <div className="bg-gray-100 p-4 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">{editId ? 'Edit Parent' : 'Add Parent'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['name', 'email', 'phone', 'password'].map((field) => (
              <div key={field}>
                <input
                  name={field}
                  type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className={`p-2 border rounded w-full ${formErrors[field] ? 'border-red-500' : ''}`}
                  value={formData[field]}
                  onChange={handleInputChange}
                />
                {formErrors[field] && <p className="text-sm text-red-600">{formErrors[field]}</p>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateOrUpdate} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {editId ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Parent List */}
      {filteredParents.length === 0 ? (
        <p className="text-gray-500">No parents found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.map((parent) => (
            <div key={parent._id} className="rounded-2xl shadow-md border p-4 space-y-2">
              <div>
                <h2 className="text-lg font-semibold">{parent.name}</h2>
                <p className="text-sm text-gray-600">{parent.email}</p>
                <p className="text-sm text-gray-600">{parent.phone}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    setFormOpen(true);
                    setEditId(parent._id);
                    setFormData({ name: parent.name, email: parent.email, phone: parent.phone, password: '' });
                  }}
                  className="p-2 border rounded hover:bg-gray-100"
                >
                  <LucideEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(parent._id)}
                  className="p-2 border text-red-500 rounded hover:bg-red-100"
                >
                  <LucideTrash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setOtpEmail(parent.email);
                    setShowPasswordModal(true);
                    requestOtp(parent.email);
                  }}
                  className="p-2 border text-red-500 rounded hover:bg-red-100"
                >
                  Change Password
                </button>
                <div className="ml-auto flex items-center gap-1 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-md">
                  <UserCheck className="w-4 h-4" /> Active
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentManagement;
