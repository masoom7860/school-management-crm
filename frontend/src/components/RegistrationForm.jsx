import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const RegistrationForm = ({ onClose, mode = "admin" }) => {
  const navigate = useNavigate();
  const isSuperAdmin = mode === "superadmin";
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState("");
  const [formData, setFormData] = useState({});
  const [timer, setTimer] = useState(300);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [identityDocPreview, setIdentityDocPreview] = useState(null);
  const [identityDocFile, setIdentityDocFile] = useState(null);
  const [regCertPreview, setRegCertPreview] = useState(null);
  const [regCertFile, setRegCertFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm();

  const otpRefs = useRef([]);

  const steps = isSuperAdmin
    ? ["School Details", "More School Details", "Business & Admin Details"]
    : ["School Details", "More School Details", "Business & Admin Details", "OTP Verification"];

  useEffect(() => {
    let interval;
    // OTP step is now step 3 (since we removed plan selection)
    if (step === 3 && resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendDisabled]);

  useEffect(() => {
    if (serverError || message) {
      const timer = setTimeout(() => {
        setServerError("");
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [serverError, message]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentityDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdentityDocFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdentityDocPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegCertChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegCertFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegCertPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resendOtp = async () => {
    setServerError("");
    setMessage("");
    setResendDisabled(true);
    setTimer(300);
    setLoading(true);
    try {
      setMessage("Sending OTP...");
      const currentFormData = getValues();
      await axios.post(`${baseURL}/otp/send-otp`, {
        email: currentFormData.adminEmail,
        purpose: 'registration'
      });
      setMessage("OTP sent successfully.");
    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    setMessage("");
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);

    if (isSuperAdmin) {
      // Only one step: submit all data directly
      setLoading(true);
      try {
        const formData = new FormData();
        // Append all fields EXACTLY as in your Postman request
        formData.append('email', updatedFormData.adminEmail);
        // School details
        formData.append('schoolName', updatedFormData.schoolName);
        formData.append('address', updatedFormData.address);
        formData.append('city', updatedFormData.city);
        formData.append('state', updatedFormData.state);
        formData.append('country', updatedFormData.country);
        formData.append('postalCode', updatedFormData.postalCode);
        formData.append('phone', updatedFormData.phone);
        formData.append('alternatePhone', updatedFormData.alternatePhone || '');
        formData.append('website', updatedFormData.website || '');
        formData.append('establishmentYear', updatedFormData.establishmentYear);
        formData.append('affiliation', updatedFormData.affiliation || '');
        formData.append('schoolCode', updatedFormData.schoolCode || '');
        formData.append('principalName', updatedFormData.principalName);
        // Business details
        formData.append('gstNumber', updatedFormData.gstNumber || '');
        formData.append('panNumber', updatedFormData.panNumber || '');
        formData.append('licenseNumber', updatedFormData.licenseNumber || '');
        formData.append('accountHolderName', updatedFormData.accountHolderName || '');
        formData.append('bankName', updatedFormData.bankName || '');
        formData.append('accountNumber', updatedFormData.accountNumber || '');
        formData.append('ifscCode', updatedFormData.ifscCode || '');
        formData.append('upiId', updatedFormData.upiId || '');
        // Admin details
        formData.append('adminName', updatedFormData.adminName);
        formData.append('adminEmail', updatedFormData.adminEmail);
        formData.append('adminPassword', updatedFormData.adminPassword);
        formData.append('identityType', updatedFormData.identityType || '');
        formData.append('identityNumber', updatedFormData.identityNumber || '');
        // Append files
        if (logoFile) formData.append('logoUrl', logoFile);
        if (regCertFile) formData.append('registrationCertificateUrl', regCertFile);
        if (identityDocFile) formData.append('identityDocumentUrl', identityDocFile);
        await axios.post('/registerSchool/addBySuperAdmin', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage("School added successfully!");
        setTimeout(() => onClose && onClose(), 2000);
      } catch (err) {
        setServerError(err.response?.data?.details || err.response?.data?.error || "Failed to add school.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step < steps.length - 1) {
      if (step === 2) { // Before OTP step
        setLoading(true);
        try {
          setMessage("Sending OTP to your email...");
          await axios.post(`${baseURL}/otp/send-otp`, {
            email: updatedFormData.adminEmail, // Use adminEmail for OTP
            purpose: 'registration'
          });
          setMessage("OTP sent to your email.");
          setStep(step + 1);
          setOtp(["", "", "", "", "", ""]);
          setResendDisabled(true);
          setTimer(300);
        } catch (err) {
          setServerError(err.response?.data?.error || "Failed to send OTP");
        } finally {
          setLoading(false);
        }
      } else {
        setStep(step + 1);
      }
    } else { // Final submission
      setLoading(true);
      setMessage("Verifying OTP and registering your school...");
      try {
        const formData = new FormData();

        // Append all fields EXACTLY as in your Postman request
        formData.append('email', updatedFormData.adminEmail);
        formData.append('otp', otp.join(""));

        // School details
        formData.append('schoolName', updatedFormData.schoolName);
        formData.append('address', updatedFormData.address);
        formData.append('city', updatedFormData.city);
        formData.append('state', updatedFormData.state);
        formData.append('country', updatedFormData.country);
        formData.append('postalCode', updatedFormData.postalCode);
        formData.append('phone', updatedFormData.phone);
        formData.append('alternatePhone', updatedFormData.alternatePhone || '');
        formData.append('website', updatedFormData.website || '');
        formData.append('establishmentYear', updatedFormData.establishmentYear);
        formData.append('affiliation', updatedFormData.affiliation || '');
        formData.append('schoolCode', updatedFormData.schoolCode || '');
        formData.append('principalName', updatedFormData.principalName);

        // Business details
        formData.append('gstNumber', updatedFormData.gstNumber || '');
        formData.append('panNumber', updatedFormData.panNumber || '');
        formData.append('licenseNumber', updatedFormData.licenseNumber || '');
        formData.append('accountHolderName', updatedFormData.accountHolderName || '');
        formData.append('bankName', updatedFormData.bankName || '');
        formData.append('accountNumber', updatedFormData.accountNumber || '');
        formData.append('ifscCode', updatedFormData.ifscCode || '');
        formData.append('upiId', updatedFormData.upiId || '');

        // Admin details
        formData.append('adminName', updatedFormData.adminName);
        formData.append('adminEmail', updatedFormData.adminEmail);
        formData.append('adminPassword', updatedFormData.adminPassword);
        formData.append('identityType', updatedFormData.identityType || '');
        formData.append('identityNumber', updatedFormData.identityNumber || '');

        // Append files
        if (logoFile) formData.append('logoUrl', logoFile);
        if (regCertFile) formData.append('registrationCertificateUrl', regCertFile);
        if (identityDocFile) formData.append('identityDocumentUrl', identityDocFile);

        // Debug: Log the form data being sent
        console.log('Submitting form data:', Object.fromEntries(formData));

        const res = await axios.post(`${baseURL}/registerSchool/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setMessage("School registered successfully! You can now log in.");
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        console.error('Registration error:', err);
        if (err.response?.data?.error?.includes('OTP')) {
          setServerError("Invalid OTP. Please check the code or request a new one.");
        } else {
          setServerError(err.response?.data?.details || err.response?.data?.error || "Registration failed. Please check all fields and try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-8">
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-bold text-center">{steps[step]}</h2>
        <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {serverError && <p className="text-red-400 text-center mb-4">{serverError}</p>}
      {message && <p className="text-green-400 text-center mb-4">{message}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-8">
        {step === 0 && ( // School Details
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-medium">School Logo:</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <label
                    htmlFor="logo"
                    className="inline-block px-4 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                  >
                    Choose Logo
                  </label>
                </div>
                {logoPreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-600">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block font-medium">School Name:</label>
              <input
                {...register("schoolName", { required: "School name is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.schoolName && <p className="text-red-400">{errors.schoolName.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Address:</label>
              <input
                {...register("address", { required: "Address is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.address && <p className="text-red-400">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block font-medium">City:</label>
              <input
                {...register("city", { required: "City is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.city && <p className="text-red-400">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block font-medium">State:</label>
              <input
                {...register("state", { required: "State is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.state && <p className="text-red-400">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Country:</label>
              <input
                {...register("country", { required: "Country is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.country && <p className="text-red-400">{errors.country.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Postal Code:</label>
              <input
                {...register("postalCode", { required: "Postal Code is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.postalCode && <p className="text-red-400">{errors.postalCode.message}</p>}
            </div>
            <div>
              <label className="block font-medium">School Phone:</label>
              <input
                {...register("phone", {
                  required: "School phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.phone && <p className="text-red-400">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Alternate Phone:</label>
              <input
                {...register("alternatePhone")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
          </div>
        )}

        {step === 1 && ( // More School Details
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium">Website:</label>
              <input
                {...register("website")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Establishment Year:</label>
              <input
                {...register("establishmentYear", {
                  required: "Establishment year is required",
                  min: { value: 1900, message: "Year must be after 1900" },
                  max: { value: new Date().getFullYear(), message: "Year cannot be in the future" }
                })}
                type="number"
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.establishmentYear && <p className="text-red-400">{errors.establishmentYear.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Affiliation:</label>
              <input
                {...register("affiliation")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">School Code:</label>
              <input
                {...register("schoolCode")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Principal Name:</label>
              <input
                {...register("principalName", { required: "Principal name is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.principalName && <p className="text-red-400">{errors.principalName.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Registration Certificate:</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    id="regCert"
                    accept="image/*,.pdf"
                    onChange={handleRegCertChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <label
                    htmlFor="regCert"
                    className="inline-block px-4 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                  >
                    Upload Certificate
                  </label>
                </div>
                {regCertPreview && (
                  <div className="w-16 h-16 border border-gray-600 flex items-center justify-center">
                    {regCertPreview.includes('data:image/') ? (
                      <img src={regCertPreview} alt="Certificate preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs">PDF File</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && ( // Business & Admin Details
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium">GST Number:</label>
              <input
                {...register("gstNumber")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">PAN Number:</label>
              <input
                {...register("panNumber")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">License Number:</label>
              <input
                {...register("licenseNumber")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Account Holder Name:</label>
              <input
                {...register("accountHolderName")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Bank Name:</label>
              <input
                {...register("bankName")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Account Number:</label>
              <input
                {...register("accountNumber")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">IFSC Code:</label>
              <input
                {...register("ifscCode")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">UPI ID:</label>
              <input
                {...register("upiId")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Admin Name:</label>
              <input
                {...register("adminName", { required: "Admin name is required" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.adminName && <p className="text-red-400">{errors.adminName.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Admin Email:</label>
              <input
                {...register("adminEmail", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/, message: "Invalid email format" },
                })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.adminEmail && <p className="text-red-400">{errors.adminEmail.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Admin Password:</label>
              <input
                {...register("adminPassword", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                type="password"
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
              {errors.adminPassword && (
                <p className="text-red-400">{errors.adminPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">Identity Type:</label>
              <select
                {...register("identityType", { required: "Identity Type is required if providing identity details" })}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              >
                <option value="">Select Identity Type</option>
                <option value="Aadhar">Aadhar</option>
                <option value="PAN">PAN</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
              {errors.identityType && <p className="text-red-400">{errors.identityType.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Identity Number:</label>
              <input
                {...register("identityNumber")}
                className="w-full border bg-gray-700 text-white p-3 rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Identity Document:</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    id="identityDoc"
                    accept="image/*,.pdf"
                    onChange={handleIdentityDocChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <label
                    htmlFor="identityDoc"
                    className="inline-block px-4 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                  >
                    Upload Document
                  </label>
                </div>
                {identityDocPreview && (
                  <div className="w-16 h-16 border border-gray-600 flex items-center justify-center">
                    {identityDocPreview.includes('data:image/') ? (
                      <img src={identityDocPreview} alt="Document preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs">PDF File</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && ( // OTP Verification
          <div className="text-center">
            <label className="block font-medium text-lg mb-4">Enter OTP sent to your email</label>
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (otpRefs.current[index] = el)}
                  className="w-12 h-12 text-2xl text-center bg-gray-700 border border-white rounded"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {resendDisabled
                ? `Resend available in ${Math.floor(timer / 60)
                  .toString()
                  .padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`
                : "Didn't receive the OTP?"}
            </div>
            <button
              type="button"
              disabled={resendDisabled || loading}
              onClick={resendOtp}
              className={`text-sm font-medium underline ${resendDisabled || loading ? "text-gray-500" : "text-red-400"
                }`}
            >
              {loading ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        )}

        {/* Stepper navigation for superadmin mode */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="bg-gray-600 text-white px-6 py-2 rounded disabled:opacity-50"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            disabled={step === 0 || loading}
          >
            Back
          </button>
          {isSuperAdmin ? (
            step < steps.length - 1 ? (
              <button
                type="button"
                className="bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50"
                onClick={async () => {
                  const valid = await handleSubmit(() => true)();
                  if (valid !== false) setStep((prev) => prev + 1);
                }}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                Submit
              </button>
            )
          ) : (
            step < steps.length - 1 ? (
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                Register
              </button>
            )
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
