// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/login.jpg"; // ✅ adjust path as needed

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(`${BASE_URL}/registerSchool/login`, {
        email,
        password,
      });

      const { message, token, school } = response.data;

      setSuccessMessage(message);

      // Save token and school admin info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", "admin");
      localStorage.setItem("schoolName", school?.schoolName || "");
      localStorage.setItem("schoolId", school?.id || "");
      localStorage.setItem("adminName", school?.admin?.name || "");
      localStorage.setItem("adminEmail", school?.admin?.email || "");
      localStorage.setItem("schoolLogo", school?.logoUrl || "");

      // Redirect to admin dashboard
      navigate("/admindashboard");
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
        {/* Left Form Panel */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
          <p className="text-sm text-gray-500 mb-6">
            Don't have an account?{" "}
            <Link
              to="/RegistrationForm"
              className="text-red-600 font-semibold hover:underline"
            >
              Register your school
            </Link>
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && (
            <p className="text-green-600 mb-4">{successMessage}</p>
          )}

          <form className="space-y-4 mr-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600">Password</label>
                {/* Optional: Add "Forgot password" route later */}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter 6 characters or more"
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2"
                />
                <label className="text-sm text-gray-600">Show Password</label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-md font-semibold hover:bg-red-700 transition-all mb-5"
            >
              LOGIN
            </button>
          </form>

          <p className="text-sm text-gray-500 text-end">
            <Link
              to="/"
              className="text-red-600 font-semibold hover:underline"
            >
              Go to Home Page
            </Link>
          </p>
        </div>

        {/* Right Image Panel */}
        <div className="hidden md:flex md:w-1/2 bg-white p-8 items-center justify-center">
          <img
            src={loginImage}
            alt="Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
