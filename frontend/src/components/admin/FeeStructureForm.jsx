import { Plus, Minus, Trash2 } from 'react-feather';

// FeeStructureForm Component
const FeeStructureForm = ({
  formData,
  setFormData,
  formErrors,
  editingId,
  isSubmitting,
  classes,
  classesLoading,
  formSections,
  academicYears,
  loadingAcademicYears,
  predefinedFeeNames,
  selectedFeeNames,
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
      <h2 className="text-xl font-semibold mb-4">
        {editingId ? 'Edit Fee Structure' : 'Add New Fee Structure'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Class Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value, sectionId: '' })}
              required
              disabled={classesLoading}
            >
              <option value="">Select Class</option>
              {(classes || []).map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
            {classesLoading && <p className="mt-1 text-sm text-gray-500">Loading classes...</p>}
            {formErrors.classId && <p className="mt-1 text-sm text-red-600">{formErrors.classId}</p>}
          </div>

          {/* Section Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              required
              disabled={!formData.classId || formSections.length === 0}
            >
              <option value="">
                {formSections.length === 0 ? 'No sections available' : 'Select Section'}
              </option>
              {formSections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.name}
                </option>
              ))}
            </select>
            {formErrors.sectionId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.sectionId}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              name="academicYear"
              className={`w-full p-2 border ${formErrors.academicYear ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              value={formData.academicYear}
              onChange={handleInputChange}
              required
              disabled={loadingAcademicYears}
            >
              <option value="">
                {loadingAcademicYears ? 'Loading academic years...' : 'Select Academic Year'}
              </option>
              {academicYears.length > 0 ? (
                academicYears.map(year => (
                  <option key={year.value} value={year.value}>
                    {year.label} {year.isActive ? '(Active)' : ''}
                  </option>
                ))
              ) : (
                <option value="">No academic years available</option>
              )}
            </select>
            {formErrors.academicYear && (
              <p className="text-red-500 text-xs mt-1">{formErrors.academicYear}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency*</label>
            <select
              name="frequency"
              className={`w-full border rounded p-2 ${formErrors.frequency ? 'border-red-500' : ''}`}
              value={formData.frequency}
              onChange={handleInputChange}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
            {formErrors.frequency && (
              <p className="text-red-500 text-sm mt-1">{formErrors.frequency}</p>
            )}
          </div>
          {formData.frequency !== 'one-time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date*</label>
              <input
                type="date"
                name="dueDate"
                className={`w-full border rounded p-2 ${formErrors.dueDate ? 'border-red-500' : ''}`}
                value={formData.dueDate}
                onChange={handleInputChange}
              />
              {formErrors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure Name*</label>
          <input
            type="text"
            name="name"
            className={`w-full border rounded p-2 ${formErrors.name ? 'border-red-500' : ''}`}
            placeholder="Enter fee structure name (e.g., Class 1A - Annual Fees)"
            value={formData.name}
            onChange={handleInputChange}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Fee Components*</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {predefinedFeeNames.map((fee) => (
              <div
                key={fee.id}
                onClick={() => handleFeeNameSelect(fee)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFeeNames.includes(fee.id)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{fee.name}</span>
                  {selectedFeeNames.includes(fee.id) ? (
                    <Minus className="h-4 w-4 text-red-600" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            className="w-full border rounded p-2"
            placeholder="Optional description of the fee structure"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
          />
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
                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove component"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2">₹</span>
                      <input
                        type="number"
                        className={`w-full border rounded p-2 pl-8 ${formErrors.components?.[index]?.amount ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                        value={component.amount}
                        onChange={(e) => handleComponentChange(index, 'amount', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {formErrors.components?.[index]?.amount && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.components[index].amount}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                      checked={component.isTaxable}
                      onChange={(e) => handleComponentChange(index, 'isTaxable', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">Taxable</span>
                  </label>
                  {component.isTaxable && (
                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          className={`w-full border rounded p-2 pr-8 ${formErrors.components?.[index]?.taxRate ? 'border-red-500' : ''}`}
                          placeholder="0"
                          value={component.taxRate}
                          onChange={(e) => handleComponentChange(index, 'taxRate', e.target.value)}
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-2">%</span>
                      </div>
                      {formErrors.components?.[index]?.taxRate && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.components[index].taxRate}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isActive"
              className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total Amount: ₹{typeof total === 'number' ? total.toLocaleString() : '0'}
            {formData.components.some(c => c.isTaxable) && (
              <span className="text-sm text-gray-600 ml-2">(incl. taxes)</span>
            )}
          </div>
          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  {editingId ? 'Updating...' : 'Saving...'}
                </>
              ) : editingId ? (
                'Update Fee Structure'
              ) : (
                'Add Fee Structure'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeeStructureForm;
