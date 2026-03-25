import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  createFeeMonth,
  deleteFeeMonth,
  getFeeDependencies,
  getFeeMonths,
  updateFeeMonth,
} from '../../../api/feesApi';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

const DEFAULT_FEE_TYPES = [
  'Admission Fees',
  'Annual Fees',
  'Computer Fees',
  'Exam Fees',
  'Miscellaneous Fees',
  'Registration Fees',
  'Tuition Fees',
];

const storageKey = (schoolId, sessionId) => `fee-types-${schoolId}-${sessionId}`;

const AddFeeMonths = ({ schoolId }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [feeTypes, setFeeTypes] = useState(DEFAULT_FEE_TYPES);
  const [highlightedMonthId, setHighlightedMonthId] = useState('');

  const activeSessionLabel = useMemo(() => {
    const match = sessions.find((session) => session._id === selectedSession);
    return match?.yearRange || '';
  }, [sessions, selectedSession]);

  useEffect(() => {
    if (!schoolId) return;
    const load = async () => {
      try {
        const response = await getFeeDependencies(schoolId);
        const sessionList = response?.data?.sessions ?? [];
        setSessions(sessionList);
        if (sessionList.length > 0) {
          setSelectedSession(sessionList[0]._id);
        }
      } catch (error) {
        console.error('Failed to load sessions', error);
        toast.error(error?.message || 'Failed to load sessions');
      }
    };
    load();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !selectedSession) return;
    const key = storageKey(schoolId, selectedSession);
    const storedTypes = localStorage.getItem(key);
    if (storedTypes) {
      try {
        const parsed = JSON.parse(storedTypes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeeTypes(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse stored fee types');
      }
    }
  }, [schoolId, selectedSession]);

  useEffect(() => {
    if (!schoolId || !selectedSession) return;
    const loadMonths = async () => {
      setLoading(true);
      try {
        const response = await getFeeMonths(schoolId, { sessionId: selectedSession });
        const monthList = response?.data ?? [];
        setMonths(monthList);

        // derive fee types from metadata if present
        const metadataTypes = Array.from(
          new Set(
            monthList
              .map((month) => month?.metadata?.feeHeads || [])
              .flat()
              .filter(Boolean),
          ),
        );
        if (metadataTypes.length > 0) {
          setFeeTypes(metadataTypes);
        }
      } catch (error) {
        console.error('Failed to load fee months', error);
        toast.error(error?.message || 'Failed to load fee months');
      } finally {
        setLoading(false);
      }
    };
    loadMonths();
  }, [schoolId, selectedSession]);

  const handleAddMonth = async () => {
    const trimmed = newMonthName.trim();
    if (!trimmed) {
      toast.error('Enter a month name (e.g., APR or APR-MAY)');
      return;
    }
    if (!selectedSession) {
      toast.error('Select a session first');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createFeeMonth({
        schoolId,
        sessionId: selectedSession,
        name: trimmed.toUpperCase(),
        order: (months?.length || 0) + 1,
      });

      if (response?.alreadyExisted) {
        toast.success('Month already exists for this session. Highlighting it below.');
      } else {
        toast.success(response?.message || 'Month added');
      }

      setNewMonthName('');
      const refreshed = await getFeeMonths(schoolId, { sessionId: selectedSession });
      setMonths(refreshed?.data ?? []);

      if (response?.data?._id) {
        setHighlightedMonthId(response.data._id);
      }
    } catch (error) {
      console.error('Failed to add month', error);
      const fallback = error?.message || 'Failed to add month';
      const conflictMessage = error?.response?.status === 409
        ? error?.response?.data?.message || 'Month already exists for this session'
        : null;

      if (conflictMessage) {
        const existing = months.find((month) => month.name?.trim().toUpperCase() === trimmed.toUpperCase());
        if (existing?._id) {
          setHighlightedMonthId(existing._id);
          if (typeof window !== 'undefined') {
            const element = document.getElementById(`month-row-${existing._id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }

      toast.error(conflictMessage || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!highlightedMonthId) return undefined;

    const scrollToRow = () => {
      if (typeof window === 'undefined') return;
      const element = document.getElementById(`month-row-${highlightedMonthId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    scrollToRow();
    const timer = setTimeout(() => setHighlightedMonthId(''), 3500);
    return () => clearTimeout(timer);
  }, [highlightedMonthId, months]);

  const handleDeleteMonth = async (monthId) => {
    if (!monthId) return;
    if (!window.confirm('Remove this month from the current session?')) return;
    try {
      setSubmitting(true);
      await deleteFeeMonth(monthId);
      toast.success('Month removed');
      const refreshed = await getFeeMonths(schoolId, { sessionId: selectedSession });
      setMonths(refreshed?.data ?? []);
    } catch (error) {
      console.error('Failed to delete month', error);
      toast.error(error?.message || 'Failed to delete month');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFeeType = (type) => {
    setFeeTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  };

  const handleSelectAll = () => setFeeTypes(DEFAULT_FEE_TYPES);
  const handleClear = () => setFeeTypes([]);

  const handlePersistFeeTypes = async () => {
    if (!selectedSession) {
      toast.error('Select a session first');
      return;
    }
    if (feeTypes.length === 0) {
      toast.error('Select at least one fee type');
      return;
    }
    try {
      setSubmitting(true);
      const payloads = months.map((month) =>
        updateFeeMonth(month._id, {
          metadata: {
            ...(month.metadata || {}),
            feeHeads: feeTypes,
          },
        }),
      );
      await Promise.all(payloads);
      localStorage.setItem(storageKey(schoolId, selectedSession), JSON.stringify(feeTypes));
      toast.success('Fee types saved for this session');
    } catch (error) {
      console.error('Failed to save fee types', error);
      toast.error(error?.message || 'Failed to save fee types');
    } finally {
      setSubmitting(false);
    }
  };

  const orderedMonths = useMemo(() => {
    return [...months].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [months]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Set Fees - Session Months</h1>
            <p className="text-gray-800">
              Define fee months and standard fee types for the selected academic session.
            </p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Session</label>
            <select
              value={selectedSession}
              onChange={(event) => setSelectedSession(event.target.value)}
              className="rounded-md border border-red-200 bg-white px-4 py-2 text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.yearRange}
                  {session.isActive ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Month management */}
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-white px-5 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Add Month For Fees</h2>
              <span className="text-sm font-medium text-red-500">
                {activeSessionLabel || 'Select session'}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMonthName}
                  onChange={(event) => setNewMonthName(event.target.value.toUpperCase())}
                  placeholder="APR or APR-MAY"
                  className="flex-1 rounded-md border border-red-200 px-4 py-2 text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <button
                  type="button"
                  onClick={handleAddMonth}
                  disabled={submitting || !selectedSession}
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                  Save
                </button>
              </div>

              <div className="border border-red-100 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-white text-black text-sm font-semibold">
                  <div className="px-3 py-2 border-r border-red-200">SR</div>
                  <div className="px-3 py-2 border-r border-red-200">Month</div>
                  <div className="px-3 py-2 text-center">Delete</div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-red-500">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading months...
                    </div>
                  ) : orderedMonths.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      No months configured for this session yet.
                    </div>
                  ) : (
                    orderedMonths.map((month, index) => {
                      const isHighlighted = highlightedMonthId === month._id;
                      const rowClasses = [
                        'grid grid-cols-3 border-t border-red-100 text-sm text-gray-700 transition-colors duration-300',
                        isHighlighted ? 'bg-amber-50 ring-1 ring-amber-300 shadow-inner' : 'bg-white',
                      ].join(' ');

                      return (
                        <div
                          key={month._id}
                          id={`month-row-${month._id}`}
                          className={rowClasses}
                        >
                          <div className="px-3 py-2 border-r border-red-100">{index + 1}</div>
                          <div className="px-3 py-2 border-r border-red-100 font-medium">
                            {month.name}
                          </div>
                          <div className="px-3 py-2 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteMonth(month._id)}
                              className="rounded-full p-1 text-red-500 hover:bg-red-100"
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fee types */}
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-white px-5 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Select Fees Type</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded-md border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-md border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="p-5 flex flex-col h-full">
              <div className="flex-1 space-y-3">
                {DEFAULT_FEE_TYPES.map((type) => {
                  const isSelected = feeTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFeeType(type)}
                      className={`w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition hover:shadow-sm ${
                        isSelected
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-red-100 bg-white text-gray-700'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{type}</span>
                        <span
                          className={`h-3 w-3 rounded-full border ${
                            isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handlePersistFeeTypes}
                disabled={submitting || feeTypes.length === 0}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeeMonths;
