import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { getStudentFees as apiGetStudentFees, generateReceiptPdf } from '../../api/studentFeeApi';

const StudentFeeDashboard = () => {
  const [feeRecords, setFeeRecords] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [schoolId, setSchoolId] = useState(''); 
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setStudentId(decoded.id);
      setSchoolId(decoded.schoolId);
      // Ensure axiosInstance attaches School-ID header consistently
      if (decoded.schoolId) localStorage.setItem('schoolId', decoded.schoolId);
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Invalid session. Please login again.');
    }
  }, []);

  const fetchFeeRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetStudentFees(studentId);
      setFeeRecords(res?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch fee records');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, schoolId]);

  useEffect(() => {
    if (studentId && schoolId) {
      fetchFeeRecords();
    }
  }, [studentId, schoolId, fetchFeeRecords]);

  const yearOptions = React.useMemo(() => {
    const unique = Array.from(new Set(feeRecords.map(r => r.academicYear).filter(Boolean)));
    const sorted = unique.sort((a, b) => {
      const start = (yr) => {
        const m = /^(\d{4})-(\d{4})$/.exec(yr || '');
        return m ? parseInt(m[1], 10) : -Infinity;
      };
      return start(b) - start(a);
    });
    return sorted;
  }, [feeRecords]);

  useEffect(() => {
    if (!selectedYear && yearOptions.length > 0) {
      setSelectedYear(yearOptions[0]);
    }
  }, [yearOptions, selectedYear]);

  const toggleExpandRecord = (id) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  const downloadReceipt = async (feeId, paymentId) => {
    try {
      const pdfBlob = await generateReceiptPdf(feeId, paymentId);
      
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.setAttribute('hidden', '');
      link.setAttribute('href', url);
      link.setAttribute('download', `fee_receipt_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download receipt');
      console.error('Download error:', error);
    }
  };

  const currentYearFeeRecord = feeRecords.find(record => record.academicYear === selectedYear);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">My Fee Records</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Academic Year</label>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading fee records...</div>
      ) : !currentYearFeeRecord ? ( 
        <div className="text-center py-8 text-gray-500">
          {yearOptions.length === 0 ? 'No fee records found for your account.' : 'No fee record found for the selected academic year.'}
        </div>
      ) : (
        <div className="space-y-4">
          <div key={currentYearFeeRecord._id} className="border rounded-lg overflow-hidden">
            <div
              className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${
                expandedRecord === currentYearFeeRecord._id ? 'bg-gray-50 border-b' : ''
              }`}
              onClick={() => toggleExpandRecord(currentYearFeeRecord._id)}
            >
              <div>
                <h3 className="font-medium">
                  {currentYearFeeRecord.academicYear} - {currentYearFeeRecord.classId?.className || 'Unknown Class'}
                </h3>
                <div className="flex flex-wrap gap-4 mt-1">
                  <span className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${
                      currentYearFeeRecord.status === 'Paid' ? 'text-green-600' :
                      currentYearFeeRecord.status === 'Partially Paid' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {currentYearFeeRecord.status}
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Total: <span className="font-medium">₹{Number(currentYearFeeRecord.totalFee || 0).toLocaleString('en-IN')}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Paid: <span className="font-medium">₹{Number(currentYearFeeRecord.paidAmount || 0).toLocaleString('en-IN')}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Principal Due: <span className="font-medium">₹{Number(currentYearFeeRecord.dueAmount || 0).toLocaleString('en-IN')}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Late Fee Due: <span className="font-medium">₹{Number(currentYearFeeRecord.lateFeeDue || 0).toLocaleString('en-IN')}</span>
                  </span>
                  <span className="text-sm text-gray-800">
                    Total Due: <span className="font-bold">₹{Number((currentYearFeeRecord.totalDueWithLate != null ? currentYearFeeRecord.totalDueWithLate : Number(currentYearFeeRecord.dueAmount || 0) + Number(currentYearFeeRecord.lateFeeDue || 0)) || 0).toLocaleString('en-IN')}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedRecord === currentYearFeeRecord._id ? (
                  <ChevronUp size={20} className="text-gray-500 ml-2" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500 ml-2" />
                )}
              </div>
            </div>
            {expandedRecord === currentYearFeeRecord._id && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">Fee Components</h4>
                    <ul className="space-y-2">
                      {Array.isArray(currentYearFeeRecord.feeStructureId?.components) && currentYearFeeRecord.feeStructureId.components.map((comp, idx) => (
                        <li key={idx} className="flex justify-between py-1 border-b border-gray-100">
                          <div>
                            <span className="text-gray-700">{comp.name}</span>
                            {comp.isTaxable && (
                              <span className="text-xs text-gray-500 ml-2">(+{comp.taxRate}% tax)</span>
                            )}
                          </div>
                          <span className="font-medium">₹{comp.amount.toLocaleString('en-IN')}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>₹{Number(currentYearFeeRecord.totalFee || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-3 text-gray-700">Payment History</h4>
                      {Array.isArray(currentYearFeeRecord.payments) && currentYearFeeRecord.payments.length > 0 ? (
                        <ul className="space-y-2">
                          {currentYearFeeRecord.payments.map((payment, idx) => (
                            <li key={idx} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">
                                    {new Date(payment.date).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {payment.mode} • {payment.remark || payment.receiptNumber || 'No details'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">₹{payment.amount.toLocaleString('en-IN')}</span>
                                  {payment.receiptNumber && (
                                    <button
                                      onClick={() => downloadReceipt(currentYearFeeRecord._id, payment.receiptNumber)}
                                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                                    >
                                      <Download size={16} /> Receipt
                                    </button>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No payment history available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeDashboard;
