import React from "react"; // Removed useState, useEffect
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
// Removed axios, jwtDecode, useNavigate, BASE_URL

const StudentStatsNotifications = ({ students, loading, error }) => { // Accept students, loading, error as props

  // Calculate male and female student counts from props
  const femaleStudents = students ? students.filter(student => student.gender === 'Female').length : 0;
  const maleStudents = students ? students.filter(student => student.gender === 'Male').length : 0;

  const chartData = [
    { name: "Female Students", value: femaleStudents, color: "#2C50ED" },
    { name: "Male Students", value: maleStudents, color: "#FFA500" },
  ];

  // Demo notifications (keep for now, can be replaced later if needed)
  const notifications = [
    { date: "16 June, 2019", message: "Great School managing printing.", sender: "Jennyfar Lopez", timeAgo: "5 min ago", color: "#FFD700" },
    { date: "16 June, 2019", message: "School news update lorem ipsum text.", sender: "Jennyfar Lopez", timeAgo: "10 min ago", color: "#FF1493" },
    { date: "16 June, 2019", message: "Reminder: Parent meeting tomorrow.", sender: "Admin", timeAgo: "1 hour ago", color: "#20B2AA" },
  ];

  if (loading) {
    return <div className="p-4">Loading student stats...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Student Stats Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Students</h2>
        {students && students.length > 0 ? ( // Check if students is not null/undefined and has length
          <PieChart width={300} height={300}>
            <Pie data={chartData} dataKey="value" outerRadius={100}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <div className="text-gray-600">No student data available for chart.</div>
        )}
        <div className="flex justify-between mt-4 text-gray-600">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-blue-600 inline-block mr-2"></span> Female Students: {femaleStudents}
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-orange-500 inline-block mr-2"></span> Male Students: {maleStudents}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto h-80">
        <h2 className="text-xl font-bold mb-4">Notifications</h2>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div key={index} className="p-3 border-b">
              <span className="inline-block px-2 py-1 rounded-full text-white text-sm" style={{ backgroundColor: notification.color }}>
                {notification.date}
              </span>
              <p className="mt-2 font-semibold">{notification.message}</p>
              <p className="text-sm text-gray-500">{notification.sender} / {notification.timeAgo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentStatsNotifications;
