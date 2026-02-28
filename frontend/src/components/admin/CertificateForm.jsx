import React, { useState, useEffect } from "react";
import { getClasses, getSectionsByClass, getStudentsByClassAndSection } from "../../api/classesApi";
import toast from "react-hot-toast";
import { createCertificate, fetchHouses } from "../../api/certificateApi";
import { getSessions } from "../../api/sessionsApi";

export default function CertificateForm({ schoolId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [houses, setHouses] = useState([]);

  const [formData, setFormData] = useState({  
    classId: "",
    sectionId: "",
    studentId: "",
    colorHouse: "",
    sessionId: "",
    type: "Award",
    issueDate: new Date().toISOString().split("T")[0],
    eventName: "",
    awardTitle: "",
    eventCoordinator: "",
  });

  // 🔹 Fetch classes on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const classesData = await getClasses();
        setClasses(Array.isArray(classesData) ? classesData : classesData?.data || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) fetchInitialData();
  }, [schoolId]);

  // 🔹 Fetch sessions for Year dropdown
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await getSessions();
        const data = res?.success ? res.data : (Array.isArray(res) ? res : []);
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    loadSessions();
  }, [schoolId]);

  // 🔹 Fetch house options
  useEffect(() => {
    const loadHouses = async () => {
      try {
        const res = await fetchHouses();
        const list = res?.success ? res.data : (Array.isArray(res) ? res : []);
        setHouses(Array.isArray(list) && list.length ? list : ["Red", "Green", "Blue", "Yellow"]);
      } catch (error) {
        setHouses(["Red", "Green", "Blue", "Yellow"]);
      }
    };
    loadHouses();
  }, [schoolId]);

  // 🔹 Fetch sections when class changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!formData.classId) {
        setSections([]);
        setFormData((prev) => ({ ...prev, sectionId: "", studentId: "" }));
        return;
      }

      try {
        setLoading(true);
        const sectionsData = await getSectionsByClass(formData.classId);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
        setFormData((prev) => ({ ...prev, sectionId: "", studentId: "" }));
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast.error("Failed to load sections");
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [formData.classId]);

  // 🔹 Fetch students when class or section changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!formData.classId) {
        setStudents([]);
        setFormData((prev) => ({ ...prev, studentId: "" }));
        return;
      }

      try {
        setLoading(true);
        const studentsData = await getStudentsByClassAndSection(
          formData.classId,
          formData.sectionId || null
        );
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setFormData((prev) => ({ ...prev, studentId: "" }));
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [formData.classId, formData.sectionId]);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.classId || !formData.sectionId || !formData.studentId || !formData.sessionId) {
      toast.error("Please fill Class, Section, Student, and Session");
      return;
    }

    if (!formData.eventName || !formData.awardTitle || !formData.eventCoordinator || !formData.issueDate) {
      toast.error("Please fill Event Name, Award Title, Event Coordinator, and Date");
      return;
    }

    try {
      setLoading(true);
      const certificateData = {
        ...formData,
        schoolId: schoolId || localStorage.getItem("schoolId"),
        issueDate: formData.issueDate || new Date().toISOString(),
        sessionId: formData.sessionId,
      };

      await createCertificate(certificateData);
      toast.success("Certificate created successfully!");

      // Reset form
      setFormData({
        classId: "",
        sectionId: "",
        studentId: "",
        colorHouse: "",
        sessionId: "",
        type: "Award",
        issueDate: new Date().toISOString().split("T")[0],
        eventName: "",
        awardTitle: "",
        eventCoordinator: "",
      });
      setStudents([]);
      setSections([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating certificate:", error);
      toast.error(error.response?.data?.message || "Error creating certificate");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Static color houses
  const colorHouses = ["Red", "Green", "Yellow", "Blue"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Certificate</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section <span className="text-red-500">*</span>
          </label>
          <select
            name="sectionId"
            value={formData.sectionId}
            onChange={handleChange}
            disabled={!formData.classId || loading}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student <span className="text-red-500">*</span>
          </label>
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            disabled={!formData.sectionId || loading}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Student</option>
            {students.map((student) => {
              const displayName =
                student.name ||
                [student.firstName, student.lastName].filter(Boolean).join(" ") ||
                student.studentName ||
                "Unnamed";
              const label = student.rollNumber ? `${displayName} (${student.rollNumber})` : displayName;
              return (
                <option key={student._id} value={student._id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* House */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            House
          </label>
          <select
            name="colorHouse"
            value={formData.colorHouse}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select House</option>
            {houses.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Session */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session <span className="text-red-500">*</span></label>
          <select
            name="sessionId"
            value={formData.sessionId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.yearRange || s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Annual Sports Day"
          />
        </div>

        {/* Award Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Award Title</label>
          <input
            type="text"
            name="awardTitle"
            value={formData.awardTitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., First Rank in Class"
          />
        </div>

        {/* Event Coordinator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Coordinator</label>
          <input
            type="text"
            name="eventCoordinator"
            value={formData.eventCoordinator}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Mr. Sharma"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 md:col-span-2 pt-4">
          <button
            type="button"
            onClick={() =>
              setFormData({
                classId: "",
                sectionId: "",
                studentId: "",
                colorHouse: "",
                type: "Award",
                issueDate: new Date().toISOString().split("T")[0],
                year: "",
                eventName: "",
                awardTitle: "",
                eventCoordinator: "",
              })
            }
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Certificate"}
          </button>
        </div>
      </form>
    </div>
  );
}
