import React from "react";
import { FaChalkboardTeacher } from "react-icons/fa";

const StaffTeachersStats = () => {
  const totalTeachers = 150; // Example data

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 flex items-center">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
        <FaChalkboardTeacher className="text-red-600 text-4xl" />
      </div>
      <div className="ml-4">
        <h2 className="text-3xl font-bold">{totalTeachers}</h2>
        <p className="text-gray-500">Total Teachers</p>
      </div>
    </div>
  );
};

export default StaffTeachersStats;
