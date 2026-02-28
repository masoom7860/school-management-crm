import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AdminFeeReports = ({ schoolId, token }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = ''; // Assuming status filter might be needed for reports later

  // Export helpers
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        toast.info("No data to export.");
        return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));
    for (const row of data) {
      const values = headers.map(header => {
          const value = row[header] ?? "";
          // Handle potential commas or quotes in data by wrapping in double quotes
          return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!schoolId || !token) {
      setError("School ID or token missing.");
      setLoading(false);
      return;
    }
    fetchFeeReports();
  }, [schoolId, token, academicYearFilter, classFilter]); // Depend on filters

  const fetchFeeReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}/payment/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            schoolId,
            academicYear: academicYearFilter,
            classId: classFilter, // Assuming backend supports classId filter
            // status: statusFilter, // Add if backend supports status filter for reports
        },
      });

      if (response.data && response.data.success) {
        setReport(response.data.data); // Assuming data contains summary, monthlyCollections, classBreakdown
      } else {
         setReport(null); // Clear previous report data on error
         throw new Error(response.data?.message || "Invalid response format");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching fee reports:", err);
      setError(err.response?.data?.message || err.message || "Failed to load reports.");
      setLoading(false);
    }
  };

  const handleAcademicYearChange = (e) => {
      setAcademicYearFilter(e.target.value);
  };

  const handleClassChange = (e) => {
      setClassFilter(e.target.value);
  };


  if (loading) return <div className="text-center py-8">Loading fee reports...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!report) return <div className="text-center py-8 text-gray-500">No report data available.</div>;

  const { summary, monthlyCollections, classBreakdown } = report;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Fee Reports</h2>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
         <div className="min-w-[200px]">
            <label htmlFor="academicYearFilter" className="block text-sm font-medium text-gray-700">Academic Year</label>
            <input
              type="text"
              id="academicYearFilter"
              name="academicYearFilter"
              value={academicYearFilter}
              onChange={handleAcademicYearChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="e.g., 2024-2025"
            />
          </div>
           <div className="min-w-[200px]">
            <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">Class ID</label>
            <input
              type="text"
              id="classFilter"
              name="classFilter"
              value={classFilter}
              onChange={handleClassChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Enter Class ID"
            />
          </div>
          {/* Add Status Filter if needed */}
      </div>


      {/* Overall Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Overall Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <p>Total Records: <span className="font-medium">{summary?.totalRecords ?? 0}</span></p>
          <p>Total Assigned: <span className="font-medium">₹{summary?.totalAssigned?.toFixed(2) ?? "0.00"}</span></p>
          <p>Total Collected: <span className="font-medium">₹{summary?.totalCollected?.toFixed(2) ?? "0.00"}</span></p>
          <p>Total Outstanding: <span className="font-medium">₹{summary?.totalOutstanding?.toFixed(2) ?? "0.00"}</span></p>
          <p>Paid: <span className="font-medium">{summary?.totalPaidCount ?? 0}</span></p>
          <p>Partial: <span className="font-medium">{summary?.totalPartialCount ?? 0}</span></p>
          <p>Pending: <span className="font-medium">{summary?.totalPendingCount ?? 0}</span></p>
        </div>
      </div>

      {/* Monthly Collections */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Monthly Collections</h3>
          {monthlyCollections?.length > 0 && (
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              onClick={() => exportToCSV(monthlyCollections, "monthly_collections.csv")}
            >
              Export CSV
            </button>
          )}
        </div>
        {monthlyCollections?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Collected</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyCollections.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{row.year}</td>
                    <td className="px-4 py-2">{row.month}</td>
                    <td className="px-4 py-2">₹{row.totalCollected?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No monthly collection data available for the selected filters.</p>
        )}
      </div>

      {/* Class-wise Breakdown */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Class-wise Breakdown</h3>
          {classBreakdown?.length > 0 && (
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              onClick={() => exportToCSV(classBreakdown, "class_breakdown.csv")}
            >
              Export CSV
            </button>
          )}
        </div>
        {classBreakdown?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Assigned</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Collected</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Outstanding</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classBreakdown.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{row.className}</td>
                    <td className="px-4 py-2">₹{row.totalAssigned?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-2">₹{row.totalCollected?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-2">₹{row.totalOutstanding?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-2">{row.totalRecords}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No class-wise breakdown data available for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default AdminFeeReports;
