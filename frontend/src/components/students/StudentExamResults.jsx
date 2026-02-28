const StudentExamResult = () => {
  const [examResults, setExamResults] = useState([]);
  const examResultsAPI = '/api/exam-results'; // Replace this with your real API route

  useEffect(() => {
    fetch(examResultsAPI)
      .then(res => res.json())
      .then(data => setExamResults(data))
      .catch(err => console.error('API Error:', err));
  }, []);

  return (
    <div className="overflow-x-auto mt-6 bg-white p-4 rounded-xl shadow h-fit">
      <h2 className="text-xl font-bold mb-4">All Exam Results</h2>
      <table className="table-auto w-full border text-left">
        <thead>
          <tr>
            <th className="px-2 py-1">ID</th>
            <th className="px-2 py-1">Exam Name</th>
            <th className="px-2 py-1">Subject</th>
            <th className="px-2 py-1">Grade</th>
            <th className="px-2 py-1">Percent</th>
            <th className="px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {examResults.map((res, index) => (
            <tr key={index} className="border-t">
              <td className="px-2 py-1">{res.id}</td>
              <td className="px-2 py-1">{res.examName}</td>
              <td className="px-2 py-1">{res.subject}</td>
              <td className="px-2 py-1">{res.grade}</td>
              <td className="px-2 py-1">{res.percent}</td>
              <td className="px-2 py-1">{res.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
