import React, { useState } from "react";

// Logo Upload Card Component
const LogoUploadCard = ({ title }) => {
  const isDark = title === "Dark logo";
  const isLight = title === "Light logo";

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-center text-base font-medium mb-2 text-gray-700 dark:text-white">{title}</h4>
      <div className={`rounded-lg shadow-md p-6 flex flex-col items-center w-full ${isDark || title === "Favicon" ? "bg-gray-200" : "bg-gray-700"}`}>
        <div className={`text-2xl font-bold mb-4 ${isDark ? "text-sky-500" : "text-white"}`}>
          {title === "Favicon" || title === "Nav Bar Logo" ? "🎓" : "🎓 Ekattor 8"}
        </div>
        <div className="flex w-full max-w-xs">
          <input type="file" className="w-1/2 border rounded-l px-2 py-1 text-sm" />
          <span className="w-1/2 flex items-center justify-center bg-white border border-l-0 rounded-r text-sm text-gray-600">
            No file chosen
          </span>
        </div>
      </div>
    </div>
  );
};

const EmailTemplateSection = () => {
  const [formData, setFormData] = useState({
    emailTitle: "",
    emailDetails: "",
    warningText: "",
  });

  const [logoPreviews, setLogoPreviews] = useState({
    emailLogo: "",
    social1: "",
    social2: "",
    social3: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreviews((prev) => ({ ...prev, [key]: previewUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Email Template submitted");
    console.log(formData);
  };

  return (
    <div className="bg-white p-4 sm:p-6 mt-10 rounded shadow">
      <h3 className="text-base sm:text-lg font-semibold mb-6">📧 EMAIL TEMPLATE</h3>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email Title</label>
          <input
            type="text"
            name="emailTitle"
            value={formData.emailTitle}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Details</label>
          <textarea
            name="emailDetails"
            maxLength={200}
            value={formData.emailDetails}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded text-sm h-24"
          />
          <p className="text-xs text-gray-500">
            Remaining characters: {200 - formData.emailDetails.length}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Warning Text</label>
          <textarea
            name="warningText"
            maxLength={150}
            value={formData.warningText}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded text-sm h-20"
          />
          <p className="text-xs text-gray-500">
            Remaining characters: {150 - formData.warningText.length}
          </p>
        </div>
        <div className="mt-4 max-w-md bg-green-100 border border-green-400 text-sm text-green-800 p-4 rounded">
        <strong>Instruction:</strong><br />
        Images for email templates will only support if the application is hosted on a live server.<br />
        <span className="font-semibold">Localhost will not support this.</span>
      </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Submit
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {[
          { title: "Email Logo", key: "emailLogo" },
          { title: "Social Logo - 1", key: "social1" },
          { title: "Social Logo - 2", key: "social2" },
          { title: "Social Logo - 3", key: "social3" },
        ].map(({ title, key }) => (
          <div key={key} className="flex flex-col items-center">
            <h4 className="text-center text-sm font-semibold mb-2">{title}</h4>
            <div className="rounded shadow p-4 bg-gray-100 w-full max-w-xs flex flex-col items-center">
              {logoPreviews[key] && (
                <img src={logoPreviews[key]} alt={title} className="h-16 mb-3" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, key)}
                className="w-full border px-2 py-1 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
};

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    systemName: "",
    systemTitle: "",
    navbarTitle: "",
    email: "",
    phone: "",
    fax: "",
    language: "English",
    address: "",
    frontendView: "Yes",
    timezone: "America/New_York",
    footerText: "",
    footerLink: "",
    helpLink: "",
    youtubeApiKey: "",
    vimeoApiKey: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">System Settings</h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Home – Settings – System Settings</p>

      {/* SETTINGS + PRODUCT UPDATE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white rounded shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">🛠 SYSTEM SETTINGS</h3>
          <form className="space-y-4">
            {/* System Form Fields */}
            {[{ label: "System Name", name: "systemName" },
              { label: "System Title", name: "systemTitle" },
              { label: "Navbar Title", name: "navbarTitle" },
              { label: "System Email", name: "email" },
              { label: "Phone", name: "phone" },
              { label: "Fax", name: "fax" }].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
            ))}

            {/* Dropdown Fields */}
            <div>
              <label className="block text-sm font-medium mb-1">System Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-sm"
              >
                <option>English</option>
                <option>Spanish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Frontend View</label>
              <select
                name="frontendView"
                value={formData.frontendView}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-sm"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-sm"
              >
                <option>America/New_York</option>
                <option>Asia/Kolkata</option>
              </select>
            </div>

            {[{ label: "Footer Text", name: "footerText" },
              { label: "Footer Link", name: "footerLink" },
              { label: "Help Link", name: "helpLink" },
              { label: "Youtube API Key", name: "youtubeApiKey" },
              { label: "Vimeo API Key", name: "vimeoApiKey" }].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
            ))}

           
          </form>
        </div>

        {/* PRODUCT UPDATE */}
        <div className="bg-white rounded shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">📦 PRODUCT UPDATE</h3>
          <input type="file" className="w-full border px-2 py-1 rounded text-sm mb-4" />
          <button className="bg-red-500 text-white w-full py-2 rounded mb-2">Update</button>
          <div className="text-white text-xs mb-1 bg-red-600 p-2 rounded">Last patch was updated on: 12/2024</div>
          <div className="text-white text-xs mb-1 bg-red-600 p-2 rounded">Patch size max 12MB</div>
          <div className="text-white text-xs bg-red-500 p-2 rounded">
            "patch_max_size" value is too large in file "upload_max_filesize"
          </div>
        </div>
      </div>

      {/* SYSTEM LOGO SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h3 className="text-base sm:text-lg font-semibold mb-6">🎨 SYSTEM LOGO</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <LogoUploadCard title="Dark logo" />
          <LogoUploadCard title="Light logo" />
          <LogoUploadCard title="Favicon" />
          <LogoUploadCard title="Nav Bar Logo" />
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Update Logo</button>
      </div>

      {/* EMAIL TEMPLATE SECTION */}
      <EmailTemplateSection />
      <button
              type="submit"
              className="bg-red-600 text-white px-5 py-2 rounded text-sm hover:bg-red-700"
            >
              Submit
            </button>
    </div>
  );
};

export default SystemSettings;
