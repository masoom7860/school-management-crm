import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { getSessions } from '../../api/sessionsApi';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const TeacherAttendanceManagement = (props) => {
  // State variables
  const [attendanceDate, setAttendanceDate] = useState('');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [sendSMS, setSendSMS] = useState(true);
  const [smsLogs, setSmsLogs] = useState([]);
  const [showSmsLog, setShowSmsLog] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsOption, setSmsOption] = useState('absent'); // 'absent', 'present', 'all'
  const [role, setRole] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Get teacher info from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const decodedRole = decoded.role;
        setRole(decodedRole || localStorage.getItem('role') || '');

        const effectiveSchoolId = props?.schoolId || decoded.schoolId || localStorage.getItem('schoolId') || '';
        setSchoolId(effectiveSchoolId);

        if (decodedRole === 'teacher') {
          setTeacherId(decoded.id);
          fetchAssignedStudents(decoded.id, effectiveSchoolId);
        } else {
          fetchSessionsList();
          fetchTeachersList(effectiveSchoolId);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Invalid authentication token');
      }
    }
  }, []);

  const fetchTeachersList = async (currentSchoolId) => {
    if (!currentSchoolId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseURL}/api/teachers/all/${currentSchoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(Array.isArray(res.data?.teachers) ? res.data.teachers : []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    }
  };

  const fetchSessionsList = async () => {
    try {
      const res = await getSessions();
      setSessions(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setSessions([]);
    }
  };

  // Fetch assigned students
  const fetchAssignedStudents = async (teacherId, currentSchoolId) => {
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));
    if (!teacherId || !currentSchoolId || !isValidObjectId(teacherId)) {
      console.error('Missing teacherId or schoolId:', { teacherId, currentSchoolId });
      setError('Missing teacher or school information');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseURL}/api/students/teacher/${teacherId}/students?schoolId=${currentSchoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignedStudents(response.data.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      if (err?.response?.status === 404) {
        setAssignedStudents([]);
        setError(null);
      } else {
        setError('Failed to fetch assigned students');
      }
    }
  };

  const handleTeacherChange = (e) => {
    const id = e.target.value;
    setSelectedTeacherId(id);
    setTeacherId(id);
    setAssignedStudents([]);
    const isValidObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(String(val));
    if (id && schoolId && isValidObjectId(id)) {
      fetchAssignedStudents(id, schoolId);
    } else if (id && !isValidObjectId(id)) {
      setError('Please select a valid teacher from the list.');
    }
  };

  const handleSessionChange = (e) => {
    const id = e.target.value;
    setSelectedSessionId(id);
    const session = sessions.find(s => s._id === id);
    if (session) {
      try {
        const start = new Date(session.startDate).toISOString().slice(0, 10);
        const end = new Date(session.endDate).toISOString().slice(0, 10);
        setReportStartDate(start);
        setReportEndDate(end);
      } catch (_) {}
    }
  };

  // Handle attendance status change
  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Handle download report
  const handleDownloadReport = async () => {
    if (!teacherId) {
      setError('Please select a teacher first');
      return;
    }
    if (!reportStartDate || !reportEndDate) {
      setError('Please select both start and end dates for the report');
      return;
    }

    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${baseURL}/attendance/report?teacherId=${teacherId}&startDate=${reportStartDate}&endDate=${reportEndDate}&format=xlsx`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${reportStartDate}-to-${reportEndDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('Report downloaded successfully!');
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report');
    } finally {
      setReportLoading(false);
    }
  };

  // Function to send attendance SMS through BACKEND API
  const sendAttendanceSMS = async (student, status, date) => {
    // Check for parent phone number in different possible fields
    const parentPhone = student.parentPhone || 
                       student.parentId?.father?.mobile || 
                       student.parentId?.mother?.mobile ||
                       student.parent?.father?.mobile ||
                       student.parent?.mother?.mobile;
    
    if (!sendSMS || !parentPhone) {
      console.log('SMS not sent - missing phone or SMS disabled');
      return null;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Use BACKEND API to send SMS
      const response = await axios.post(
        `${baseURL}/api/sms/send-attendance-sms`,
        {
          studentId: student._id,
          studentName: student.name,
          parentPhone: parentPhone,
          status: status,
          date: date,
          schoolId: schoolId,
          teacherId: teacherId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Log the SMS
      const logEntry = {
        studentName: student.name,
        phone: parentPhone,
        message: response.data.data?.message || `Your child ${student.name} was marked ${status} on ${date}.`,
        templateId: '1707172506548994059',
        status: response.data.success ? 'Sent' : 'Failed',
        time: new Date().toLocaleString(),
        messageId: response.data.data?.messageId,
        response: response.data
      };
      
      setSmsLogs(prev => [...prev, logEntry]);
      return logEntry;
      
    } catch (error) {
      console.error('Failed to send attendance SMS:', error);
      
      // Log failed SMS
      const logEntry = {
        studentName: student.name,
        phone: parentPhone,
        message: `Your child ${student.name} was marked ${status} on ${date}.`,
        templateId: '1707172506548994059',
        status: 'Failed',
        time: new Date().toLocaleString(),
        error: error.response?.data?.message || error.message
      };
      
      setSmsLogs(prev => [...prev, logEntry]);
      return null;
    }
  };

  // Fetch SMS logs from backend
  const fetchSmsLogs = async () => {
    setSmsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${baseURL}/api/sms/logs?teacherId=${teacherId}&schoolId=${schoolId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSmsLogs(response.data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      setError('Failed to fetch SMS logs');
    } finally {
      setSmsLoading(false);
    }
  };

  // Handle toggle SMS log view
  const handleToggleSmsLog = () => {
    if (!teacherId) {
      setError('Please select a teacher first');
      return;
    }
    if (!showSmsLog) {
      fetchSmsLogs();
    }
    setShowSmsLog(!showSmsLog);
  };

  // Modify handleMarkBatchAttendance to include SMS for both absent and present
  const handleMarkBatchAttendance = async () => {
    if (!attendanceDate) {
      setMessage("Please select a date to mark attendance.");
      return;
    }
    if (!teacherId) {
      setError('Please select a teacher first');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // First, save attendance records
      const attendanceRecords = assignedStudents.map(student => ({
        studentId: student._id,
        schoolId: schoolId,
        date: attendanceDate,
        status: attendanceStatus[student._id] || 'Absent',
        recordedBy: teacherId,
        note: '',
      }));

      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/attendance/batch`, 
        { attendanceRecords }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("Attendance marked successfully!");
      
      // Send SMS notifications based on selected option
      if (sendSMS) {
        let studentsToNotify = [];
        
        switch(smsOption) {
          case 'absent':
            studentsToNotify = assignedStudents.filter(
              student => (attendanceStatus[student._id] || 'Absent') === 'Absent'
            );
            break;
          case 'present':
            studentsToNotify = assignedStudents.filter(
              student => (attendanceStatus[student._id] || 'Absent') === 'Present'
            );
            break;
          case 'all':
            studentsToNotify = assignedStudents.filter(
              student => attendanceStatus[student._id] // Only those with status set
            );
            break;
          default:
            studentsToNotify = [];
        }
        
        if (studentsToNotify.length > 0) {
          setMessage(prev => prev + ` Sending SMS notifications for ${studentsToNotify.length} students...`);
          
          let smsCount = 0;
          let failedCount = 0;
          
          // Process SMS sequentially to avoid rate limiting
          for (const student of studentsToNotify) {
            const status = attendanceStatus[student._id] || 'Absent';
            const result = await sendAttendanceSMS(student, status, attendanceDate);
            if (result && result.status === 'Sent') {
              smsCount++;
            } else {
              failedCount++;
            }
            
            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          if (smsCount > 0) {
            setMessage(prev => prev + ` SMS notifications sent to ${smsCount} parents.`);
          }
          if (failedCount > 0) {
            setMessage(prev => prev + ` ${failedCount} SMS failed to send.`);
          }
        } else {
          setMessage(prev => prev + " No students to send SMS notifications for.");
        }
      }
      
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  // Get SMS statistics
  const getSmsStats = () => {
    const total = smsLogs.length;
    const sent = smsLogs.filter(log => log.status === 'Sent').length;
    const failed = smsLogs.filter(log => log.status === 'Failed').length;
    
    return { total, sent, failed };
  };

  const smsStats = getSmsStats();

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Attendance Management</h1>

      {role !== 'teacher' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Session</label>
              <select
                className="p-2 border border-gray-300 rounded-md w-full"
                value={selectedSessionId}
                onChange={handleSessionChange}
              >
                <option value="">Select Session</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>{s.yearRange}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
              <select
                className="p-2 border border-gray-300 rounded-md w-full"
                value={selectedTeacherId}
                onChange={handleTeacherChange}
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Message and Error Display */}
      {message && (
        <div className="mb-4 p-4 bg-red-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Mark Attendance Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Mark Attendance for {attendanceDate || 'Select Date'}
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date:
          </label>
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-md w-full max-w-xs"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        {/* SMS Toggle */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="sendSMS"
            checked={sendSMS}
            onChange={(e) => setSendSMS(e.target.checked)}
            className="mr-2 h-5 w-5 text-blue-600"
          />
          <label htmlFor="sendSMS" className="text-sm font-medium text-gray-700">
            Send SMS notifications to parents
          </label>
        </div>

        {/* SMS Options */}
        {sendSMS && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send SMS for:
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="smsOption"
                  value="absent"
                  checked={smsOption === 'absent'}
                  onChange={(e) => setSmsOption(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Absent Students Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="smsOption"
                  value="present"
                  checked={smsOption === 'present'}
                  onChange={(e) => setSmsOption(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Present Students Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="smsOption"
                  value="all"
                  checked={smsOption === 'all'}
                  onChange={(e) => setSmsOption(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">All Students</span>
              </label>
            </div>
          </div>
        )}

        {/* SMS Statistics */}
        {smsStats.total > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">SMS Statistics:</h3>
            <div className="flex space-x-4 text-xs">
              <span className="text-green-600">✅ Sent: {smsStats.sent}</span>
              <span className="text-red-600">❌ Failed: {smsStats.failed}</span>
              <span className="text-blue-600">📊 Total: {smsStats.total}</span>
            </div>
          </div>
        )}

        {/* View SMS Log Button */}
        <button
          onClick={handleToggleSmsLog}
          className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium"
          disabled={smsLoading}
        >
          {smsLoading ? 'Loading...' : (showSmsLog ? 'Hide SMS Logs' : 'View SMS Logs')}
        </button>

        {/* SMS Logs */}
        {showSmsLog && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-2 text-gray-800">SMS History</h3>
            {smsLogs.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No SMS records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Message
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {smsLogs.map((log, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {log.studentName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {log.phone}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                          {log.message}
                        </td>
                        <td
                          className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                            log.status === 'Sent'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {log.status}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {log.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Student list and status selection */}
        {attendanceDate && assignedStudents.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="font-bold text-gray-700">STUDENT NAME</div>
              <div className="font-bold text-gray-700">STATUS</div>
              
              {assignedStudents.map(student => (
                <React.Fragment key={student._id}>
                  <div className="p-2 border-b">{student.name}</div>
                  <div className="p-2 border-b">
                    <select
                      className="p-2 border border-gray-300 rounded-md w-full"
                      value={attendanceStatus[student._id] || ''}
                      onChange={(e) => handleStatusChange(student._id, e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <button
              onClick={handleMarkBatchAttendance}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </>
        )}
        {attendanceDate && assignedStudents.length === 0 && (
          <p className="text-gray-600">No students assigned to you.</p>
        )}
      </div>

      <hr className="my-8 border-gray-300" />

      {/* Download Report Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Download Attendance Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date:
            </label>
            <input
              type="date"
              className="p-2 border border-gray-300 rounded-md w-full"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date:
            </label>
            <input
              type="date"
              className="p-2 border border-gray-300 rounded-md w-full"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={reportLoading}
        >
          {reportLoading ? 'Generating...' : 'Download Report'}
        </button>
      </div>
    </div>
  );
};

export default TeacherAttendanceManagement;