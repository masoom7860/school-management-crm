import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import InputControl from './InputControl';
import { getStaffBySchoolId } from '../../../api/staffApi';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const StaffCard = () => {
  const [sessions, setSessions] = useState([]);
  const [staff, setStaff] = useState([]);
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
        const [sessRes, staffRes] = await Promise.all([
          axiosInstance.get('/api/sessions'),
          getStaffBySchoolId(schoolId),
        ]);
        const sess = sessRes?.data?.data || [];
        setSessions(sess);
        const active = sess.find((s) => s.isActive) || sess[0];
        if (active) setSessionId(active._id);

        const staffList = staffRes?.staff || staffRes?.data?.staff || [];
        const list = Array.isArray(staffList) ? staffList : [];
        setStaff(list);
        setSelectedIds(new Set(list.map((s) => s._id || s.id)));
        setSelectAll(true);
      } catch (err) {
        console.error('Error fetching initial data for StaffCard:', err);
        setStaff([]);
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
      const all = new Set(staff.map((s) => s._id || s.id));
      setSelectedIds(all);
      setSelectAll(true);
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelectAll(next.size === staff.length && staff.length > 0);
      return next;
    });
  };

  const selectedStaff = useMemo(() => staff.filter((s) => selectedIds.has(s._id || s.id)), [staff, selectedIds]);
  const handlePrint = () => {
    const sessionLabel = (sessions.find((s) => s._id === sessionId)?.yearRange) || '';
    navigate('/print/staff', {
      state: {
        title: 'Staff ID Cards',
        items: selectedStaff,
        type: 'staff',
        sessionLabel,
        iCardType,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 font-semibold text-lg">Staff I Card Print</div>

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

        {/* Optional: tiny helper text showing how many staff loaded */}
        <div className="text-xs text-gray-500">Loaded {staff.length} staff</div>
      </div>

      {/* Selection Table */}
      {staff.length > 0 && (
        <div className="p-4">
          <div className="bg-green-600 text-white px-3 py-2 rounded-t flex items-center justify-between">
            <div className="font-semibold">Select Staff For Print I Card : {staff.length}</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              <span>Select All</span>
            </label>
          </div>
          <div className="border rounded-b overflow-hidden">
            <div className="grid grid-cols-[40px_100px_1fr_140px] bg-gray-100 text-xs font-semibold text-gray-700 px-3 py-2">
              <div></div>
              <div>Photo</div>
              <div>Name</div>
              <div>Designation</div>
            </div>
            <div className="max-h-96 overflow-auto">
              {staff.map((st, idx) => {
                const id = st._id || st.id || idx;
                const name = st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim();
                const designation = st.designation || st.designationName || '';
                return (
                  <div key={id} className="grid grid-cols-[40px_100px_1fr_140px] items-center px-3 py-2 border-t">
                    <div>
                      <input type="checkbox" checked={selectedIds.has(id)} onChange={() => toggleRow(id)} />
                    </div>
                    <div className="h-12 flex items-center">
                      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                      <img src={resolveAssetUrl(st.photoUrl)} alt="Photo" className="h-10 w-10 object-cover rounded border" onError={(e)=>{e.currentTarget.style.display='none'}} />
                    </div>
                    <div className="font-medium truncate">{name}</div>
                    <div className="text-sm text-gray-600 truncate">{designation || 'Staff'}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <button
              disabled={selectedStaff.length === 0}
              onClick={handlePrint}
              className="w-full bg-green-600 disabled:bg-green-300 text-white font-bold py-3 hover:bg-green-700 transition duration-200"
            >
              Print Selected ({selectedStaff.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCard;