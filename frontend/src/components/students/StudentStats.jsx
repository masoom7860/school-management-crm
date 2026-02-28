const stats = [
    { title: 'Notification', value: 12, icon: '📋', color: 'bg-purple-100' },
    { title: 'Events', value: 6, icon: '📅', color: 'bg-red-100' },
    { title: 'Attendance', value: '94%', icon: '📈', color: 'bg-yellow-100' },
];

export default function StudentStats() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className={`p-10 rounded-xl shadow-md flex items-center gap-4 ${stat.color}`}>
                    <div className="text-5xl">{stat.icon}</div>
                    <div>
                        <p className="text-3xl font-semibold text-gray-700">{stat.title}</p>

                        <p className="text-3xl font-extrabold">{stat.value}</p>

                    </div>
                </div>
            ))}
        </div>
    );
}
