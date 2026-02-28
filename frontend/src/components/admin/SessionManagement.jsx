import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, LucideEdit, LucideTrash2, CheckCircle2 } from 'lucide-react';
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  activateSession,
} from '../../api/sessionsApi';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

const initialFormState = {
  yearRange: '',
};

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      setSessions(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toast.error(err?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setEditId(null);
    setFormOpen(false);
  };

  const isValidYearRange = (val) => /^(\d{4})-(\d{4})$/.test(val.trim());

  const computeDatesFromYearRange = (yr) => {
    const [startY, endY] = yr.split('-').map((n) => Number(n));
    // Academic year Apr 1 to Mar 31 by default
    const startDate = new Date(startY, 3, 1); // Apr = 3 index
    const endDate = new Date(endY, 2, 31); // Mar = 2 index
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const validate = () => {
    const errors = {};
    const { yearRange } = formData;
    if (!yearRange.trim()) errors.yearRange = 'Year range is required';
    else if (!isValidYearRange(yearRange)) errors.yearRange = 'Format must be YYYY-YYYY';

    // Duplicate check on client
    const normalized = yearRange.trim().toLowerCase();
    const duplicate = sessions.some((s) => s.yearRange?.trim().toLowerCase() === normalized && s._id !== editId);
    if (!errors.yearRange && duplicate) errors.yearRange = 'Session for this year already exists';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix form errors');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        yearRange: formData.yearRange.trim(),
        ...computeDatesFromYearRange(formData.yearRange.trim()),
      };
      if (editId) {
        await updateSession(editId, payload);
        toast.success('Session updated');
      } else {
        await createSession(payload);
        toast.success('Session created');
      }
      await fetchAll();
      resetForm();
    } catch (err) {
      toast.error(err?.message || 'Failed to save session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditId(session._id);
    setFormData({
      yearRange: session.yearRange || '',
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (id) => {
    setActionLoading(true);
    try {
      await deleteSession(id);
      toast.success('Session deleted');
      await fetchAll();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete session');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const handleActivate = async (id) => {
    setActionLoading(true);
    try {
      await activateSession(id);
      toast.success('Session activated');
      await fetchAll();
    } catch (err) {
      toast.error(err?.message || 'Failed to activate session');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.yearRange?.toLowerCase().includes(q));
  }, [search, sessions]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Session Management</h1>
        <div className="w-full max-w-md relative">
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{editId ? 'Update Session' : 'Add Session'}</h2>
              <button
                onClick={() => { setFormOpen(true); setEditId(null); setFormData(initialFormState); setFormErrors({}); }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {formOpen && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
                  <input
                    type="text"
                    placeholder="e.g., 2025-2026"
                    value={formData.yearRange}
                    onChange={(e) => { setFormData({ ...formData, yearRange: e.target.value }); setFormErrors((p) => ({ ...p, yearRange: '' })); }}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.yearRange ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.yearRange && <p className="mt-1 text-sm text-red-600">{formErrors.yearRange}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {editId ? 'Update Session' : 'Create Session'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{s.yearRange}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(s.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(s.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="w-4 h-4"/> Active</span>
                        ) : (
                          <span className="text-gray-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          {!s.isActive && (
                            <button onClick={() => handleActivate(s._id)} className="text-green-700 hover:text-green-900 p-1 rounded hover:bg-green-50" disabled={actionLoading} title="Activate">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" disabled={actionLoading} title="Edit">
                            <LucideEdit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" disabled={actionLoading} title="Delete">
                            <LucideTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">No sessions found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
        onConfirm={() => pendingDeleteId && confirmDelete(pendingDeleteId)}
        itemToDelete={pendingDeleteId}
      />
    </div>
  );
};

export default SessionManagement;


