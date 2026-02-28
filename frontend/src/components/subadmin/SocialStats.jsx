import React from "react";
import { Facebook, Twitter, Linkedin, Plus } from "lucide-react";

const SocialStats = () => {
  const socialData = [
    { icon: <Facebook size={24} />, text: "Like us on facebook", count: "30,000", color: "bg-[#3b5998]" },
    { icon: <Twitter size={24} />, text: "Follow us on twitter", count: "1,11,000", color: "bg-[#55acee]" },
    { icon: <Plus size={24} />, text: "Follow us on googleplus", count: "19,000", color: "bg-[#dd4b39]" },
    { icon: <Linkedin size={24} />, text: "Follow us on linked", count: "45,000", color: "bg-[#0077b5]" },
  ];

  return (
    <div className="bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {socialData.map((item, index) => (
          <div key={index} className={`p-6 text-white rounded-lg ${item.color} text-center`}>
            <div className="flex items-center justify-center space-x-2">
              {item.icon}
              <span className="text-lg font-semibold">{item.text}</span>
            </div>
            <p className="text-2xl font-bold mt-2">{item.count}</p>
          </div>
        ))}
      </div>

      <footer className="text-center mt-6 text-gray-600 text-sm">
        © Copyrights <span className="font-bold">Zosto</span> 2019. All rights reserved. Designed by <span className="font-bold">PsdBosS</span>
      </footer>

      {/* Scroll to Top Button */}
      <button className="fixed bottom-4 right-4 bg-red-900 text-white p-2 rounded-full shadow-md">
        ▲
      </button>
    </div>
  );
};

export default SocialStats;