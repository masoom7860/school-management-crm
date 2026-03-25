import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaChalkboardTeacher, FaUser } from 'react-icons/fa';
import { fadeIn, slideInUp } from '../utils/animations';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function UserLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    schoolId: ""
  });

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for forgot password flow data
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSchoolId, setForgotPasswordSchoolId] = useState("");
  const [forgotPasswordRole, setForgotPasswordRole] = useState("");


  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    console.log("Attempting login with formData:", formData); // Added log

    try {
      const res = await axios.post(`${BASE_URL}/userlogin/user`, formData);
      console.log("Login successful:", res.data); // Added log
      const { token, role, schoolId, name, schoolName, userId } = res.data; // Destructure schoolName and userId from response

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("schoolId", schoolId);
      localStorage.setItem("schoolName", schoolName); // Store schoolName for all roles

      // Store name based on role
      if (role === "subadmin") {
        localStorage.setItem("adminName", name); // Store as adminName for subadmin
      } else {
        localStorage.setItem("userName", name); // Store as userName for other roles
      }

      // Store userId based on role
      switch (role) {
        case "student":
          localStorage.setItem("studentId", userId);
          navigate("/studentdashboard");
          break;
        case "teacher":
          localStorage.setItem("teacherId", userId);
          navigate("/teacherdashboard");
          break;
        case "staff":
          localStorage.setItem("staffId", userId);
          navigate("/staffdashboard");
          break;
        case "parent":
          localStorage.setItem("parentId", userId);
          navigate("/parentdashboard");
          break;
        case "subadmin":
          localStorage.setItem("subadminId", userId); // Store subadminId
          navigate("/admindashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err); // Added log
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleForgotPasswordClick = () => {
    // Check if email and school ID are entered before proceeding
    if (!formData.email || !formData.schoolId) {
      setError("Please enter your email and school ID in the login form first.");
      return;
    }

    setForgotPasswordMode(true);
    setError("");
    setMessage("");
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    // Store current login form data for forgot password flow
    setForgotPasswordEmail(formData.email);
    setForgotPasswordSchoolId(formData.schoolId);
    setForgotPasswordRole(formData.role);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Use stored forgot password data
    if (!forgotPasswordEmail || !forgotPasswordSchoolId) {
      setError("Please enter your email and school ID.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/otp/send-otp`, {
        email: forgotPasswordEmail, // Use stored email
        purpose: 'forgot-password'
      });
      setMessage(res.data.message || "OTP sent successfully.");
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) { // Basic password length validation
      setError("Password must be at least 6 characters long.");
      return;
    }


    try {
      const res = await axios.post(`${BASE_URL}/userlogin/reset-password`, {
        email: forgotPasswordEmail, // Use stored email
        schoolId: forgotPasswordSchoolId, // Use stored school ID
        role: forgotPasswordRole, // Use stored role
        otp: otp,
        newPassword: newPassword
      });
      setMessage(res.data.message || "Password reset successfully. You can now log in.");
      setForgotPasswordMode(false); // Go back to login form
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setFormData(prev => ({ ...prev, password: "" })); // Clear password field
    } catch (err) {
      console.error('Reset password error:', err); // Log error on frontend
      const errorMessage = err.response?.data?.error || "Failed to reset password.";
      if (errorMessage.toLowerCase().includes('invalid otp') || errorMessage.toLowerCase().includes('otp expired')) {
        setError("Invalid or expired OTP. Please request a new one.");
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        setError("User not found in this school. Please check email, school ID, and role.");
      }
      else {
        setError(errorMessage);
      }
    }
  };


  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-red-50 via-white to-black-50 p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={
          forgotPasswordMode
            ? otpSent
              ? handleResetPassword
              : handleSendOtp
            : handleLogin
        }
        className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl shadow-red-100/50 w-full max-w-sm border border-red-100"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-center text-red-700 mb-6"
        >
          {forgotPasswordMode
            ? otpSent
              ? "Reset Password"
              : "Forgot Password"
            : "User Login"}
        </motion.h2>

        {error && <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-red-600 text-sm text-center mb-4"
        >{error}</motion.p>}
        {message && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-600 text-sm text-center mb-4"
          >{message}</motion.p>
        )}

        {/* Input Fields with consistent height, spacing, and width */}
        {/* LOGIN FORM */}
        <AnimatePresence mode="wait">
          {!forgotPasswordMode && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="schoolId"
                placeholder="School ID"
                required
                value={formData.schoolId}
                onChange={handleChange}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border-2 px-3 transition-all ${formData.role === 'student' ? 'bg-red-600 text-white border-red-600' : 'bg-white/80 border-red-200'}`}
                >
                  <FaUserGraduate />
                  <span className="text-sm">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border-2 px-3 transition-all ${formData.role === 'teacher' ? 'bg-red-600 text-white border-red-600' : 'bg-white/80 border-red-200'}`}
                >
                  <FaChalkboardTeacher />
                  <span className="text-sm">Teacher</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'staff' }))}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border-2 px-3 transition-all ${formData.role === 'staff' ? 'bg-red-600 text-white border-red-600' : 'bg-white/80 border-red-200'}`}
                >
                  <FaUser />
                  <span className="text-sm">Staff</span>
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/20"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleForgotPasswordClick}
                className="w-full text-red-600 text-xs text-center hover:underline mt-2"
              >
                Forgot Password?
              </motion.button>
            </motion.div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {forgotPasswordMode && !otpSent && (
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="schoolId"
                placeholder="School ID"
                required
                value={formData.schoolId}
                onChange={handleChange}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border-2 px-3 transition-all ${formData.role === 'student' ? 'bg-red-600 text-white border-red-600' : 'bg-white/80 border-red-200'}`}
                >
                  <FaUserGraduate />
                  <span className="text-sm">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border-2 px-3 transition-all ${formData.role === 'teacher' ? 'bg-red-600 text-white border-red-600' : 'bg-white/80 border-red-200'}`}
                >
                  <FaChalkboardTeacher />
                  <span className="text-sm">Teacher</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'staff' }))}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border-2 px-3 transition-all ${formData.role === 'staff' ? 'bg-red-600 text-white border-red-600' : 'bg-white/80 border-red-200'}`}
                >
                  <FaUser />
                  <span className="text-sm">Staff</span>
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/20"
              >
                Send OTP
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="w-full text-red-600 text-sm text-center hover:underline"
              >
                Back to Login
              </motion.button>
            </motion.div>
          )}

          {/* RESET PASSWORD FORM */}
          {forgotPasswordMode && otpSent && (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 border-2 border-red-200 bg-white/80 backdrop-blur-sm px-4 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/20"
              >
                Reset Password
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setMessage("");
                }}
                className="w-full text-red-600 text-sm text-center hover:underline"
              >
                Resend OTP
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="w-full text-red-600 text-sm text-center hover:underline"
              >
                Back to Login
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );

}

export default UserLogin;