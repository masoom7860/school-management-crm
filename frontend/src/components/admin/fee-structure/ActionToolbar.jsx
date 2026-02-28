import React from 'react';
import { Plus } from 'lucide-react';

const ActionToolbar = ({ onOpenAssignFeeModal, onDownloadMonthly, onDownloadClassWise, onDownloadPendingVsCollected, onDownloadDefaulters }) => {
  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2" onClick={onOpenAssignFeeModal}>
        <Plus size={20} /> Assign Fee
      </button>

      <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={onDownloadMonthly}>Download Monthly Summary PDF</button>
      <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={onDownloadClassWise}>Download Class-wise Revenue PDF</button>
      <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={onDownloadPendingVsCollected}>Download Pending vs Collected PDF</button>
      <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={onDownloadDefaulters}>Download Defaulters PDF</button>
    </div>
  );
};

export default ActionToolbar;
