import { Printer } from 'lucide-react';

const ReceiptViewerModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen || !receiptData) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Receipt</h3>
        <div className="border p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Receipt Number:</p>
              <p className="text-lg font-bold">{receiptData.receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Date:</p>
              <p className="text-lg">{new Date(receiptData.date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium">Student:</p>
            <p className="text-lg">{receiptData.studentName}</p>
            <p className="text-sm text-gray-600">
              {receiptData.className}
              {receiptData.section ? ` • ${receiptData.section}` : ''}
              {` • ${receiptData.academicYear}`}
            </p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium">Payment Details:</p>
            <p className="text-lg">Amount: ₹{receiptData.amount.toLocaleString('en-IN')}</p>
            <p className="text-sm">Mode: {receiptData.mode}</p>
          </div>
          
          {receiptData.remark && (
            <div className="mb-4">
              <p className="text-sm font-medium">Remark:</p>
              <p className="text-sm">{receiptData.remark}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewerModal;