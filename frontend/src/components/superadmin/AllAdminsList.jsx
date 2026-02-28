import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AllAdminsList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    
    // Check if token exists
    const token = localStorage.getItem('superadmin_token');
    if (!token) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/superadmin/all-admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      console.error('Error fetching admins:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Clear invalid token
        localStorage.removeItem('superadmin_token');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view admins.');
      } else {
        setError(`Failed to fetch admins: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (schoolId) => {
    if (!schoolId) {
      toast.error('Invalid school ID');
      return;
    }
    
    setDeletingId(schoolId);
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }
      
      const response = await axios.delete(`/api/superadmin/delete-school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.data);
      toast.success('School and admin deleted successfully');
      fetchAdmins();
    } catch (err) {
      console.error('Error deleting school:', err);
      let errorMessage = 'Failed to delete school/admin.';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'School not found.';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
          localStorage.removeItem('superadmin_token');
        } else if (err.response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to delete this school.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>All School Admins</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: 8, border: '1px solid #e2e8f0' }}>Admin Name</th>
            <th style={{ padding: 8, border: '1px solid #e2e8f0' }}>Admin Email</th>
            <th style={{ padding: 8, border: '1px solid #e2e8f0' }}>School Name</th>
            <th style={{ padding: 8, border: '1px solid #e2e8f0' }}>School ID</th>
            <th style={{ padding: 8, border: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin._id}>
              <td style={{ padding: 8, border: '1px solid #e2e8f0' }}>{admin.name}</td>
              <td style={{ padding: 8, border: '1px solid #e2e8f0' }}>{admin.email}</td>
              <td style={{ padding: 8, border: '1px solid #e2e8f0' }}>{admin.school?.schoolName || 'N/A'}</td>
              <td style={{ padding: 8, border: '1px solid #e2e8f0' }}>{admin.school?._id || 'N/A'}</td>
              <td style={{ padding: 8, border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => handleDelete(admin.school?._id)}
                  disabled={deletingId === admin.school?._id || !admin.school?._id}
                  style={{ 
                    background: !admin.school?._id ? '#9ca3af' : deletingId === admin.school?._id ? '#6b7280' : '#ef4444', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '6px 12px', 
                    cursor: !admin.school?._id || deletingId === admin.school?._id ? 'not-allowed' : 'pointer',
                    opacity: !admin.school?._id || deletingId === admin.school?._id ? 0.6 : 1
                  }}
                >
                  {deletingId === admin.school?._id ? 'Deleting...' : !admin.school?._id ? 'No School' : 'Delete School'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllAdminsList; 