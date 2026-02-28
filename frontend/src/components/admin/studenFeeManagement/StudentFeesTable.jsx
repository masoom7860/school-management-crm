// StudentFeesTable.jsx
import { Eye, DollarSign } from 'lucide-react';
import ReceiptDownloadButton from './ReceiptDownloadButton';

const StudentFeesTable = ({
  studentFees,
  loading,
  classes,
  getClassName,
  handleAddPaymentClick,
  handleDownloadReceipt,
  handleViewReceipt
}) => {
  const getStatusTagColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Due': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">Loading student fee records...</p>
      </div>
    );
  }

  if (studentFees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No student fee records found matching your criteria.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">All Student Fees</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Structure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due (Principal)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late Fee Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentFees.map((fee) => (
              <tr key={fee._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(() => {
                    const name = fee.studentId?.name || `${fee.studentId?.firstName ?? ''} ${fee.studentId?.lastName ?? ''}`.trim();
                    const adm = fee.studentId?.admissionNumber ? ` (${fee.studentId.admissionNumber})` : '';
                    return `${name}${adm}`;
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.classId?.className || getClassName?.(fee.classId?._id) || ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.academicYear || fee.feeStructureId?.academicYear || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.feeStructureId?.name || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(fee.totalFee || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(fee.paidAmount || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(fee.dueAmount || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(fee.lateFeeDue || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{Number((fee.totalDueWithLate != null ? fee.totalDueWithLate : Number(fee.dueAmount || 0) + Number(fee.lateFeeDue || 0)) || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusTagColor(fee.status)}`}>
                    {fee.status || ''}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {Number((fee.totalDueWithLate != null ? fee.totalDueWithLate : Number(fee.dueAmount || 0) + Number(fee.lateFeeDue || 0)) || 0) > 0 && (
                      <button
                        onClick={() => handleAddPaymentClick(fee)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Add Payment"
                      >
                        <DollarSign size={18} />
                      </button>
                    )}
                    {fee.payments && fee.payments.length > 0 && (
                      <>
                        <ReceiptDownloadButton
                          studentFeeId={fee._id}
                          receiptNumber={fee.payments[fee.payments.length - 1].receiptNumber}
                        />
                        <button
                          onClick={() => handleViewReceipt(fee, fee.payments[fee.payments.length - 1])}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Latest Receipt"
                        >
                          <Eye size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFeesTable;