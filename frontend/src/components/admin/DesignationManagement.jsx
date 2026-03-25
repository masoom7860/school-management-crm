import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Trash2, PlusCircle } from "lucide-react";

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [name, setName] = useState("");

  // Fetch all
  const fetchDesignations = async () => {
    try {
      const res = await axios.get("/api/designations");
      setDesignations(res.data || []);
    } catch (err) {
      console.error("Error fetching designations:", err);
      setDesignations([]);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  // Add new
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await axios.post("/api/designations", { name });
      setName("");
      fetchDesignations();
    } catch (err) {
      console.error("Error adding designation:", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this designation?")) {
      try {
        await axios.delete(`/api/designations/${id}`);
        fetchDesignations();
      } catch (err) {
        console.error("Error deleting designation:", err);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Add Designation</h2>

      {/* Form */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg shadow-md p-4 mb-6 max-w-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <PlusCircle className="text-blue-500" />
          Designation
        </h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Designation Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-3 bg-red-600">
          <h3 className="text-white font-semibold">Designation List</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {designations.length > 0 ? (
              designations.map((d, index) => (
                <tr key={d._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center justify-center"
                      title="Delete designation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500 italic">No designations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignationManagement;
