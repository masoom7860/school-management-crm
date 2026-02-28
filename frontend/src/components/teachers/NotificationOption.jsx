import React from "react";

const notifications = [
  { id: 1, message: "New assignment uploaded for Class 10A", time: "2 hours ago", type: "info" },
  { id: 2, message: "Parent meeting scheduled for tomorrow", time: "1 day ago", type: "warning" },
  { id: 3, message: "Exam results published", time: "3 days ago", type: "success" },
];

const NotificationOption = () => {
  return (
    <div className="bg-white shadow-lg p-6 rounded-xl border border-gray-200 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
            <p>{notif.message}</p>
            <span className="text-gray-500 text-sm">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationOption;