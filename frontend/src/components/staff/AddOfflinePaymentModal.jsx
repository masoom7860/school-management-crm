import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';


const AddOfflinePaymentModal = ({ feeRecord, onClose, schoolId, token }) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    mode: 'Cash', // Default mode
    transactionId: '', // Optional for Cheque/Bank
    note: '', // Optional note
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
      // Reset form data when feeRecord changes (e.g., modal is opened for a different record)
      setPaymentData({
          amount: feeRecord?.balance || '', // Pre-fill with balance if available
          mode: 'Cash',
          transactionId: '',
          note: '',
      });
      setError(null); // Clear previous errors
  }, [feeRecord]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!feeRecord || !feeRecord._id) {
        setError("Fee record not provided.");
        setLoading(false);
        return;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
        setError("Please enter a valid amount greater than zero.");
        setLoading(false);
        return;
    }

    try {
      // Use the new offline payment endpoint
      const response = await axiosInstance.post(`/payment/offline`, {
        studentId: feeRecord.studentId?._id || feeRecord.studentId,
        feeRecordId: feeRecord._id,
        amount: parseFloat(paymentData.amount),
        mode: paymentData.mode,
        referenceNo: paymentData.transactionId,
        note: paymentData.note,
      });

      toast.success(response.data.message || "Offline payment added successfully.");
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Error adding offline payment:", err);
      setError(err.response?.data?.message || "Failed to add offline payment.");
      setLoading(false);
    }
  };

  if (!feeRecord) {
      return null; // Don't render if no fee record is provided
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add Offline Payment</h3>
          <div className="mt-2 px-7 py-3">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 text-left">Amount Paid</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  value={paymentData.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  min="0.01" // Ensure positive amount
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700 text-left">Payment Mode</label>
                <select
                  id="mode"
                  name="mode"
                  required
                  value={paymentData.mode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              {(paymentData.mode === 'Bank Transfer' || paymentData.mode === 'Cheque') && (
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 text-left">Transaction/Cheque ID (Optional)</label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={paymentData.transactionId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              )}
               <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 text-left">Note (Optional)</label>
                  <textarea
                    id="note"
                    name="note"
                    value={paymentData.note}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  ></textarea>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Payment'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOfflinePaymentModal;
