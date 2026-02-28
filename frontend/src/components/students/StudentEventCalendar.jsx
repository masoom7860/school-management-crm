import React from 'react';

export default function StudentEventCalendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDates = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-1">Event Calendar</h2>
      <p className="text-sm mb-3 text-gray-500">April 2025</p>
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-1 text-sm bg-gray-100 rounded-full">Day</button>
        <button className="px-4 py-1 text-sm bg-gray-100 rounded-full">Week</button>
        <button className="px-4 py-1 text-sm bg-pink-500 text-white rounded-full">Month</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm text-center text-gray-700">
        {days.map((day) => (
          <div key={day} className="font-semibold">{day}</div>
        ))}
        {Array(2).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {calendarDates.map((day) => (
          <div
            key={day}
            className={`py-2 rounded-lg ${day === 21 ? 'bg-yellow-100' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
