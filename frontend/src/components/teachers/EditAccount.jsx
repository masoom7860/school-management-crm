import React, { useState, useEffect } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const EditAccount = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    alternatePhone: "",
    website: "",
    establishmentYear: "",
    affiliation: "",
    schoolCode: "",
    principalName: "",
    gstNumber: "",
    panNumber: "",
    licenseNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    adminName: "",
    adminEmail: "",
    identityType: "",
    identityNumber: "",
    password: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [regCertFile, setRegCertFile] = useState(null);
  const [identityDocFile, setIdentityDocFile] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);
  const [regCertPreview, setRegCertPreview] = useState(null);
  const [identityDocPreview, setIdentityDocPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("school");

  useEffect(() => {
    const schoolId = localStorage.getItem("schoolId");
    if (!schoolId) {
      setError("School ID not found in local storage.");
      setLoading(false);
      return;
    }

    const fetchSchoolData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/registerSchool/get/${schoolId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const schoolData = response.data.school;

        setFormData({
          schoolName: schoolData.schoolName || "",
          address: schoolData.address || "",
          city: schoolData.city || "",
          state: schoolData.state || "",
          country: schoolData.country || "",
          postalCode: schoolData.postalCode || "",
          phone: schoolData.phone || "",
          alternatePhone: schoolData.alternatePhone || "",
          website: schoolData.website || "",
          establishmentYear: schoolData.establishmentYear || "",
          affiliation: schoolData.affiliation || "",
          schoolCode: schoolData.schoolCode || "",
          principalName: schoolData.principalName || "",
          gstNumber: schoolData.businessDetails?.gstNumber || "",
          panNumber: schoolData.businessDetails?.panNumber || "",
          licenseNumber: schoolData.businessDetails?.licenseNumber || "",
          accountHolderName: schoolData.businessDetails?.accountHolderName || "",
          bankName: schoolData.businessDetails?.bankName || "",
          accountNumber: schoolData.businessDetails?.accountNumber || "",
          ifscCode: schoolData.businessDetails?.ifscCode || "",
          upiId: schoolData.businessDetails?.upiId || "",
          adminName: schoolData.admin?.name || "",
          adminEmail: schoolData.admin?.email || "",
          identityType: schoolData.adminDetails?.identityType || "",
          identityNumber: schoolData.adminDetails?.identityNumber || "",
          password: "",
          razorpayKeyId: schoolData.razorpay?.key_id || "",
          razorpayKeySecret: schoolData.razorpay?.key_secret || "",
        });

        if (schoolData.logoUrl) setLogoPreview(`${baseURL}/${schoolData.logoUrl.replace('uploads/', 'uploads/')}`);
        if (schoolData.businessDetails?.registrationCertificateUrl) setRegCertPreview(`${baseURL}/${schoolData.businessDetails.registrationCertificateUrl.replace('uploads/', 'uploads/')}`);
        if (schoolData.adminDetails?.identityDocumentUrl) setIdentityDocPreview(`${baseURL}/${schoolData.adminDetails.identityDocumentUrl.replace('uploads/', 'uploads/')}`);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching school data:", err);
        setError("Failed to fetch school data. Please try again.");
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage("");

    const schoolId = localStorage.getItem("schoolId");
    if (!schoolId) {
      setError("School ID not found in local storage.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updateFormData = new FormData();

      for (const key in formData) {
        if (formData[key] !== "" && key !== "password") {
          updateFormData.append(key, formData[key]);
        }
      }

      if (formData.password) {
        updateFormData.append('adminPassword', formData.password);
      }

      updateFormData.append('razorpay.key_id', formData.razorpayKeyId);
      updateFormData.append('razorpay.key_secret', formData.razorpayKeySecret);

      if (logoFile) updateFormData.append('logoUrl', logoFile);
      if (regCertFile) updateFormData.append('registrationCertificateUrl', regCertFile);
      if (identityDocFile) updateFormData.append('identityDocumentUrl', identityDocFile);

      const response = await axios.put(`${baseURL}/registerSchool/update/${schoolId}`, updateFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setMessage("Account updated successfully!");
      const updatedLogoUrl = response.data?.school?.logoUrl || response.data?.logoUrl;
      if (updatedLogoUrl) {
        localStorage.setItem("schoolLogo", updatedLogoUrl);
        setLogoPreview(`${baseURL}/uploads/schools/${updatedLogoUrl}`);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error updating school data:", err);
      setError(err.response?.data?.error || "Failed to update account. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit School Account</h2>
          <p className="text-gray-600">Update your school and admin details</p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection("school")}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === "school" ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                School Information
              </button>
              <button
                onClick={() => setActiveSection("payment")}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === "payment" ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Payment Gateway
              </button>
              <button
                onClick={() => setActiveSection("business")}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === "business" ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Business Details
              </button>
              <button
                onClick={() => setActiveSection("admin")}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${activeSection === "admin" ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Admin Details
              </button>
            </nav>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 p-6">
            {message && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
                <p>{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* School Information Section */}
              {activeSection === "school" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">School Information</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="edit-logo"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label
                          htmlFor="edit-logo"
                          className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Upload Logo
                        </label>
                      </div>
                      {logoPreview && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School Code</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="schoolCode"
                        value={formData.schoolCode}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Establishment Year</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="establishmentYear"
                        value={formData.establishmentYear}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="affiliation"
                        value={formData.affiliation}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="principalName"
                        value={formData.principalName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Gateway Section */}
              {activeSection === "payment" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Payment Gateway Configuration</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          These credentials are used to process online payments. Keep them secure.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="razorpayKeyId"
                        value={formData.razorpayKeyId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key Secret *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="razorpayKeySecret"
                        value={formData.razorpayKeySecret}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business Details Section */}
              {activeSection === "business" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Business & Banking Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Certificate</label>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="file"
                            id="edit-regCert"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, setRegCertFile, setRegCertPreview)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <label
                            htmlFor="edit-regCert"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Upload Certificate
                          </label>
                        </div>
                        {regCertPreview && (
                          <div className="w-16 h-16 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            {regCertPreview.includes('data:image/') ? (
                              <img src={regCertPreview} alt="Certificate preview" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-xs text-gray-500">PDF File</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Bank Account Details</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          name="accountHolderName"
                          value={formData.accountHolderName}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          name="upiId"
                          value={formData.upiId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Details Section */}
              {activeSection === "admin" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Admin Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Identity Type</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="identityType"
                        value={formData.identityType}
                        onChange={handleChange}
                      >
                        <option value="">Select Identity Type</option>
                        <option value="Aadhar">Aadhar</option>
                        <option value="PAN">PAN</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Identity Number</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="identityNumber"
                        value={formData.identityNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Identity Document</label>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="file"
                            id="edit-identityDoc"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, setIdentityDocFile, setIdentityDocPreview)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <label
                            htmlFor="edit-identityDoc"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Upload Document
                          </label>
                        </div>
                        {identityDocPreview && (
                          <div className="w-16 h-16 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            {identityDocPreview.includes('data:image/') ? (
                              <img src={identityDocPreview} alt="Document preview" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-xs text-gray-500">PDF File</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        name="password"
                        placeholder="Leave blank to keep current password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <p className="mt-1 text-xs text-gray-500">Minimum 8 characters with at least one number and one special character</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveSection(prev => {
                    if (prev === "school") return "admin";
                    if (prev === "payment") return "school";
                    if (prev === "business") return "payment";
                    if (prev === "admin") return "business";
                    return "school";
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection(prev => {
                    if (prev === "school") return "payment";
                    if (prev === "payment") return "business";
                    if (prev === "business") return "admin";
                    if (prev === "admin") return "school";
                    return "school";
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Next
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;