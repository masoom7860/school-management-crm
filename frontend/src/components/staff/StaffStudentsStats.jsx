import React from "react";
import { FaUserGraduate } from "react-icons/fa";

const StaffStudentsStats = () => {
  const totalStudents = 3500;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 flex items-center">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
        <FaUserGraduate className="text-green-600 text-4xl" />
      </div>
      <div className="ml-4">
        <h2 className="text-3xl font-bold">{totalStudents}</h2>
        <p className="text-gray-500">Total Students</p>
      </div>
    </div>
  );
};

export default StaffStudentsStats;
