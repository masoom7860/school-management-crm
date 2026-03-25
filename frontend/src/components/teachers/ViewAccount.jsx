import React, { useState, useEffect } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const ViewAccount = () => {
  const [accountData, setAccountData] = useState({
    schoolName: "",
    schoolId: "",
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
    razorpayKeyId: "",
    razorpayKeySecret: ""
  });

  const [logoPreview, setLogoPreview] = useState(localStorage.getItem("schoolLogo") ? `${baseURL}/uploads/schools/${localStorage.getItem("schoolLogo")}` : null);
  const [regCertPreview, setRegCertPreview] = useState(null);
  const [identityDocPreview, setIdentityDocPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("school");

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

        setAccountData({
          schoolId: schoolData._id || schoolData.id || localStorage.getItem("schoolId") || "",
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
          razorpayKeyId: schoolData.razorpay?.key_id || "",
          razorpayKeySecret: schoolData.razorpay?.key_secret || "",
        });

        // Set previews
        if (schoolData.logoUrl && !localStorage.getItem("schoolLogo")) setLogoPreview(`${baseURL}/${schoolData.logoUrl}`);
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

  // Always use the latest logo from localStorage if available
  useEffect(() => {
    const logoFromStorage = localStorage.getItem("schoolLogo");
    if (logoFromStorage) {
      setLogoPreview(`${baseURL}/${logoFromStorage}`);
    }
  }, [localStorage.getItem("schoolLogo")]);

  const maskSecret = (secret) => {
    if (!secret) return "";
    return "•".repeat(secret.length - 4) + secret.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-screen-2xl mx-auto">
      {/* Header with logo and school name */}
      <div className="bg-gradient-to-r from-red-50 to-purple-50 px-6 py-8 border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {logoPreview ? (
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <img 
                  src={logoPreview} 
                  alt="School logo" 
                  className="w-full h-full object-cover" 
                  onError={e => { e.target.onerror = null; e.target.src = "/default-logo.png"; }}
                />
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
              🏫
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{accountData.schoolName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 mb-3">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {accountData.address}, {accountData.city}, {accountData.state}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {accountData.phone}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">
                Code: {accountData.schoolCode}
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                Est: {accountData.establishmentYear}
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
                {accountData.affiliation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("school")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "school" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            School Information
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "business" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "payment" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Payment Gateway
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "admin" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Administrator
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* School Information Tab */}
        {activeTab === "school" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
            </div>
                <DetailField label="School ID" value={accountData.schoolId} />
            <DetailField label="School Name" value={accountData.schoolName} />
            <DetailField label="Principal Name" value={accountData.principalName} />
            <DetailField label="Address" value={accountData.address} />
            <DetailField label="City" value={accountData.city} />
            <DetailField label="State" value={accountData.state} />
            <DetailField label="Country" value={accountData.country} />
            <DetailField label="Postal Code" value={accountData.postalCode} />
            <DetailField label="Phone" value={accountData.phone} />
            <DetailField label="Alternate Phone" value={accountData.alternatePhone} />
            <DetailField label="Website" value={accountData.website} />
            <DetailField label="Establishment Year" value={accountData.establishmentYear} />
            <DetailField label="Affiliation" value={accountData.affiliation} />
            <DetailField label="School Code" value={accountData.schoolCode} />
          </div>
        )}

        {/* Business Details Tab */}
        {activeTab === "business" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Legal & Financial Information</h3>
            </div>
            <DetailField label="GST Number" value={accountData.gstNumber} />
            <DetailField label="PAN Number" value={accountData.panNumber} />
            <DetailField label="License Number" value={accountData.licenseNumber} />
            <DetailField label="Account Holder Name" value={accountData.accountHolderName} />
            <DetailField label="Bank Name" value={accountData.bankName} />
            <DetailField label="Account Number" value={accountData.accountNumber} />
            <DetailField label="IFSC Code" value={accountData.ifscCode} />
            <DetailField label="UPI ID" value={accountData.upiId} />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Certificate</label>
              {regCertPreview && (
                <div className="w-full max-w-xs border border-gray-300 rounded p-2">
                  {regCertPreview.includes('.pdf') ? (
                    <a
                      href={regCertPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Registration Certificate (PDF)
                    </a>
                  ) : (
                    <img src={regCertPreview} alt="Registration certificate" className="max-w-full max-h-64 object-contain" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Gateway Tab */}
        {activeTab === "payment" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Payment Gateway Configuration</h3>
            </div>
            <DetailField label="Razorpay Key ID" value={accountData.razorpayKeyId} />
            <DetailField label="Razorpay Key Secret" value={maskSecret(accountData.razorpayKeySecret)} />
          </div>
        )}

        {/* Administrator Tab */}
        {activeTab === "admin" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Administrator Details</h3>
            </div>
            <DetailField label="Admin Name" value={accountData.adminName} />
            <DetailField label="Admin Email" value={accountData.adminEmail} />
            <DetailField label="Identity Type" value={accountData.identityType} />
            <DetailField label="Identity Number" value={accountData.identityNumber} />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Identity Document</label>
              {identityDocPreview && (
                <div className="w-full max-w-xs border border-gray-300 rounded p-2">
                  {identityDocPreview.includes('.pdf') ? (
                    <a
                      href={identityDocPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Identity Document (PDF)
                    </a>
                  ) : (
                    <img src={identityDocPreview} alt="Identity document" className="max-w-full max-h-64 object-contain" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable component for displaying read-only fields
const DetailField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <div className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg">
      {value || <span className="text-gray-400 italic">Not provided</span>}
    </div>
  </div>
);

export default ViewAccount;