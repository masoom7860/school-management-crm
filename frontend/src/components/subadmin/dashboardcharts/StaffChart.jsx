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

const StaffChart = () => {
  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    const schoolId = localStorage.getItem('schoolId');
    if (!schoolId) {
      console.error('School ID not found in localStorage');
      return;
    }

    axios
      .get(`${BASE_URL}/staff/getstaff/${schoolId}`) // Corrected staff API endpoint
      .then((res) => {
        console.log('Staff API response:', res.data); // Added logging
        let staffArray = [];
        if (Array.isArray(res.data)) {
          staffArray = res.data;
        } else if (Array.isArray(res.data.staff)) {
          // In case the data is returned as { staff: [...] }
          staffArray = res.data.staff;
        } else {
          console.error('Unexpected response format:', res.data);
        }
        setStaffData(staffArray);

        // Log gender for each staff member
        staffArray.forEach((staff, index) => {
          console.log(`Staff ${index} gender:`, staff.gender);
        });
      })
      .catch((err) => {
        console.error('Error fetching staff:', err);
        setStaffData([]); // prevent .filter from crashing
      });
  }, []);


  const maleCount = staffData.filter((s) => s.gender === 'Male').length;
  const femaleCount = staffData.filter((s) => s.gender === 'Female').length;

  const chartData = [
    { name: 'Female Staff', value: femaleCount },
    { name: 'Male Staff', value: maleCount },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-4">Staff</h2>
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
            <span>Female Staff</span>
          </div>
          <div className="text-black font-bold">{femaleCount.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-[#FFA500] rounded-full" />
            <span>Male Staff</span>
          </div>
          <div className="text-black font-bold">{maleCount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default StaffChart;
