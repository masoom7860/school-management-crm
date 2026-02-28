import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import InputControl from './InputControl';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const AllStudentCard = () => {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true);

  const [sessionId, setSessionId] = useState('');
  const [iCardType, setICardType] = useState('I-Card 1');

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const schoolId = localStorage.getItem('schoolId');
        const [sessRes, studRes] = await Promise.all([
          axiosInstance.get('/api/sessions'),
          axiosInstance.get(`/api/students/get/${schoolId}`),
        ]);
        const sess = sessRes?.data?.data || [];
        setSessions(sess);
        const active = sess.find((s) => s.isActive) || sess[0];
        if (active) setSessionId(active._id);

        const studentsData = studRes?.data?.students || [];
        const list = Array.isArray(studentsData) ? studentsData : [];
        setStudents(list);
        // default select all
        setSelectedIds(new Set(list.map((s) => s._id || s.id)));
        setSelectAll(true);
      } catch (err) {
        console.error('Error fetching initial data for AllStudentCard:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

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

  const handlePrint = () => {
    const sessionLabel = (sessions.find((s) => s._id === sessionId)?.yearRange) || '';
    navigate('/print/all-students', {
      state: {
        title: 'All Students ID Cards',
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
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg">All Student I Card Print</div>

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

        <InputControl label="Types of I-Cards" value={iCardType} onChange={(e) => setICardType(e.target.value)}>
          <option value="I-Card 1">I-Card 1</option>
          <option value="I-Card 2">I-Card 2</option>
        </InputControl>

        {/* Optional: tiny helper text showing how many students loaded */}
        <div className="text-xs text-gray-500">Loaded {students.length} students</div>
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
          <div className="border rounded-b overflow-hidden">
            <div className="grid grid-cols-[40px_100px_1fr_100px_80px] bg-gray-100 text-xs font-semibold text-gray-700 px-3 py-2">
              <div></div>
              <div>Photo</div>
              <div>Name</div>
              <div>Cls</div>
              <div>Roll</div>
            </div>
            <div className="max-h-96 overflow-auto">
              {students.map((st, idx) => {
                const id = st._id || st.id || idx;
                const name = st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim();
                const className = st.classId?.className || st.className || '-';
                const sectionName = st.sectionId?.name || st.section || st.sectionName || '';
                const roll = st.rollNumber || st.roll || '';
                return (
                  <div key={id} className="grid grid-cols-[40px_100px_1fr_100px_80px] items-center px-3 py-2 border-t">
                    <div>
                      <input type="checkbox" checked={selectedIds.has(id)} onChange={() => toggleRow(id)} />
                    </div>
                    <div className="h-12 flex items-center">
                      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                      <img src={resolveAssetUrl(st.profilePhoto)} alt="Photo" className="h-10 w-10 object-cover rounded border" onError={(e)=>{e.currentTarget.style.display='none'}} />
                    </div>
                    <div className="font-medium truncate">{name}</div>
                    <div className="text-sm text-gray-600 truncate">{className}{sectionName ? `- ${sectionName}` : ''}</div>
                    <div className="font-semibold text-right pr-2">{roll}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <button
              disabled={selectedStudents.length === 0}
              onClick={handlePrint}
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

export default AllStudentCard;