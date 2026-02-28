import React, { useState } from "react";

const ExpiredSubscriptionReport = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expired Subscription</h2>
        <p className="text-sm text-gray-500">Home – Subscriptions – Expired Subscription</p>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Expired Subscription"
          className="border px-4 py-2 rounded w-full md:w-1/2"
        />
        <button className="ml-auto bg-red-100 text-red-600 px-4 py-2 rounded text-sm font-medium">
          ⬇ Export
        </button>
      </div>

      {/* Report Summary */}
      <div className="bg-gray-100 flex flex-col lg:flex-row justify-between items-center p-6 rounded shadow mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Expired Subscription Report</h3>
          <p className="text-sm text-gray-600"><strong>From:</strong> 01/01/2025</p>
          <p className="text-sm text-gray-600"><strong>To:</strong> 12/31/2025</p>
          <p className="text-sm text-gray-600"><strong>Total Amount:</strong> 500 USD</p>
        </div>
        <img
          src="/students.png"
          alt="students jumping"
          className="w-40 h-auto mt-4 lg:mt-0"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 font-semibold text-gray-900">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">School Name</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Purchase Date</th>
              <th className="px-4 py-3">Expire Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3 font-medium text-gray-900">Paramount Secondary School</td>
              <td className="px-4 py-3 font-semibold">Gold</td>
              <td className="px-4 py-3">25-Sep-2023</td>
              <td className="px-4 py-3">24-Sep-2024</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-sm text-center text-gray-500">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology</a>
      </footer>
    </div>
  );
};

export default ExpiredSubscriptionReport;
