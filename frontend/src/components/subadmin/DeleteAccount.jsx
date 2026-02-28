import React, { useState } from 'react';

const SubAdminDeleteAccount = () => {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, userId }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`${role} account deleted successfully.`);
        setUserId('');
        setRole('');
      } else {
        setMessage(result.message || 'Error deleting account.');
      }
    } catch (error) {
      setMessage('Something went wrong.');
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Delete User Account</h2>

      {message && (
        <div className="mb-4 text-sm text-center text-red-600 font-medium">{message}</div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Select Role</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">-- Choose Role --</option>
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
          <option value="Parent">Parent</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">User ID or Email</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter ID or Email"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <button
        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200"
        disabled={!role || !userId}
        onClick={() => setConfirmOpen(true)}
      >
        Delete Account
      </button>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the <strong>{role}</strong> account with ID/email: <strong>{userId}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminDeleteAccount;
