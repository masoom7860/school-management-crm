import React, { useState } from "react";

const packages = [
  {
    id: 1,
    name: "Silver",
    price: 0,
    interval: "Days",
    period: 14,
    studentLimit: 50,
    status: "Active",
  },
  {
    id: 2,
    name: "Platinum",
    price: 250,
    interval: "Monthly",
    period: 1,
    studentLimit: 100,
    status: "Active",
  },
  {
    id: 3,
    name: "Gold",
    price: 500,
    interval: "Yearly",
    period: 1,
    studentLimit: 250,
    status: "Active",
  },
  {
    id: 4,
    name: "Dimond",
    price: 1000,
    interval: "Life Time",
    period: "Life Time",
    studentLimit: "Unlimited",
    status: "Active",
  },
];

const Packages = () => {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Packages</h2>
          <p className="text-sm text-gray-500">Home – Packages</p>
        </div>

        {/* Top Controls */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === "active"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600"
                }`}
              >
                Active <span className="ml-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">4</span>
              </button>
              <button
                onClick={() => setActiveTab("archive")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === "archive"
                    ? "bg-red-100 text-red-700"
                    : "text-gray-600"
                }`}
              >
                Archive <span className="ml-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">0</span>
              </button>
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded">
              + Add Package
            </button>
          </div>

          {/* Search and Export */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search Package"
              className="px-4 py-2 w-full md:w-1/3 border rounded bg-gray-100"
            />
            <button className="text-red-600 font-medium text-sm hover:underline">
              ⬇ Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-sm text-left text-gray-600">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Package</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Interval</th>
                <th className="px-4 py-2">Preiod</th>
                <th className="px-4 py-2">Student Limit</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, index) => (
                <tr
                  key={pkg.id}
                  className="border-t text-sm text-gray-700 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-semibold">{pkg.name}</td>
                  <td className="px-4 py-2">{pkg.price}</td>
                  <td className="px-4 py-2">{pkg.interval}</td>
                  <td className="px-4 py-2">{pkg.period}</td>
                  <td className="px-4 py-2">{pkg.studentLimit}</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="border px-4 py-1 text-sm rounded text-gray-600 bg-gray-100 hover:bg-gray-200">
                      Actions ▾
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-sm text-center text-gray-500 mt-10">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology</a>
      </footer>
    </div>
  );
};

export default Packages;
