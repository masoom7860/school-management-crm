import React, { useEffect, useState } from 'react';

const AllSuperAdmins = () => {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuperAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/superadmin/all-superadmins');
        const data = await res.json();
        if (res.ok) {
          setSuperAdmins(data.superAdmins || []);
        } else {
          setError(data.message || 'Failed to fetch super admins');
        }
      } catch (err) {
        setError('Failed to fetch super admins');
      } finally {
        setLoading(false);
      }
    };
    fetchSuperAdmins();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">All Super Admins</h2>
      {loading ? (
        <div>Loading super admins...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {superAdmins.map((admin) => (
              <tr key={admin._id}>
                <td className="py-2 px-4 border-b">{admin.name}</td>
                <td className="py-2 px-4 border-b">{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllSuperAdmins; 