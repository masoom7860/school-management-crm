import { useState } from 'react';

export default function ExamResults() {
    const results = [
        { id: '#0021', name: 'Class Test', subject: 'English', grade: 'A', percent: '99.00 > 100', date: '22/02/2019' },
        { id: '#0022', name: 'Class Test', subject: 'English', grade: 'A', percent: '99.00 > 100', date: '22/02/2019' },
        { id: '#0023', name: 'Class Test', subject: 'Chemistry', grade: 'A', percent: '99.00 > 100', date: '22/02/2019' },
        { id: '#0024', name: 'Class Test', subject: 'English', grade: 'A', percent: '99.00 > 100', date: '22/02/2019' },
        { id: '#0025', name: 'Class Test', subject: 'Chemistry', grade: 'A', percent: '99.00 > 100', date: '22/02/2019' },
        { id: '#0026', name: 'Class Test', subject: 'Chemistry', grade: 'D', percent: '70.00 > 100', date: '22/02/2019' },
        { id: '#0027', name: 'Class Test', subject: 'English', grade: 'C', percent: '80.00 > 100', date: '22/02/2019' },
        { id: '#0028', name: 'Class Test', subject: 'English', grade: 'B', percent: '99.00 > 100', date: '22/02/2019' },
        { id: '#0029', name: 'First Semester', subject: 'English', grade: 'A', percent: '99.00 > 100', date: '22/02/2019' },
    ];

    const [selectedIds, setSelectedIds] = useState([]);

    const toggleAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(results.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto text-base">
            <h2 className="font-extrabold text-xl mb-4">All Exam Results</h2>

            <div className="flex gap-3 mb-4">
                <input className="border rounded px-3 py-2 w-1/3" placeholder="Search by Exam ..." />
                <input className="border rounded px-3 py-2 w-1/3" placeholder="Search by Subject ..." />
                <input className="border rounded px-3 py-2 w-1/3" placeholder="dd/mm/yyyy" />
                <button className="bg-yellow-400 text-white px-6 py-2 rounded">SEARCH</button>
            </div>

            <table className="w-full text-left border-t text-base">
                <thead className="bg-gray-100">
                    <tr className="text-gray-700 font-semibold">
                        <th className="py-3 px-3">
                            <input
                                type="checkbox"
                                onChange={toggleAll}
                                checked={selectedIds.length === results.length}
                            />
                        </th>
                        <th className="py-3 px-3">ID</th>
                        <th className="py-3 px-3">Exam Name</th>
                        <th className="py-3 px-3">Subject</th>
                        <th className="py-3 px-3">Grade</th>
                        <th className="py-3 px-3">Percent</th>
                        <th className="py-3 px-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="py-2 px-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(r.id)}
                                    onChange={() => toggleOne(r.id)}
                                />
                            </td>
                            <td className="py-2 px-3 font-medium">{r.id}</td>
                            <td className="py-2 px-3 font-medium">{r.name}</td>
                            <td className="py-2 px-3 font-medium">{r.subject}</td>
                            <td className="py-2 px-3 font-medium">{r.grade}</td>
                            <td className="py-2 px-3 font-medium">{r.percent}</td>
                            <td className="py-2 px-3 font-medium">{r.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
    