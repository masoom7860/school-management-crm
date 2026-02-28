import React from "react";
import {
  FaMoneyBillWave,
  FaClipboardList,
  FaGraduationCap,
} from "react-icons/fa";

const dashboardData = [
  {
    title: "Due Fees",
    value: "$4503",
    icon: <FaMoneyBillWave className="text-red-500 text-2xl" />,
    bgColor: "bg-red-100",
  },
  {
    title: "Notifications",
    value: "12",
    icon: <FaClipboardList className="text-purple-500 text-2xl" />,
    bgColor: "bg-purple-100",
  },
  {
    title: "Result",
    value: "16",
    icon: <FaGraduationCap className="text-yellow-500 text-2xl" />,
    bgColor: "bg-yellow-100",
  },
  {
    title: "Expenses",
    value: "$193000",
    icon: <FaMoneyBillWave className="text-red-500 text-2xl" />,
    bgColor: "bg-red-100",
  },
];

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-100">
      {dashboardData.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
        >
          <div
            className={`rounded-full p-4 ${item.bgColor} flex items-center justify-center`}
          >
            {item.icon}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
