import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const CertificateManagement = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    schoolId: "",
    type: "Completion",
    issueDate: "",
    validTill: "",
    course: "",
    className: "",
    description: "",
    certificateNumber: "",
    issuedBy: "",
    remarks: ""
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [schoolCertificates, setSchoolCertificates] = useState([]);

  // Load schoolId from localStorage on mount
  useEffect(() => {
    const savedSchoolId = localStorage.getItem("schoolId");
    if (savedSchoolId) {
      setFormData((prev) => ({ ...prev, schoolId: savedSchoolId }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse(null);
    try {
      const res = await axiosInstance.post(`/api/certificates/create`, formData);
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create certificate");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow space-y-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Certificate</h2>

      <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {/* Same form fields, unchanged */}
        {/* ... */}
        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="schoolId"
          placeholder="School ID"
          value={formData.schoolId}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="type"
          placeholder="Type (e.g., Completion)"
          value={formData.type}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="issueDate"
          value={formData.issueDate}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="validTill"
          value={formData.validTill}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="course"
          placeholder="Course Name"
          value={formData.course}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="className"
          placeholder="Class Name"
          value={formData.className}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="certificateNumber"
          placeholder="Certificate Number"
          value={formData.certificateNumber}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="issuedBy"
          placeholder="Issued By (Admin ID)"
          value={formData.issuedBy}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="remarks"
          placeholder="Remarks"
          value={formData.remarks}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Certificate Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="col-span-2 border p-2 rounded h-24 resize-none"
        />
        <button
          type="submit"
          className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Create Certificate
        </button>
      </form>

      {/* 🧾 Created certificate (on submission) */}
      {response && response.certificate && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Issued Certificate</h3>
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-2">Student</th>
                <th className="border p-2">Title</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border p-2">{response.certificate.studentId?.name || response.certificate.studentId}</td>
                <td className="border p-2">{response.certificate.course}</td>
                <td className="border p-2">{new Date(response.certificate.issueDate).toISOString().split("T")[0]}</td>
                <td className="border p-2 space-x-2">
                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Edit</button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Preview</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mt-4">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;