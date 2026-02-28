import React from 'react';

const NotificationsComponent = () => {
  const notifications = [
    {
      date: '16 June, 2019',
      color: 'bg-teal-400',
      title: 'Great School manag mene esom tus eleifend lectus sed maximus mi faucibusnting.',
      author: 'Jennyfar Lopez',
      time: '5 min ago',
    },
    {
      date: '16 June, 2019',
      color: 'bg-yellow-400',
      title: 'Great School manag printing.',
      author: 'Jennyfar Lopez',
      time: '5 min ago',
    },
    {
      date: '16 June, 2019',
      color: 'bg-pink-500',
      title:
        'Great School manag Nulla rhoncus eleifensed mim us mi faucibus id. Mauris vestibulum non purus lobortismenearea',
      author: 'Jennyfar Lopez',
      time: '5 min ago',
    },
    {
      date: '16 June, 2019',
      color: 'bg-red-600',
      title: 'Great School manag mene esom text of the printing.',
      author: 'Jennyfar Lopez',
      time: '5 min ago',
    },
    {
      date: '16 June, 2019',
      color: 'bg-yellow-400',
      title: 'Great School manag printing.',
      author: 'Jennyfar Lopez',
      time: '5 min ago',
    },
    {
      date: '16 June, 2019',
      color: 'bg-teal-400',
      title: 'Great School manag mene esom tus eleifend lectus sed maximus mi faucibusnting.',
      author: 'Jennyfar Lopez',
      time: '5 min ago',
    },
  ];

  return (
    <>

      <div className="col-span-3 bg-white rounded-xl shadow p-4 h-[500px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div>
          {notifications.map((note, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <div className={`text-white text-sm px-2 py-1 rounded-full w-fit ${note.color}`}>
                {note.date}
              </div>
              <p className="font-medium mt-2">{note.title}</p>
              <p className="text-sm text-gray-500">
                {note.author} / {note.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsComponent;
