import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
import useAuth from '../hooks/useAuth'; // Assuming an auth hook to get user/school info
// Assuming charting library like Chart.js or Recharts is available
// import { Bar } from 'react-chartjs-2';

const FeeDashboard = () => {
  const { user } = useAuth(); // Get logged-in user and school info
  const schoolId = user?.schoolId;

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    academicYear: '', // Add academic year filter
    classId: '', // Add class filter
    // Add other relevant filters
  });

  // Assuming a hook or API call to get list of academic years and classes for filters
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]); // Assuming useSchoolClasses hook or similar

  useEffect(() => {
    if (schoolId) {
      fetchReportData(schoolId, filters);
      // Fetch academic years and classes for filters
      fetchFilterOptions(schoolId);
    }
  }, [schoolId, filters]); // Refetch when schoolId or filters change

  const fetchReportData = async (schoolId, currentFilters) => {
    try {
      setLoading(true);
      // Assuming a new backend API endpoint for fee reports
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fee-reports/school/${schoolId}`, { 
        params: currentFilters,
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data.data); // Assuming aggregated report data is in res.data.data
      setLoading(false);
    } catch (err) {
      console.error('Error fetching fee report data:', err);
      setError('Failed to fetch fee report data.');
      setLoading(false);
      toast.error('Failed to fetch fee report data.');
    }
  };

  const fetchFilterOptions = async (schoolId) => {
    try {
      // Fetch academic years (assuming an API like /api/academic-years/school/:schoolId)
      const token = localStorage.getItem('token');
      const yearsRes = await axios.get(`/api/academic-years/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAcademicYears(yearsRes.data.data); // Assuming data is array of year strings

      // Fetch classes using the centralized API
      const { getClasses } = await import('../api/classesApi');
      const classesRes = await getClasses();
      setClasses(classesRes.data || []); // Assuming data is array of class objects
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Handle error, maybe set default options or show a message
    }
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDownloadReport = async (format) => {
    try {
      setLoading(true);
      // Assuming backend API for downloading reports, e.g., /api/fee-reports/download/school/:schoolId?format=csv&...
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/fee-reports/download/school/${schoolId}`, {
        params: { ...filters, format },
        responseType: 'blob', // Important for downloading files
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create a blob from the response data
      const blob = new Blob([res.data], { type: res.headers['content-type'] });

      // Create a link element, set the download attribute, and click it
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `fee_report_${filters.academicYear || 'all'}_${filters.classId || 'all'}.${format}`;
      link.click();

      // Clean up the URL object
      window.URL.revokeObjectURL(link.href);

      setLoading(false);
      toast.success(`${format.toUpperCase()} report downloaded successfully!`);

    } catch (err) {
      console.error('Error downloading report:', err);
      setLoading(false);
      toast.error(err.response?.data?.message || `Failed to download ${format.toUpperCase()} report.`);
    }
  };

  // Placeholder for rendering charts/tables based on reportData
  const renderReportContent = () => {
    if (!reportData) return null;

    // Example: Displaying a summary
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="border-2 border-red-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-4">
          <h3 className="text-lg font-semibold mb-2 text-red-700">Overall Summary</h3>
          <p>Total Expected Fees: {reportData.totalExpected?.toFixed(2) || 'N/A'}</p>
          <p>Total Collected: {reportData.totalCollected?.toFixed(2) || 'N/A'}</p>
          <p>Total Outstanding: {reportData.totalOutstanding?.toFixed(2) || 'N/A'}</p>
          {/* Add more summary details */}
        </div>
        {/* Add sections for class-wise reports, charts, etc. */}
        {reportData.classSummary && (
           <div className="border-2 border-red-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-4 col-span-full">
             <h3 className="text-lg font-semibold mb-2 text-red-700">Class-wise Summary</h3>
             <table className="min-w-full bg-white/80 backdrop-blur-sm border border-red-200 text-sm rounded-lg overflow-hidden">
               <thead className="bg-red-100">
                 <tr>
                   <th className="py-2 px-3 border-b text-left">Class</th>
                   <th className="py-2 px-3 border-b text-left">Expected</th>
                   <th className="py-2 px-3 border-b text-left">Collected</th>
                   <th className="py-2 px-3 border-b text-left">Outstanding</th>
                 </tr>
               </thead>
               <tbody>
                 {reportData.classSummary.map(summary => (
                   <tr key={summary.classId}>
                     <td className="py-2 px-3 border-b">{summary.className || 'N/A'}</td>
                     <td className="py-2 px-3 border-b">{summary.expected.toFixed(2)}</td>
                     <td className="py-2 px-3 border-b">{summary.collected.toFixed(2)}</td>
                     <td className="py-2 px-3 border-b">{summary.outstanding.toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </motion.div>
    );
  };


  return (
    <div className="bg-gradient-to-br from-red-50 via-white to-black-50 min-h-screen p-6">
      <div className="container mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 text-red-700"
        >
          Fee Dashboard & Reports
        </motion.h1>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              name="academicYear"
              value={filters.academicYear}
              onChange={handleFilterChange}
              className="mt-1 block w-full border-2 border-red-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3 focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
            >
              <option value="">All Years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="mt-1 block w-full border-2 border-red-200 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3 focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all duration-200"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.className} {cls.section ? `(${cls.section})` : ''}</option>
              ))}
            </select>
          </div>
          {/* Add more filter inputs */}
        </motion.div>

        {/* Report Download Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-x-3"
        >
          <button
            onClick={() => handleDownloadReport('csv')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20 transition-all duration-200"
            disabled={loading}
          >
            Download CSV Report
          </button>
          <button
            onClick={() => handleDownloadReport('pdf')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all duration-200"
            disabled={loading}
          >
            Download PDF Report
          </button>
        </motion.div>

        {/* Report Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8 bg-red-50 rounded-lg border border-red-200">{error}</div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-6 border border-red-100">
              {renderReportContent()}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FeeDashboard;