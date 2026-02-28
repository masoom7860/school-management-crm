import React, { useState } from "react";

const PendingRequest = () => {
  const [dateRange, setDateRange] = useState("01/01/2025 - 12/31/2025");

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pending Request</h2>
          <p className="text-sm text-gray-500">
            Home – Subscriptions – Pending Request
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded p-6 shadow mb-10">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border px-4 py-2 rounded w-full md:w-1/3"
            />
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded text-sm font-medium">
              Filter
            </button>
          </div>

          {/* Empty State Image */}
          <div className="flex justify-center items-center mt-10">
            <img
              src="/no-data.png"
              alt="No pending requests"
              className="w-48 opacity-70"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-sm text-center text-gray-500 mt-6">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology </a>
      </footer>
    </div>
  );
};

export default PendingRequest;
