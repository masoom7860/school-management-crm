import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { ArrowLeft, DollarSign, Download, Mail } from 'lucide-react'; // Icons

const StudentFeeDetail = ({ studentId, onBack, onAddPayment, onDownloadReceipt }) => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(null); // To show history for a specific record
  const [token, setToken] = useState(null); // State to hold the token

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      toast.error("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }
    setToken(storedToken);
  }, []); // Run once on mount to get the token

  useEffect(() => {
    if (studentId && token) { // Fetch data only when studentId and token are available
      fetchStudentFeeDetails();
    }
  }, [studentId, token]); // Depend on studentId and token

  const fetchStudentFeeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the existing backend endpoint to get student fee records by student ID
      const response = await axiosInstance.get(`/api/student-fees/student/${studentId}`);
      // The backend endpoint /studentFee/student/:studentId returns { data: feeRecordsArray }
      setFeeRecords(response.data.data); // Assuming response.data.data is the array of fee records
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student fee details:", err);
      setError(err.response?.data?.message || "Failed to load student fee details.");
      setLoading(false);
    }
  };

  // Handler to trigger adding offline payment modal
  const handleAddPaymentClick = (feeRecord) => {
      if (onAddPayment) {
          onAddPayment(feeRecord); // Call the prop function
      }
  };

   // Handler to trigger receipt viewer modal
  const handleViewReceiptClick = (payment) => {
       if (onDownloadReceipt) {
           onDownloadReceipt(payment); // Call the prop function
       }
   };


  if (loading) {
    return <div className="text-center py-8">Loading student fee details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  // The backend endpoint /studentFee/student/:studentId now populates student and class details.
  // We can display student name and class name from the fee records.
  const studentName = feeRecords.length > 0
    ? (feeRecords[0].studentId?.name || `${feeRecords[0].studentId?.firstName || ''} ${feeRecords[0].studentId?.lastName || ''}`.trim())
    : 'N/A';

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <button
        onClick={onBack}
        className="mb-4 text-red-600 hover:underline flex items-center"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Student List
      </button>

      {/* Display student name if available from the first record */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Student Fee Details {studentName !== 'N/A' && `for ${studentName}`}
      </h2>

      {feeRecords.length === 0 ? (
        <p className="text-gray-500">No fee records found for this student.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeRecords.map(record => (
                <React.Fragment key={record._id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.academicYear || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.studentId?.classId?.className || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{record.totalFee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{record.amountPaid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{record.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            record.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {record.balance > 0 && (
                            <button
                                onClick={() => handleAddPaymentClick(record)} // Pass the fee record to the handler
                                className="text-green-600 hover:text-green-900 mr-4"
                                title="Add Offline Payment"
                            >
                                <DollarSign className="w-5 h-5 inline-block" />
                            </button>
                       )}
                      <button
                          onClick={() => setShowPaymentHistory(showPaymentHistory === record._id ? null : record._id)}
                          className="text-red-600 hover:underline"
                      >
                          {showPaymentHistory === record._id ? 'Hide History' : 'View History'}
                      </button>
                    </td>
                  </tr>
                  {/* Payment History Row */}
                  {showPaymentHistory === record._id && (
                      <tr>
                          <td colSpan="8" className="px-6 py-4 bg-gray-50"> {/* Adjusted colspan */}
                              <h4 className="text-md font-semibold mb-2">Payment History:</h4>
                              {record.paymentHistory.length > 0 ? (
                                  <ul className="list-disc list-inside text-sm text-gray-700">
                                      {record.paymentHistory.map((payment, pIndex) => (
                                          // Only show history entries with amount paid
                                          payment.amount > 0 && (
                                              <li key={pIndex} className="mb-2">
                                                  Amount: ₹{payment.amount} on {new Date(payment.date).toLocaleDateString()} ({payment.mode})
                                                  {payment.transactionId && ` - Txn ID: ${payment.transactionId}`}
                                                  {payment.note && ` - Note: ${payment.note}`}
                                                  {payment.status && ` - Status: ${payment.status}`}
                                                  {/* Receipt Buttons for this payment entry */}
                                                  {/* Only show receipt options for captured or manual payments */}
                                                  {(payment.status === 'captured' || payment.mode === 'Manual') && (
                                                      <div className="ml-4 inline-flex space-x-2">
                                                           <button
                                                              onClick={() => handleViewReceiptClick(payment)} // Pass the payment object
                                                              className="text-purple-600 hover:underline text-xs"
                                                          >
                                                              <Download className="w-3 h-3 inline-block mr-1" /> View/Download
                                                          </button>
                                                           {/* Emailing receipt might be an admin/superadmin function, but keeping for now */}
                                                           {/* <button
                                                              onClick={() => handleEmailReceipt(record._id, payment._id)} // Pass feeRecordId and paymentId
                                                              className="text-red-600 hover:underline text-xs"
                                                           >
                                                               <Mail className="w-3 h-3 inline-block mr-1" /> Email
                                                           </button> */}
                                                      </div>
                                                  )}
                                              </li>
                                          )
                                      ))}
                                  </ul>
                              ) : (
                                  <p className="text-gray-600">No payment history for this record.</p>
                              )}
                          </td>
                      </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentFeeDetail;
