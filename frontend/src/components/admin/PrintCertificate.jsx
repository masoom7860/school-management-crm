import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function CertificateGenerator() {
  const [form, setForm] = useState({
    studentName: "",
    className: "",
    section: "",
    house: "",
    year: "",
    event: "",
    description: "",
    certificateNumber: "",
    studentId: "",
    schoolId: "",
    type: "Award",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/api/certificates/create", form);
      alert("Certificate created successfully!");
      console.log(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Error generating certificate");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">🏆 Generate Certificate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(form).map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full border border-gray-400 p-2 rounded"
            />
          </div>
        ))}
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Generate & Save
        </button>
      </form>
    </div>
  );
}
