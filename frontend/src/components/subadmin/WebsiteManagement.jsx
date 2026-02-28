import React, { useState } from "react";

const WebsiteManagement = () => {
  const [tab, setTab] = useState("logo");

  const tabs = [
    { key: "logo", label: "Logo" },
    { key: "notification", label: "Notification" },
    { key: "slider", label: "Slider" },
    { key: "payment", label: "Payment" },
  ];

  const renderTabContent = () => {
    switch (tab) {
      case "logo":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Upload School Logo</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Upload Logo
            </button>
          </div>
        );
      case "notification":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Homepage Notification Message</label>
            <textarea
              rows={3}
              placeholder="e.g., Admissions Open for 2025-26 session!"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            ></textarea>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Save Notification
            </button>
          </div>
        );
      case "slider":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Upload Homepage Slider Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Upload Slides
            </button>
          </div>
        );
      case "payment":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Payment Gateway API Key</label>
            <input
              type="text"
              placeholder="Enter Razorpay / Stripe API Key"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">Enable Payment Methods</label>
            <div className="space-y-2 pl-2">
              {["UPI", "Credit / Debit Card", "Net Banking"].map((method) => (
                <label className="flex items-center space-x-2" key={method}>
                  <input type="checkbox" className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Save Payment Settings
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Website Management</h2>
        <p className="text-sm text-gray-500">Customize your school’s public-facing website</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
              tab === item.key ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">{renderTabContent()}</div>
    </div>
  );
};

export default WebsiteManagement;
