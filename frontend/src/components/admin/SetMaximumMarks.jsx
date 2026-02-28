import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { getClasses, getSectionsByClass } from "../../api/classesApi";

const SetMaximumMarks = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [className, setClassName] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const API_ROOT = "/api";

  const examTypes = [
    { name: "Term1", color: "bg-green-400" },
    { name: "Term2", color: "bg-red-400" },
    { name: "Term3", color: "bg-blue-400" },
  ];

  const blankTerm = () => ({ i: 0, ii: 0, iii: 0, iv: 0, v: 0, max: 0 });

  // Global enable/disable toggles per term for components i/ii/iii/iv/v
  const [componentsEnabled, setComponentsEnabled] = useState({
    Term1: { i: true, ii: true, iii: false, iv: false, v: false },
    Term2: { i: true, ii: true, iii: false, iv: false, v: false },
    Term3: { i: true, ii: true, iii: false, iv: false, v: false },
  });

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    const schoolId = localStorage.getItem("schoolId");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (schoolId) headers["School-ID"] = schoolId;
    return headers;
  };

  // Load classes
  useEffect(() => {
    (async () => {
      try {
        const list = await getClasses();
        setClasses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Error loading classes", e);
      }
    })();
  }, []);

  // When class changes, load sections and set className
  useEffect(() => {
    if (!selectedClassId) {
      setSections([]);
      setSectionId("");
      setSectionName("");
      setClassName("");
      setRows([]);
      return;
    }

    const cls = classes.find(c => c._id === selectedClassId);
    setClassName(cls?.className || "");

    (async () => {
      try {
        const secs = await getSectionsByClass(selectedClassId);
        setSections(Array.isArray(secs) ? secs : []);
        setSectionId("");
        setSectionName("");
      } catch (e) {
        console.error("Error loading sections", e);
        setSections([]);
      }
    })();
  }, [selectedClassId, classes]);

  // Load existing max marks for class + section. If none, seed from subjects list
  const loadData = async () => {
    if (!className || !sectionName) return;
    setLoading(true);
    try {
      const maxRes = await axiosInstance.get(`${API_ROOT}/maxmarks`, {
        params: { className, section: sectionName },
      });
      
      // New API response structure: { marks: [...], openDays: {...} }
      const responseData = maxRes.data;
      const maxRows = Array.isArray(responseData.marks) ? responseData.marks : [];
      const openDaysData = responseData.openDays || {};

      if (maxRows.length > 0) {
        // Ensure all terms exist and merge with openDays data
        const normalized = maxRows.map(r => ({
          subject: r.subject,
          Term1: { i: r.Term1?.i ?? 0, ii: r.Term1?.ii ?? 0, iii: r.Term1?.iii ?? 0, iv: r.Term1?.iv ?? 0, v: r.Term1?.v ?? 0, max: r.Term1?.max ?? 0 },
          Term2: { i: r.Term2?.i ?? 0, ii: r.Term2?.ii ?? 0, iii: r.Term2?.iii ?? 0, iv: r.Term2?.iv ?? 0, v: r.Term2?.v ?? 0, max: r.Term2?.max ?? 0 },
          Term3: { i: r.Term3?.i ?? 0, ii: r.Term3?.ii ?? 0, iii: r.Term3?.iii ?? 0, iv: r.Term3?.iv ?? 0, v: r.Term3?.v ?? 0, max: r.Term3?.max ?? 0 },
          Term1OpenDays: openDaysData.term1OpenDays ?? 0,
          Term2OpenDays: openDaysData.term2OpenDays ?? 0,
          Term3OpenDays: openDaysData.term3OpenDays ?? 0,
        }));

        // Initialize component toggles: enable parts if any subject uses it in that term
        const enabled = { Term1: { i: true, ii: true, iii: false, iv: false, v: false }, Term2: { i: true, ii: true, iii: false, iv: false, v: false }, Term3: { i: true, ii: true, iii: false, iv: false, v: false } };
        normalized.forEach(n => {
          examTypes.forEach(ex => {
            if ((n?.[ex.name]?.iii || 0) > 0) enabled[ex.name].iii = true;
            if ((n?.[ex.name]?.iv || 0) > 0) enabled[ex.name].iv = true;
            if ((n?.[ex.name]?.v || 0) > 0) enabled[ex.name].v = true;
          });
        });
        setComponentsEnabled(enabled);

        // Also include any newly-added subjects (from Subject Management) not present in existing max marks
        try {
          const subjRes = await axiosInstance.get(`${API_ROOT}/subjects`, {
            params: { classId: selectedClassId, sectionId },
          });
          let subjList = Array.isArray(subjRes.data?.data) ? subjRes.data.data : [];
          // If no section-specific subjects, fallback to class-wide subjects
          if ((!Array.isArray(subjList) || subjList.length === 0) && sectionId) {
            try {
              const fallbackRes = await axiosInstance.get(`${API_ROOT}/subjects`, {
                params: { classId: selectedClassId },
              });
              subjList = Array.isArray(fallbackRes.data?.data) ? fallbackRes.data.data : [];
            } catch (_) {}
          }
          const existing = new Set(normalized.map(r => (r.subject || '').toUpperCase()));
          const term1OD = openDaysData.term1OpenDays ?? 0;
          const term2OD = openDaysData.term2OpenDays ?? 0;
          const term3OD = openDaysData.term3OpenDays ?? 0;
          const additions = subjList
            .map(s => (s.name || '').toUpperCase())
            .filter(name => name && !existing.has(name))
            .map(name => ({
              subject: name,
              Term1: blankTerm(),
              Term2: blankTerm(),
              Term3: blankTerm(),
              Term1OpenDays: term1OD,
              Term2OpenDays: term2OD,
              Term3OpenDays: term3OD,
            }));
          setRows([...normalized, ...additions]);
        } catch {
          setRows(normalized);
        }
        return;
      }

      // Fallback to subjects list if no max marks yet
      const subjRes = await axiosInstance.get(`${API_ROOT}/subjects`, {
        params: { classId: selectedClassId, sectionId },
      });
      let data = subjRes.data?.data || [];
      // If no section-specific subjects found, fallback to class-wide subjects
      if ((!Array.isArray(data) || data.length === 0) && sectionId) {
        try {
          const fallback = await axiosInstance.get(`${API_ROOT}/subjects`, {
            params: { classId: selectedClassId },
          });
          data = fallback.data?.data || [];
        } catch {}
      }
      const initial = data.map(s => ({
        subject: (s.name || "").toUpperCase(),
        Term1: blankTerm(),
        Term2: blankTerm(),
        Term3: blankTerm(),
        Term1OpenDays: 0,
        Term2OpenDays: 0,
        Term3OpenDays: 0,
      }));
      setRows(initial);
    } catch (e) {
      console.error("Error loading max marks/subjects", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, sectionName]);

  const handleValueChange = (rowIndex, exam, field, value) => {
    const updated = [...rows];
    const numeric = Number(value || 0);
    updated[rowIndex][exam] = updated[rowIndex][exam] || blankTerm();
    updated[rowIndex][exam][field] = numeric;

    // Auto-compute max as sum of enabled components
    const en = componentsEnabled[exam] || { i: true, ii: true, iii: false, iv: false, v: false };
    const parts = ["i","ii","iii","iv","v"];
    updated[rowIndex][exam].max = parts.reduce((sum, p) => sum + (en[p] ? Number(updated[rowIndex][exam][p] || 0) : 0), 0);

    setRows(updated);
  };

  const handleTotalOpenDaysChange = (rowIndex, value) => {
    const updated = [...rows];
    updated[rowIndex].totalOpenDays = Number(value || 0);
    setRows(updated);
  };

  const handleSubmit = async () => {
    if (!className || !sectionName) return alert("Please select class and section");
    setSubmitting(true);
    try {
      // Extract openDays from first row (since it's same for all subjects)
      const openDays = {
        term1OpenDays: rows[0]?.Term1OpenDays ?? 0,
        term2OpenDays: rows[0]?.Term2OpenDays ?? 0,
        term3OpenDays: rows[0]?.Term3OpenDays ?? 0,
      };
      
      // Prepare subjects data without openDays fields
      const subjects = rows.map(r => {
        const out = { subject: r.subject, Term1: { ...r.Term1 }, Term2: { ...r.Term2 }, Term3: { ...r.Term3 } };
        // Zero out disabled components to persist intent (i..v)
        ["Term1","Term2","Term3"].forEach(term => {
          const en = componentsEnabled[term] || { i: true, ii: true, iii: false, iv: false, v: false };
          ["i","ii","iii","iv","v"].forEach(p => { if (!en[p]) out[term][p] = 0; });
          // Recompute max as sum of enabled comps
          out[term].max = ["i","ii","iii","iv","v"].reduce((sum, p) => sum + (en[p] ? Number(out[term][p] || 0) : 0), 0);
        });
        return out;
      });
      
      await axiosInstance.post(`${API_ROOT}/maxmarks/set`, {
        className,
        section: sectionName,
        subjects: subjects,
        openDays: openDays,
      });
      alert("Marks saved successfully");
      await loadData();
    } catch (e) {
      console.error(e);
      alert("Failed to save marks: " + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const totalFor = (exam, field) => rows.reduce((acc, r) => acc + (r?.[exam]?.[field] || 0), 0);

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b bg-red-600 text-white font-semibold text-base md:text-lg">
          Set Maximum Marks {className ? `- ${className}` : ""} {sectionName ? ` (${sectionName})` : ""}
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="border rounded px-3 py-2 w-full"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.className}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
            value={sectionId}
            onChange={(e) => {
              const val = e.target.value;
              setSectionId(val);
              const sec = sections.find(s => (s._id || s.id) === val || (s.sectionName || s.name) === val);
              setSectionName(sec?.sectionName || sec?.name || "");
            }}
            disabled={!selectedClassId}
          >
            <option value="">Select Section</option>
            {sections.map(sec => (
              <option key={sec._id || sec.id || sec.name} value={sec._id || sec.id || (sec.sectionName || sec.name)}>
                {sec.sectionName || sec.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded px-4 py-2 disabled:opacity-50 w-full md:w-auto"
            onClick={loadData}
            disabled={!selectedClassId || !sectionName || loading}
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>

        <div className="px-4 pb-4">
          {rows.length > 0 ? (
            <>
              {/* Component toggles per term */}
              <div className="mb-3 hidden md:flex gap-4 items-center">
                {examTypes.map(ex => (
                  <div key={ex.name} className="flex items-center gap-2 px-3 py-2 rounded border">
                    <span className={`px-2 py-0.5 rounded text-white text-sm ${ex.color}`}>{ex.name}</span>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={!!componentsEnabled[ex.name]?.i} onChange={(e) => {
                        const next = { ...componentsEnabled, [ex.name]: { ...componentsEnabled[ex.name], i: e.target.checked } };
                        // If disabling, zero out all i values for this term
                        if (!e.target.checked) {
                          const upd = rows.map(r => ({ ...r, [ex.name]: { ...(r[ex.name] || blankTerm()), i: 0 } }));
                          // recompute max
                          upd.forEach(r => { const en = next[ex.name] || {}; r[ex.name].max = (en.i ? r[ex.name].i : 0) + (en.ii ? r[ex.name].ii : 0) + (en.iii ? r[ex.name].iii : 0) + (en.iv ? r[ex.name].iv : 0) + (en.v ? r[ex.name].v : 0); });
                          setRows(upd);
                        }
                        setComponentsEnabled(next);
                      }} /> i
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={!!componentsEnabled[ex.name]?.ii} onChange={(e) => {
                        const next = { ...componentsEnabled, [ex.name]: { ...componentsEnabled[ex.name], ii: e.target.checked } };
                        if (!e.target.checked) {
                          const upd = rows.map(r => ({ ...r, [ex.name]: { ...(r[ex.name] || blankTerm()), ii: 0 } }));
                          upd.forEach(r => { const en = next[ex.name] || {}; r[ex.name].max = (en.i ? r[ex.name].i : 0) + (en.ii ? r[ex.name].ii : 0) + (en.iii ? r[ex.name].iii : 0) + (en.iv ? r[ex.name].iv : 0) + (en.v ? r[ex.name].v : 0); });
                          setRows(upd);
                        }
                        setComponentsEnabled(next);
                      }} /> ii
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={!!componentsEnabled[ex.name]?.iii} onChange={(e) => {
                        const next = { ...componentsEnabled, [ex.name]: { ...componentsEnabled[ex.name], iii: e.target.checked } };
                        if (!e.target.checked) {
                          const upd = rows.map(r => ({ ...r, [ex.name]: { ...(r[ex.name] || blankTerm()), iii: 0 } }));
                          upd.forEach(r => { const en = next[ex.name] || {}; r[ex.name].max = (en.i ? r[ex.name].i : 0) + (en.ii ? r[ex.name].ii : 0) + (en.iii ? r[ex.name].iii : 0) + (en.iv ? r[ex.name].iv : 0) + (en.v ? r[ex.name].v : 0); });
                          setRows(upd);
                        }
                        setComponentsEnabled(next);
                      }} /> iii
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={!!componentsEnabled[ex.name]?.iv} onChange={(e) => {
                        const next = { ...componentsEnabled, [ex.name]: { ...componentsEnabled[ex.name], iv: e.target.checked } };
                        if (!e.target.checked) {
                          const upd = rows.map(r => ({ ...r, [ex.name]: { ...(r[ex.name] || blankTerm()), iv: 0 } }));
                          upd.forEach(r => { const en = next[ex.name]; r[ex.name].max = (en.i ? r[ex.name].i : 0) + (en.ii ? r[ex.name].ii : 0) + (en.iii ? r[ex.name].iii : 0) + (en.iv ? r[ex.name].iv : 0) + (en.v ? r[ex.name].v : 0); });
                          setRows(upd);
                        }
                        setComponentsEnabled(next);
                      }} /> iv
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={!!componentsEnabled[ex.name]?.v} onChange={(e) => {
                        const next = { ...componentsEnabled, [ex.name]: { ...componentsEnabled[ex.name], v: e.target.checked } };
                        if (!e.target.checked) {
                          const upd = rows.map(r => ({ ...r, [ex.name]: { ...(r[ex.name] || blankTerm()), v: 0 } }));
                          upd.forEach(r => { const en = next[ex.name]; r[ex.name].max = (en.i ? r[ex.name].i : 0) + (en.ii ? r[ex.name].ii : 0) + (en.iii ? r[ex.name].iii : 0) + (en.iv ? r[ex.name].iv : 0) + (en.v ? r[ex.name].v : 0); });
                          setRows(upd);
                        }
                        setComponentsEnabled(next);
                      }} /> v
                    </label>
                  </div>
                ))}
              </div>
              {/* Desktop/tablet view */}
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full text-sm border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border py-2 px-3 bg-blue-100 text-left sticky left-0 z-10">Subject</th>
                    {examTypes.map(ex => {
                      const en = componentsEnabled[ex.name] || {};
                      const parts = ["i","ii","iii","iv","v"].filter(p => en[p]);
                      return (
                        <th key={ex.name} colSpan={parts.length + 1} className={`border text-center ${ex.color}`}>{ex.name}</th>
                      );
                    })}
                  </tr>
                  <tr>
                    <th className="border bg-blue-50 sticky left-0 z-10"></th>
                    {examTypes.map(ex => {
                      const en = componentsEnabled[ex.name] || {};
                      const parts = ["i","ii","iii","iv","v"].filter(p => en[p]);
                      return (
                        <React.Fragment key={ex.name}>
                          {parts.map(p => (<th key={`${ex.name}-${p}`} className="border bg-gray-50">{p}</th>))}
                          <th className="border bg-gray-50">Max</th>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="text-center">
                      <td className="border py-2 px-3 text-left font-medium bg-blue-50 sticky left-0 z-10">{r.subject}</td>
                      {examTypes.map(ex => {
                        const en = componentsEnabled[ex.name] || {};
                        const parts = ["i","ii","iii","iv","v"].filter(p => en[p]);
                        return (
                          <React.Fragment key={ex.name}>
                            {parts.map(p => (
                              <td key={p} className="border p-1">
                                <input
                                  type="number"
                                  className="w-20 md:w-24 lg:w-28 border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-300 outline-none"
                                  value={r?.[ex.name]?.[p] ?? 0}
                                  onChange={(e) => handleValueChange(i, ex.name, p, e.target.value)}
                                  min={0}
                                />
                              </td>
                            ))}
                            <td className="border p-1">
                              <input
                                type="number"
                                className="w-20 md:w-24 lg:w-28 border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-300 outline-none"
                                value={r?.[ex.name]?.max ?? 0}
                                readOnly
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Total Open Days Row */}
                  <tr className="bg-yellow-50">
                    <td className="border py-2 px-3 text-left font-medium bg-yellow-100 sticky left-0 z-10">Total Open Days</td>
                    {examTypes.map(ex => {
                      const en = componentsEnabled[ex.name] || {};
                      const parts = ["i","ii","iii","iv","v"].filter(p => en[p]);
                      return (
                        <td key={ex.name} colSpan={parts.length + 1} className="border p-1 text-center">
                          <input
                            type="number"
                            className="w-20 md:w-24 lg:w-28 border rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-300 outline-none bg-white"
                            value={rows[0]?.[`${ex.name}OpenDays`] ?? 0}
                            onChange={(e) => {
                              const updated = [...rows];
                              updated.forEach(row => {
                                row[`${ex.name}OpenDays`] = Number(e.target.value || 0);
                              });
                              setRows(updated);
                            }}
                            min={0}
                            placeholder="Days"
                          />
                        </td>
                      );
                    })}
                  </tr>  
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold text-center">
                    <td className="border py-2 px-3 text-left sticky left-0 z-10 bg-gray-100">Total</td>
                    {examTypes.map(ex => {
                      const en = componentsEnabled[ex.name] || {};
                      const parts = ["i","ii","iii","iv","v"].filter(p => en[p]);
                      return (
                        <React.Fragment key={ex.name}>
                          {parts.map(p => (<td key={`${ex.name}-${p}`} className="border">{totalFor(ex.name, p)}</td>))}
                          <td className="border">{totalFor(ex.name, "max")}</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tfoot>
                </table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {rows.map((r, i) => (
                  <div key={i} className="border rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2 font-semibold">{r.subject}</div>
                    <div className="p-3 space-y-3">
                      {examTypes.map(ex => (
                        <div key={ex.name} className="rounded-md border">
                          <div className={`px-3 py-2 text-sm font-medium ${ex.color}`}>{ex.name}</div>
                          <div className="p-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {(() => { const en = componentsEnabled[ex.name] || {}; const parts = ["i","ii","iii","iv","v"].filter(p => en[p]); return [...parts, 'max']; })().map(field => (
                              <div key={field} className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1 uppercase">{field}</label>
                                <input
                                  type="number"
                                  className="w-full border rounded px-3 py-2 text-center focus:ring-2 focus:ring-blue-300 outline-none"
                                  value={r?.[ex.name]?.[field] ?? 0}
                                  onChange={(e) => handleValueChange(i, ex.name, field, e.target.value)}
                                  min={0}
                                  readOnly={field === 'max'}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Total Open Days on mobile */}
                <div className="border rounded-lg overflow-hidden bg-yellow-50">
                  <div className="bg-yellow-100 px-4 py-2 font-semibold">Total Open Days</div>
                  <div className="p-3 space-y-3">
                    {examTypes.map(ex => (
                      <div key={ex.name} className="flex items-center gap-3">
                        <label className="font-medium text-sm w-20">{ex.name}:</label>
                        <input
                          type="number"
                          className="flex-1 border rounded px-3 py-2 text-center focus:ring-2 focus:ring-blue-300 outline-none bg-white"
                          value={rows[0]?.[`${ex.name}OpenDays`] ?? 0}
                          onChange={(e) => {
                            const updated = [...rows];
                            updated.forEach(row => {
                              row[`${ex.name}OpenDays`] = Number(e.target.value || 0);
                            });
                            setRows(updated);
                          }}
                          min={0}
                          placeholder="Days"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals on mobile */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-semibold">Totals</div>
                  <div className="p-3 space-y-3">
                    {examTypes.map(ex => {
                      const en = componentsEnabled[ex.name] || {};
                      const parts = ["i","ii","iii","iv","v"].filter(p => en[p]);
                      return (
                        <div key={ex.name} className="grid grid-cols-4 gap-2 text-sm">
                          <div className="font-medium">{ex.name}</div>
                          {parts.map(p => (
                            <div key={`${ex.name}-${p}`} className="text-right">{p}: {totalFor(ex.name, p)}</div>
                          ))}
                          <div className="col-span-4 text-right">Max: {totalFor(ex.name, "max")}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {loading ? "Loading..." : "Select class and section to view subjects"}
            </div>
          )}
        </div>

        <div className="px-4 pb-6">
          <div className="flex justify-center">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50 w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={rows.length === 0 || submitting || !className || !sectionName}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetMaximumMarks;
