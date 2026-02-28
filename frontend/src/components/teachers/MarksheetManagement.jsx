import { useEffect, useMemo, useState } from 'react'; // React hooks for side effects, memoization, and state management
import api from '../../api/marksheetsApi'; // API service for marksheet operations
import { toast } from 'react-hot-toast'; // For displaying notifications
import MarksheetList from './MarksheetList'; // Your list component
import MarksheetEntry from '../teachers/MarksheetEntry';

// --- UPDATED Default structure for a subject ---
const defaultSubject = { 
  subjectId: '', 
  subjectName: '', 
  Term1: { max: 0, obtained: 0 },
  Term2: { max: 0, obtained: 0 },
  Term3: { max: 0, obtained: 0 },
  totalMaxMarks: 0, 
  passingMarks: 0, 
};

// --- UPDATED Computes total marks obtained, total maximum marks, and percentage from a list of subjects ---
const computeTotals = (subjects) => {
  const totalObtained = subjects.reduce((s, x) => s + (Number(x.Term1?.obtained) || 0) + (Number(x.Term2?.obtained) || 0) + (Number(x.Term3?.obtained) || 0), 0);
  const totalMaxMarks = subjects.reduce((s, x) => s + (Number(x.Term1?.max) || 0) + (Number(x.Term2?.max) || 0) + (Number(x.Term3?.max) || 0), 0);
  
  const percentage = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 10000) / 100 : 0;
  return { totalObtained, totalMaxMarks, percentage };
};

// Determines the grade based on the given percentage
const gradeFromPercentage = (p) => {
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C+';
  if (p >= 40) return 'C';
  if (p >= 33) return 'D';
  return 'F';
};

// Determines the pass/fail status based on the given percentage
const statusFromPercentage = (p) => (p >= 33 ? 'PASS' : 'FAIL');

// Validates the marksheet form data before submission - UPDATED for components
const validateForm = (form, students) => {
  if (!form.session || !form.classId || !form.sectionId || !form.examId || !form.studentId) {
    return 'All top-level fields (session, class, section, exam, student) are required.';
  }
  if (!students.some(s => s._id === form.studentId)) {
    return 'Selected student is not valid.';
  }
  if (!Array.isArray(form.subjects) || form.subjects.length === 0) {
    return 'At least one subject is required. Check Max Marks Configuration.';
  }

  for (const [i, sub] of form.subjects.entries()) {
    if (!sub.subjectId) return `Subject is required for subject #${i + 1}`;
    
    const totalMax = (sub.Term1?.max || 0) + (sub.Term2?.max || 0) + (sub.Term3?.max || 0);
    if (totalMax === 0) {
        return `Max marks configuration missing or zero for ${sub.subjectName}. Please contact admin.`;
    }

    for (const term of ['Term1', 'Term2', 'Term3']) {
      if (sub[term]) {
        const obtained = sub[term].obtained;
        const max = sub[term].max;
        if (obtained == null || obtained === '' || Number(obtained) > max) {
          return `Marks for ${term} in ${sub.subjectName} is invalid or exceeds max marks (${max}).`;
        }
      }
    }
  }
  return null;
};

