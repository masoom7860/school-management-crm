import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = ['#3366FF', '#FFA500']; // red (Female), Orange (Male)

const TeacherChart = () => {
  const [teacherData, setTeacherData] = useState([]);

  useEffect(() => {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) {
      console.error('School ID not found in localStorage');
      return;
    }

    const token = localStorage.getItem('token');
    axios
      .get(`${BASE_URL}/api/teachers/all/${schoolId}`,
        { headers: { Authorization: `Bearer ${token}` }})
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTeacherData(res.data);
        } else if (Array.isArray(res.data.teachers)) {
          // In case the data is returned as { teachers: [...] }
          setTeacherData(res.data.teachers);
        } else {
          console.error('Unexpected response format:', res.data);
          setTeacherData([]); // fallback to empty array
        }
      })
      .catch((err) => {
        console.error('Error fetching teachers:', err);
        setTeacherData([]); // prevent .filter from crashing
      });
  }, []);


  const maleCount = teacherData.filter((t) => t.gender === 'Male').length;
  const femaleCount = teacherData.filter((t) => t.gender === 'Female').length;

  const chartData = [
    { name: 'Female Teachers', value: femaleCount },
    { name: 'Male Teachers', value: maleCount },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-4">Teachers</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            paddingAngle={5}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value.toLocaleString()}`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex justify-around mt-4 text-sm text-gray-600">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-[#3366FF] rounded-full" />
            <span>Female Teachers</span>
          </div>
          <div className="text-black font-bold">{femaleCount.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-[#FFA500] rounded-full" />
            <span>Male Teachers</span>
          </div>
          <div className="text-black font-bold">{maleCount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherChart;
