import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const FeeStructureForm = ({
  formData,
  setFormData,
  formErrors,
  editingId,
  isSubmitting,
  classes,
  classesLoading,
  academicYears,
  loadingAcademicYears,
  predefinedFeeNames,
  selectedFeeNames,
  setSelectedFeeNames,
  handleInputChange,
  handleFeeNameSelect,
  handleComponentChange,
  handleRemoveComponent,
  handleSubmit,
  resetForm,
  calculateTotal
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Fee Structure' : 'Add New Fee Structure'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} required disabled={classesLoading}>
              <option value="" key="form-select-class-option">Select Class</option>
              {(classes || []).map((cls) => (<option key={cls._id} value={cls._id}>{cls.className}</option>))}
            </select>
            {classesLoading && <p className="mt-1 text-sm text-gray-500">Loading classes...</p>}
            {formErrors.classId && <p className="mt-1 text-sm text-red-600">{formErrors.classId}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select name="academicYear" className={`w-full p-2 border ${formErrors.academicYear ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} value={formData.academicYear} onChange={handleInputChange} required disabled={loadingAcademicYears}>
              <option value="">{loadingAcademicYears ? 'Loading academic years...' : (academicYears.length > 0 ? 'Select Academic Year' : 'No academic years available')}</option>
              {academicYears.map(year => (<option key={year.value} value={year.value}>{year.label} {year.isActive ? '(Active)' : ''}</option>))}
            </select>
            {formErrors.academicYear && (<p className="text-red-500 text-xs mt-1">{formErrors.academicYear}</p>)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} value={formData.name} onChange={handleInputChange} required placeholder="Enter fee structure name" />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency*</label>
            <select name="frequency" className={`w-full border rounded p-2 ${formErrors.frequency ? 'border-red-500' : ''}`} value={formData.frequency} onChange={handleInputChange}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
            {formErrors.frequency && (<p className="text-red-500 text-sm mt-1">{formErrors.frequency}</p>)}
          </div>
          {formData.frequency !== 'one-time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date*</label>
              <input type="date" name="dueDate" className={`w-full border rounded p-2 ${formErrors.dueDate ? 'border-red-500' : ''}`} value={formData.dueDate} onChange={handleInputChange} />
              {formErrors.dueDate && (<p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="mb-4 md:mb-0 flex items-center">
            <label className="inline-flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" checked={!!formData.lateFeeEnabled} onChange={(e) => setFormData({ ...formData, lateFeeEnabled: e.target.checked })} />
              <span className="ml-2 text-sm text-gray-700">Enable Late Fee</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Per Day (₹)</label>
            <input type="number" name="lateFeePerDay" className={`w-full border rounded p-2 ${formErrors.lateFeePerDay ? 'border-red-500' : ''}`} value={formData.lateFeePerDay} onChange={(e) => setFormData({ ...formData, lateFeePerDay: Number(e.target.value) })} min="0" step="1" disabled={!formData.lateFeeEnabled} />
            {formErrors.lateFeePerDay && (<p className="text-red-500 text-sm mt-1">{formErrors.lateFeePerDay}</p>)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grace Days</label>
            <input type="number" name="lateFeeGraceDays" className={`w-full border rounded p-2 ${formErrors.lateFeeGraceDays ? 'border-red-500' : ''}`} value={formData.lateFeeGraceDays} onChange={(e) => setFormData({ ...formData, lateFeeGraceDays: Number(e.target.value) })} min="0" step="1" disabled={!formData.lateFeeEnabled} />
            {formErrors.lateFeeGraceDays && (<p className="text-red-500 text-sm mt-1">{formErrors.lateFeeGraceDays}</p>)}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Custom Fee Component Name</label>
          <div className="flex gap-2 mt-2">
            <input type="text" name="newCustomFeeName" className="w-full border rounded p-2" placeholder="Add custom fee component name" value={formData.newCustomFeeName || ''} onChange={e => setFormData(prev => ({ ...prev, newCustomFeeName: e.target.value }))} />
            <button type="button" className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => {
              if (formData.newCustomFeeName && formData.newCustomFeeName.trim() !== '') {
                const newId = `custom_${Date.now()}`;
                setFormData(prev => ({
                  ...prev,
                  customFeeNames: [...(prev.customFeeNames || []), { id: newId, name: prev.newCustomFeeName }],
                  newCustomFeeName: ''
                }));
              }
            }}>Add</button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Fee Components*</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {[...predefinedFeeNames, ...(formData.customFeeNames || [])].map((fee) => (
              <div key={fee.id} onClick={() => handleFeeNameSelect(fee)} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFeeNames.includes(fee.id) ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{fee.name}</span>
                  {selectedFeeNames.includes(fee.id) ? (<Minus className="h-4 w-4 text-red-600" />) : (<Plus className="h-4 w-4 text-gray-400" />)}
                  {fee.id.startsWith('custom_') && (
                    <button type="button" className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 text-xs" onClick={e => {
                      e.stopPropagation();
                      setFormData(prev => ({
                        ...prev,
                        customFeeNames: prev.customFeeNames.filter(f => f.id !== fee.id),
                        components: prev.components.filter(c => c.id !== fee.id),
                      }));
                      setSelectedFeeNames(prev => prev.filter(id => id !== fee.id));
                    }}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Configure Selected Components*</label>
          {formData.components.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">Select fee components from above to configure amounts</p>
            </div>
          ) : (
            formData.components.map((component, index) => (
              <div key={component.id || index} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{component.name}</h4>
                  <button type="button" onClick={() => handleRemoveComponent(index)} className="text-red-600 hover:text-red-800 p-1" title="Remove component">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2">₹</span>
                      <input type="number" className={`w-full border rounded p-2 pl-8 ${formErrors.components?.[index]?.amount ? 'border-red-500' : ''}`} placeholder="0.00" value={component.amount} onChange={(e) => handleComponentChange(index, 'amount', e.target.value)} min="0" step="0.01" />
                    </div>
                    {formErrors.components?.[index]?.amount && (<p className="text-red-500 text-sm mt-1">{formErrors.components[index].amount}</p>)}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" checked={component.isTaxable} onChange={(e) => handleComponentChange(index, 'isTaxable', e.target.checked)} />
                    <span className="ml-2 text-sm text-gray-700">Taxable</span>
                  </label>
                  {component.isTaxable && (
                    <div className="w-24">
                      <div className="relative">
                        <input type="number" className={`w-full border rounded p-2 pr-8 ${formErrors.components?.[index]?.taxRate ? 'border-red-500' : ''}`} placeholder="0" value={component.taxRate} onChange={(e) => handleComponentChange(index, 'taxRate', e.target.value)} min="0" max="100" />
                        <span className="absolute right-3 top-2">%</span>
                      </div>
                      {formErrors.components?.[index]?.taxRate && (<p className="text-red-500 text-sm mt-1">{formErrors.components[index].taxRate}</p>)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input type="checkbox" name="isActive" className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total Amount: ₹{calculateTotal(formData.components).toLocaleString('en-IN')}
            {formData.components.some(c => c.isTaxable) && (<span className="text-sm text-gray-600 ml-2">(incl. taxes)</span>)}
          </div>
          <div className="flex gap-3">
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
            )}
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? (<> {editingId ? 'Updating...' : 'Saving...'} </>) : editingId ? 'Update Fee Structure' : 'Add Fee Structure'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeeStructureForm;
