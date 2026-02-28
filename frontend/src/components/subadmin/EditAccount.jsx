import React, { useState } from "react";

const EditAccount = () => {
  const [accountType, setAccountType] = useState("Teacher");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit updated data to backend
    console.log("Submitting:", { accountType, ...formData });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Account</h2>

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
          <label className="block text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">{accountType} ID</label>
          <input
            type="text"
            name="id"
            placeholder={`Enter ${accountType} ID`}
            value={formData.id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditAccount;
