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
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <h3 className="bg-red-600 text-white p-3 font-semibold">
          Designation List
        </h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-2">Sr. No</th>
              <th className="border p-2">Designation</th>
              <th className="border p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {designations.length > 0 ? (
              designations.map((d, index) => (
                <tr
                  key={d._id}
                  className="hover:bg-gray-50 transition text-center"
                >
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2 font-medium">{d.name}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center justify-center mx-auto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center text-gray-500 p-4 italic"
                >
                  No designations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignationManagement;
