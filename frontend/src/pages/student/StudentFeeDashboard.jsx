import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download, Eye } from 'lucide-react';
import { getStudentFees, generateReceiptPdf } from '../../api/studentFeeApi';
import jwt_decode from 'jwt-decode';

const StudentFeeDashboard = () => {
  const navigate = useNavigate();
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [expandedFeeId, setExpandedFeeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setStudentId(decoded.id); // Assuming 'id' is the student's ID in the token
        setSchoolId(decoded.schoolId);
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchStudentFeesData = useCallback(async () => {
    if (!studentId || !schoolId) return;
    setLoading(true);
    try {
      const response = await getStudentFees(studentId, { schoolId }); // Pass schoolId as query param
      setStudentFees(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch fee records');
      console.error('Fetch student fees error:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, schoolId]);

  useEffect(() => {
    fetchStudentFeesData();
  }, [fetchStudentFeesData]);

  const handleDownloadReceipt = async (feeId, receiptNumber) => {
    try {
      const blob = await generateReceiptPdf(feeId, receiptNumber);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to download receipt');
      console.error('Download receipt error:', error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedFeeId(expandedFeeId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Fee Dashboard</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading your fee records...</p>
        </div>
      ) : studentFees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No fee records found for you.
        </div>
      ) : (
        <div className="space-y-6">
          {studentFees.map((fee) => (
            <div key={fee._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(fee._id)}
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {fee.feeStructureId?.name || 'N/A'} - {fee.academicYear}
                  </h3>
                  <p className="text-sm text-gray-600">Class: {fee.classId?.className || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700">Total: <span className="font-bold">₹{fee.totalFee.toLocaleString('en-IN')}</span></p>
                  <p className="text-gray-700">Paid: <span className="font-bold text-green-600">₹{fee.paidAmount.toLocaleString('en-IN')}</span></p>
                  <p className="text-gray-700">Due: <span className="font-bold text-red-600">₹{fee.dueAmount.toLocaleString('en-IN')}</span></p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    fee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    fee.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {fee.status}
                  </span>
                </div>
              </div>

              {expandedFeeId === fee._id && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-3">Payment History</h4>
                  {fee.payments && fee.payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No.</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fee.payments.map((payment) => (
                            <tr key={payment.receiptNumber}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{payment.receiptNumber}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{payment.amount.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{payment.mode}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDownloadReceipt(fee._id, payment.receiptNumber)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                  title="Download Receipt"
                                >
                                  <Download size={16} /> Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No payments recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeeDashboard;
