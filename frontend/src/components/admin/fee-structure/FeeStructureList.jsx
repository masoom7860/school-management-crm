import React from 'react';
import { ChevronDown, ChevronUp, Copy, Edit, Trash2 } from 'lucide-react';

const FeeStructureList = ({
  feeStructures,
  loading,
  expandedStructure,
  toggleExpandStructure,
  handleEdit,
  handleDuplicate,
  confirmDelete,
  classes,
  academicYears
}) => {
  const getClassName = (classData) => {
    return classData?.className || classData?.classId?.className || 'Unknown Class';
  };

  const getAcademicYearLabel = (academicYearId) => {
    const year = academicYears.find(y => y.value === academicYearId);
    if (year) return year.label;
    // Fallback: some older records store the yearRange string directly
    const byLabel = academicYears.find(y => y.label === academicYearId);
    if (byLabel) return byLabel.label;
    return academicYearId || 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Existing Fee Structures</h2>
        <div className="text-sm text-gray-500">Showing {feeStructures.length} structure{feeStructures.length !== 1 ? 's' : ''}</div>
      </div>

      {loading && feeStructures.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading fee structures...</p>
        </div>
      ) : feeStructures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No fee structures found matching your criteria</div>
      ) : (
        <div className="space-y-4">
          {feeStructures.map(structure => (
            <div key={structure._id} className="border rounded-lg overflow-hidden">
              <div className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 ${expandedStructure === structure._id ? 'bg-gray-50 border-b' : ''}`} onClick={() => toggleExpandStructure(structure._id)}>
                <div>
                  <h3 className="font-medium">{getClassName(structure.classData)} - {structure.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="text-sm text-gray-600">Year: <span className="font-medium">{getAcademicYearLabel(structure.academicYear)}</span></span>
                    <span className="text-sm text-gray-600">Frequency: <span className="font-medium capitalize">{structure.frequency}</span></span>
                    {structure.frequency !== 'one-time' && (<span className="text-sm text-gray-600">Due: <span className="font-medium">{new Date(structure.dueDate).toLocaleDateString()}</span></span>)}
                    <span className="text-sm text-gray-600">Total: <span className="font-medium">₹{(structure.totalAmount ?? 0).toLocaleString('en-IN')}</span></span>
                    <span className="text-sm text-gray-600">Late Fee: <span className="font-medium">{structure.lateFeeEnabled ? `Enabled (₹${Number(structure.lateFeePerDay ?? 10)}/day, Grace ${Number(structure.lateFeeGraceDays ?? 0)}d)` : 'Disabled'}</span></span>
                    <span className="text-sm">Status: {structure.isActive ? (<span className="text-green-600 font-medium">Active</span>) : (<span className="text-red-600 font-medium">Inactive</span>)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDuplicate(structure); }} className="text-gray-600 hover:text-blue-600 p-1" title="Duplicate"><Copy size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(structure); }} className="text-gray-600 hover:text-blue-600 p-1" title="Edit"><Edit size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); confirmDelete(structure); }} className="text-gray-600 hover:text-red-600 p-1" title="Delete"><Trash2 size={18} /></button>
                  {expandedStructure === structure._id ? (<ChevronUp size={20} className="text-gray-500 ml-2" />) : (<ChevronDown size={20} className="text-gray-500 ml-2" />)}
                </div>
              </div>
              {expandedStructure === structure._id && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Fee Components</h4>
                      <ul className="space-y-2">
                        {structure.components.map((comp, idx) => (
                          <li key={idx} className="flex justify-between py-1 border-b border-gray-100">
                            <div>
                              <span className="text-gray-700">{comp.name}</span>
                              {comp.isTaxable && (<span className="text-xs text-gray-500 ml-2">(+{comp.taxRate}% tax)</span>)}
                            </div>
                            <span className="font-medium">₹{(comp.amount ?? 0).toLocaleString('en-IN')}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>₹{(structure.totalAmount ?? 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">Structure Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-gray-600">Description:</span><span className="font-medium text-right">{structure.description || 'None'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Frequency:</span><span className="font-medium capitalize">{structure.frequency}</span></div>
                        {structure.frequency !== 'one-time' && (<div className="flex justify-between"><span className="text-gray-600">Due Date:</span><span className="font-medium">{new Date(structure.dueDate).toLocaleDateString()}</span></div>)}
                        <div className="flex justify-between"><span className="text-gray-600">Late Fee Enabled:</span><span className={`font-medium ${structure.lateFeeEnabled ? 'text-green-600' : 'text-gray-700'}`}>{structure.lateFeeEnabled ? 'Yes' : 'No'}</span></div>
                        {structure.lateFeeEnabled && (
                          <>
                            <div className="flex justify-between"><span className="text-gray-600">Late Fee Per Day:</span><span className="font-medium">₹{Number(structure.lateFeePerDay ?? 10).toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Grace Days:</span><span className="font-medium">{Number(structure.lateFeeGraceDays ?? 0)}</span></div>
                          </>
                        )}
                        <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`font-medium ${structure.isActive ? 'text-green-600' : 'text-red-600'}`}>{structure.isActive ? 'Active' : 'Inactive'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Created:</span><span className="font-medium">{new Date(structure.createdAt).toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Last Updated:</span><span className="font-medium">{new Date(structure.updatedAt).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeeStructureList;
