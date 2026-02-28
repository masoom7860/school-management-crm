import React from "react";

const WebsiteTraffic = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Website Traffic</h2>
        <button className="text-gray-500">•••</button>
      </div>
      <p className="text-gray-500 mt-2">Unique Visitors</p>
      <h2 className="text-2xl font-bold mt-2">2,590</h2>
      <div className="w-full bg-gray-300 h-2 rounded-full mt-3">
        <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
      </div>
      <ul className="mt-4 space-y-2">
        <li className="flex justify-between">
          <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Direct</span>
          <span>12,890</span><span>50%</span>
        </li>
        <li className="flex justify-between">
          <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Search</span>
          <span>7,245</span><span>27%</span>
        </li>
        <li className="flex justify-between">
          <span className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span> Referrals</span>
          <span>4,256</span><span>8%</span>
        </li>
        <li className="flex justify-between">
          <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Social</span>
          <span>500</span><span>7%</span>
        </li>
      </ul>
    </div>
  );
};

export default WebsiteTraffic;
