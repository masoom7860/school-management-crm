import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ArrowRight, Users, User, UserCheck, School } from "lucide-react";

const COLORS = ["#34d399", "#f87171"];

const normalizeSchoolResponse = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.schools)) return payload.schools;
  return null;
};

const SuperDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/registerSchool/getAllSchool", {
          params: { limit: 1000 }
        });
        const normalized = normalizeSchoolResponse(response.data);
        if (normalized) {
          setSchools(normalized);
        } else {
          setSchools([]);
          setError("Failed to load dashboard data. Unexpected response shape.");
        }
      } catch (err) {
        setSchools([]);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  // Aggregated stats
  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === "active").length;
  const inactiveSchools = schools.filter(s => s.status === "inactive").length;
  const totalStudents = schools.reduce((sum, s) => sum + (s.studentCount || 0), 0);
  const totalTeachers = schools.reduce((sum, s) => sum + (s.teacherCount || 0), 0);
  const totalStaff = schools.reduce((sum, s) => sum + (s.staffCount || 0), 0);

  // Recent registrations (latest 5)
  const recentSchools = [...schools]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Status breakdown for chart
  const statusData = [
    { name: "Active", value: activeSchools },
    { name: "Inactive", value: inactiveSchools },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Home - Dashboard</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-lg text-gray-500">Loading dashboard data...</div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-lg text-red-500">{error}</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
              <School className="text-cyan-500" size={36} />
              <div>
                <div className="text-3xl font-bold">{totalSchools}</div>
                <div className="text-gray-600">Total Schools</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
              <Users className="text-green-500" size={36} />
              <div>
                <div className="text-3xl font-bold">{totalStudents}</div>
                <div className="text-gray-600">Total Students</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
              <User className="text-purple-500" size={36} />
              <div>
                <div className="text-3xl font-bold">{totalTeachers}</div>
                <div className="text-gray-600">Total Teachers</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
              <UserCheck className="text-yellow-500" size={36} />
              <div>
                <div className="text-3xl font-bold">{totalStaff}</div>
                <div className="text-gray-600">Total Staff</div>
              </div>
            </div>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
            {/* School Status Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">School Status Breakdown</h3>
              {totalSchools === 0 ? (
                <div className="text-gray-400 mt-10">No school data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent Registrations */}
            <div className="bg-white p-6 rounded-lg shadow col-span-2">
              <h3 className="text-lg font-semibold mb-4">Recent School Registrations</h3>
              {recentSchools.length === 0 ? (
                <div className="text-gray-400">No recent school registrations.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="py-2 px-3 text-left">School Name</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Registered On</th>
                      <th className="py-2 px-3 text-left">Students</th>
                      <th className="py-2 px-3 text-left">Teachers</th>
                      <th className="py-2 px-3 text-left">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSchools.map((school) => (
                      <tr key={school._id} className="border-b">
                        <td className="py-2 px-3 font-semibold">{school.schoolName}</td>
                        <td className="py-2 px-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${school.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{school.status}</span>
                        </td>
                        <td className="py-2 px-3">{school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="py-2 px-3">{school.studentCount}</td>
                        <td className="py-2 px-3">{school.teacherCount}</td>
                        <td className="py-2 px-3">{school.staffCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="#/schools" className="bg-cyan-100 hover:bg-cyan-200 p-6 rounded-lg shadow flex flex-col items-center">
              <School size={32} className="mb-2 text-cyan-600" />
              <span className="font-semibold text-cyan-700">Manage Schools</span>
            </a>
            <a href="#/reports" className="bg-green-100 hover:bg-green-200 p-6 rounded-lg shadow flex flex-col items-center">
              <Users size={32} className="mb-2 text-green-600" />
              <span className="font-semibold text-green-700">View Reports</span>
            </a>
            <a href="#/settings" className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-lg shadow flex flex-col items-center">
              <UserCheck size={32} className="mb-2 text-yellow-600" />
              <span className="font-semibold text-yellow-700">System Settings</span>
            </a>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="text-sm text-gray-600 mt-10 text-center">
        2025 © <a href="#" className="text-cyan-500">By Zosto</a>
      </footer>
    </div>
  );
};

export default SuperDashboard;
