// PaymentModal.jsx
import { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onSubmit, studentFee, isSubmitting }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount('');
      setPaymentMode('Cash');
      setRemark('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    const amount = parseFloat(paymentAmount);
    const principalDue = Number(studentFee?.dueAmount || 0);
    const lateDue = Number(studentFee?.lateFeeDue || 0);
    const totalDue = Number(studentFee?.totalDueWithLate != null ? studentFee.totalDueWithLate : principalDue + lateDue);

    if (isNaN(amount) || amount <= 0) {
      newErrors.paymentAmount = 'Amount must be a positive number';
    } else if (studentFee && amount > totalDue) {
      newErrors.paymentAmount = `Amount cannot exceed total due (incl. late fee): ₹${totalDue}`;
    }
    if (!paymentMode) newErrors.paymentMode = 'Payment mode is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(studentFee._id, { amount: parseFloat(paymentAmount), paymentMode, remark });
    }
  };

  if (!isOpen || !studentFee) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {(() => {
            const name = studentFee.studentId?.name || `${studentFee.studentId?.firstName || ''} ${studentFee.studentId?.lastName || ''}`.trim();
            return `Add Payment for ${name}`;
          })()}
        </h3>
        <div className="text-sm text-gray-700 mb-4 space-y-1">
          <div>Principal Due: <span className="font-bold">₹{Number(studentFee.dueAmount || 0).toLocaleString('en-IN')}</span></div>
          <div>Late Fee Due: <span className="font-bold">₹{Number(studentFee.lateFeeDue || 0).toLocaleString('en-IN')}</span></div>
          <div className="border-t pt-1">Total Due: <span className="font-bold text-red-600">₹{Number((studentFee.totalDueWithLate != null ? studentFee.totalDueWithLate : Number(studentFee.dueAmount || 0) + Number(studentFee.lateFeeDue || 0)) || 0).toLocaleString('en-IN')}</span></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.paymentAmount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
            {errors.paymentAmount && <p className="text-red-500 text-xs mt-1">{errors.paymentAmount}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.paymentMode ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
              <option value="Online">Online</option>
            </select>
            {errors.paymentMode && <p className="text-red-500 text-xs mt-1">{errors.paymentMode}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="2"
              placeholder="Any notes about the payment"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;