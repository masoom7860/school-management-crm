import React, { useState } from 'react';

const   ExamResultsComponent = () => {
  const examResults = [
    {
      id: '#0021',
      exam: 'Class Test',
      subject: 'English',
      class: 2,
      roll: '#0045',
      grade: 'A',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0022',
      exam: 'Class Test',
      subject: 'English',
      class: 1,
      roll: '#0025',
      grade: 'A',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0023',
      exam: 'Class Test',
      subject: 'Drawing',
      class: 2,
      roll: '#0045',
      grade: 'A',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0024',
      exam: 'Class Test',
      subject: 'English',
      class: 1,
      roll: '#0048',
      grade: 'A',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0025',
      exam: 'Class Test',
      subject: 'Chemistry',
      class: 8,
      roll: '#0050',
      grade: 'A',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0025',
      exam: 'Class Test',
      subject: 'Bangla',
      class: 4,
      roll: '#0035',
      grade: 'D',
      percent: '70.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0025',
      exam: 'Class Test',
      subject: 'Drawing',
      class: 2,
      roll: '#0045',
      grade: 'C',
      percent: '80.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0025',
      exam: 'Class Test',
      subject: 'English',
      class: 4,
      roll: '#0048',
      grade: 'B',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
    {
      id: '#0025',
      exam: 'First Semister',
      subject: 'English',
      class: 2,
      roll: '#0045',
      grade: 'A',
      percent: '99.00 > 100',
      date: '22/02/2019',
    },
  ];

  const [searchExam, setSearchExam] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const filteredResults = examResults.filter((res) => {
    return (
      res.exam.toLowerCase().includes(searchExam.toLowerCase()) &&
      res.subject.toLowerCase().includes(searchSubject.toLowerCase()) &&
      res.date.includes(searchDate)
    );
  });

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
  };

  return (
    <div className="col-span-9 bg-white rounded-xl shadow p-4 overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">All Exam Results</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by Exam ..."
          value={searchExam}
          onChange={(e) => setSearchExam(e.target.value)}
          className="border px-3 py-2 rounded w-80 text-sm"
        />
        <input
          type="text"
          placeholder="Search by Subject ..."
          value={searchSubject}
          onChange={(e) => setSearchSubject(e.target.value)}
          className="border px-3 py-2 rounded w-80 text-sm"
        />
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border px-3 py-2 rounded w-80 text-sm"
        />
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded text-lg">
          SEARCH
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-600">
              <th className="p-2">
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th className="p-2">ID</th>
              <th className="p-2">Exam Name</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Class</th>
              <th className="p-2">Roll</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Percent</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((res, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <input type="checkbox" checked={selectAll} readOnly />
                </td>
                <td className="p-2">{res.id}</td>
                <td className="p-2">{res.exam}</td>
                <td className="p-2">{res.subject}</td>
                <td className="p-2">{res.class}</td>
                <td className="p-2">{res.roll}</td>
                <td className="p-2">{res.grade}</td>
                <td className="p-2">{res.percent}</td>
                <td className="p-2">{res.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamResultsComponent;
