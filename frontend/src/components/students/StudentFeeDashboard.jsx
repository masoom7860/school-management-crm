import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReceiptModal from '../../components/modals/ReceiptModal';

const StudentFeeDashboard = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const navigate = useNavigate();

  // Get student ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setStudentId(decoded.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch fee records
  useEffect(() => {
    if (studentId) {
      fetchFeeRecords();
    }
  }, [studentId]);

  const fetchFeeRecords = async () => {
    setLoading(true);
    try {
      // Updated the API endpoint to match the backend router
      const response = await axios.get(`/studentFee/student/${studentId}`);
      setFeeRecords(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch fee records');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandRecord = (id) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  const viewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setReceiptModalOpen(true);
  };

  const downloadReceipt = async (feeId, paymentId) => {
    try {
      const response = await axios.get(`/api/student-fees/${feeId}/receipt/${paymentId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee_receipt_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download receipt');
      console.error('Download error:', error);
    }
  };

  const downloadFullReceipt = async (feeId) => {
    try {
      const response = await axios.get(`/api/student-fees/${feeId}/full-receipt`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `full_fee_receipt_${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download full receipt');
      console.error('Download error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Fee Records</h1>

      {loading && feeRecords.length === 0 ? (
        <div className="text-center py-8">
          <LoadingSpinner size={8} />
        </div>
      ) : feeRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No fee records found for your account
        </div>
      ) : (
        <div className="space-y-4">
          {feeRecords.map(record => (
            <div key={record._id} className="border rounded-lg overflow-hidden">
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${
                  expandedRecord === record._id ? 'bg-gray-50 border-b' : ''
                }`}
                onClick={() => toggleExpandRecord(record._id)}
              >
                <div>
                  <h3 className="font-medium">
                    {record.academicYear} - {record.classDetails?.className || 'Unknown Class'}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Status: <span className={`font-medium ${
                        record.status === 'paid' ? 'text-green-600' : 
                        record.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Total: <span className="font-medium">₹{record.totalAmount.toLocaleString('en-IN')}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Paid: <span className="font-medium">₹{record.amountPaid.toLocaleString('en-IN')}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Balance: <span className="font-medium">₹{record.balance.toLocaleString('en-IN')}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFullReceipt(record._id);
                    }}
                    className="text-gray-600 hover:text-red-600 p-1 flex items-center gap-1"
                    title="Download Full Receipt"
                  >
                    <Download size={18} />
                  </button>
                  {expandedRecord === record._id ? (
                    <ChevronUp size={20} className="text-gray-500 ml-2" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500 ml-2" />
                  )}
                </div>
              </div>
              {expandedRecord === record._id && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Installments</h4>
                      <ul className="space-y-3">
                        {record.installments.map((inst, idx) => (
                          <li key={idx} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{inst.name}</h5>
                                <div className="text-sm text-gray-600 mt-1">
                                  Due: {new Date(inst.dueDate).toLocaleDateString()}
                                </div>
                                <div className={`text-sm mt-1 ${
                                  inst.status === 'paid' ? 'text-green-600' : 
                                  inst.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  Status: {inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">₹{inst.amount.toLocaleString('en-IN')}</div>
                                <div className="text-sm text-gray-600">
                                  Paid: ₹{inst.paidAmount.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                            {inst.paymentEntries.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <h6 className="text-sm font-medium mb-2">Payment History</h6>
                                <ul className="space-y-2">
                                  {inst.paymentEntries.map((payment, pIdx) => (
                                    <li key={pIdx} className="flex justify-between items-center text-sm">
                                      <div>
                                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                                        <span className="text-gray-600 ml-2">({payment.mode})</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">₹{payment.amount.toLocaleString('en-IN')}</span>
                                        {payment.receipt && (
                                          <button
                                            onClick={() => viewReceipt(payment.receipt)}
                                            className="text-red-600 hover:text-red-800 text-xs"
                                          >
                                            View Receipt
                                          </button>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Fee Components</h4>
                      <ul className="space-y-2">
                        {record.components.map((comp, idx) => (
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
                        <span>₹{record.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-3 text-gray-700">Payment History</h4>
                        {record.payments.length > 0 ? (
                          <ul className="space-y-2">
                            {record.payments.map((payment, idx) => (
                              <li key={idx} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">
                                      {new Date(payment.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {payment.mode} • {payment.reference || 'No reference'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">₹{payment.amount.toLocaleString('en-IN')}</span>
                                    {payment.receipt && (
                                      <button
                                        onClick={() => downloadReceipt(record._id, payment._id)}
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
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default StudentFeeDashboard;
