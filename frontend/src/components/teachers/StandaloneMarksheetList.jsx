import React, { useState, useEffect } from 'react';
import api from '../../api/marksheetsApi';
import { toast } from 'react-hot-toast';

const StandaloneMarksheetList = () => {
  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    classId: '', 
    studentId: '', 
    examId: '', 
    session: '' 
  });
  
  // Dropdown data
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const userRole = localStorage.getItem('role');
        const studentParams = {};
        if (schoolId) studentParams.schoolId = schoolId;
        
        if (userRole === 'teacher') {
          const teacherId = localStorage.getItem('teacherId');
          if (teacherId) studentParams.teacherId = teacherId;
        }

        const [clsRes, stuRes, examRes] = await Promise.all([
          api.getClasses(),
          api.getStudents(studentParams),
          api.getExams()
        ]);
        
        setClasses(clsRes?.data || clsRes || []);
        setStudents(stuRes?.data || stuRes || []);
        setExams(examRes?.data || examRes || []);
      } catch (err) {
        console.error('Error loading initial data:', err);
        toast.error('Failed to load data');
      }
    };
    
    loadInitialData();
    loadList();
  }, []);

  // Load marksheet list
  const loadList = async () => {
    setLoading(true);
    try {
      const res = await api.listMarksheets({ ...filters });
      setItems(res?.data || []);
    } catch (err) {
      console.error('Error loading marksheets:', err);
      toast.error('Failed to load marksheets');
    } finally {
      setLoading(false);
    }
  };

  // Edit marksheet
  // const editItem = (item) => {
  //   toast.info('Edit functionality - redirect to marksheet management');
  //   // You could navigate to the marksheet management page here
  // };

  // Delete marksheet
  const delItem = async (id) => {
    if (!confirm('Delete marksheet?')) return;
    try {
      await api.deleteMarksheet(id);
      toast.success('Deleted successfully');
      loadList();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    }
  };

  // Download PDF
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
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('PDF download failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-6 py-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            MARKSHEET RECORDS
          </h1>
          <p className="text-blue-100 mt-1">Academic Performance Management System</p>
        </div>
        
        {/* Filters Section */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select 
              value={filters.classId} 
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })} 
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">🎓 All Classes</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
            </select>
            <select 
              value={filters.studentId} 
              onChange={(e) => setFilters({ ...filters, studentId: e.target.value })} 
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">👨‍🎓 All Students</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select 
              value={filters.examId} 
              onChange={(e) => setFilters({ ...filters, examId: e.target.value })} 
              className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">📝 All Exams</option>
              {exams.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}
            </select>
            <button 
              onClick={loadList} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading marksheet records...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Records Found</h3>
            <p className="text-gray-600">No marksheet records match your current filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((m) => (
            <div key={m._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Marksheet Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b-4 border-blue-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">SCHOOL MARKSHEET</h2>
                    <p className="text-gray-300 text-sm">Academic Performance Report</p>
                  </div>
                  <div className="text-right text-white">
                    <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm">Session: {m.session}</p>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Student Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {m.studentId?.name}</p>
                      <p><span className="font-medium">Roll No:</span> {m.studentId?.rollNumber || 'N/A'}</p>
                      <p><span className="font-medium">Father:</span> {m.studentId?.fatherName || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Academic Details
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Class:</span> {m.classId?.className}</p>
                      <p><span className="font-medium">Section:</span> {m.sectionId?.name || m.sectionId?.sectionName || 'N/A'}</p>
                      <p><span className="font-medium">Exam:</span> {m.examId?.title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Performance Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-lg font-bold text-gray-800">{m.totalObtained}/{m.totalMaxMarks}</p>
                        <p className="text-sm text-gray-600">Total Marks</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-blue-100 rounded-lg p-2 flex-1 text-center">
                          <p className="font-bold text-blue-800">{m.percentage}%</p>
                          <p className="text-xs text-blue-600">Percentage</p>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-2 flex-1 text-center">
                          <p className="font-bold text-purple-800">{m.grade}</p>
                          <p className="text-xs text-purple-600">Grade</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Status */}
              <div className="px-6 py-4 bg-white border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">Result Status:</span>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${m.status === 'PASS' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                      {m.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
                    </div>
                    <span className={`text-sm ${m.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                      ({m.status === 'PASS' ? 'Promoted to next class' : 'Not promoted'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex flex-wrap gap-3 justify-center">
                  {/* <button 
                    onClick={() => alert(JSON.stringify(m, null, 2))} 
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="View Full Details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                   */}
                  {/* <button 
                    onClick={() => editItem(m)} 
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Edit Marksheet"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button> */}
                  
                  <button 
                    onClick={() => delItem(m._id)} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Delete Marksheet"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                  
                  <button 
                    onClick={() => downloadPdf(m._id)} 
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Download Official Marksheet PDF"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    📄 Download PDF
                  </button>
                </div>
              </div>

              {/* Footer Note */}
              <div className="px-6 py-3 bg-gray-100 border-t text-center">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> University does not own for the errors or omissions, if any, in this statement.
                  <br />
                  Correction, if any to be reported within 7 days of publication of Result.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StandaloneMarksheetList;
