import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const FeeStructureFilter = ({
  filter,
  onFilterChange,
  onClearFilters,
  onExport,
  classes,
  classesLoading,
  academicYears,
  getSectionsByClassId
}) => {
  const [filterSections, setFilterSections] = useState([]);

  // Fetch sections for filter when filter classId changes
  useEffect(() => {
    const loadFilterSections = async () => {
      if (filter.classId) {
        try {
          const sections = await getSectionsByClassId(filter.classId);
          setFilterSections(sections || []);
          
          // Reset sectionId if it's not in the new sections list
          if (filter.sectionId && !sections?.some(s => s._id === filter.sectionId)) {
            onFilterChange({ sectionId: '' });
          }
        } catch (error) {
          console.error('Error loading filter sections:', error);
          setFilterSections([]);
          onFilterChange({ sectionId: '' });
        }
      } else {
        setFilterSections([]);
        onFilterChange({ sectionId: '' });
      }
    };
    
    loadFilterSections();
  }, [filter.classId, getSectionsByClassId, onFilterChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Filter Fee Structures</h2>
        <div className="flex gap-2">
          <button
            onClick={onClearFilters}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <button
            onClick={onExport}
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
            name="classId"
            value={filter.classId}
            onChange={handleInputChange}
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
            name="sectionId"
            value={filter.sectionId}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
          >
            <option value="">All Academic Years</option>
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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

export default FeeStructureFilter;