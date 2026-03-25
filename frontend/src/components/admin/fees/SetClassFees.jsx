import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  deleteClassMonthlyFee,
  getClassMonthlyFees,
  getFeeDependencies,
  getFeeMonths,
  saveClassMonthlyFee,
} from '../../../api/feesApi';
import { Loader2, RefreshCcw, Save, Trash2 } from 'lucide-react';

const DEFAULT_FEE_TYPES = [
  'Admission Fees',
  'Annual Fees',
  'Miscellaneous Fees',
  'Registration Fees',
  'Tuition Fees',
];

const currency = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SetClassFees = ({ schoolId }) => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [months, setMonths] = useState([]);
  const [grid, setGrid] = useState([]);
  const [feeHeads, setFeeHeads] = useState(DEFAULT_FEE_TYPES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copyPanelOpen, setCopyPanelOpen] = useState(false);
  const [copyTargets, setCopyTargets] = useState([]);

  const filteredSections = useMemo(() => {
    if (!selectedClass) return [];
    return sections.filter((section) => section.classId === selectedClass || section.classId?._id === selectedClass);
  }, [sections, selectedClass]);

  const sessionLabel = useMemo(() => sessions.find((s) => s._id === selectedSession)?.yearRange || '', [sessions, selectedSession]);
  const classLabel = useMemo(() => classes.find((c) => c._id === selectedClass)?.className || '', [classes, selectedClass]);

  useEffect(() => {
    if (!schoolId) return;
    const loadDependencies = async () => {
      try {
        const response = await getFeeDependencies(schoolId);
        const data = response?.data ?? {};
        setSessions(data.sessions ?? []);
        setClasses(data.classes ?? []);
        setSections(data.sections ?? []);
        if (data.sessions?.length) setSelectedSession(data.sessions[0]._id);
        if (data.classes?.length) setSelectedClass(data.classes[0]._id);
      } catch (error) {
        console.error('Failed to load dependencies', error);
        toast.error(error?.message || 'Failed to load dependencies');
      }
    };
    loadDependencies();
  }, [schoolId]);

  const loadMonths = useCallback(async () => {
    if (!schoolId || !selectedSession) return [];
    const response = await getFeeMonths(schoolId, { sessionId: selectedSession });
    return response?.data ?? [];
  }, [schoolId, selectedSession]);

  const deriveHeads = (monthList, classFees) => {
    const fromMetadata = monthList
      .map((month) => month?.metadata?.feeHeads || [])
      .flat();
    const fromFees = classFees
      .map((fee) => fee.feeItems || [])
      .flat()
      .map((item) => item.feeHead);
    const merged = Array.from(new Set([...fromMetadata, ...fromFees].filter(Boolean)));
    if (merged.length === 0) return DEFAULT_FEE_TYPES;
    return merged;
  };

  const normalizeGrid = (monthList, classFees, heads) => {
    const feeMap = classFees.reduce((acc, fee) => {
      const key = fee.monthId?._id || fee.monthId;
      acc[key] = fee;
      return acc;
    }, {});

    const orderedMonths = [...monthList].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return orderedMonths.map((month) => {
      const existing = feeMap[month._id];
      const amountMap = heads.reduce((acc, head) => {
        if (existing) {
          const match = (existing.feeItems || []).find((item) => item.feeHead === head);
          acc[head] = Number(match?.amount || 0);
        } else {
          acc[head] = 0;
        }
        return acc;
      }, {});

      return {
        monthId: month._id,
        monthName: month.name,
        dueDate: month.dueDate,
        recordId: existing?._id,
        feeItems: amountMap,
      };
    });
  };

  const handleLoadPlan = useCallback(async () => {
    if (!selectedSession || !selectedClass) {
      toast.error('Select session and class');
      return;
    }
    try {
      setLoading(true);
      const monthList = await loadMonths();
      if (monthList.length === 0) {
        toast.error('No months configured. Please add months first.');
        setMonths([]);
        setGrid([]);
        return;
      }
      setMonths(monthList);

      const response = await getClassMonthlyFees(schoolId, {
        sessionId: selectedSession,
        classId: selectedClass,
        sectionId: selectedSection || undefined,
      });
      const classFees = response?.data ?? [];
      const heads = deriveHeads(monthList, classFees);
      setFeeHeads(heads);
      setGrid(normalizeGrid(monthList, classFees, heads));
    } catch (error) {
      console.error('Failed to load class fees', error);
      toast.error(error?.message || 'Failed to load class fees');
    } finally {
      setLoading(false);
    }
  }, [selectedSession, selectedClass, selectedSection, schoolId, loadMonths]);

  useEffect(() => {
    if (selectedSession && selectedClass) {
      handleLoadPlan();
    }
  }, [handleLoadPlan]);

  const updateAmount = (index, head, value) => {
    const numeric = value === '' ? '' : Number(value);
    if (value !== '' && (isNaN(numeric) || numeric < 0)) return;
    setGrid((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              feeItems: {
                ...row.feeItems,
                [head]: value === '' ? '' : numeric,
              },
            }
          : row,
      ),
    );
  };

  const totals = useMemo(() => {
    const columnTotals = feeHeads.reduce((acc, head) => {
      acc[head] = grid.reduce((sum, row) => sum + Number(row.feeItems[head] || 0), 0);
      return acc;
    }, {});
    const rowTotals = grid.map((row) => feeHeads.reduce((sum, head) => sum + Number(row.feeItems[head] || 0), 0));
    const grandTotal = rowTotals.reduce((sum, value) => sum + value, 0);
    return { columnTotals, rowTotals, grandTotal };
  }, [grid, feeHeads]);

  const handleSave = async () => {
    if (grid.length === 0) {
      toast.error('Nothing to save');
      return;
    }
    try {
      setSaving(true);
      const requests = grid.map((row) => {
        const feeItems = feeHeads.map((head) => ({ feeHead: head, amount: Number(row.feeItems[head] || 0) }));
        return saveClassMonthlyFee({
          schoolId,
          sessionId: selectedSession,
          classId: selectedClass,
          sectionId: selectedSection || null,
          monthId: row.monthId,
          monthName: row.monthName,
          feeItems,
        });
      });
      await Promise.all(requests);
      toast.success('Monthly plan updated');
      handleLoadPlan();
    } catch (error) {
      console.error('Failed to save plan', error);
      toast.error(error?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (grid.length === 0) {
      toast.error('No plan to delete');
      return;
    }
    if (!window.confirm('Delete monthly fee plan for this class?')) return;
    try {
      setSaving(true);
      const deletions = grid
        .map((row) => row.recordId)
        .filter(Boolean)
        .map((id) => deleteClassMonthlyFee(id));
      await Promise.all(deletions);
      toast.success('Plan deleted');
      handleLoadPlan();
    } catch (error) {
      console.error('Failed to delete plan', error);
      toast.error(error?.message || 'Failed to delete plan');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPlan = async () => {
    if (copyTargets.length === 0) {
      toast.error('Select at least one class to copy');
      return;
    }
    try {
      setSaving(true);
      const targets = classes.filter((cls) => copyTargets.includes(cls._id));
      const requests = [];
      targets.forEach((targetClass) => {
        grid.forEach((row) => {
          const feeItems = feeHeads.map((head) => ({ feeHead: head, amount: Number(row.feeItems[head] || 0) }));
          requests.push(
            saveClassMonthlyFee({
              schoolId,
              sessionId: selectedSession,
              classId: targetClass._id,
              sectionId: null,
              monthId: row.monthId,
              monthName: row.monthName,
              feeItems,
            }),
          );
        });
      });
      await Promise.all(requests);
      toast.success('Plan copied successfully');
      setCopyPanelOpen(false);
      setCopyTargets([]);
    } catch (error) {
      console.error('Failed to copy plan', error);
      toast.error(error?.message || 'Failed to copy plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Set Month-wise Class Fees</h1>
            <p className="text-sm text-gray-800">
              Configure monthly fee heads for each class. Values are auto-synced to student ledgers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
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
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
                className="rounded-md border border-red-200 bg-white px-4 py-2 text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">Section (optional)</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="rounded-md border border-red-200 bg-white px-4 py-2 text-gray-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="">All Sections</option>
                {filteredSections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleLoadPlan}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white shadow hover:bg-red-700"
          >
            <RefreshCcw className="h-4 w-4" /> Load
          </button>
          <button
            type="button"
            onClick={() => setCopyPanelOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white shadow hover:bg-red-700"
          >
            Apply in Other Class
          </button>
          <button
            type="button"
            onClick={handleDeletePlan}
            disabled={saving || grid.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-red-100 px-4 py-2 font-semibold text-red-600 shadow hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

        {copyPanelOpen && (
          <div className="rounded-lg border border-orange-300 bg-white p-4 shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="text-lg font-semibold text-orange-600">Copy plan to other classes</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCopyTargets(classes.filter((cls) => cls._id !== selectedClass).map((cls) => cls._id));
                  }}
                  className="rounded-md border border-orange-300 px-3 py-1 text-sm font-medium text-orange-600 hover:bg-orange-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setCopyTargets([])}
                  className="rounded-md border border-orange-300 px-3 py-1 text-sm font-medium text-orange-600 hover:bg-orange-50"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {classes
                .filter((cls) => cls._id !== selectedClass)
                .map((cls) => (
                  <label key={cls._id} className="flex items-center gap-2 rounded-md border border-orange-200 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50">
                    <input
                      type="checkbox"
                      className="accent-orange-500"
                      checked={copyTargets.includes(cls._id)}
                      onChange={(event) => {
                        setCopyTargets((prev) =>
                          event.target.checked
                            ? [...prev, cls._id]
                            : prev.filter((id) => id !== cls._id),
                        );
                      }}
                    />
                    {cls.className}
                  </label>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCopyPlan}
                disabled={saving || copyTargets.length === 0}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Copy Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopyPanelOpen(false);
                  setCopyTargets([]);
                }}
                className="rounded-md border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-auto rounded-xl border border-red-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead className="bg-white text-black">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Month</th>
                {feeHeads.map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold">
                    {head}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={feeHeads.length + 2} className="px-4 py-8 text-center text-red-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading plan...
                    </div>
                  </td>
                </tr>
              ) : grid.length === 0 ? (
                <tr>
                  <td colSpan={feeHeads.length + 2} className="px-4 py-8 text-center text-gray-500">
                    No months available. Configure months in the “Set Fees” section first.
                  </td>
                </tr>
              ) : (
                grid.map((row, index) => {
                  const rowTotal = totals.rowTotals[index];
                  return (
                    <tr key={row.monthId} className={'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{row.monthName}</td>
                      {feeHeads.map((head) => (
                        <td key={head} className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.feeItems[head] === '' ? '' : row.feeItems[head]}
                            onChange={(event) => updateAmount(index, head, event.target.value)}
                            className="w-28 rounded-md border border-red-200 px-3 py-1 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-300"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 font-semibold text-gray-900">₹ {currency(rowTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {grid.length > 0 && (
              <tfoot className="bg-white text-black">
                <tr>
                  <td className="px-4 py-3 font-semibold">Totals</td>
                  {feeHeads.map((head) => (
                    <td key={head} className="px-4 py-3 font-semibold">
                      ₹ {currency(totals.columnTotals[head])}
                    </td>
                  ))}
                  <td className="px-4 py-3 font-bold text-black">₹ {currency(totals.grandTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || grid.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
            <h3 className="mb-2 text-lg font-semibold text-black">Instructions</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Select session, class, and section (optional), then press <strong>Load</strong>.</li>
              <li>Enter amounts for each fee head. Totals recalculate automatically.</li>
              <li>Click <strong>Update</strong> to persist. Student ledgers refresh instantly.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-orange-200 bg-white p-5 text-sm text-gray-700 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-orange-600">Need more months?</h3>
            <p>
              Head to <span className="font-semibold text-red-600">Set Fees</span> &rarr; <span className="font-semibold text-red-600">Add Month For Fees</span> to manage session months
              and default fee heads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetClassFees;
