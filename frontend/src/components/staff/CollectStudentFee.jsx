import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from '../Modal'; // Assuming a generic Modal component exists
import useAuth from '../../hooks/useAuth'; // Assuming an auth hook to get user/school info

const CollectStudentFee = () => {
  const { user } = useAuth(); // Get logged-in user and school info
  const schoolId = user?.schoolId;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFeeRecords, setStudentFeeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentFeeRecord, setCurrentFeeRecord] = useState(null); // The fee record being paid against
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    mode: 'Cash',
    reference: '',
    note: '',
    paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    deviceId: 'web-browser-manual', // Identifier for manual web payments
  });

  // Fetch student fee records when a student is selected
  useEffect(() => {
    if (selectedStudent && schoolId) {
      fetchStudentFeeRecords(selectedStudent._id, schoolId);
    } else {
      setStudentFeeRecords([]);
    }
  }, [selectedStudent, schoolId]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Assuming a student search API exists, e.g., /api/students/search?q=...
      // This API should ideally filter by schoolId based on the logged-in user
      const res = await axios.get(`/api/students/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.data); // Assuming data is in res.data.data
      setLoading(false);
    } catch (err) {
      console.error('Error searching students:', err);
      setError('Failed to search students.');
      setLoading(false);
      toast.error('Failed to search students.');
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setSearchResults([]); // Clear search results after selection
    setSearchQuery(`${student.firstName} ${student.lastName} (${student.rollNumber})`); // Display selected student
  };

  const fetchStudentFeeRecords = async (studentId, schoolId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Assuming API endpoint to get fees for a specific student
      // The existing getStudentFeesBySchool might work if it supports filtering by studentId
      // Let's assume a dedicated endpoint or query param for student ID
      const res = await axios.get(`/api/student-fees/school/${schoolId}?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentFeeRecords(res.data.data); // Assuming data is in res.data.data
      setLoading(false);
    } catch (err) {
      console.error('Error fetching student fee records:', err);
      setError('Failed to fetch student fee records.');
      setLoading(false);
      toast.error('Failed to fetch student fee records.');
    }
  };

  const openPaymentModal = (feeRecord) => {
    setCurrentFeeRecord(feeRecord);
    setPaymentFormData({
      amount: feeRecord.balance > 0 ? feeRecord.balance : 0, // Default to outstanding balance
      mode: 'Cash',
      reference: '',
      note: '',
      paymentDate: new Date().toISOString().split('T')[0],
      deviceId: 'web-browser-manual',
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData({ ...paymentFormData, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!currentFeeRecord) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Use the existing submitOfflinePayment controller, which seems suitable for manual entry
      const res = await axios.post('/api/student-fees/offline-payment', {
        headers: { Authorization: `Bearer ${token}` }
      }, {
        studentId: selectedStudent._id,
        academicYear: currentFeeRecord.academicYear, // Need academic year for the payment
        ...paymentFormData,
        amount: parseFloat(paymentFormData.amount), // Ensure amount is a number
      });

      toast.success('Payment recorded successfully!');
      setIsPaymentModalOpen(false);
      setLoading(false);
      fetchStudentFeeRecords(selectedStudent._id, schoolId); // Refresh fee records

      // Optional: Trigger receipt generation after successful payment
      // Assuming the response includes the new payment entry ID or the updated fee record
      // const newPaymentEntryId = res.data.data.paymentEntry._id;
      // window.open(`/api/student-fees/receipt/${currentFeeRecord._id}/${newPaymentEntryId}?type=payment`, '_blank');

    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Failed to record payment.');
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  const handleDownloadReceipt = (feeRecordId, paymentId) => {
    // Assuming the generateReceipt API is at /api/student-fees/receipt/:feeId/:paymentId
    window.open(`/api/student-fees/receipt/${feeRecordId}/${paymentId}?type=payment`, '_blank');
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Collect Student Fee</h1>

      {/* Student Search */}
      <form onSubmit={handleSearch} className="mb-4 flex">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="flex-1 border border-gray-300 rounded-l-md shadow-sm p-2"
          placeholder="Search student by name or roll number"
        />
        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded-r-md hover:bg-red-600"
        >
          Search
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-gray-300 rounded-md mb-4 max-h-40 overflow-y-auto">
          {searchResults.map(student => (
            <div
              key={student._id}
              className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
              onClick={() => selectStudent(student)}
            >
              {student.firstName} {student.lastName} ({student.rollNumber}) - {student.classId?.className || 'N/A'}
            </div>
          ))}
        </div>
      )}

      {/* Selected Student Info and Fee Records */}
      {selectedStudent && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Selected Student: {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.rollNumber})</h2>
          {loading ? (
            <div>Loading fee records...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : studentFeeRecords.length === 0 ? (
            <div>No fee records found for this student.</div>
          ) : (
            <div className="space-y-4">
              {studentFeeRecords.map(feeRecord => (
                <div key={feeRecord._id} className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">
                    {feeRecord.academicYear} - {feeRecord.feeStructure?.name || 'Fee Record'}
                  </h3>
                  <p><strong>Total Amount:</strong> {feeRecord.totalAmount.toFixed(2)}</p>
                  <p><strong>Amount Paid:</strong> {feeRecord.amountPaid.toFixed(2)}</p>
                  <p><strong>Balance Due:</strong> {feeRecord.balance.toFixed(2)}</p>
                  <p><strong>Status:</strong> {feeRecord.status}</p>

                  <h4 className="font-medium mt-2 mb-1">Installments:</h4>
                  <ul className="list-disc list-inside">
                    {feeRecord.installments.map(inst => (
                      <li key={inst._id}>
                        {inst.name}: {inst.amount.toFixed(2)} (Due: {new Date(inst.dueDate).toLocaleDateString()}) - Paid: {inst.paidAmount.toFixed(2)} (Status: {inst.status})
                      </li>
                    ))}
                  </ul>

                  <h4 className="font-medium mt-2 mb-1">Payments:</h4>
                   {feeRecord.payments && feeRecord.payments.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {feeRecord.payments.map(payment => (
                        <li key={payment._id}>
                          {new Date(payment.date).toLocaleDateString()}: {payment.amount.toFixed(2)} ({payment.mode}) - Ref: {payment.reference}
                           <button
                             onClick={() => handleDownloadReceipt(feeRecord._id, payment._id)}
                             className="ml-2 text-red-500 hover:underline text-sm"
                           >
                             Download Receipt
                           </button>
                        </li>
                      ))}
                    </ul>
                   ) : (
                     <p>No payments recorded yet.</p>
                   )}


                  {feeRecord.balance > 0 && (
                    <button
                      onClick={() => openPaymentModal(feeRecord)}
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Record Payment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        {currentFeeRecord && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <p><strong>Paying for:</strong> {selectedStudent?.firstName} {selectedStudent?.lastName} - {currentFeeRecord.academicYear}</p>
              <p><strong>Outstanding Balance:</strong> {currentFeeRecord.balance.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                name="amount"
                value={paymentFormData.amount}
                onChange={handlePaymentInputChange}
                required
                min="0.01"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
              <select
                name="mode"
                value={paymentFormData.mode}
                onChange={handlePaymentInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                {['Cash', 'Cheque', 'Bank Transfer', 'Other'].map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={paymentFormData.paymentDate}
                onChange={handlePaymentInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference (e.g., Cheque No, Txn ID, Receipt No)</label>
              <input
                type="text"
                name="reference"
                value={paymentFormData.reference}
                onChange={handlePaymentInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Note</label>
              <textarea
                name="note"
                value={paymentFormData.note}
                onChange={handlePaymentInputChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CollectStudentFee;
