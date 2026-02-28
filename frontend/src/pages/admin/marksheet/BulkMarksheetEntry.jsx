import React, { useEffect, useState } from "react";
import {
  getClasses,
  getSections,
  getStudents,
  getExams,
  getSubjects,
  getMaxMarksConfig,
  createMarksheet,
  downloadMarksheetPdf,
} from "../../../api/marksheetsApi";

const BulkMarksheetEntry = () => {
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
  });
  const [marksData, setMarksData] = useState({}); // { studentId: { subjectId: marks } }
  const [loading, setLoading] = useState(false);

  // Load class & exam list
  useEffect(() => {
    (async () => {
      try {
        const [cls, ex] = await Promise.all([getClasses(), getExams()]);
        setClasses(Array.isArray(cls) ? cls : []);
        setExams(Array.isArray(ex) ? ex : []);
      } catch (err) {
        console.error("Error loading base data:", err);
        setClasses([]);
        setExams([]);
      }
    })();
  }, []);

  // Load sections and students when class changes
  useEffect(() => {
    if (selected.classId) {
      const schoolId = localStorage.getItem("schoolId");
      Promise.all([
        getSections(selected.classId, schoolId),
        getStudents({ classId: selected.classId }) // Load students for the class directly
      ])
        .then(([sec, stu]) => {
          setSections(Array.isArray(sec) ? sec : []);
          setStudents(Array.isArray(stu) ? stu : []);
        })
        .catch((err) => {
          console.error("Error loading sections and students:", err);
          setSections([]);
          setStudents([]);
        });
    } else {
      // Reset when no class is selected
      setSections([]);
      setStudents([]);
    }
    // Reset dependent selections when class changes
    setSelected((prev) => ({ ...prev, sectionId: "", examId: "" }));
    setSubjects([]);
    setMarksData({});
    setMaxMarks({});
  }, [selected.classId]);

  // Load students + subjects when section selected (optional filtering)
  useEffect(() => {
    if (selected.classId && selected.sectionId) {
      // If section is selected, load students for that specific section
      const schoolId = localStorage.getItem("schoolId");
      Promise.all([
        getStudents({
          classId: selected.classId,
          sectionId: selected.sectionId,
        }),
        getSubjects(selected.classId, selected.sectionId, schoolId),
      ])
        .then(([stu, subj]) => {
          const studentsArray = Array.isArray(stu) ? stu : [];
          const subjectsArray = Array.isArray(subj) ? subj : [];
          setStudents(studentsArray);
          setSubjects(subjectsArray);
          setMarksData(
            Object.fromEntries(
              studentsArray.map((s) => [
                s._id,
                Object.fromEntries(subjectsArray.map((sb) => [sb._id, ""])),
              ])
            )
          );
        })
        .catch((err) => {
          console.error("Error loading students/subjects:", err);
          setStudents([]);
          setSubjects([]);
          setMarksData({});
        });
    } else if (selected.classId && !selected.sectionId) {
      // If no section selected but class is selected, load all students for the class
      getStudents({ classId: selected.classId })
        .then((stu) => {
          const studentsArray = Array.isArray(stu) ? stu : [];
          setStudents(studentsArray);
          setSubjects([]); // Clear subjects when no section selected
          setMarksData({});
        })
        .catch((err) => {
          console.error("Error loading students:", err);
          setStudents([]);
          setSubjects([]);
          setMarksData({});
        });
    } else {
      // Reset when no class is selected
      setStudents([]);
      setSubjects([]);
      setMarksData({});
    }
  }, [selected.sectionId, selected.classId]);

  // Load max marks when exam/class/section selected
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
        } catch {
          setMaxMarks({});
        }
      })();
    }
  }, [selected.examId, selected.classId, selected.sectionId]);

  // Dropdown handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelected((prev) => ({ ...prev, [name]: value }));
  };

  // Marks input handler
  const handleMarkChange = (studentId, subjectId, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: value },
    }));
  };

  // Save all marksheets
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected.examId || !selected.classId || !selected.sectionId) {
      alert("Select class, section, and exam first.");
      return;
    }

    try {
      setLoading(true);
      const schoolId = localStorage.getItem("schoolId");

      const payloads = Object.entries(marksData).map(([studentId, marks]) => ({
        ...selected,
        studentId,
        marks,
        schoolId,
      }));

      // Call API sequentially or in parallel
      for (const data of payloads) {
        await createMarksheet(data);
      }

      alert("✅ All marksheets saved successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error saving marksheets");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (studentId) => {
    try {
      const blob = await downloadMarksheetPdf(studentId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `marksheet-${studentId}.pdf`;
      link.click();
    } catch {
      alert("PDF download failed");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🧾 Bulk Marksheet Entry</h2>

      {/* Dropdown filters */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <select name="classId" onChange={handleChange} value={selected.classId}>
          <option value="">Select Class</option>
          {Array.isArray(classes) &&
            classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
        </select>

        <select name="sectionId" onChange={handleChange} value={selected.sectionId}>
          <option value="">Select Section</option>
          {Array.isArray(sections) &&
            sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.sectionName}
              </option>
            ))}
        </select>

        <select name="examId" onChange={handleChange} value={selected.examId}>
          <option value="">Select Exam</option>
          {Array.isArray(exams) &&
            exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.examName}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      {Array.isArray(students) && students.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="overflow-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">Student</th>
                  {Array.isArray(subjects) && subjects.length > 0 ? (
                    subjects.map((sub) => (
                      <th key={sub._id} className="p-2 border text-center">
                        {sub.subjectName}
                        <div className="text-xs text-gray-500">
                          / {maxMarks[sub._id] || "-"}
                        </div>
                      </th>
                    ))
                  ) : (
                    <th className="p-2 border text-center text-gray-500">
                      {selected.sectionId ? "Loading subjects..." : "Select section for subjects"}
                    </th>
                  )}
                  <th className="p-2 border text-center">PDF</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => (
                  <tr key={stu._id}>
                    <td className="p-2 border">{stu.name || `${stu.firstName || ""} ${stu.lastName || ""}`.trim()}</td>
                    {Array.isArray(subjects) && subjects.length > 0 ? (
                      subjects.map((sub) => (
                        <td key={sub._id} className="p-2 border text-center">
                          <input
                            type="number"
                            className="w-16 border p-1 text-center"
                            value={marksData[stu._id]?.[sub._id] || ""}
                            onChange={(e) =>
                              handleMarkChange(stu._id, sub._id, e.target.value)
                            }
                          />
                        </td>
                      ))
                    ) : (
                      <td className="p-2 border text-center text-gray-500">-</td>
                    )}
                    <td className="p-2 border text-center">
                      <button
                        type="button"
                        onClick={() => handleDownload(stu._id)}
                        className="text-blue-600 hover:underline"
                      >
                        ⬇
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading || !Array.isArray(subjects) || subjects.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save All Marksheets"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BulkMarksheetEntry;
