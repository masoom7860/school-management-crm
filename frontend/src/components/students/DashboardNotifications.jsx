// src/components/Notifications.jsx
import React from 'react';

const DashboardNotifications = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 overflow-y-auto max-h-[400px]">
    <h2 className="font-semibold text-lg mb-4">Notifications</h2>
    {[
      { date: '16 June, 2019', color: 'bg-green-400', message: 'Great School manag mene esom tus eleifend lectus sed maximus mi faucibusunting.' },
      { date: '16 June, 2019', color: 'bg-yellow-400', message: 'Great School manag printing.' },
      { date: '16 June, 2019', color: 'bg-pink-500', message: 'Great School manag Nulla rhoncus eleifendsed mim us mi faucibus id.' },
    ].map((item, i) => (
      <div key={i} className="mb-4">
        <span className={`text-xs text-white ${item.color} px-2 py-1 rounded-full`}>{item.date}</span>
        <p className="text-sm mt-1 font-semibold">{item.message}</p>
        <p className="text-xs text-gray-400">Jennyfar Lopez / 5 min ago</p>
      </div>
    ))}
  </div>
);

export default DashboardNotifications;
