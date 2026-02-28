import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { getClasses, getSectionsByClass } from "../../api/classesApi";

const SetMaximumMarks = () => {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const API_URL = "/api";

  const examTypes = [
    { name: "Term1", color: "bg-green-400" },
    { name: "Term2", color: "bg-red-400" },
    { name: "Term3", color: "bg-blue-400" },
  ];

  const termStructure = () => ({
    i: 0,
    ii: 0,
    max: 0,
  });

  const defaultSubjects = () => [
    "HINDI",
    "ENGLISH",
    "MATHEMATICS",
    "SCIENCE",
    "SOCIAL STUDY",
    "MORAL SCIENCE",
    "G.K.",
    "COMPUTER",
    "DRAWING",
    "P.T.",
  ].map((sub) => ({
    subject: sub,
    Term1: termStructure(),
    Term2: termStructure(),
    Term3: termStructure(),
  }));

  // Fetch all classes on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getClasses();
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    })();
  }, []);

  // When a class is selected
  useEffect(() => {
    if (!selectedClassId) {
      setAvailableSections([]);
      setClassName("");
      setSection("");
      return;
    }
    const cls = classes.find((c) => c._id === selectedClassId);
    if (cls) {
      setClassName(cls.className || "");
    }
    (async () => {
      try {
        const secs = await getSectionsByClass(selectedClassId);
        setAvailableSections(Array.isArray(secs) ? secs : []);
        setSection("");
      } catch (err) {
        console.error("Failed to load sections", err);
        setAvailableSections([]);
      }
    })();
  }, [selectedClassId, classes]);

  // Fetch existing marks
  const fetchExistingMarks = async () => {
    if (!className || !section) return;
    try {
      const res = await axiosInstance.get(`${API_URL}/maxmarks`, { params: { className, section } });
      const payload = res?.data || {};
      const list = Array.isArray(payload?.marks) ? payload.marks : (Array.isArray(payload) ? payload : []);
      setSubjects(list.length ? list : defaultSubjects());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExistingMarks();
  }, [className, section]);

  const handleChange = (subIndex, examType, field, value) => {
    const updated = [...subjects];
    updated[subIndex][examType] = updated[subIndex][examType] || {};
    updated[subIndex][examType][field] = Number(value);
    setSubjects(updated);
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post(`${API_URL}/maxmarks/set`, { className, section, subjects });
      alert("✅ Marks saved successfully!");
      fetchExistingMarks();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save marks");
    }
  };

  const calculateTotal = (examType, field) =>
    subjects.reduce((sum, s) => sum + (s[examType]?.[field] || 0), 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white text-center py-3 font-semibold text-lg">
          Fill Maximum Marks ({className || "Class"} {section ? ` - ${section}` : ""})
        </div>

        {/* Class & Section */}
        <div className="flex gap-4 justify-center py-4">
          <select
            className="border rounded px-3 py-2"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">Select Section</option>
            {availableSections.map((sec) => (
              <option key={sec._id} value={sec.sectionName || sec.name}>
                {sec.sectionName || sec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {subjects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border py-2 px-4 bg-blue-100">Subject</th>
                  {examTypes.map((exam) => (
                    <th key={exam.name} colSpan={3} className={`border text-center ${exam.color}`}>
                      {exam.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="border bg-blue-50"></th>
                  {examTypes.map((exam) => (
                    <React.Fragment key={exam.name}>
                      <th className="border bg-gray-50">i</th>
                      <th className="border bg-gray-50">ii</th>
                      <th className="border bg-gray-50">Max</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, i) => (
                  <tr key={i} className="text-center">
                    <td className="border py-2 font-medium bg-blue-50">{sub.subject}</td>
                    {examTypes.map((exam) => (
                      <React.Fragment key={exam.name}>
                        {["i", "ii", "max"].map((field) => (
                          <td key={field} className="border">
                            <input
                              type="number"
                              value={sub[exam.name]?.[field] || ""}
                              onChange={(e) => handleChange(i, exam.name, field, e.target.value)}
                              className="w-16 border rounded text-center"
                            />
                          </td>
                        ))}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>

              {/* Totals */}
              <tfoot>
                <tr className="bg-gray-100 font-semibold text-center">
                  <td className="border py-2">Total</td>
                  {examTypes.map((exam) => (
                    <React.Fragment key={exam.name}>
                      <td className="border">{calculateTotal(exam.name, "i")}</td>
                      <td className="border">{calculateTotal(exam.name, "ii")}</td>
                      <td className="border">{calculateTotal(exam.name, "max")}</td>
                    </React.Fragment>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Submit */}
        <div className="p-4 text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetMaximumMarks;
