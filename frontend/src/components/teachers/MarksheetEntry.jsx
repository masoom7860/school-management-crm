import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMaxMarksConfig } from '../../api/marksheetsApi';
import { getAllClasses, getClassesWithSections } from '../../api/classesApi';
import { getAllExams } from '../../api/examsApi';

const MarksheetEntry = () => {
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [examId, setExamId] = useState('');
  const [subjects, setSubjects] = useState([]);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [exams, setExams] = useState([]);

  // ✅ Load initial dropdowns
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const [classData, classesWithSectionsData, examData] = await Promise.all([
          getAllClasses(schoolId),
          getClassesWithSections(),
          getAllExams(schoolId)
        ]);
        setClasses(classData);
        
        // Flatten sections from classesWithSections
        const allSections = [];
        classesWithSectionsData.forEach(cls => {
          if (cls.sections && Array.isArray(cls.sections)) {
            allSections.push(...cls.sections);
          }
        });
        setSections(allSections);
        setExams(examData);
      } catch (error) {
        console.error('Dropdown Load Error:', error);
        toast.error('Failed to load dropdown data');
      }
    };
    loadDropdowns();
  }, []);

  // ✅ Fetch Max Marks Config once class, section, and exam are selected
  useEffect(() => {
    const fetchConfig = async () => {
      if (classId && sectionId && examId) {
        try {
          const res = await getMaxMarksConfig(examId, classId, sectionId);
          if (res.success && Array.isArray(res.data)) {
            setSubjects(res.data);
            toast.success('Max Marks Config loaded!');
          } else {
            setSubjects([]);
            toast.error(res.message || 'No configuration found');
          }
        } catch (err) {
          console.error('Config Fetch Error:', err);
          setSubjects([]);
          toast.error('Error fetching config');
        }
      }
    };
    fetchConfig();
  }, [classId, sectionId, examId]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">Create Marksheet</h1>

      {/* Dropdowns */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Class */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.className}</option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Section</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select Section</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>{s.name || s.sectionName}</option>
            ))}
          </select>
        </div>

        {/* Exam */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Exam</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject Marks Table */}
      {subjects.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Subject</th>
              <th className="border p-2">Max Marks I</th>
              <th className="border p-2">Max Marks II</th>
              <th className="border p-2">Total Max</th>
              <th className="border p-2">Passing</th>
              <th className="border p-2">Obtained</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">{sub.subjectName}</td>
                <td className="border p-2 text-center">{sub.maxMarksI}</td>
                <td className="border p-2 text-center">{sub.maxMarksII}</td>
                <td className="border p-2 text-center">{sub.totalMaxMarks}</td>
                <td className="border p-2 text-center">{sub.passingMarks}</td>
                <td className="border p-2 text-center">
                  <input
                    type="number"
                    className="w-20 border rounded-md p-1 text-center"
                    min="0"
                    max={sub.totalMaxMarks}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          Select Class, Section, and Exam to load subjects.
        </p>
      )}
    </div>
  );
};

export default MarksheetEntry;
