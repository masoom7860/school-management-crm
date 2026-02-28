import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import InputControl from './InputControl';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const StudentCard = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [iCardType, setICardType] = useState('I-Card 1');
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [sessRes, classRes] = await Promise.all([
          axiosInstance.get('/api/sessions'),
          axiosInstance.get('/api/classes'),
        ]);
        const sess = sessRes?.data?.data || [];
        const cls = classRes?.data?.data || [];
        setSessions(sess);
        setClasses(cls);
        const active = sess.find((s) => s.isActive) || sess[0];
        if (active) setSessionId(active._id);
        if (cls.length > 0) setClassId(cls[0]._id);
      } catch (err) {
        console.error('Error fetching initial data for StudentCard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      if (!classId) {
        setSections([]);
        setSectionId('');
        return;
      }
      setLoadingSections(true);
      try {
        const res = await axiosInstance.get('/api/classes/sections', { params: { classId } });
        const secs = res?.data?.data || res?.data || [];
        const normalized = Array.isArray(secs) ? secs : [];
        setSections(normalized);
        setSectionId(normalized[0]?._id || '');
      } catch (err) {
        console.error('Error fetching sections:', err);
        setSections([]);
        setSectionId('');
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, [classId]);

  const handleNext = async () => {
    try {
      // Find section name to pass to query API
      const secObj = sections.find((s) => s._id === sectionId);
      const sectionName = secObj?.name || '';
      const params = { classId };
      if (sectionName) params.section = sectionName;
      const res = await axiosInstance.get('/api/students', { params });
      const data = res?.data?.data || res?.data || [];
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      // Reset selections
      setSelectedIds(new Set(list.map((s) => s._id || s.id))); // default select all
      setSelectAll(true);
    } catch (err) {
      console.error('Error fetching students for preview:', err);
      setStudents([]);
      setSelectedIds(new Set());
      setSelectAll(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const all = new Set(students.map((s) => s._id || s.id));
      setSelectedIds(all);
      setSelectAll(true);
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelectAll(next.size === students.length && students.length > 0);
      return next;
    });
  };

  const selectedStudents = useMemo(() => students.filter((s) => selectedIds.has(s._id || s.id)), [students, selectedIds]);

  const handlePrintSelected = () => {
    const sessionLabel = (sessions.find((s) => s._id === sessionId)?.yearRange) || '';
    navigate('/print/students', {
      state: {
        title: 'Student ID Cards',
        items: selectedStudents,
        type: 'student',
        sessionLabel,
        iCardType,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg">Student I Card Print</div>

      {/* Body */}
      <div className="p-6">
        <InputControl label="Session" value={sessionId} onChange={(e) => setSessionId(e.target.value)} disabled={loading}>
          <option value="">Select Session</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.yearRange} {s.isActive ? '(Active)' : ''}
            </option>
          ))}
        </InputControl>

        <InputControl label="Select Class" value={classId} onChange={(e) => setClassId(e.target.value)} disabled={loading}>
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.className}
            </option>
          ))}
        </InputControl>

        <InputControl label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={loading || loadingSections}>
          <option value="">Select Section</option>
          {sections.map((sec) => (
            <option key={sec._id} value={sec._id}>
              {sec.name}
            </option>
          ))}
        </InputControl>

        <InputControl label="Types of I-Cards" value={iCardType} onChange={(e) => setICardType(e.target.value)}>
          <option value="I-Card 1">I-Card 1</option>
          <option value="I-Card 2">I-Card 2</option>
        </InputControl>
      </div>

      {/* Footer / Button */}
      <div className="p-0">
        <button onClick={handleNext} className="w-full bg-blue-600 text-white font-bold py-3 hover:bg-blue-700 transition duration-200">
          Load Students
        </button>
      </div>

      {/* Selection Table */}
      {students.length > 0 && (
        <div className="p-4">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-t flex items-center justify-between">
            <div className="font-semibold">Select Student For Print I Card : {students.length}</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              <span>Select All</span>
            </label>
          </div>
          <div className="border rounded-b overflow-hidden w-full">
            {/* Table header */}
            <div className="grid grid-cols-[40px_100px_1fr] bg-gray-100 text-xs font-semibold text-gray-700 px-3 py-2">
              <div className="text-center"></div>
              <div>Photo</div>
              <div>Name & Class</div>
            </div>
            {/* Table body with scroll */}
            <div className="max-h-96 overflow-auto">
              {students.map((st, idx) => {
                const id = st._id || st.id || idx;
                const name = st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim();
                const className = st.classId?.className || st.className || '-';
                const sectionName = st.sectionId?.name || st.section || st.sectionName || '-';
                
                return (
                  <div 
                    key={id} 
                    className="grid grid-cols-[40px_100px_1fr] items-center px-3 py-2 border-t hover:bg-gray-50"
                  >
                    <div className="text-center">
                      <input type="checkbox" checked={selectedIds.has(id)} onChange={() => toggleRow(id)} />
                    </div>
                    <div className="h-12 flex items-center">
                      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                      <img 
                        src={resolveAssetUrl(st.profilePhoto)} 
                        alt="Photo" 
                        className="h-10 w-10 object-cover rounded border mx-auto" 
                        onError={(e)=>{e.currentTarget.style.display='none'}} 
                      />
                    </div>
                    <div className="font-medium truncate">{name} ({className}{sectionName ? ` - ${sectionName}` : ''})</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <button
              disabled={selectedStudents.length === 0}
              onClick={handlePrintSelected}
              className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 hover:bg-blue-700 transition duration-200"
            >
              Print Selected ({selectedStudents.length})
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentCard;