import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const TeacherCard = () => {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
        const token = localStorage.getItem('token');

        const [sessRes, teachersRes] = await Promise.all([
          axiosInstance.get('/api/sessions'),
          axiosInstance.get(`/api/teachers/all/${schoolId}`),
        ]);

        const sess = sessRes?.data?.data || [];
        setSessions(sess);
        const active = sess.find((s) => s.isActive) || sess[0];
        if (active) setSessionId(active._id);

        const teachersList = teachersRes?.data?.teachers || [];
        const list = Array.isArray(teachersList) ? teachersList : [];
        setTeachers(list);
        setSelectedIds(new Set(list.map((t) => t._id || t.id)));
        setSelectAll(true);
      } catch (err) {
        console.error('Error fetching initial data for TeacherCard:', err);
        setTeachers([]);
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
      const all = new Set(teachers.map((t) => t._id || t.id));
      setSelectedIds(all);
      setSelectAll(true);
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelectAll(next.size === teachers.length && teachers.length > 0);
      return next;
    });
  };

  const selectedTeachers = useMemo(() => teachers.filter((t) => selectedIds.has(t._id || t.id)), [teachers, selectedIds]);

  const handlePrint = () => {
    const sessionLabel = (sessions.find((s) => s._id === sessionId)?.yearRange) || '';
    navigate('/print/teacher', {
      state: {
        title: 'Teacher ID Cards',
        items: selectedTeachers,
        type: 'teacher',
        sessionLabel,
        iCardType,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg">Teacher I Card Print</div>

      {/* Body */}
      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.yearRange} {s.isActive ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Types of I-Cards</label>
          <select
            value={iCardType}
            onChange={(e) => setICardType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="I-Card 1">I-Card 1</option>
            <option value="I-Card 2">I-Card 2</option>
          </select>
        </div>

        {/* Optional: tiny helper text showing how many teachers loaded */}
        <div className="text-xs text-gray-500">Loaded {teachers.length} teachers</div>
      </div>

      {/* Selection Table */}
      {teachers.length > 0 && (
        <div className="p-4">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-t flex items-center justify-between">
            <div className="font-semibold">Select Teachers For Print I Card : {teachers.length}</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              <span>Select All</span>
            </label>
          </div>
          <div className="border rounded-b overflow-hidden">
            <div className="grid grid-cols-[40px_100px_200px_120px_120px_100px_100px_100px] bg-gray-100 text-xs font-semibold text-gray-700 px-3 py-2">
              <div></div>
              <div>Photo</div>
              <div>Name</div>
              <div>Employee ID</div>
              <div>Mobile</div>
              <div>DOB</div>
              <div>Gender</div>
              <div>Blood Group</div>
            </div>
            <div className="max-h-96 overflow-auto">
              {teachers.map((teacher, idx) => {
                const id = teacher._id || teacher.id || idx;
                const name = teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
                const employeeId = teacher.employeeId || 'N/A';
                const phone = teacher.phone || 'N/A';
                const dob = teacher.dob ? new Date(teacher.dob).toLocaleDateString() : 'N/A';
                const gender = teacher.gender || 'N/A';
                const bloodGroup = teacher.bloodGroup || 'N/A';
                return (
                  <div key={id} className="grid grid-cols-[40px_100px_200px_120px_120px_100px_100px_100px] items-center px-3 py-2 border-t">
                    <div>
                      <input type="checkbox" checked={selectedIds.has(id)} onChange={() => toggleRow(id)} />
                    </div>
                    <div className="h-12 flex items-center">
                      <img
                        src={resolveAssetUrl(teacher.photoUrl || (teacher.photo ? `uploads/teachers/${teacher.photo}` : ''))}
                        alt="Photo"
                        className="h-10 w-10 object-cover rounded border"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="font-medium truncate">{name} (Teacher)</div>
                    <div className="text-sm text-gray-600 truncate">{employeeId}</div>
                    <div className="text-sm text-gray-600 truncate">{phone}</div>
                    <div className="text-sm text-gray-600 truncate">{dob}</div>
                    <div className="text-sm text-gray-600 truncate">{gender}</div>
                    <div className="text-sm text-gray-600 truncate">{bloodGroup}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <button
              disabled={selectedTeachers.length === 0}
              onClick={handlePrint}
              className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 hover:bg-blue-700 transition duration-200"
            >
              Print Selected ({selectedTeachers.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCard;