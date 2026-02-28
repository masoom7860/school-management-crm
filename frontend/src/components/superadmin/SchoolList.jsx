import React, { useEffect, useState } from "react";
import { ChevronDown, Search, Upload, Edit, RefreshCw } from "lucide-react";
import EditSchoolModal from "./EditSchoolModal"; // Import the new modal component
import { toast } from 'react-hot-toast';
import axiosInstance from "../../api/axiosInstance";

const normalizeSchoolResponse = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.schools)) return payload.schools;
  return null;
};

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [statusLoading, setStatusLoading] = useState({}); // Track loading per school
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/registerSchool/getAllSchool', {
        params: { limit: 1000 }
      });
      const normalized = normalizeSchoolResponse(response.data);
      if (normalized) {
        setSchools(normalized);
      } else {
        setSchools([]);
        setError(new Error("Unexpected data format from API."));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleEditSchool = (schoolId) => {
    setSelectedSchoolId(schoolId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchoolId(null);
  };

  const handleSchoolUpdated = () => {
    fetchSchools();
  };

  const handleToggleStatus = async (schoolId) => {
    setStatusLoading((prev) => ({ ...prev, [schoolId]: true }));
    try {
      await axiosInstance.patch(`/registerSchool/toggle-status/${schoolId}`);
      fetchSchools();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setStatusLoading((prev) => ({ ...prev, [schoolId]: false }));
    }
  };

  // Filtered schools by search term
  const filteredSchools = schools.filter(school =>
    school.schoolName && school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading schools...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading schools: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">School List</h2>
          <p className="text-sm text-gray-500 mt-1">Home - Schools - School List</p>
        </div>
        <div className="text-lg font-semibold text-gray-700">
          Total Registered Schools: <span className="text-red-500">{schools.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-2.5 left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search School"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white shadow-sm focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-left">Teachers</th>
              <th className="px-4 py-3 text-left">Staff</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filteredSchools.map((school, index) => (
              <tr key={school._id} className="border-b">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-semibold">{school.schoolName}</td>
                <td className="px-4 py-3">{school.address}</td>
                <td className="px-4 py-3">{school.phone}</td>
                <td className="px-4 py-3">{school.studentCount}</td>
                <td className="px-4 py-3">{school.teacherCount}</td>
                <td className="px-4 py-3">{school.staffCount}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${school.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(school._id)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${school.status === 'active' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} flex items-center gap-1`}
                    disabled={statusLoading[school._id]}
                  >
                    {statusLoading[school._id] ? <RefreshCw className="animate-spin" size={14} /> : null}
                    {school.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEditSchool(school._id)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded inline-flex items-center gap-1 hover:bg-gray-300"
                  >
                    <Edit size={14} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="text-sm text-gray-600 mt-10 text-center">
        2022 © <a href="#" className="text-red-500">By Creativeitem</a>
      </footer>

      {/* Edit School Modal */}
      {isModalOpen && (
        <EditSchoolModal
          schoolId={selectedSchoolId}
          onClose={handleCloseModal}
          onUpdate={handleSchoolUpdated}
        />
      )}
    </div>
  );
};

export default SchoolList;
