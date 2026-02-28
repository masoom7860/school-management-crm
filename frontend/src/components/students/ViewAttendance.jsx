import { useState } from "react";

// Generate sample data for 20 students with random attendance
const studentsData = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: `Student ${index + 1}`,
  attendance: {
    M: Math.random() > 0.5,
    T: Math.random() > 0.5,
    W: Math.random() > 0.5,
    TH: Math.random() > 0.5,
    F: Math.random() > 0.5,
    S: Math.random() > 0.5,
  }
}));

export default function ViewAttendance() {
  const [students] = useState(studentsData);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-red-800 py-4 rounded-t-md">
        <h1 className="text-4xl font-bold text-white text-center">CLASS ATTENDANCE</h1>
      </div>

      <div className="bg-white p-4 shadow-md rounded-b-md">
        <div className="flex justify-between text-sm text-gray-700 mb-4">
          <div>
            <strong>CLASS:</strong>{" "}
            <span className="underline">7th Grade – Social Studies</span>
          </div>
          <div>
            <strong>WEEK OF:</strong>{" "}
            <span className="underline">August 5–10, 2030</span>
          </div>
        </div>

        <table className="w-full border border-red-600">
          <thead>
            <tr className="bg-yellow-300 text-red-900 text-sm">
              <th className="border border-red-600 px-2 py-1">No</th>
              <th className="border border-red-600 px-2 py-1 text-left">Name of Student</th>
              <th className="border border-red-600 px-2 py-1">M</th>
              <th className="border border-red-600 px-2 py-1">T</th>
              <th className="border border-red-600 px-2 py-1">W</th>
              <th className="border border-red-600 px-2 py-1">TH</th>
              <th className="border border-red-600 px-2 py-1">F</th>
              <th className="border border-red-600 px-2 py-1">S</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={student.id} className="text-center text-sm">
                <td className="border border-red-600 px-2 py-1">{idx + 1}</td>
                <td className="border border-red-600 px-2 py-1 text-left">{student.name}</td>
                {["M", "T", "W", "TH", "F", "S"].map((day) => (
                  <td className="border border-red-600 px-2 py-1" key={day}>
                    {student.attendance[day] ? "✓" : "✗"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
