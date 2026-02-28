import React, { useEffect, useState } from "react";

import { getSectionsByClass } from "../../../api/classesApi";
import {
  getClasses,
  getStudents,
  getExams,
  getSubjects,
  getMaxMarksConfig,
  createMarksheet,
  downloadMarksheetPdf,
} from "../../../api/marksheetsApi";

const CreateMarksheet = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [maxMarks, setMaxMarks] = useState({});
  const [selected, setSelected] = useState({
    classId: "",
    sectionId: "",
    examId: "",
    studentId: "",
  });
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedMarksheetId, setSavedMarksheetId] = useState(null);

  // Load classes and exams on mount
  useEffect(() => {
    (async () => {
      try {
        const [cls, ex] = await Promise.all([getClasses(), getExams()]);
        setClasses(Array.isArray(cls) ? cls : []);
        setExams(Array.isArray(ex) ? ex : []);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setClasses([]);
        setExams([]);
      }
    })();
  }, []);

  // Load sections and students when class changes
  useEffect(() => {
    if (selected.classId) {
      (async () => {
        const schoolId = localStorage.getItem("schoolId");
        try {
          // Load sections and students in parallel
          const [sec, stu] = await Promise.all([
            getSectionsByClass(selected.classId, schoolId),
            getStudents({ classId: selected.classId }) // Load students for the class directly
          ]);

          setSections(Array.isArray(sec) ? sec : []);
          setStudents(Array.isArray(stu) ? stu : []);
        } catch (err) {
          console.error("Error loading sections and students:", err);
          setSections([]);
          setStudents([]);
        }
      })();
    } else {
      // Reset when no class is selected
      setSections([]);
      setStudents([]);
    }
    // Reset dependent selections when class changes
    setSelected((prev) => ({ ...prev, sectionId: "", studentId: "" }));
    setSubjects([]);
    setMarks({});
  }, [selected.classId]);

  // Load students + subjects when section changes (optional filtering)
  useEffect(() => {
    if (selected.classId && selected.sectionId) {
      // If section is selected, load students for that specific section
      (async () => {
        const schoolId = localStorage.getItem("schoolId");
        try {
          const [stu, subj] = await Promise.all([
            getStudents({ classId: selected.classId, sectionId: selected.sectionId }),
            getSubjects(selected.classId, selected.sectionId, schoolId),
          ]);
          setStudents(Array.isArray(stu) ? stu : []);
          setSubjects(Array.isArray(subj) ? subj : []);
        } catch (err) {
          console.error("Error loading students/subjects:", err);
          setStudents([]);
          setSubjects([]);
        }
      })();
    } else if (selected.classId && !selected.sectionId) {
      // If no section selected but class is selected, load all students for the class
      (async () => {
        try {
          const stu = await getStudents({ classId: selected.classId });
          setStudents(Array.isArray(stu) ? stu : []);
          setSubjects([]); // Clear subjects when no section selected
        } catch (err) {
          console.error("Error loading students:", err);
          setStudents([]);
          setSubjects([]);
        }
      })();
    } else {
      // Reset when no class is selected
      setStudents([]);
      setSubjects([]);
    }
    // Reset dependent selections when section changes
    setSelected((prev) => ({ ...prev, studentId: "" }));
    setMarks({});
  }, [selected.sectionId, selected.classId]);

  // Fetch max marks config when exam/class/section all selected
  useEffect(() => {
    if (selected.examId && selected.classId && selected.sectionId) {
      (async () => {
        try {
          const data = await getMaxMarksConfig(
            selected.examId,
            selected.classId,
            selected.sectionId
          );
          setMaxMarks(data || {});
        } catch (err) {
          console.warn("No max marks config found");
          setMaxMarks({});
        }
      })();
    }
  }, [selected.examId, selected.classId, selected.sectionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelected((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarkChange = (subjectId, value) => {
    setMarks((prev) => ({ ...prev, [subjectId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected.studentId || !selected.examId) {
      alert("Please select student and exam.");
      return;
    }

    const data = {
      ...selected,
      marks,
      schoolId: localStorage.getItem("schoolId"),
    };

    try {
      setLoading(true);
      const res = await createMarksheet(data);
      setSavedMarksheetId(res._id);
      alert("Marksheet created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error creating marksheet");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!savedMarksheetId) return alert("Save marksheet first!");
    const blob = await downloadMarksheetPdf(savedMarksheetId);
    const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `marksheet-${savedMarksheetId}.pdf`;
    link.click();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">🧾 Create Marksheet</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <select name="classId" onChange={handleChange} value={selected.classId}>
            <option value="">Select Class</option>
            {Array.isArray(classes) &&
              classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
          </select>

          <select name="sectionId" onChange={handleChange} value={selected.sectionId}>
            <option value="">Select Section</option>
            {Array.isArray(sections) &&
              sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.sectionName}
                </option>
              ))}
          </select>

          <select name="examId" onChange={handleChange} value={selected.examId}>
            <option value="">Select Exam</option>
            {Array.isArray(exams) &&
              exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.examName}
                </option>
              ))}
          </select>

          <select name="studentId" onChange={handleChange} value={selected.studentId}>
            <option value="">Select Student</option>
            {Array.isArray(students) &&
              students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name || `${st.firstName || ""} ${st.lastName || ""}`.trim()}
                </option>
              ))}
          </select>
        </div>

        {/* Marks Entry */}
        {Array.isArray(subjects) && subjects.length > 0 ? (
          <div>
            <h3 className="font-semibold mt-4">Enter Marks</h3>
            <table className="w-full border mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Subject</th>
                  <th className="p-2 border">Marks Obtained</th>
                  <th className="p-2 border">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subj) => (
                  <tr key={subj._id}>
                    <td className="p-2 border">{subj.subjectName}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="border p-1 w-24"
                        value={marks[subj._id] || ""}
                        onChange={(e) => handleMarkChange(subj._id, e.target.value)}
                      />
                    </td>
                    <td className="p-2 border">
                      {maxMarks[subj._id] || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : Array.isArray(students) && students.length > 0 ? (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">
              {selected.sectionId ? "Loading subjects..." : "Select a section to load subjects and enter marks"}
            </p>
          </div>
        ) : null}

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading || !Array.isArray(subjects) || subjects.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save Marksheet"}
          </button>

          {savedMarksheetId && (
            <button
              type="button"
              onClick={handleDownload}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download PDF
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateMarksheet;
