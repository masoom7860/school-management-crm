import React, { useState, useEffect, useMemo } from 'react';
import { getStudents, createMarksheet, getSubjects, getClasses, getSections } from '../../api/marksheetsApi';
import { getSessions } from '../../api/sessionsApi';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const MarksheetForm = ({ filters }) => {
  const [students, setStudents] = useState([]);
  const [maxMarksConfig, setMaxMarksConfig] = useState([]);
  const [marksheetData, setMarksheetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [legacyMarksData, setLegacyMarksData] = useState([]);
  const [classInfo, setClassInfo] = useState({ className: '', sectionName: '' });
  const [sessionInfo, setSessionInfo] = useState({ yearRange: '' });
  const schoolId = localStorage.getItem('schoolId');
  const navigate = useNavigate();
  
  const [openDays, setOpenDays] = useState({ Term1: 0, Term2: 0, Term3: 0 });
  const [attendance, setAttendance] = useState({ Term1: 0, Term2: 0, Term3: 0 });

  const terms = ['Term1', 'Term2', 'Term3'];
  const allParts = ['i', 'ii', 'iii', 'iv', 'v'];
  const activePartsByTerm = useMemo(() => ({
    Term1: allParts.filter(p => (Array.isArray(maxMarksConfig) ? maxMarksConfig : []).some(s => Number(s?.Term1?.[p] || 0) > 0)),
    Term2: allParts.filter(p => (Array.isArray(maxMarksConfig) ? maxMarksConfig : []).some(s => Number(s?.Term2?.[p] || 0) > 0)),
    Term3: allParts.filter(p => (Array.isArray(maxMarksConfig) ? maxMarksConfig : []).some(s => Number(s?.Term3?.[p] || 0) > 0)),
  }), [maxMarksConfig]);
  const termLabels = { Term1: 'Term 1', Term2: 'Term 2', Term3: 'Term 3' };
  const termColors = { Term1: 'bg-green-500', Term2: 'bg-red-500', Term3: 'bg-blue-500' };
  const fmt = (n) => {
    const num = Number(n || 0);
    if (!Number.isFinite(num)) return '0';
    const val = Math.round(num * 100) / 100;
    const s = val.toFixed(2);
    return s.endsWith('.00') ? s.slice(0, -3) : s;
  };
  const isValidId = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

  // Fetch in sequence to avoid duplicate class/section fetches
  useEffect(() => {
    if (filters?.class && filters?.section) {
      (async () => {
        await fetchClassAndSessionInfo();
        await fetchStudents();
        await fetchMaxMarksConfig();
      })();
    }
  }, [filters]);

  const fetchClassAndSessionInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [classesRes, sectionsRes, sessionsRes] = await Promise.all([
        axiosInstance.get('/api/classes'),
        axiosInstance.get('/api/classes/sections', { params: { classId: filters.class } }),
        axiosInstance.get('/api/sessions')
      ]);
      
      const classesList = classesRes.data?.success ? classesRes.data.data : (Array.isArray(classesRes.data) ? classesRes.data : []);
      const sectionsList = sectionsRes.data?.success ? sectionsRes.data.sections : (Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
      const sessionsList = sessionsRes.data?.success ? sessionsRes.data.data : (Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      
      const classDoc = (Array.isArray(classesList) ? classesList : []).find(c => c._id === filters.class);
      const sectionDoc = (Array.isArray(sectionsList) ? sectionsList : []).find(s => (s._id || s.id) === filters.section);
      const sessionDoc = (Array.isArray(sessionsList) ? sessionsList : []).find(s => s._id === filters.session);
      
      setClassInfo({
        className: classDoc?.className || '',
        sectionName: sectionDoc?.sectionName || sectionDoc?.name || ''
      });
      
      setSessionInfo({
        yearRange: sessionDoc?.yearRange || ''
      });
    } catch (error) {
      console.error('Error fetching class/session info:', error);
    }
  };

  // Ensure Max Marks Config exists for this exam/class/section in DB
  const ensureMaxMarksConfig = async (examId, classId, sectionId) => {
    if (!Array.isArray(maxMarksConfig) || maxMarksConfig.length === 0) {
      return false;
    }

    const normalizeTerm = (term = {}) => {
      const base = {
        i: Number(term.i || 0),
        ii: Number(term.ii || 0),
        iii: Number(term.iii || 0),
        iv: Number(term.iv || 0),
        v: Number(term.v || 0),
      };
      const computedMax = ['i', 'ii', 'iii', 'iv', 'v'].reduce((sum, key) => sum + Number(base[key] || 0), 0);
      return {
        ...base,
        max: computedMax || Number(term.max || 0)
      };
    };

    const subjectsPayload = maxMarksConfig
      .filter((subject) => subject?.subjectId)
      .map((subject) => ({
        subjectId: String(subject.subjectId),
        Term1: normalizeTerm(subject.Term1),
        Term2: normalizeTerm(subject.Term2),
        Term3: normalizeTerm(subject.Term3),
        passingMarks: Number(subject.passingMarks ?? 0)
      }));

    if (!subjectsPayload.length) {
      return false;
    }

    try {
      await axiosInstance.post('/api/marksheets/max-marks-config', {
        examId,
        classId,
        sectionId,
        subjects: subjectsPayload
      });
      return true;
    } catch (error) {
      console.error('Failed to sync Max Marks Config:', error);
      return false;
    }
  };

  const legacyNameMap = useMemo(() => {
    const map = new Map();
    legacyMarksData.forEach(m => {
      const key = String(m.subject || '').trim().toUpperCase();
      map.set(key, m.subject);
    });
    return map;
  }, [legacyMarksData]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents({
        classId: filters.class,
        sectionId: filters.section,
        schoolId: schoolId
      });
      
      let studentData = response?.students || response?.data || response || [];
      if (!Array.isArray(studentData)) studentData = [];

      if (filters?.student) {
        studentData = studentData.filter(s => s._id === filters.student);
      }
      setStudents(studentData);
      initializeMarksheetData(studentData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaxMarksConfig = async () => {
    try {
      setLoading(true);
      await tryLegacyMaxMarksFallback();
    } catch (error) {
      console.error('Error fetching max marks:', error);
      setMaxMarksConfig([]);
    } finally {
      setLoading(false);
    }
  };

  const tryLegacyMaxMarksFallback = async () => {
    try {
      // Prefer already-fetched class/section info to avoid duplicate requests
      let className = classInfo.className;
      let sectionName = classInfo.sectionName;

      if (!className || !sectionName) {
        const [classesRes, sectionsRes] = await Promise.all([
          axiosInstance.get('/api/classes'),
          axiosInstance.get('/api/classes/sections', { params: { classId: filters.class } })
        ]);

        const classesList = classesRes.data?.success ? classesRes.data.data : (Array.isArray(classesRes.data) ? classesRes.data : []);
        const sectionsList = sectionsRes.data?.success ? sectionsRes.data.sections : (Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
        const classDoc = (Array.isArray(classesList) ? classesList : []).find(c => c._id === filters.class);
        const sectionDoc = (Array.isArray(sectionsList) ? sectionsList : []).find(s => (s._id || s.id) === filters.section);
        className = classDoc?.className;
        sectionName = sectionDoc?.sectionName || sectionDoc?.name;
      }
      
      if (!className || !sectionName) {
        setMaxMarksConfig([]);
        return;
      }

      const legacyRes = await axiosInstance.get('/api/maxmarks', {
        params: { className, section: sectionName }
      });
      
      const legacy = legacyRes.data || {};
      const legacyMarks = Array.isArray(legacy.marks) ? legacy.marks : [];
      const legacyOpenDays = legacy.openDays || {};

      if (legacyMarks.length === 0) {
        setMaxMarksConfig([]);
        setLegacyMarksData([]);
        return;
      }
      
      setLegacyMarksData(legacyMarks);
      setOpenDays({
        Term1: legacyOpenDays.term1OpenDays || 0,
        Term2: legacyOpenDays.term2OpenDays || 0,
        Term3: legacyOpenDays.term3OpenDays || 0,
      });

      const subjectsRes = await getSubjects(filters.class, filters.section, schoolId);
      const subjectsList = Array.isArray(subjectsRes?.data) ? subjectsRes.data : (Array.isArray(subjectsRes) ? subjectsRes : []);

      const nameToSubject = new Map(
        subjectsList.map(s => [String(s.subjectName || s.name || '').trim().toUpperCase(), s])
      );

      const mapped = legacyMarks.map(m => {
        const key = String(m.subject || '').trim().toUpperCase();
        const subj = nameToSubject.get(key) || {};
        return {
          subjectId: subj._id || subj.id,
          subjectName: subj.subjectName || subj.name || m.subject || 'Unknown',
          Term1: { i: m.Term1?.i || 0, ii: m.Term1?.ii || 0, iii: m.Term1?.iii || 0, iv: m.Term1?.iv || 0, v: m.Term1?.v || 0, max: m.Term1?.max || 0 },
          Term2: { i: m.Term2?.i || 0, ii: m.Term2?.ii || 0, iii: m.Term2?.iii || 0, iv: m.Term2?.iv || 0, v: m.Term2?.v || 0, max: m.Term2?.max || 0 },
          Term3: { i: m.Term3?.i || 0, ii: m.Term3?.ii || 0, iii: m.Term3?.iii || 0, iv: m.Term3?.iv || 0, v: m.Term3?.v || 0, max: m.Term3?.max || 0 },
          passingMarks: 0
        };
      }).filter(m => m.subjectId);

      if (mapped.length === 0) {
        setMaxMarksConfig([]);
        return;
      }

      setMaxMarksConfig(mapped);
    } catch (e) {
      console.error('Legacy maxmarks fallback failed:', e);
      setMaxMarksConfig([]);
    }
  };

  const prefillExistingMarks = async () => {
    try {
      if (!students.length || !maxMarksConfig.length || !classInfo.className || !classInfo.sectionName) return;
      const selected = students[0];
      const res = await axiosInstance.get('/api/studentmarks/entrydata', {
        params: {
          studentId: selected._id,
          className: classInfo.className,
          section: classInfo.sectionName,
        }
      });
      const data = res.data || {};
      if (data.openDays) {
        setOpenDays({
          Term1: Number(data.openDays.term1OpenDays || 0),
          Term2: Number(data.openDays.term2OpenDays || 0),
          Term3: Number(data.openDays.term3OpenDays || 0),
        });
      }
      const subjectsArr = Array.isArray(data.subjects) ? data.subjects : [];
      const obtainedByName = new Map();
      subjectsArr.forEach((s) => {
        if (s && s.subject && s.obtainedMarks) {
          obtainedByName.set(String(s.subject).trim().toUpperCase(), s.obtainedMarks);
        }
      });

      setMarksheetData((prev) => {
        if (!prev.length) return prev;
        const next = [...prev];
        const idx = 0;
        const item = { ...next[idx] };
        const marks = { ...item.marks };

        maxMarksConfig.forEach((sub) => {
          const key = String(sub.subjectName || '').trim().toUpperCase();
          const ob = obtainedByName.get(key);
          if (ob) {
            terms.forEach((term) => {
              const termVal = ob[term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0 };
              if (!marks[sub.subjectId]) marks[sub.subjectId] = {};
              marks[sub.subjectId][term] = {
                ...marks[sub.subjectId][term],
                i: Number(termVal.i || 0),
                ii: Number(termVal.ii || 0),
                iii: Number(termVal.iii || 0),
                iv: Number(termVal.iv || 0),
                v: Number(termVal.v || 0),
                obtained: Number(termVal.i || 0) + Number(termVal.ii || 0) + Number(termVal.iii || 0) + Number(termVal.iv || 0) + Number(termVal.v || 0),
              };
            });
          }
        });

        item.marks = marks;
        next[0] = item;
        return next;
      });
      // Prefill per-term attendance from API response if present
      if (data.attendance) {
        if (data.hasPerTermAttendance) {
          setAttendance({
            Term1: Number(data.attendance.Term1 || 0),
            Term2: Number(data.attendance.Term2 || 0),
            Term3: Number(data.attendance.Term3 || 0),
          });
        } else {
          // Legacy fallback: only set the selected term to avoid copying the same value into other terms
          setAttendance(prev => ({
            ...prev,
            [filters.term]: Number((data.attendance && data.attendance[filters.term]) || 0)
          }));
        }
      }
    } catch (e) {
      // ignore prefill errors
    }
  };

  useEffect(() => {
    if (students.length && maxMarksConfig.length && classInfo.className && classInfo.sectionName) {
      prefillExistingMarks();
    }
  }, [students, maxMarksConfig, classInfo.className, classInfo.sectionName, filters.term]);

  const initializeMarksheetData = (studentList) => {
    const initialData = studentList.map(student => ({
      studentId: student._id,
      studentName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      studentRollNo: student.rollNumber || student.rollNo || '',
      marks: {} // { subjectId: { Term1: { i: 0, ii: 0, obtained: 0 }, ... } }
    }));
    setMarksheetData(initialData);
  };

  const handleMarksChange = (studentIndex, subjectId, term, field, value) => {
    const updatedData = [...marksheetData];
    if (!updatedData[studentIndex].marks[subjectId]) {
      updatedData[studentIndex].marks[subjectId] = {};
    }
    if (!updatedData[studentIndex].marks[subjectId][term]) {
      updatedData[studentIndex].marks[subjectId][term] = { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
    }
    
    const numValue = parseFloat(value) || 0;
    const subject = maxMarksConfig.find(s => s.subjectId === subjectId);
    const maxForTerm = subject?.[term]?.max || 0;
    const maxI = subject?.[term]?.i || 0;
    const maxIi = subject?.[term]?.ii || 0;
    const maxIii = subject?.[term]?.iii || 0;
    const maxIv = subject?.[term]?.iv || 0;
    const maxV = subject?.[term]?.v || 0;
    
    // Validate and update the field
    if (field === 'i') {
      // Validate i marks
      if (numValue > maxI) {
        alert(`Marks for 'i' cannot exceed ${maxI} for ${subject?.subjectName} - ${termLabels[term]}`);
        return;
      }
      updatedData[studentIndex].marks[subjectId][term].i = numValue;
    } else if (field === 'ii') {
      // Validate ii marks
      if (numValue > maxIi) {
        alert(`Marks for 'ii' cannot exceed ${maxIi} for ${subject?.subjectName} - ${termLabels[term]}`);
        return;
      }
      updatedData[studentIndex].marks[subjectId][term].ii = numValue;
    } else if (field === 'iii') {
      if (numValue > maxIii) {
        alert(`Marks for 'iii' cannot exceed ${maxIii} for ${subject?.subjectName} - ${termLabels[term]}`);
        return;
      }
      updatedData[studentIndex].marks[subjectId][term].iii = numValue;
    } else if (field === 'iv') {
      if (numValue > maxIv) {
        alert(`Marks for 'iv' cannot exceed ${maxIv} for ${subject?.subjectName} - ${termLabels[term]}`);
        return;
      }
      updatedData[studentIndex].marks[subjectId][term].iv = numValue;
    } else if (field === 'v') {
      if (numValue > maxV) {
        alert(`Marks for 'v' cannot exceed ${maxV} for ${subject?.subjectName} - ${termLabels[term]}`);
        return;
      }
      updatedData[studentIndex].marks[subjectId][term].v = numValue;
    }
    
    // Calculate total obtained marks
    const iMarks = updatedData[studentIndex].marks[subjectId][term].i || 0;
    const iiMarks = updatedData[studentIndex].marks[subjectId][term].ii || 0;
    const iiiMarks = updatedData[studentIndex].marks[subjectId][term].iii || 0;
    const ivMarks = updatedData[studentIndex].marks[subjectId][term].iv || 0;
    const vMarks = updatedData[studentIndex].marks[subjectId][term].v || 0;
    const totalObtained = iMarks + iiMarks + iiiMarks + ivMarks + vMarks;
    
    // Validate total doesn't exceed max
    if (totalObtained > maxForTerm) {
      alert(`Total marks cannot exceed ${maxForTerm} for ${subject?.subjectName} - ${termLabels[term]}`);
      // Reset the field that caused overflow
      if (field === 'i') {
        updatedData[studentIndex].marks[subjectId][term].i = Math.max(0, maxForTerm - ((updatedData[studentIndex].marks[subjectId][term].ii || 0) + (updatedData[studentIndex].marks[subjectId][term].iii || 0)));
      } else if (field === 'ii') {
        updatedData[studentIndex].marks[subjectId][term].ii = Math.max(0, maxForTerm - ((updatedData[studentIndex].marks[subjectId][term].i || 0) + (updatedData[studentIndex].marks[subjectId][term].iii || 0)));
      } else if (field === 'iii') {
        updatedData[studentIndex].marks[subjectId][term].iii = Math.max(0, maxForTerm - ((updatedData[studentIndex].marks[subjectId][term].i || 0) + (updatedData[studentIndex].marks[subjectId][term].ii || 0) + (updatedData[studentIndex].marks[subjectId][term].iv || 0) + (updatedData[studentIndex].marks[subjectId][term].v || 0)));
      } else if (field === 'iv') {
        updatedData[studentIndex].marks[subjectId][term].iv = Math.max(0, maxForTerm - ((updatedData[studentIndex].marks[subjectId][term].i || 0) + (updatedData[studentIndex].marks[subjectId][term].ii || 0) + (updatedData[studentIndex].marks[subjectId][term].iii || 0) + (updatedData[studentIndex].marks[subjectId][term].v || 0)));
      } else if (field === 'v') {
        updatedData[studentIndex].marks[subjectId][term].v = Math.max(0, maxForTerm - ((updatedData[studentIndex].marks[subjectId][term].i || 0) + (updatedData[studentIndex].marks[subjectId][term].ii || 0) + (updatedData[studentIndex].marks[subjectId][term].iii || 0) + (updatedData[studentIndex].marks[subjectId][term].iv || 0)));
      }
      // Recalculate
      updatedData[studentIndex].marks[subjectId][term].obtained = 
        (updatedData[studentIndex].marks[subjectId][term].i || 0) + (updatedData[studentIndex].marks[subjectId][term].ii || 0) + (updatedData[studentIndex].marks[subjectId][term].iii || 0) + (updatedData[studentIndex].marks[subjectId][term].iv || 0) + (updatedData[studentIndex].marks[subjectId][term].v || 0);
    } else {
      updatedData[studentIndex].marks[subjectId][term].obtained = totalObtained;
    }
    
    setMarksheetData(updatedData);
  };

  const createMaxMarksConfigFromLegacy = async (examId, classId, sectionId, legacyMarks) => {
    try {
      const token = localStorage.getItem('token');
      
      const subjects = legacyMarks.map(m => {
        const subjectConfig = maxMarksConfig.find(config => 
          config.subjectName?.toUpperCase() === m.subject?.toUpperCase()
        );
        
        if (!subjectConfig) return null;
        
        return {
          subjectId: subjectConfig.subjectId,
          Term1: subjectConfig.Term1,
          Term2: subjectConfig.Term2,
          Term3: subjectConfig.Term3,
          passingMarks: subjectConfig.passingMarks || 0
        };
      }).filter(s => s !== null);
      
      try {
        await axiosInstance.post('/api/marksheets/max-marks-config', {
          examId,
          classId,
          sectionId,
          subjects
        });
      } catch (err) {
        console.warn('Could not create MaxMarksConfig (may already exist):', err);
      }
    } catch (error) {
      console.warn('Error creating MaxMarksConfig from legacy:', error);
    }
  };

  const getOrCreateExamId = async (term, className, sectionName) => {
    try {
      const token = localStorage.getItem('token');
      const academicYear = sessionInfo.yearRange || '';
      const examType = 'General';

      const examsRes = await axiosInstance.get('/api/exams', {
        params: {
          class: className,
          term: term,
          academicYear,
          examType
        }
      });
      
      const exams = examsRes.data?.data || examsRes.data || [];
      const existingExam = Array.isArray(exams) ? exams.find(e => {
        return e.term === term && 
               e.class === className &&
               (e.academicYear === academicYear) &&
               ((e.examType || 'General') === examType);
      }) : null;
      
      if (existingExam) {
        return existingExam._id || existingExam.id;
      }
      
      const createdBy = localStorage.getItem('userId');
      const newExamRes = await axiosInstance.post('/api/exams/create', {
        title: `${term} - ${className} ${sectionName}`,
        description: `Marksheet exam for ${term}`,
        class: className,
        ...(isValidId(filters.section) ? { sectionId: filters.section } : {}),
        term: term,
        schoolId: schoolId,
        academicYear,
        examType,
        createdBy: createdBy
      });
      
      return newExamRes.data?.exam?._id || newExamRes.data?._id;
    } catch (error) {
      console.error('Error getting/creating exam:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Validate on client before making any requests
      if (!validateBeforeSubmit()) {
        setSubmitting(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const [classesRes, sectionsRes] = await Promise.all([
        axiosInstance.get('/api/classes'),
        axiosInstance.get('/api/classes/sections', { params: { classId: filters.class } })
      ]);
      
      const classesList = classesRes.data?.success ? classesRes.data.data : (Array.isArray(classesRes.data) ? classesRes.data : []);
      const sectionsList = sectionsRes.data?.success ? sectionsRes.data.sections : (Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
      const classDoc = (Array.isArray(classesList) ? classesList : []).find(c => c._id === filters.class);
      const sectionDoc = (Array.isArray(sectionsList) ? sectionsList : []).find(s => (s._id || s.id) === filters.section);
      const className = classDoc?.className || '';
      const sectionName = sectionDoc?.sectionName || sectionDoc?.name || '';
      
      const examId = await getOrCreateExamId(filters.term, className, sectionName);

      // Ensure DB has MaxMarksConfig for this exam/class/section
      const hasConfig = await ensureMaxMarksConfig(examId, filters.class, filters.section);
      if (!hasConfig) {
        throw new Error('Max Marks Configuration not found. Please set Maximum Marks for this class/section/exam first.');
      }

      const submissions = marksheetData.map(student => ({
        session: filters.session,
        classId: filters.class,
        sectionId: filters.section,
        examId: examId,
        studentId: student.studentId,
        remarks: '',
        subjects: maxMarksConfig.map(subject => {
          const term1Marks = student.marks[subject.subjectId]?.Term1 || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
          const term2Marks = student.marks[subject.subjectId]?.Term2 || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
          const term3Marks = student.marks[subject.subjectId]?.Term3 || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
          const sumParts = (termKeyMarks, term) => {
            const parts = activePartsByTerm[term] || ['i','ii','iii','iv','v'];
            return Number(termKeyMarks.obtained ?? parts.reduce((s,p) => s + Number(termKeyMarks[p] || 0), 0));
          };
          return {
            subjectId: String(subject.subjectId),
            subjectName: subject.subjectName,
            Term1: { obtained: sumParts(term1Marks, 'Term1') },
            Term2: { obtained: sumParts(term2Marks, 'Term2') },
            Term3: { obtained: sumParts(term3Marks, 'Term3') },
          };
        })
      }));

      for (const submission of submissions) {
        await axiosInstance.post('/api/marksheets', submission);
      }

      const termKey = filters.term;
      const daysPresentVal = Number(attendance[termKey] || 0);

      for (const student of marksheetData) {
        const marks = maxMarksConfig.map(subject => {
          const subjKey = String(subject.subjectName || '').trim().toUpperCase();
          const subjectNameDb = legacyNameMap.get(subjKey) || subjKey;
          const tm = student.marks[subject.subjectId]?.[termKey] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0 };
          return {
            subject: subjectNameDb,
            term: termKey,
            i: Number(tm.i || 0),
            ii: Number(tm.ii || 0),
            iii: Number(tm.iii || 0),
            iv: Number(tm.iv || 0),
            v: Number(tm.v || 0),
            daysPresent: daysPresentVal,
          };
        });
        await axiosInstance.post('/api/studentmarks/set', {
          studentId: student.studentId,
          className,
          section: sectionName,
          marks,
        });
      }

      // Refresh UI with saved marks
      await prefillExistingMarks();

      alert('✅ Marksheets submitted successfully!');
    } catch (error) {
      console.error('Error submitting marksheets:', error?.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit marksheets';
      alert(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!filters?.class || !filters?.section) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-center text-gray-500">
          Please select all filters to view the marksheet form
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-center text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (maxMarksConfig.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-center text-red-500 font-semibold">
          ⚠️ Max Marks Configuration not found. Please set maximum marks first.
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-center text-gray-500">
          No students found for the selected class and section
        </p>
      </div>
    );
  }

  const selectedStudent = students[0];
  const studentName = selectedStudent?.name || `${selectedStudent?.firstName || ''} ${selectedStudent?.lastName || ''}`.trim();
  const studentRollNo = selectedStudent?.rollNumber || selectedStudent?.rollNo || '';

  // Validation function before submit
  const validateBeforeSubmit = () => {
    const errors = [];
    // Validate attendance against open days for the selected term
    const termKey = filters.term;
    const termOpenDays = Number(openDays[termKey] || 0);
    const termAttendance = Number(attendance[termKey] || 0);
    if (termAttendance > termOpenDays) {
      errors.push(`Total Attendance for ${termLabels[termKey]} (${termAttendance}) cannot exceed Open Days (${termOpenDays}).`);
    }
    marksheetData.forEach((student, studentIndex) => {
      maxMarksConfig.forEach((subject) => {
        terms.forEach((term) => {
          const parts = activePartsByTerm[term] || [];
          const marks = student.marks[subject.subjectId]?.[term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
          const maxMarks = subject[term]?.max || 0;
          parts.forEach(p => {
            const partMax = Number(subject[term]?.[p] || 0);
            const partVal = Number(marks[p] || 0);
            if (partVal > partMax) {
              errors.push(`${subject.subjectName} - ${termLabels[term]}: '${p}' marks (${partVal}) cannot exceed ${partMax}`);
            }
          });
          const totalObtained = Number(marks.obtained ?? parts.reduce((s,p) => s + Number(marks[p] || 0), 0));
          if (totalObtained > maxMarks) {
            errors.push(`${subject.subjectName} - ${termLabels[term]}: Total marks (${totalObtained}) cannot exceed ${maxMarks}`);
          }
        });
      });
    });
    
    if (errors.length > 0) {
      alert('Validation Errors:\n\n' + errors.join('\n'));
      return false;
    }
    return true;
  };

  return (
    <div className="w-full max-w-full mx-auto">
      {/* Header Section with Student Info - Full Width */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="px-3 py-1.5 bg-blue-500 rounded-lg text-xs md:text-sm font-bold shadow-md">
                {filters.term?.replace('Term', 'TERM ') || 'TERM'}
              </span>
              <span className="px-3 py-1.5 bg-green-500 rounded-lg text-xs md:text-sm font-bold shadow-md">
                {sessionInfo.yearRange || filters.session}
              </span>
              <span className="px-3 py-1.5 bg-purple-500 rounded-lg text-xs md:text-sm font-bold shadow-md">
                {classInfo.className} - {classInfo.sectionName}
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 break-words">
                {studentName}
              </h1>
              {studentRollNo && (
                <p className="text-blue-100 text-sm md:text-base lg:text-lg">
                  Roll No: {studentRollNo} | {classInfo.className} - {classInfo.sectionName} | {sessionInfo.yearRange}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Container */}
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-2 md:px-4 lg:px-6 py-4 md:py-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
            <div className="p-3 md:p-4 lg:p-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Term Open Days & Attendance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {terms.map((term) => {
                  const selected = filters.term === term;
                  return (
                    <div key={term} className={`border rounded-lg p-3 md:p-4 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{termLabels[term]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{selected ? 'Selected' : ' '}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Open Days</label>
                          <input
                            type="number"
                            readOnly
                            value={openDays[term] || 0}
                            className="w-full border rounded px-2 py-2 text-center bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Total Attendance</label>
                          <input
                            type="number"
                            min="0"
                            max={openDays[term] || 0}
                            value={attendance[term] || ''}
                            onChange={(e) => setAttendance(prev => ({ ...prev, [term]: Number(e.target.value || 0) }))}
                            className={`w-full border rounded px-2 py-2 text-center focus:ring-2 focus:ring-blue-300 ${!selected ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                            disabled={!selected}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Fill Student Marks Table - Full Width Responsive */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 md:p-4 lg:p-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded"></span>
                Fill Student Marks
              </h2>
              
              {/* Responsive Table Container */}
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full text-xs sm:text-sm md:text-base border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                        <th rowSpan={2} className="border-2 border-gray-600 px-2 sm:px-3 md:px-4 py-2 md:py-3 font-bold text-center sticky left-0 z-30 bg-gray-900 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
                          S.No
                        </th>
                        <th rowSpan={2} className="border-2 border-gray-600 px-2 sm:px-3 md:px-4 py-2 md:py-3 font-bold text-left sticky left-10 sm:left-14 md:left-20 z-30 bg-gray-900 min-w-[80px] sm:min-w-[100px] md:min-w-[140px] lg:min-w-[180px]">
                          Subject
                        </th>
                        {terms.map((term) => {
                          const parts = activePartsByTerm[term] || [];
                          const span = (parts.length * 2) + 2; // max columns + total + obtained columns + total
                          return (
                            <th key={term} colSpan={span} className={`border-2 border-gray-600 text-center text-white px-1 sm:px-2 py-2 md:py-3 ${termColors[term]}`}>
                              <span className="text-xs sm:text-sm md:text-base font-bold">{termLabels[term]}</span>
                            </th>
                          );
                        })}
                        <th rowSpan={2} className="border-2 border-gray-600 px-2 sm:px-3 md:px-4 py-2 md:py-3 font-bold text-center bg-yellow-600 text-white">
                          Total
                        </th>
                      </tr>
                      <tr className="bg-gray-700 text-white">
                        {terms.map((term) => {
                          const parts = activePartsByTerm[term] || [];
                          return (
                            <React.Fragment key={term}>
                              {parts.map((p) => (
                                <th key={`${term}-${p}-max`} className="border-2 border-gray-600 bg-gray-600 px-1 sm:px-2 py-1 md:py-2 text-xs font-bold">{p} (Max)</th>
                              ))}
                              <th className="border-2 border-gray-600 bg-gray-600 px-1 sm:px-2 py-1 md:py-2 text-xs font-bold">Total Max</th>
                              {parts.map((p) => (
                                <th key={`${term}-${p}-obt`} className="border-2 border-gray-600 bg-gray-600 px-1 sm:px-2 py-1 md:py-2 text-xs font-bold">{p} Obtained</th>
                              ))}
                              <th className="border-2 border-gray-600 bg-gray-600 px-1 sm:px-2 py-1 md:py-2 text-xs font-bold">Total Obtained</th>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {maxMarksConfig.map((subject, index) => {
                        const studentIndex = 0;
                        return (
                          <tr key={subject.subjectId} className="hover:bg-blue-50 transition-colors even:bg-gray-50">
                            <td className="border-2 border-gray-300 px-2 sm:px-3 md:px-4 py-2 md:py-3 font-bold text-center bg-blue-100 sticky left-0 z-20">
                              {index + 1}
                            </td>
                            <td className="border-2 border-gray-300 px-2 sm:px-3 md:px-4 py-2 md:py-3 font-bold text-left bg-blue-100 sticky left-10 sm:left-14 md:left-20 z-20 break-words">
                              {subject.subjectName}
                            </td>
                            {terms.map((term) => {
                              const parts = activePartsByTerm[term] || [];
                              const maxMarks = subject[term]?.max || 0;
                              const termBgColor = term === 'Term1' ? 'bg-green-50' : term === 'Term2' ? 'bg-red-50' : 'bg-blue-50';
                              const marks = marksheetData[studentIndex]?.marks[subject.subjectId]?.[term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
                              const obtainedByPart = parts.map(p => Number(marks[p] || 0));
                              const exceededAny = parts.some(p => Number(marks[p] || 0) > Number(subject[term]?.[p] || 0));
                              const totalObtained = marks.obtained || obtainedByPart.reduce((a,b) => a+b, 0);
                              const isInvalid = totalObtained > maxMarks || exceededAny;
                              return (
                                <React.Fragment key={term}>
                                  {parts.map((p) => (
                                    <td key={`${term}-${p}-max`} className={`border-2 border-gray-300 px-1 sm:px-2 py-2 text-center font-semibold ${termBgColor}`}>
                                      <span className="text-xs sm:text-sm">{subject[term]?.[p] || 0}</span>
                                    </td>
                                  ))}
                                  <td className={`border-2 border-gray-300 px-1 sm:px-2 py-2 text-center font-bold ${termBgColor}`}>
                                    <span className="text-xs sm:text-sm md:text-base">{maxMarks}</span>
                                  </td>
                                  {parts.map((p) => (
                                    <td key={`${term}-${p}-obt`} className={`border-2 border-gray-300 px-1 sm:px-2 py-1 md:py-2 ${termBgColor} ${isInvalid && Number(marks[p] || 0) > Number(subject[term]?.[p] || 0) ? 'bg-red-200' : ''}`}>
                                      <input
                                        type="number"
                                        min="0"
                                        max={Number(subject[term]?.[p] || 0)}
                                        step="0.01"
                                        value={Number(marks[p] || 0) || ''}
                                        onChange={(e) => handleMarksChange(studentIndex, subject.subjectId, term, p, e.target.value)}
                                        className={`w-full border-2 rounded px-1 sm:px-2 py-1 text-center text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          isInvalid && Number(marks[p] || 0) > Number(subject[term]?.[p] || 0) ? 'border-red-500 bg-red-50' : 'border-gray-400'
                                        } ${term !== filters.term ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                        disabled={term !== filters.term}
                                        placeholder="0"
                                      />
                                    </td>
                                  ))}
                                  <td className={`border-2 border-gray-300 px-1 sm:px-2 py-2 text-center font-bold ${termBgColor} ${isInvalid ? 'bg-red-100' : ''}`}>
                                    <span className={`text-xs sm:text-sm md:text-base ${isInvalid ? 'text-red-600' : 'text-gray-800'}`}>
                                      {fmt(totalObtained)}
                                    </span>
                                  </td>
                                </React.Fragment>
                              );
                            })}
                            {/* Total Column - Sum of all terms */}
                            <td className="border-2 border-gray-300 px-2 sm:px-3 py-2 md:py-3 text-center font-bold bg-yellow-100">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-600 mb-1">All Terms</span>
                                <span className="text-sm md:text-base font-bold text-gray-800">
                                  {fmt(terms.reduce((sum, term) => {
                                    const parts = activePartsByTerm[term] || [];
                                    const marks = marksheetData[studentIndex]?.marks[subject.subjectId]?.[term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
                                    return sum + (marks.obtained || parts.reduce((s,p) => s + Number(marks[p] || 0), 0));
                                  }, 0))}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-800 text-white font-bold">
                        <td colSpan={2} className="border-2 border-gray-600 px-3 md:px-4 py-2 md:py-3 text-right sticky left-0 z-20">
                          Grand Total:
                        </td>
                        {terms.map((term) => {
                          const parts = activePartsByTerm[term] || [];
                          const span = (parts.length * 2) + 2;
                          const termTotal = maxMarksConfig.reduce((sum, subject) => {
                            const marks = marksheetData[0]?.marks[subject.subjectId]?.[term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
                            return sum + (marks.obtained || parts.reduce((s,p) => s + Number(marks[p] || 0), 0));
                          }, 0);
                          return (
                            <td key={term} colSpan={span} className={`border-2 border-gray-600 px-2 md:px-3 py-2 text-center font-bold text-white ${termColors[term]}`}>
                              {fmt(termTotal)}
                            </td>
                          );
                        })}
                        <td className="border-2 border-gray-600 px-2 md:px-3 py-2 text-center bg-yellow-600 text-white font-bold">
                          {fmt(terms.reduce((total, term) => {
                            const parts = activePartsByTerm[term] || [];
                            return total + maxMarksConfig.reduce((sum, subject) => {
                              const marks = marksheetData[0]?.marks[subject.subjectId]?.[term] || { i: 0, ii: 0, iii: 0, iv: 0, v: 0, obtained: 0 };
                              return sum + (marks.obtained || parts.reduce((s,p) => s + Number(marks[p] || 0), 0));
                            }, 0);
                          }, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center gap-3 mt-6 md:mt-8 pb-4">
                <button
                  onClick={() => {
                    if (validateBeforeSubmit()) {
                      handleSubmit();
                    }
                  }}
                  disabled={submitting}
                  className={`px-8 md:px-12 py-3 md:py-4 rounded-lg font-bold text-white shadow-xl transition-all transform hover:scale-105 text-base md:text-lg ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'SUBMIT MARKSHEET'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sid = (Array.isArray(students) && students.length) ? (students[0]?._id || null) : null;
                    navigate('/print/marksheet', {
                      state: {
                        sessionId: filters.session,
                        term: filters.term,
                        classId: filters.class,
                        sectionId: filters.section,
                        studentId: sid,
                        autoFind: true
                      }
                    });
                  }}
                  className="px-8 md:px-12 py-3 md:py-4 rounded-lg font-bold text-white shadow-xl transition-all transform hover:scale-105 text-base md:text-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                >
                  PRINT MARKSHEET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksheetForm;
