import React, { useState } from "react";

const ChangePassword = () => {
  const [accountType, setAccountType] = useState("Teacher");
  const [formData, setFormData] = useState({
    id: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Replace with real API call
    console.log("Changing password for:", {
      type: accountType,
      id: formData.id,
      newPassword: formData.newPassword,
    });

    // Simulate success
    setSuccess(`Password for ${accountType} ID "${formData.id}" has been updated.`);
    setFormData({ id: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Account Password</h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Account Type
        </label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
          <option value="Parent">Parent</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-1">{accountType} ID</label>
          <input
            type="text"
            name="id"
            placeholder={`Enter ${accountType} ID`}
            value={formData.id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}
        {success && <p className="text-green-600 font-medium">{success}</p>}

        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
