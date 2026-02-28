import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import jwtDecode from "jwt-decode";
import { getClasses, getSectionsByClass, getStudentsByClassAndSection, getAssignedClasses } from "../../api/classesApi";
import { getSubjects } from "../../api/subjectApi";
import {
  uploadStudyMaterial,
  getTeacherMaterials,
  deleteMaterial,
} from "../../api/studyMaterialApi";

const StudyMaterialManagement = () => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [file, setFile] = useState(null);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("material");
  const [dueDate, setDueDate] = useState("");
  const [assignScope, setAssignScope] = useState("class"); // 'class' or 'student'
  const [students, setStudents] = useState([]);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [subjectSource, setSubjectSource] = useState("class"); // 'class' | 'assigned'

  const baseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || "", []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const decoded = jwtDecode(token);
        const teacherId = decoded.id;
        const teacherRes = await axiosInstance.get(`/api/teachers/single/${teacherId}`);
        const teacher = teacherRes.data?.teacher;
        setTeacherSubjects(Array.isArray(teacher?.subjects) ? teacher.subjects : []);
        // Prefer backend-scoped assigned classes for this teacher
        const assignedClasses = await getAssignedClasses();
        setClasses(Array.isArray(assignedClasses) ? assignedClasses : []);
        if (Array.isArray(assignedClasses) && assignedClasses.length === 1) {
          setClassId(assignedClasses[0]._id);
        }
        if (Array.isArray(teacher?.subjects) && teacher.subjects.length === 1) {
          setSubject(teacher.subjects[0]);
          setSubjectSource("assigned");
        }
      } catch (e) {
        try {
          // Fallback: load all classes to avoid empty UI if decode fails
          const assignedFallback = await getAssignedClasses();
          setClasses(assignedFallback || []);
        } catch (_) {}
      }
      try {
        const list = await getTeacherMaterials();
        setMaterials(list);
      } catch (e) {
        // silent
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      if (!classId) {
        setSections([]);
        setSectionId("");
        if (subjectSource === 'class') {
          setSubjects([]);
          setSubject("");
        }
        return;
      }
      try {
        const secs = await getSectionsByClass(classId);
        setSections(secs);
      } catch (e) {
        setSections([]);
      }
    };
    loadSections();
  }, [classId, subjectSource]);

  // Load students if targeting a single student
  useEffect(() => {
    const loadStudents = async () => {
      if (assignScope !== 'student' || !classId) {
        setStudents([]);
        setTargetStudentId("");
        return;
      }
      try {
        const list = await getStudentsByClassAndSection(classId, sectionId || undefined);
        setStudents(list);
        if (list.length === 0) setTargetStudentId("");
      } catch (e) {
        setStudents([]);
        setTargetStudentId("");
      }
    };
    loadStudents();
  }, [assignScope, classId, sectionId]);

  // Load subjects when class or section changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (subjectSource === 'assigned') {
        const list = (Array.isArray(teacherSubjects) ? teacherSubjects : []).map((name) => ({ _id: name, name }));
        setSubjects(list);
        if (list.every((s) => s.name !== subject)) {
          setSubject("");
        }
        return;
      }
      if (!classId) { setSubjects([]); return; }
      try {
        let list = await getSubjects({ classId, sectionId: sectionId || undefined });
        // Fallback to class-wide subjects if no section-specific subjects exist
        if ((sectionId && (!Array.isArray(list) || list.length === 0))) {
          list = await getSubjects({ classId });
        }
        setSubjects(list);
        // If current subject not in list, reset
        if (list.every(s => s.name !== subject)) {
          setSubject("");
        }
      } catch (e) {
        setSubjects([]);
      }
    };
    loadSubjects();
  }, [classId, sectionId, teacherSubjects, subjectSource]);

  const handleUpload = async () => {
    if (!title || !file || !classId) return;
    const subj = customSubject ? subject : (subject || (subjects[0]?.name || ""));
    if (!subj) return;
    setLoading(true);
    try {
      await uploadStudyMaterial({
        title,
        description,
        subject: subj,
        classId,
        sectionId: sectionId || undefined,
        type,
        dueDate: (type === 'homework' || type === 'task') ? dueDate : undefined,
        targetStudentId: assignScope === 'student' ? (targetStudentId || undefined) : undefined,
        file,
      });
      const list = await getTeacherMaterials();
      setMaterials(list);
      setTitle("");
      setSubject("");
      setDescription("");
      setClassId("");
      setSectionId("");
      setType("material");
      setDueDate("");
      setAssignScope("class");
      setTargetStudentId("");
      setFile(null);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (e) {
      // silent
    }
  };

  const absUrl = (p) => {
    if (!p) return "#";
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith("/")) return `${baseUrl}${p}`;
    return `${baseUrl}/${p}`;
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Study Material Management</h2>

      {/* Upload Section */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 rounded w-full"
        />
        {/* Subject source toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="subjectSource"
              value="class"
              checked={subjectSource === 'class'}
              onChange={() => setSubjectSource('class')}
            />
            <span className="text-sm">Class Subjects</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="subjectSource"
              value="assigned"
              checked={subjectSource === 'assigned'}
              onChange={() => setSubjectSource('assigned')}
            />
            <span className="text-sm">My Subjects</span>
          </label>
        </div>

        {subjects.length > 0 && !customSubject ? (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 rounded w-full"
            disabled={subjectSource === 'assigned' && Array.isArray(teacherSubjects) && teacherSubjects.length === 1}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id || s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="border p-2 rounded w-full"
          />
        )}
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border p-2 rounded w-full"
          disabled={Array.isArray(classes) && classes.length === 1}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.className}
            </option>
          ))}
        </select>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="border p-2 rounded w-full"
          disabled={!sections.length}
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s._id || s.name} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input id="customSubj" type="checkbox" checked={customSubject} onChange={(e) => setCustomSubject(e.target.checked)} />
          <label htmlFor="customSubj" className="text-sm text-gray-700">Custom Subject</label>
        </div>
        {/* Assign scope */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="assignScope"
              value="class"
              checked={assignScope === 'class'}
              onChange={() => setAssignScope('class')}
              disabled={!classId}
            />
            <span className="text-sm">All students in class/section</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="assignScope"
              value="student"
              checked={assignScope === 'student'}
              onChange={() => setAssignScope('student')}
              disabled={!classId}
            />
            <span className="text-sm">Single student</span>
          </label>
        </div>
        {assignScope === 'student' && (
          <select
            value={targetStudentId}
            onChange={(e) => setTargetStudentId(e.target.value)}
            className="border p-2 rounded w-full"
            disabled={!students.length}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()} ({s.classId?.className}{s.sectionId?.name ? ` - ${s.sectionId.name}` : ''})
              </option>
            ))}
          </select>
        )}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="material">Material</option>
          <option value="homework">Homework</option>
          <option value="task">Task</option>
        </select>
        {(type === 'homework' || type === 'task') && (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        )}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border p-2 rounded w-full md:col-span-2"
        />
        <input
          type="file"
          className="border p-2 rounded w-full md:col-span-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="md:col-span-2">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Material"}
          </button>
        </div>
      </div>

      {/* Study Material List */}
      <h3 className="text-lg font-semibold mb-2">Uploaded Materials</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Subject</th>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Due Date</th>
            <th className="border border-gray-300 p-2">Class</th>
            <th className="border border-gray-300 p-2">Section</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m._id}>
              <td className="border border-gray-300 p-2">{m.title}</td>
              <td className="border border-gray-300 p-2">{m.subject}</td>
              <td className="border border-gray-300 p-2">{m.type || 'material'}</td>
              <td className="border border-gray-300 p-2">{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '-'}</td>
              <td className="border border-gray-300 p-2">
                {classes.find((c) => String(c._id) === String(m.classId))?.className || m.class || "-"}
              </td>
              <td className="border border-gray-300 p-2">
                {m.sectionId ? (sections.find((s) => String(s._id) === String(m.sectionId))?.name || "-") : "-"}
              </td>
              <td className="border border-gray-300 p-2">
                {new Date(m.createdAt).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 p-2 space-x-2">
                <a
                  className="text-blue-600 hover:underline"
                  href={absUrl(m.file)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(m._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudyMaterialManagement;
