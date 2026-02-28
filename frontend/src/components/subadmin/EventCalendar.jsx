import React, { useState } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(weekday);
dayjs.extend(localeData);

const EventCalendar = () => {
  const [activeTab, setActiveTab] = useState("Month");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigation handler
  const handlePrevNext = (direction) => {
    let newDate;
    if (activeTab === "Day") {
      newDate = currentDate.add(direction, "day");
    } else if (activeTab === "Week") {
      newDate = currentDate.add(direction, "week");
    } else {
      newDate = currentDate.add(direction, "month");
    }
    setCurrentDate(newDate);
  };

  // Render single day
  const renderDays = () => (
    <div className="text-center p-4 border rounded-lg">
      <p className="text-lg font-semibold">{currentDate.format("MMMM D, YYYY")}</p>
    </div>
  );

  // Render week
  const renderWeek = () => {
    const startOfWeek = currentDate.startOf("week");
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
    return (
      <table className="w-full text-center border rounded-lg">
        <thead>
          <tr>
            {days.map((day) => (
              <th key={day}>{day.format("ddd D")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((day) => (
              <td key={day}>{day.format("D")}</td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  // Render month
  const renderMonth = () => {
    const startOfMonth = currentDate.startOf("month");
    const startDay = startOfMonth.weekday(0); // Align with Sunday
    const days = Array.from({ length: 42 }, (_, i) => startDay.add(i, "day"));
    return (
      <table className="w-full text-center border rounded-lg">
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, i) => (
            <tr key={i}>
              {days.slice(i * 7, i * 7 + 7).map((day, index) => (
                <td key={index} className={day.month() !== currentDate.month() ? "text-gray-400" : ""}>
                  {day.format("D")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Event Calendar</h2>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500">
          <MoreHorizontal />
        </button>
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-12 right-4 bg-white shadow-md rounded-lg p-2">
            <p className="cursor-pointer p-2 hover:bg-gray-200" onClick={() => setMenuOpen(false)}>Close</p>
            <p className="cursor-pointer p-2 hover:bg-gray-200">Edit</p>
            <p className="cursor-pointer p-2 hover:bg-gray-200">Refresh</p>
          </div>
        )}
      </div>

      {/* Date & Navigation */}
      <div className="flex items-center justify-between mt-2">
        <button onClick={() => handlePrevNext(-1)} className="text-gray-500"><ChevronLeft /></button>
        <p className="text-gray-600 font-semibold text-lg">{currentDate.format("MMMM YYYY")}</p>
        <button onClick={() => handlePrevNext(1)} className="text-gray-500"><ChevronRight /></button>
      </div>

      {/* Tabs */}
      <div className="flex mt-3 space-x-2">
        {["Day", "Week", "Month"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-1 rounded-lg ${
              activeTab === tab ? "bg-pink-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      <div className="mt-4">
        {activeTab === "Day" ? renderDays() : activeTab === "Week" ? renderWeek() : renderMonth()}
      </div>
    </div>
  );
};

export default EventCalendar;