const MarksheetManagement = () => {
  const [form, setForm] = useState({
    session: '',
    classId: '',
    sectionId: '',
    examId: '',
    studentId: '',
    remarks: '',
    subjects: [] // Subjects will be populated from Max Marks Config
  });

  // States for dropdown data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);
  // const [subjects, setSubjects] = useState([]); // Subject dropdown list is no longer needed since we load configuration

  // States for marksheet list and UI control
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ classId: '', studentId: '', examId: '', session: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Memoized calculations for totals, grade, and status
  const totals = useMemo(() => computeTotals(form.subjects), [form.subjects]);
  const overallGrade = useMemo(() => gradeFromPercentage(totals.percentage), [totals]);
  const status = useMemo(() => statusFromPercentage(totals.percentage), [totals]);

  // Derived state for form submission button
  const isStudentValid = form.studentId && students.some(s => s._id === form.studentId);
  // Disabled if any major ID is missing, student is invalid, or no subjects were loaded from config
  const isSubmitDisabled = !form.classId || !form.examId || !form.session || !isStudentValid || loading || form.subjects.length === 0; 


  // 1. useEffect to load initial dropdown data (classes, students (all), exams, sessions) on component mount
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const userRole = localStorage.getItem('role');
        const studentParams = {};
        if (schoolId) studentParams.schoolId = schoolId;
        
        // This initial load might be broad, subsequent effects filter based on class/section.
        if (userRole === 'teacher') {
          const teacherId = localStorage.getItem('teacherId');
          if (teacherId) studentParams.teacherId = teacherId;
        }

        const [clsRes, stuRes, examRes, sesRes] = await Promise.all([
          api.getClasses(),
          api.getStudents(studentParams),
          api.getExams(),
          api.getSessions()
        ]);
        const allClasses = clsRes?.data || clsRes || [];
        // If teacher, restrict classes to those with at least one assigned student
        if (userRole === 'teacher') {
          const stuList = (stuRes?.data || stuRes || []).students || (stuRes?.data || stuRes || []);
          const allowedClassIds = new Set(
            (Array.isArray(stuList) ? stuList : []).map((s) =>
              (s.classId && (s.classId._id || s.classId)) || s.classAppliedFor
            ).filter(Boolean)
          );
          const filtered = allClasses.filter((c) => allowedClassIds.has(c._id));
          setClasses(filtered);
        } else {
          setClasses(allClasses);
        }
        // Save the broad student list initially; the filtering logic will refine this.
        // setStudents(stuRes?.data || stuRes || []); 
        setExams(examRes?.data || examRes || []);
        setSessions(sesRes?.data || sesRes || []);
      } catch (err) {
        console.error('Error loading initial data:', err);
        toast.error('Failed to load initial data (Classes/Exams/Sessions)');
      }
    };
    loadInitial();
  }, []);

  // 2. useEffect to load sections, filter students, and fetch Max Marks Config
  useEffect(() => {
    const loadData = async () => {
        const schoolId = localStorage.getItem('schoolId');
        const userRole = localStorage.getItem('role');

        // --- PHASE 1: Load Sections ---
        if (form.classId) {
            try {
                const res = await api.getSections(form.classId, schoolId);
                setSections(res?.data || res || []);
            } catch (err) {
                console.error('Error loading sections:', err);
                setSections([]);
            }
        } else {
            setSections([]);
        }

        // --- PHASE 2: Load Students & Config (Requires Class & Exam) ---
        // Students are loaded when classId is present. Config requires examId too.
        if (!form.classId) {
            setStudents([]);
            setForm(p => ({ ...p, subjects: [] })); 
            return;
        }

        setLoading(true);

        const studentParams = { schoolId, classId: form.classId };
        if (form.session) studentParams.academicYear = form.session;
        
        // **FIX: Student Filtering Logic**
        if (form.sectionId) studentParams.sectionId = form.sectionId; 

        if (userRole === 'teacher') {
            const teacherId = localStorage.getItem('teacherId');
            if (teacherId) studentParams.teacherId = teacherId; 
        }

        try {
            // 1. Fetch Students (Filtered)
            const stuRes = await api.getStudents(studentParams);
            const newStudents = stuRes?.data || stuRes || [];
            setStudents(newStudents);
            
            // Clear studentId if the selected student is no longer in the filtered list
            if (form.studentId && !newStudents.some(s => s._id === form.studentId)) {
                setForm(f => ({ ...f, studentId: '' }));
            }
            
            // 2. Fetch Max Marks Configuration (Only if Exam is selected)
            if (form.examId) {
                const configRes = await api.getMaxMarksConfig(form.examId, form.classId, form.sectionId);
                const configData = configRes.data;
    
                // Map configuration to form subjects
                const initialSubjects = configData.map(c => ({
                    subjectId: c.subjectId,
                    subjectName: c.subjectName,
                    Term1: { max: c.Term1?.max || 0, obtained: 0 },
                    Term2: { max: c.Term2?.max || 0, obtained: 0 },
                    Term3: { max: c.Term3?.max || 0, obtained: 0 },
                    passingMarks: c.passingMarks,
                }));
                
                // If we are creating a new marksheet, or editing an empty one, set the new config subjects.
                if (!editingId || form.subjects.length === 0) {
                    setForm(p => ({ ...p, subjects: initialSubjects }));
                }

                // If editing, the subjects array already has the component marks from the API call in editItem.
                // We trust the existing subjects array in the form state when editing.
            } else {
                // Clear subjects if exam is not selected
                 setForm(p => ({ ...p, subjects: [] }));
            }

        } catch (err) {
            console.error('Data loading error:', err);
            // Specifically handle 404 for config
            if (form.examId && err.response?.status === 404 && err.response?.data?.message.includes('Marks configuration')) {
                toast.error(err.response.data.message);
            }
            // Clear subjects on configuration error
            if(form.examId) setForm(p => ({ ...p, subjects: [] })); 
        } finally {
            setLoading(false);
        }
    };
    loadData();
}, [form.classId, form.sectionId, form.examId, form.session, editingId]); // Added editingId to re-trigger config load when starting edit

  // Function to load the list of marksheets based on current filters
  const loadList = async () => {
    setLoading(true);
    try {
      // Ensure session filter matches stored value (session is stored as Session _id)
      const params = { ...filters };
      if (params.session) {
        const s = sessions.find(
          (x) => x?._id === params.session || x?.yearRange === params.session
        );
        if (s) params.session = s._id;
      }
      const res = await api.listMarksheets(params);
      setItems(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load marksheet list.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect to load the marksheet list on component mount
  useEffect(() => {
    loadList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Handler for changing subject component marks
  const handleSubjectChange = (idx, term, val) => {
    setForm((prev) => {
      const next = { ...prev };
      next.subjects = next.subjects.map((s, i) => {
        if (i === idx) {
          return { ...s, [term]: { ...s[term], obtained: Number(val) } };
        }
        return s;
      });
      return next;
    });
  };

  // Resets the form to its initial state
  const resetForm = () => {
    setEditingId(null);
    setForm({ 
      session: '', 
      classId: '', 
      sectionId: '', 
      examId: '', 
      studentId: '', 
      remarks: '', 
      subjects: [] // Clear subjects, config will reload them
    });
    setSubmitAttempted(false);
  };

  // Handles form submission (create or update marksheet)
  const submit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errorMsg = validateForm(form, students);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    
    try {
      const payload = { 
        ...form,
        // Ensure the payload subjects include all necessary config fields
        subjects: form.subjects.map(s => ({
            subjectId: s.subjectId,
            subjectName: s.subjectName,
            Term1: { obtained: s.Term1.obtained },
            Term2: { obtained: s.Term2.obtained },
            Term3: { obtained: s.Term3.obtained },
        }))
      };

      if (editingId) {
        await api.updateMarksheet(editingId, payload);
      } else {
        await api.createMarksheet(payload);
      }
      toast.success(editingId ? 'Marksheet Updated Successfully' : 'Marksheet Created Successfully');
      resetForm();
      loadList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Marksheet Submission Failed.');
    }
  };

  // Populates the form with data of an item to be edited - UPDATED
  const editItem = (item) => {
    // Set editing ID first
    setEditingId(item._id); 
    
    // Construct the new form state from the item data
    const newForm = {
      session: item.session,
      classId: item.classId?._id || item.classId,
      sectionId: item.sectionId?._id || item.sectionId,
      examId: item.examId?._id || item.examId,
      studentId: item.studentId?._id || item.studentId,
      remarks: item.remarks || '',
      subjects: item.subjects.map((s) => ({ 
        subjectId: s.subjectId, 
        subjectName: s.subjectName, 
        Term1: { max: s.Term1?.max || 0, obtained: s.Term1?.obtained || 0 },
        Term2: { max: s.Term2?.max || 0, obtained: s.Term2?.obtained || 0 },
        Term3: { max: s.Term3?.max || 0, obtained: s.Term3?.obtained || 0 },
        passingMarks: s.passingMarks, 
      }))
    };
    
    // Set the new form state
    setForm(newForm);
  };

  // Deletes a marksheet
  const delItem = async (id) => {
    if (!confirm('Are you sure you want to delete this marksheet? This action cannot be undone.')) return;
    try {
      await api.deleteMarksheet(id);
      toast.success('Marksheet Deleted');
      loadList();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Downloads a marksheet as a PDF
  const downloadPdf = async (id) => {
    try {
      const blob = await api.downloadMarksheetPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marksheet-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('PDF download failed');
    }
  };

  const onStudentChange = (studentId) => {
    setForm((p) => ({ ...p, studentId }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-xl font-bold mb-4 text-blue-800">{editingId ? 'Edit Marksheet' : 'Create New Marksheet'}</h2>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Row 1: Session, Class, Section, Exam */}
          
          {/* Session Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session <span className="text-red-600">*</span></label>
            <select
              value={form.session}
              onChange={(e) => {
                const newSession = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  session: newSession,
                  studentId: newSession !== prev.session ? '' : prev.studentId
                }));
              }}
              className={`w-full border rounded px-3 py-2 ${submitAttempted && !form.session ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select session</option>
              {sessions.map((s) => (
                <option key={s._id} value={s.yearRange}>{s.yearRange}</option>
              ))}
            </select>
            {submitAttempted && !form.session && <div className="text-red-600 text-xs mt-1">Session is required.</div>}
          </div>
          
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-600">*</span></label>
            <select
              value={form.classId}
              onChange={(e) => {
                const newClassId = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  classId: newClassId,
                  sectionId: '', // Clear section when class changes
                  examId: '', // Clear exam to force config reload
                  studentId: '', // Clear student when class changes
                }));
              }}
              className={`w-full border rounded px-3 py-2 ${submitAttempted && !form.classId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.className}</option>
              ))}
            </select>
            {submitAttempted && !form.classId && <div className="text-red-600 text-xs mt-1">Class is required.</div>}
          </div>
          
          {/* Section Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-600">*</span></label>
            <select
              value={form.sectionId}
              onChange={(e) => {
                const newSectionId = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  sectionId: newSectionId,
                  studentId: newSectionId !== prev.sectionId ? '' : prev.studentId
                }));
              }}
              disabled={!form.classId || sections.length === 0}
              className={`w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 ${submitAttempted && !form.sectionId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.sectionName}</option>
              ))}
            </select>
            {submitAttempted && !form.sectionId && <div className="text-red-600 text-xs mt-1">Section is required.</div>}
          </div>
          
          {/* Exam Selection - CRITICAL for loading Max Marks Config */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam <span className="text-red-600">*</span></label>
            <select
              value={form.examId}
              onChange={(e) => setForm({ ...form, examId: e.target.value })}
              disabled={!form.classId}
              className={`w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 ${submitAttempted && !form.examId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select exam</option>
              {exams.map((x) => (
                <option key={x._id} value={x._id}>{x.title}</option>
              ))}
            </select>
            {submitAttempted && !form.examId && <div className="text-red-600 text-xs mt-1">Exam is required.</div>}
          </div>

          {/* Row 2: Student, Remarks */}

          {/* Student Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student <span className="text-red-600">*</span></label>
            <select
              value={form.studentId}
              onChange={(e) => onStudentChange(e.target.value)}
              disabled={!form.classId || students.length === 0}
              className={`w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 ${submitAttempted && !form.studentId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">{!form.classId ? 'Select class first' : (students.length === 0 ? 'No students available' : 'Select student')}</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} {s.rollNumber ? `(Roll ${s.rollNumber})` : ''}</option>
              ))}
            </select>
            {students.length === 0 && form.classId && <div className="text-red-600 text-xs mt-1">No students available for this class/section.</div>}
            {submitAttempted && !form.studentId && <div className="text-red-600 text-xs mt-1">Student is required.</div>}
          </div>
          
          {/* Remarks Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full border rounded px-3 py-2 border-gray-300" placeholder="Optional general remarks" />
          </div>

          {/* Subjects and Marks Section */}
          <div className="lg:col-span-4 mt-4">
            <h3 className="font-bold text-lg mb-3">Marks Entry</h3>
            
            {/* Subject Configuration Alert */}
            {(!form.classId || !form.examId) && (
                <div className="p-3 mb-4 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
                    ⚠️ Select Class and Exam to load Max Marks Configuration and Subjects.
                </div>
            )}
            {(form.classId && form.examId && form.subjects.length === 0 && !loading) && (
                <div className="p-3 mb-4 bg-red-100 text-red-800 rounded border border-red-300">
                    ❌ No Max Marks Configuration found for this Class/Exam. Subjects cannot be entered.
                </div>
            )}
            
            {/* Loading Indicator for Subjects */}
            {loading && form.classId && form.examId && (
                <div className="p-3 mb-4 bg-blue-100 text-blue-800 rounded border border-blue-300">
                    Loading configuration and students...
                </div>
            )}

            {/* Subject Table Header */}
            {form.subjects.length > 0 && (
                <div className="grid grid-cols-8 gap-2 text-sm font-semibold bg-gray-100 p-2 border-b border-t rounded-t">
                    <div className="col-span-2">Subject</div>
                    <div className="text-center">Term 1</div>
                    <div className="text-center">Term 2</div>
                    <div className="text-center">Term 3</div>
                    <div className="text-center">Total</div>
                </div>
            )}
            
            {/* Subject Table Rows */}
            <div className="space-y-2">
              {form.subjects.map((s, idx) => (
                <div key={s.subjectId || idx} className="grid grid-cols-8 gap-2 items-center p-2 border-b hover:bg-gray-50">
                  
                  {/* Subject Name (Read-Only) */}
                  <div className="col-span-2 text-sm font-medium text-gray-700">
                      {s.subjectName || 'N/A'} 
                      <span className="text-xs text-gray-500 block">Passing: {s.passingMarks}</span>
                  </div>
                  
                  {/* Term 1 Marks */}
                  <div className="text-center">
                    <input 
                      type="number" 
                      value={s.Term1.obtained} 
                      onChange={(e) => handleSubjectChange(idx, 'Term1', e.target.value)} 
                      placeholder={`/${s.Term1.max}`} 
                      max={s.Term1.max}
                      min="0"
                      className={`border rounded px-2 py-1 text-center w-full ${
                          (submitAttempted && (Number(s.Term1.obtained) > s.Term1.max || s.Term1.obtained === '')) ? 'border-red-500' : 'border-gray-300'
                      }`} 
                    />
                  </div>
                  
                  {/* Term 2 Marks */}
                  <div className="text-center">
                    <input 
                      type="number" 
                      value={s.Term2.obtained} 
                      onChange={(e) => handleSubjectChange(idx, 'Term2', e.target.value)} 
                      placeholder={`/${s.Term2.max}`} 
                      max={s.Term2.max}
                      min="0"
                      className={`border rounded px-2 py-1 text-center w-full ${
                          (submitAttempted && (Number(s.Term2.obtained) > s.Term2.max || s.Term2.obtained === '')) ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Term 3 Marks */}
                  <div className="text-center">
                    <input 
                      type="number" 
                      value={s.Term3.obtained} 
                      onChange={(e) => handleSubjectChange(idx, 'Term3', e.target.value)} 
                      placeholder={`/${s.Term3.max}`} 
                      max={s.Term3.max}
                      min="0"
                      className={`border rounded px-2 py-1 text-center w-full ${
                          (submitAttempted && (Number(s.Term3.obtained) > s.Term3.max || s.Term3.obtained === '')) ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  
                  {/* Total Obtained (Read-Only) */}
                  <div className="text-center font-bold text-green-700 text-sm">
                      {Number(s.Term1?.obtained || 0) + Number(s.Term2?.obtained || 0) + Number(s.Term3?.obtained || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals, Percentage, Grade, Status Display */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
            <div className="p-2"><span className="text-sm text-gray-600">Total Marks</span><div className="font-semibold text-lg text-blue-800">{totals.totalObtained}/{totals.totalMaxMarks}</div></div>
            <div className="p-2"><span className="text-sm text-gray-600">Percentage</span><div className="font-semibold text-lg text-blue-800">{totals.percentage}%</div></div>
            <div className="p-2"><span className="text-sm text-gray-600">Grade</span><div className="font-semibold text-lg text-blue-800">{overallGrade}</div></div>
            <div className="p-2"><span className="text-sm text-gray-600">Status</span><div className={`font-semibold text-lg ${status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{status}</div></div>
          </div>

          {/* Form Action Buttons */}
          <div className="lg:col-span-4 flex gap-3 mt-4">
            <button 
              type="submit" 
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 disabled:opacity-50" 
              disabled={isSubmitDisabled}
            >
              {editingId ? 'Update Marksheet' : 'Save Marksheet'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-150"
              >
                Cancel Edit
              </button>
            )}
            {!editingId && (
                <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition duration-150"
                >
                    Clear Form
                </button>
            )}
          </div>
        </form>
      </div>
      <MarksheetEntry
      form={form}
      setForm={setForm}
      students={students}
      classes={classes}
      sections={sections}
      exams={exams}
      sessions={sessions}
      submit={submit}
      resetForm={resetForm}
      editingId={editingId}
      totals={totals}
      overallGrade={overallGrade}
      status={status}
      handleSubjectChange={handleSubjectChange}
      loading={loading}
      submitAttempted={submitAttempted}
      isSubmitDisabled={isSubmitDisabled}
    />
      <MarksheetList
        items={items}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        classes={classes}
        students={students}
        exams={exams}
        loadList={loadList}
        editItem={editItem}
        delItem={delItem}
        downloadPdf={downloadPdf}
      />
    </div>
  );
};

export default MarksheetManagement;