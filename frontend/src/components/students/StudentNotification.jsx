import React from 'react';

const notifications = [
  {
    date: '16 June, 2019',
    type: 'green',
    message: 'Great School manag mene esom tus eleifend lectus sed maximus mi faucibusnting.',
    user: 'Jennyfar Lopez',
    time: '5 min ago',
  },
  {
    date: '16 June, 2019',
    type: 'yellow',
    message: 'Great School manag printing.',
    user: 'Jennyfar Lopez',
    time: '5 min ago',
  },
  {
    date: '16 June, 2019',
    type: 'pink',
    message: 'Great School manag Nulla rhoncus eleifendsem mim us mi faucibus id.',
    user: 'Jennyfar Lopez',
    time: '5 min ago',
  },
];

export default function Notifications() {
  const badgeColor = {
    green: 'bg-teal-400',
    yellow: 'bg-yellow-300',
    pink: 'bg-pink-500',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((note, i) => (
          <div key={i} className="border-b pb-4">
            <span
              className={`text-xs px-2 py-1 rounded-full text-white ${badgeColor[note.type]}`}
            >
              {note.date}
            </span>
            <p className="mt-2 text-sm">{note.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {note.user} / {note.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
