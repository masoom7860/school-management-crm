// src/components/EventCalendar.jsx
import React from 'react';

const EventCalendar = () => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="font-semibold text-lg mb-2">Event Calendar</h2>
    <p className="text-sm text-gray-600 mb-4">April 2025</p>
    <div className="flex gap-2 mb-4">
      <button className="text-xs bg-gray-100 rounded-full px-4 py-1">Day</button>
      <button className="text-xs bg-gray-100 rounded-full px-4 py-1">Week</button>
      <button className="text-xs bg-pink-500 text-white rounded-full px-4 py-1">Month</button>
    </div>
    <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center">{day}</div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-2 text-sm text-gray-700">
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} className={`text-center py-1 rounded-lg ${i + 1 === 15 ? 'bg-yellow-100' : ''}`}>
          {i + 1}
        </div>
      ))}
    </div>
  </div>
);

export default EventCalendar;
