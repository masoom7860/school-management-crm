// FilterSection.jsx
import { Bell, FileText } from 'lucide-react';

const FilterSection = ({
  filter,
  handleFilterChange,
  clearFilters,
  classes,
  classesLoading,
  academicYears,
  loadingAcademicYears,
  students,
  loadingStudents,
  setNotificationModalOpen,
  handleDownloadMonthlyReport,
  handleDownloadClassWiseRevenueReport,
  handleDownloadPendingVsCollectedReport
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Filter Student Fees</h2>
        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <Bell size={16} /> Notify Defaulters
          </button>
          <button
            onClick={handleDownloadMonthlyReport}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
          >
            <FileText size={16} /> Monthly Report
          </button>
          <button
            onClick={handleDownloadClassWiseRevenueReport}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
          >
            <FileText size={16} /> Class Revenue
          </button>
          <button
            onClick={handleDownloadPendingVsCollectedReport}
            className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-1"
          >
            <FileText size={16} /> Pending vs Collected
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            name="classId"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filter.classId}
            onChange={handleFilterChange}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <select
            name="academicYear"
            className="w-full border rounded p-2"
            value={filter.academicYear}
            onChange={handleFilterChange}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            className="w-full border rounded p-2"
            value={filter.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Due">Due</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
          <select
            name="studentId"
            className="w-full border rounded p-2"
            value={filter.studentId}
            onChange={handleFilterChange}
            disabled={loadingStudents}
          >
            <option value="">All Students</option>
            {students.map(student => {
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
        </div>
      </div>
    </div>
  );
};

export default FilterSection;