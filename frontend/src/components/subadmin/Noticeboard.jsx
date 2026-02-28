import React, { useState } from "react";
import { MoreHorizontal, X, Settings, RefreshCw } from "lucide-react";

const NoticeBoard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const notices = [
    { color: "bg-teal-500", text: "Great School manag mene esom text of the printing." },
    { color: "bg-yellow-500", text: "Great School manag printing." },
    { color: "bg-pink-500", text: "Great School manag menesom." }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notice Board</h2>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <MoreHorizontal className="text-gray-500" />
        </button>
      </div>
      <div className="mt-4 space-y-4 h-40 overflow-y-auto">
        {notices.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className={`px-3 py-1 text-white ${item.color} rounded-full text-sm`}>16 June, 2019</span>
            <div>
              <p className="font-medium">{item.text}</p>
              <p className="text-sm text-gray-500">Jennyfar Lopez / 5 min ago</p>
            </div>
          </div>
        ))}
      </div>

      {menuOpen && (
        <div className="absolute top-12 right-4 bg-white shadow-md rounded-lg p-2 space-y-2">
          <button className="flex items-center text-red-500 gap-2"><X size={16} /> Close</button>
          <button className="flex items-center text-green-500 gap-2"><Settings size={16} /> Edit</button>
          <button className="flex items-center text-yellow-500 gap-2"><RefreshCw size={16} /> Refresh</button>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
