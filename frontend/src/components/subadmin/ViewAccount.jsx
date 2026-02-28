import React, { useState, useEffect } from "react";

const mockData = {
  Teacher: [
    { id: "T001", name: "John Doe", email: "john@school.com", phone: "1234567890" },
    { id: "T002", name: "Jane Smith", email: "jane@school.com", phone: "9876543210" },
  ],
  Student: [
    { id: "S001", name: "Alice Green", email: "alice@student.com", phone: "1112223333" },
    { id: "S002", name: "Bob Brown", email: "bob@student.com", phone: "4445556666" },
  ],
  Staff: [
    { id: "SF001", name: "Emily White", email: "emily@school.com", phone: "9998887777" },
  ],
  Parent: [
    { id: "P001", name: "Mr. Patel", email: "patel@parent.com", phone: "7778889999" },
  ],
};

const ViewAccount = () => {
  const [accountType, setAccountType] = useState("Teacher");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // Replace this with API call to fetch accounts by type
    setAccounts(mockData[accountType] || []);
  }, [accountType]);

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">View Accounts</h2>

        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="Teacher">Teacher</option>
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
          <option value="Parent">Parent</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left px-4 py-2 border">ID</th>
              <th className="text-left px-4 py-2 border">Name</th>
              <th className="text-left px-4 py-2 border">Email</th>
              <th className="text-left px-4 py-2 border">Phone</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length > 0 ? (
              accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{acc.id}</td>
                  <td className="px-4 py-2 border">{acc.name}</td>
                  <td className="px-4 py-2 border">{acc.email}</td>
                  <td className="px-4 py-2 border">{acc.phone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No {accountType} accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAccount;
