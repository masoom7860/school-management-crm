import React from "react";

const addons = [
  {
    id: 1,
    bundle: "Online addon bundles",
    features: ["Online live class"],
    status: "Active",
    version: "1",
  },
  {
    id: 2,
    bundle: "Online live class",
    features: ["Live problem discussion"],
    status: "Active",
    version: "1.2",
  },
  {
    id: 3,
    bundle: "HR Management",
    features: ["Manage Users", "Custom roles", "Leave request", "Attendence", "Payroll"],
    status: "Active",
    version: "1",
  },
  {
    id: 4,
    bundle: "Payment Gateways",
    features: ["paypal", "stripe", "razorpay"],
    status: "Active",
    version: "1",
  },
];

const ManageAddons = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Addons</h2>
          <p className="text-sm text-gray-500">Home – Addons</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded">
          + Add new addon
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 font-semibold">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Bundle name</th>
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon, index) => (
              <tr key={addon.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{addon.bundle}</td>
                <td className="px-4 py-3">
                  {addon.features.map((f, i) => (
                    <p key={i}>{f}</p>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                    {addon.status}
                  </span>
                </td>
                <td className="px-4 py-3">{addon.version}</td>
                <td className="px-4 py-3">
                  <button className="border text-sm px-4 py-1 rounded bg-gray-100 hover:bg-gray-200">
                    Actions ▾
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Footer */}
       <footer className="text-sm text-center text-gray-500 mt-10">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology</a>
      </footer>
    </div>
  );
};

export default ManageAddons;
