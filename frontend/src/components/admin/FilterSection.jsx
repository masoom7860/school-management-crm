// FilterSection Component
const FilterSection = ({ 
  filter, 
  setFilter, 
  clearFilters, 
  exportToCSV, 
  classes, 
  classesLoading, 
  filterSections, 
  academicYears, 
  loadingAcademicYears 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Filter Fee Structures</h2>
        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <button
            onClick={exportToCSV}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Filter by Class */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filter.classId}
            onChange={(e) => setFilter({ ...filter, classId: e.target.value, sectionId: '' })}
            disabled={classesLoading}
          >
            <option value="">All Classes</option>
            {(classes || []).map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>
          {classesLoading && <p className="mt-1 text-sm text-gray-500">Loading classes...</p>}
        </div>

        {/* Filter by Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filter.sectionId}
            onChange={(e) => setFilter({ ...filter, sectionId: e.target.value })}
            disabled={!filter.classId || filterSections.length === 0}
          >
            <option value="">All Sections</option>
            {filterSections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
          {filter.classId && filterSections.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">No sections available</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <select
            name="academicYear"
            className="w-full border rounded p-2"
            value={filter.academicYear}
            onChange={(e) => setFilter({...filter, academicYear: e.target.value})}
            disabled={loadingAcademicYears}
          >
            <option value="">
              {loadingAcademicYears ? 'Loading academic years...' : 'All Academic Years'}
            </option>
            {academicYears.length > 0 ? (
              academicYears.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label} {year.isActive ? '(Active)' : ''}
                </option>
              ))
            ) : (
              <option value="" disabled>No academic years available</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <select
            name="frequency"
            className="w-full border rounded p-2"
            value={filter.frequency}
            onChange={(e) => setFilter({...filter, frequency: e.target.value})}
          >
            <option value="">All Frequencies</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="isActive"
            className="w-full border rounded p-2"
            value={filter.isActive}
            onChange={(e) => setFilter({...filter, isActive: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};


export default FilterSection;// DeleteConfirmationModal Component
import React from 'react';