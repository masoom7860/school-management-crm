import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { Eye } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const StudentFeeList = ({ onViewDetail, schoolId, token }) => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    academicYear: '',
    classId: '',
    status: '',
  });
  const [aggregatedStats, setAggregatedStats] = useState(null);

  useEffect(() => {
    if (schoolId && token) {
      fetchStudentFeeList();
    }
  }, [schoolId, token, pagination.currentPage, pagination.pageSize, filters]);

  const fetchStudentFeeList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/student-fees/all/${schoolId}`, {
        params: {
          page: pagination.currentPage,
          limit: pagination.pageSize,
          academicYear: filters.academicYear,
          classId: filters.classId,
          status: filters.status,
        }
      });

      if (response.data && response.data.success) {
        setFeeRecords(response.data.data || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        });
        setAggregatedStats(response.data.aggregatedStats || null);
      } else {
        throw new Error(response.data?.message || "Invalid response format");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student fee list:", err);
      setError(err.response?.data?.message || err.message || "Failed to load student fee list.");
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading student fees...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Fee List</h2>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="min-w-[200px]">
          <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">Academic Year</label>
          <input
            type="text"
            id="academicYear"
            name="academicYear"
            value={filters.academicYear}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="e.g., 2024-2025"
          />
        </div>
        <div className="min-w-[200px]">
          <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Class</label>
          <input
            type="text"
            id="classId"
            name="classId"
            value={filters.classId}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="Enter Class ID"
          />
        </div>
        <div className="min-w-[200px]">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {aggregatedStats && (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <p>Total Records: <span className="font-medium">{aggregatedStats.totalItems || 0}</span></p>
            <p>Total Collected: <span className="font-medium">₹{(aggregatedStats.totalCollected || 0).toFixed(2)}</span></p>
            <p>Total Outstanding: <span className="font-medium">₹{(aggregatedStats.totalOutstanding || 0).toFixed(2)}</span></p>
            <p>Paid: <span className="font-medium">{aggregatedStats.totalPaidCount || 0}</span></p>
            <p>Partial: <span className="font-medium">{aggregatedStats.totalPartialCount || 0}</span></p>
            <p>Pending: <span className="font-medium">{aggregatedStats.totalPendingCount || 0}</span></p>
          </div>
        </div>
      )}

      {feeRecords.length === 0 ? (
        <p className="text-gray-500">No student fee records found matching the criteria.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Fee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Payment Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeRecords.map(record => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {`${record.student?.firstName || ''} ${record.student?.lastName || ''}`.trim() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.className || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.academicYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(record.totalFee || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(record.amountPaid || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(record.balance || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        record.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.latestPaymentDate ? new Date(record.latestPaymentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Pass studentId from the record */}
                      <button
                        onClick={() => onViewDetail(record.student?._id)}
                        className="text-red-600 hover:text-red-900"
                        title="View Fee Details"
                      >
                        <Eye className="w-5 h-5 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default StudentFeeList;
