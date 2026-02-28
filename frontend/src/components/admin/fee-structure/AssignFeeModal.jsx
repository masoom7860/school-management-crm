import React, { useState, useEffect } from 'react';

const AssignFeeModal = ({ isOpen, onClose, onSubmit, classes, academicYears, feeStructures, isSubmitting, students, loadingStudents, onClassChange, assignType, setAssignType, selectedClassStudents }) => {
  const [formData, setFormData] = useState({
    classId: '',
    academicYear: '',
    feeStructureId: '',
    studentId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ classId: '', academicYear: '', feeStructureId: '', studentId: '' });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'classId') onClassChange(value);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic Year is required';
    if (!formData.feeStructureId) newErrors.feeStructureId = 'Fee Structure is required';
    if (assignType === 'single' && !formData.studentId) newErrors.studentId = 'Student is required for single assignment';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData, assignType);
  };

  // Get class ID for comparison (handles both string and object classId)
  const getClassId = (feeStructure) => {
    const cid = feeStructure?.classId;
    if (!cid) return null;
    if (typeof cid === 'object') {
      return cid?._id || cid?.id || cid?.value || null;
    }
    return cid;
  };

  // Filter fee structures for the selected class and academic year
  const filteredFeeStructures = feeStructures.filter(fs => {
    const fsClassId = getClassId(fs);
    // Support legacy records where academicYear was stored as the yearRange string
    const selectedYearValue = formData.academicYear;
    const selectedYearLabel = academicYears.find(y => y.value === selectedYearValue)?.label;
    const yearMatches = fs.academicYear === selectedYearValue || (selectedYearLabel && fs.academicYear === selectedYearLabel);
    return fsClassId === formData.classId && yearMatches;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Assign Fee Structure</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
            <select 
              name="classId" 
              value={formData.classId} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-md ${errors.classId ? 'border-red-500' : 'border-gray-300'}`} 
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.className}</option>
              ))}
            </select>
            {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
            <select 
              name="academicYear" 
              value={formData.academicYear} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-md ${errors.academicYear ? 'border-red-500' : 'border-gray-300'}`} 
              required
            >
              <option value="">{academicYears.length > 0 ? 'Select Academic Year' : 'No academic years available'}</option>
              {academicYears.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label} {year.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
            {errors.academicYear && <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure <span className="text-red-500">*</span></label>
            <select 
              name="feeStructureId" 
              value={formData.feeStructureId} 
              onChange={handleInputChange} 
              className={`w-full p-2 border rounded-md ${errors.feeStructureId ? 'border-red-500' : 'border-gray-300'}`} 
              required
              disabled={!formData.classId || !formData.academicYear}
            >
              <option value="">Select Fee Structure</option>
              {filteredFeeStructures.map(fs => (
                <option key={fs._id} value={fs._id}>
                  {fs.name} (Total: ₹{fs.totalAmount})
                </option>
              ))}
              {formData.classId && formData.academicYear && filteredFeeStructures.length === 0 && (
                <option value="" disabled>No fee structures found for this class and academic year</option>
              )}
            </select>
            {errors.feeStructureId && <p className="text-red-500 text-xs mt-1">{errors.feeStructureId}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="assignType" 
                  value="bulk" 
                  checked={assignType === 'bulk'} 
                  onChange={() => setAssignType('bulk')} 
                  className="form-radio text-red-600" 
                />
                <span className="ml-2 text-gray-700">Bulk Assign (All students)</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="assignType" 
                  value="single" 
                  checked={assignType === 'single'} 
                  onChange={() => setAssignType('single')} 
                  className="form-radio text-red-600" 
                />
                <span className="ml-2 text-gray-700">Single Student</span>
              </label>
            </div>
          </div>

          {assignType === 'single' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Student <span className="text-red-500">*</span></label>
              <select 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleInputChange} 
                className={`w-full p-2 border rounded-md ${errors.studentId ? 'border-red-500' : 'border-gray-300'}`} 
                required={assignType === 'single'} 
                disabled={loadingStudents || !formData.classId}
              >
                <option value="">{loadingStudents ? 'Loading students...' : 'Select Student'}</option>
                {selectedClassStudents.map(student => {
                  const name = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
                  const admNo = student.admissionNumber || student.scholarNumber || student.applicationNumber;
                  const label = admNo ? `${name} (${admNo})` : name;
                  return (
                    <option key={student._id} value={student._id}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
              {loadingStudents && <p className="mt-1 text-sm text-gray-500">Loading students...</p>}
            </div>
          )}

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
              {isSubmitting ? 'Assigning...' : 'Assign Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignFeeModal;