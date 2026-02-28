import React, { useState, useEffect } from 'react';
import { getSessions } from '../../api/sessionsApi';
import { getClasses, getSectionsByClass } from '../../api/classesApi';
import { getStudents } from '../../api/marksheetsApi';
import MarksheetForm from './MarksheetForm';

const MarksheetFilters = ({ onFiltersChange }) => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const schoolId = localStorage.getItem('schoolId');

  // Define terms
  const terms = [
    { value: 'Term1', label: 'Term 1' },
    { value: 'Term2', label: 'Term 2' },
    { value: 'Term3', label: 'Term 3' }
  ];

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
    fetchClasses();
  }, []);

  // Fetch sections when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  // Notify parent component when filters change
  useEffect(() => {
    if (selectedSession && selectedTerm && selectedClass && selectedSection && selectedStudent) {
      const filters = {
        session: selectedSession,
        term: selectedTerm,
        class: selectedClass,
        section: selectedSection,
        student: selectedStudent
      };
      onFiltersChange(filters);
    }
  }, [selectedSession, selectedTerm, selectedClass, selectedSection, selectedStudent, onFiltersChange]);

  // Check if all filters are selected (especially student)
  const allFiltersSelected = selectedSession && selectedTerm && selectedClass && selectedSection && selectedStudent;

  // Fetch students when both class and section are selected
  useEffect(() => {
    const fetchStudentsForSelection = async () => {
      if (!selectedClass || !selectedSection) {
        setStudents([]);
        return;
      }
      try {
        setLoadingStudents(true);
        const resp = await getStudents({ classId: selectedClass, sectionId: selectedSection, schoolId });
        const list = resp?.students || resp?.data || resp || [];
        setStudents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudentsForSelection();
  }, [selectedClass, selectedSection, schoolId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessions();
      // API returns { success: true, data: sessions }
      const sessionData = response?.data || response || [];
      setSessions(Array.isArray(sessionData) ? sessionData : []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (classId) => {
    try {
      setLoading(true);
      const data = await getSectionsByClass(classId);
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const handleTermChange = (e) => {
    setSelectedTerm(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedSection(''); // Reset section when class changes
    setStudents([]);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setSelectedStudent('');
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Session Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Session <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSession}
              onChange={handleSessionChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.yearRange}
                </option>
              ))}
            </select>
          </div>

          {/* Term Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Term <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTerm}
              onChange={handleTermChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select Term</option>
              {terms.map((term) => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          {/* Section Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSection}
              onChange={handleSectionChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || !selectedClass}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.sectionName || section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStudent}
              onChange={handleStudentChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingStudents || !selectedClass || !selectedSection}
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Loading filters...
          </div>
        )}

        {/* Students loading / empty states */}
        {selectedClass && selectedSection && loadingStudents && (
          <p className="mt-3 text-sm text-gray-500">Loading students...</p>
        )}
        {selectedClass && selectedSection && !loadingStudents && students.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No students found for the selected class and section.</p>
        )}
      </div>

      {/* Render MarksheetForm when all filters including student are selected */}
      {allFiltersSelected && (
        <div className="mt-6">
          <MarksheetForm 
            filters={{
              session: selectedSession,
              term: selectedTerm,
              class: selectedClass,
              section: selectedSection,
              student: selectedStudent
            }}
          />
        </div>
      )}
    </>
  );
};

export default MarksheetFilters;
