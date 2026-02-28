import React, { useState, useEffect } from 'react';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void; // Define a more specific type later
  initialData?: { // Add initialData prop
    studentId: string;
    academicYear: string;
    amount: string | number;
    paymentMethod: string;
    transactionId: string;
    notes: string;
  };
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  // Initialize state from initialData prop
  const [studentId, setStudentId] = useState(initialData?.studentId || '');
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear || ''); // Add academicYear state
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [paymentDate, setPaymentDate] = useState(''); // Keep paymentDate as empty initially or set to current date
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || '');
  const [transactionId, setTransactionId] = useState(initialData?.transactionId || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Update state when initialData changes (e.g., when modal is opened with a new record)
  useEffect(() => {
    if (initialData) {
      setStudentId(initialData.studentId || '');
      setAcademicYear(initialData.academicYear || '');
      setAmount(initialData.amount?.toString() || '');
      // setPaymentDate(''); // Decide if you want to reset date or keep it
      setPaymentMethod(initialData.paymentMethod || '');
      setTransactionId(initialData.transactionId || '');
      setNotes(initialData.notes || '');
    } else {
       // Reset form when modal is closed or initialData is null
       setStudentId('');
       setAcademicYear('');
       setAmount('');
       setPaymentDate('');
       setPaymentMethod('');
       setTransactionId('');
       setNotes('');
    }
  }, [initialData]);


  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const paymentData = {
      studentId,
      academicYear, // Include academicYear
      amount: parseFloat(amount), // Convert amount to number
      paymentDate,
      paymentMethod,
      transactionId,
      notes,
    };
    onSubmit(paymentData);
    // Clear form fields after submission (optional, depending on desired behavior)
    // State is now reset via useEffect when initialData becomes null on modal close
    // setStudentId('');
    // setAcademicYear('');
    // setAmount('');
    // setPaymentDate('');
    // setPaymentMethod('');
    // setTransactionId('');
    // setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Manual Payment</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Student ID and Academic Year fields - display only, should be passed via initialData */}
          <div className="mb-4">
            <label htmlFor="studentId" className="block text-gray-700 font-bold mb-2">Student ID:</label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              readOnly // Make read-only as it comes from selected record
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
            />
          </div>
           <div className="mb-4">
            <label htmlFor="academicYear" className="block text-gray-700 font-bold mb-2">Academic Year:</label>
            <input
              id="academicYear"
              type="text"
              value={academicYear}
              readOnly // Make read-only as it comes from selected record
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 font-bold mb-2">Amount Paid:</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="paymentDate" className="block text-gray-700 font-bold mb-2">Payment Date:</label>
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-gray-700 font-bold mb-2">Payment Method:</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option> {/* Updated from Online Transfer */}
              <option value="Other">Other</option> {/* Added Other */}
            </select>
          </div>
          {paymentMethod === 'Cheque' || paymentMethod === 'Bank Transfer' ? (
            <div className="mb-4">
              <label htmlFor="transactionId" className="block text-gray-700 font-bold mb-2">Transaction ID/Cheque Number:</label>
              <input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          ) : null}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-gray-700 font-bold mb-2">Notes:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-y"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentModal;
