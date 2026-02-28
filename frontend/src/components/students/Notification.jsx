import React from "react";

const notifications = [
  {
    id: 1,
    title: "School Closed Tomorrow",
    message: "Due to heavy rainfall, the school will remain closed tomorrow (13th April).",
    date: "2025-04-12",
  },
  {
    id: 2,
    title: "Exam Timetable Released",
    message: "Check the portal for the final exam timetable uploaded today.",
    date: "2025-04-11",
  },
  {
    id: 3,
    title: "Annual Sports Day",
    message: "Annual Sports Day will be held on 25th April. Students are encouraged to participate.",
    date: "2025-04-10",
  },
  {
    id: 4,
    title: "Fee Payment Reminder",
    message: "Final date for quarterly fee payment is 15th April. Please avoid late fee penalties.",
    date: "2025-04-09",
  },
  {
    id: 5,
    title: "Parent-Teacher Meeting",
    message: "PTM for grades 1 to 5 is scheduled on 17th April. Attendance is compulsory.",
    date: "2025-04-08",
  },
  {
    id: 6,
    title: "Library Book Return",
    message: "All borrowed library books must be returned by 20th April before the final exams.",
    date: "2025-04-07",
  },
  {
    id: 7,
    title: "New Uniform Policy",
    message: "Starting 1st May, students must wear the new summer uniform. Details on the website.",
    date: "2025-04-06",
  },
  {
    id: 8,
    title: "School Magazine Submissions",
    message: "Submit your poems, stories, and artwork for the annual magazine by 22nd April.",
    date: "2025-04-05",
  },
];

const NotificationList = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-red-600">School Notifications</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {notifications.map((note) => (
          <div
            key={note.id}
            className="bg-white shadow-md rounded-2xl p-5 border-l-4 border-red-500 hover:shadow-lg transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                <p className="text-gray-600 mt-1 text-sm">{note.message}</p>
              </div>
              <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                {note.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
