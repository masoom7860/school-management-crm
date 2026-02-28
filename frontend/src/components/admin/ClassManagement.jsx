// ClassManagement.jsx (updated)
import React from 'react';
import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { 
  LucideEdit, 
  LucideTrash2, 
  Plus, 
  X,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getClasses, 
  getClassById,
  createClass, 
  updateClass, 
  deleteClass,
  getSectionsByClass,
  addSectionToClass,
  updateSectionInClass,
  deleteSectionFromClass
} from '../../api/classesApi';

const ClassManagement = () => {
  // State variables
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ className: '' });
  const [formErrors, setFormErrors] = useState({});
  const [editClassId, setEditClassId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [schoolId, setSchoolId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sectionForm, setSectionForm] = useState({ 
    name: '', 
    originalName: '' 
  });
  const [sectionLoading, setSectionLoading] = useState(false);
  const [allSections, setAllSections] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});

  // Initialize token and school ID
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      toast.error("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }
    setToken(storedToken);

    try {
      const decoded = jwtDecode(storedToken);
      setSchoolId(decoded.schoolId);
    } catch (err) {
      console.error('Failed to decode token:', err);
      toast.error("Invalid authentication token. Please log in again.");
      setLoading(false);
    }
  }, []);

  // Fetch classes when component mounts
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await getClasses();
      // Handle both response formats: direct array or { success: true, data: [...] }
      const classesData = Array.isArray(response) ? response : (response?.data || []);
      setClasses(classesData);
      if (!selectedClassId && classesData.length > 0) {
        setSelectedClassId(classesData[0]._id);
        fetchSections(classesData[0]._id);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Error fetching classes: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch class by ID for editing
  const fetchClassById = async (id) => {
    setActionLoading(true);
    try {
      const response = await getClassById(id);
      // Handle both response formats: direct class object or { class: classData }
      const classData = response?.class || response;
      const clsName = classData?.className ?? '';
      setFormData({
        className: clsName,
      });
      setEditClassId(id);
      setFormOpen(true);
    } catch (err) {
      console.error('Error fetching class by ID:', err);
      toast.error('Error fetching class: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'className') {
      const normalizedValue = (value || '').trim().toLowerCase();
      const isDuplicate = classes.some((c) => (
        (c.className || '').trim().toLowerCase() === normalizedValue && c._id !== editClassId
      ));
      if (isDuplicate) {
        setFormErrors((prev) => ({ ...prev, className: 'Class already exists' }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.className.trim()) {
      errors.className = 'Class Name is required';
    }
    if (formData.className && formData.className.trim()) {
      const normalizedValue = formData.className.trim().toLowerCase();
      const isDuplicate = classes.some((c) => (
        (c.className || '').trim().toLowerCase() === normalizedValue && c._id !== editClassId
      ));
      if (isDuplicate) {
        errors.className = 'Class already exists';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new class
  const handleCreateClass = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    setActionLoading(true);
    try {
      await createClass({ className: formData.className });
      await fetchClasses();
      resetForm();
      toast.success('Class created successfully!');
    } catch (err) {
      console.error('Failed to create class:', err);
      toast.error('Failed to create class: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Update existing class
  const handleUpdateClass = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    setActionLoading(true);
    try {
      await updateClass(editClassId, { 
        className: formData.className
      });
      await fetchClasses();
      resetForm();
      toast.success('Class updated successfully!');
    } catch (err) {
      console.error('Failed to update class:', err);
      toast.error('Failed to update class: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Delete class
  const handleDeleteClass = async (id) => {
    setActionLoading(true);
    try {
      await deleteClass(id);
      await fetchClasses();
      setDeleteConfirmId(null);
      toast.success('Class deleted successfully!');
    } catch (err) {
      console.error('Failed to delete class:', err);
      toast.error('Failed to delete class: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch sections for a class
  const fetchSections = async (classId) => {
    setSectionLoading(true);
    try {
      const sections = await getSectionsByClass(classId);
      // getSectionsByClass returns the sections array directly
      setAllSections(prev => ({
        ...prev,
        [classId]: sections
      }));
    } catch (err) {
      console.error('Error fetching sections:', err);
      toast.error('Error fetching sections');
    } finally {
      setSectionLoading(false);
    }
  };

  // Add or update section
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (!sectionForm.name.trim()) {
      toast.error('Section name required');
      return;
    }
    
    // Prevent duplicate section names client-side
    if (checkSectionDuplicate(sectionForm.name, selectedClassId, sectionForm.originalName)) {
      setSectionErrors((prev) => ({ ...prev, name: 'Section already exists' }));
      toast.error('Section already exists');
      return;
    }
    
    setSectionLoading(true);
    try {
      if (sectionForm.originalName) {
        // Update existing section
        await updateSectionInClass(
          selectedClassId,
          sectionForm.originalName,
          { name: sectionForm.name }
        );
        toast.success('Section updated');
      } else {
        // Add new section
        await addSectionToClass(
          selectedClassId,
          { name: sectionForm.name }
        );
        toast.success('Section added');
      }
      await fetchSections(selectedClassId);
      resetSectionForm();
    } catch (err) {
      console.error('Error saving section:', err);
      toast.error('Error saving section: ' + (err.message || 'Unknown error'));
    } finally {
      setSectionLoading(false);
    }
  };

  // Edit section
  const handleEditSection = (section) => {
    setSectionForm({ 
      name: section.name, 
      originalName: section.name
    });
  };

  // Delete section
  const handleDeleteSection = async (sectionName) => {
    setSectionLoading(true);
    try {
      await deleteSectionFromClass(
        selectedClassId,
        sectionName
      );
      toast.success('Section deleted');
      await fetchSections(selectedClassId);
    } catch (err) {
      console.error('Error deleting section:', err);
      toast.error('Error deleting section: ' + (err.message || 'Unknown error'));
    } finally {
      setSectionLoading(false);
    }
  };

  // Reset class form
  const resetForm = () => {
    setFormData({ className: '' });
    setFormErrors({});
    setFormOpen(false);
    setEditClassId(null);
  };

  // Reset section form
  const resetSectionForm = () => {
    setSectionForm({ name: '', originalName: '' });
    setSectionErrors({});
  };

  const checkSectionDuplicate = (name, classId, excludeName) => {
    const normalized = (name || '').trim().toLowerCase();
    const list = allSections[classId] || [];
    return list.some((s) => (
      (s.name || '').trim().toLowerCase() === normalized && 
      (!excludeName || s.name !== excludeName)
    ));
  };

  // Filter classes based on search
  const filteredClasses = classes.filter(c => 
    c.className?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        
        {/* Search Bar */}
        <div className="w-full md:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Class list CRUD */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editClassId ? 'Update Class' : 'Classes'}
                </h2>
                <button
                  onClick={() => {
                    setFormOpen(true);
                    setFormData({ className: '' });
                    setFormErrors({});
                    setEditClassId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Class
                </button>
              </div>
              
              {formOpen && (
                <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <input
                      name="className"
                      type="text"
                      placeholder="e.g., 10th Grade"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.className ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.className}
                      onChange={handleInputChange}
                    />
                    {formErrors.className && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.className}</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={editClassId ? handleUpdateClass : handleCreateClass}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      disabled={actionLoading || !formData.className.trim() || Boolean(formErrors.className)}
                    >
                      {editClassId ? 'Update Class' : 'Create Class'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.map((classItem) => (
                    <tr key={classItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedClassId(classItem._id);
                            if (!allSections[classItem._id]) {
                              fetchSections(classItem._id);
                            }
                          }}
                        >
                          {classItem.className || '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => fetchClassById(classItem._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            disabled={actionLoading}
                            title="Edit Class"
                          >
                            <LucideEdit className="w-5 h-5" />
                          </button>
                          {deleteConfirmId === classItem._id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteClass(classItem._id)}
                                className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                disabled={actionLoading}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                                disabled={actionLoading}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(classItem._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              disabled={actionLoading}
                              title="Delete Class"
                            >
                              <LucideTrash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClasses.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-6 text-center text-gray-500">No classes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Sections Panel */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Management</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                value={selectedClassId} 
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedClassId(id);
                  if (!allSections[id]) {
                    fetchSections(id);
                  }
                  resetSectionForm();
                }}
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.className}</option>
                ))}
              </select>
            </div>
            
            {selectedClassId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                    <input
                      type="text"
                      placeholder="e.g., A"
                      className={`w-full px-3 py-2 border rounded-md ${sectionErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      value={sectionForm.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSectionForm({ ...sectionForm, name: value });
                        setSectionErrors((prev) => ({ ...prev, name: '' }));
                        
                        if (checkSectionDuplicate(value, selectedClassId, sectionForm.originalName)) {
                          setSectionErrors((prev) => ({ ...prev, name: 'Section already exists' }));
                        }
                      }}
                    />
                    {sectionErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{sectionErrors.name}</p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSectionSubmit}
                      className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={!sectionForm.name.trim() || !selectedClassId || sectionLoading || Boolean(sectionErrors.name)}
                    >
                      {sectionForm.originalName ? 'Update Section' : 'Add Section'}
                    </button>
                    {sectionForm.originalName && (
                      <button
                        onClick={resetSectionForm}
                        className="ml-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allSections[selectedClassId]?.length > 0 ? (
                        allSections[selectedClassId].map((section, idx) => (
                          <tr key={section._id || section.name}>
                            <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{section.name}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => handleEditSection(section)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                >
                                  <LucideEdit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSection(section.name)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  disabled={sectionLoading}
                                >
                                  <LucideTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                            {sectionLoading ? 'Loading sections...' : 'No sections found for the selected class.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            
            {!selectedClassId && (
              <div className="text-center py-8 text-gray-500">
                Please select a class to manage sections
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
