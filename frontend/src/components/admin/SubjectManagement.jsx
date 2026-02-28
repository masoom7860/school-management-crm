import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { getSectionsByClass } from '../../api/classesApi';


const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectCatalog, setSubjectCatalog] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    schoolId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [schoolId, setSchoolId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [selectedClassForBulkDelete, setSelectedClassForBulkDelete] = useState('');
  const [selectedSectionForBulkDelete, setSelectedSectionForBulkDelete] = useState('');
  const [sectionsForBulkDelete, setSectionsForBulkDelete] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeletePayload, setBulkDeletePayload] = useState(null);


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        setSchoolId(decoded.schoolId);
        setFormData(prev => ({ ...prev, schoolId: decoded.schoolId }));
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (schoolId && token) {
      fetchClasses();
      fetchSubjects();
      fetchSubjectCatalog();
    }
  }, [schoolId, token]);

  const fetchSectionsForBulkDelete = async (classId) => {
    if (!classId || classId === 'UNKNOWN_CLASS_ID') { setSectionsForBulkDelete([]); return; }
    try {
      const list = await getSectionsByClass(classId);
      setSectionsForBulkDelete(list);
    } catch (error) {
      console.error('Error fetching sections for bulk delete:', error);
      setSectionsForBulkDelete([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(`/api/classes`);
      const list = Array.isArray(response.data?.data) ? response.data.data : (response.data || []);
      setClasses(list);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchSections = async (classId) => {
    if (!classId) { setSections([]); return; }
    try {
      const list = await getSectionsByClass(classId);
      setSections(list);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/subjects`, { params: { schoolId } });
      setSubjects(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectCatalog = async () => {
    try {
      const response = await axiosInstance.get(`/api/subjects/catalog`);
      const catalog = Array.isArray(response.data) ? response.data : [];
      setSubjectCatalog(catalog);
    } catch (error) {
      console.error('Error fetching subject catalog:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing subject
        await axiosInstance.put(`/api/subjects/${editingId}`, formData);
        toast.success('Subject updated successfully');
      } else {
        // Create new subject
        await axiosInstance.post(`/api/subjects`, formData);
        toast.success('Subject created successfully');
      }
      
      setFormData({ name: '', code: '', classId: '', schoolId });
      setEditingId(null);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      code: subject.code || '',
      classId: subject.classId,
      sectionId: subject.sectionId || '',
      schoolId: subject.schoolId
    });
    // ensure sections for the class are loaded when editing
    fetchSections(subject.classId);
    setEditingId(subject._id);
  };

  const handleDelete = (subjectId) => {
    setPendingDeleteId(subjectId);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteClick = () => {
    if (!selectedClassForBulkDelete) {
      toast.error('Please select a class to delete subjects.');
      return;
    }
    const payload = {
      classId: selectedClassForBulkDelete,
      sectionId: selectedSectionForBulkDelete || undefined,
    };
    setBulkDeletePayload(payload);
    setShowBulkDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/subjects/${pendingDeleteId}`);
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    } finally {
      setShowDeleteModal(false);
      setPendingDeleteId(null);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/subjects/delete-by-class-section`, {
        data: bulkDeletePayload
      });
      toast.success(response.data.message || 'Subjects deleted successfully');
      fetchSubjects();
      setSelectedClassForBulkDelete('');
      setSelectedSectionForBulkDelete('');
      setSectionsForBulkDelete([]);
    } catch (error) {
      console.error('Error bulk deleting subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subjects');
    } finally {
      setShowBulkDeleteModal(false);
      setBulkDeletePayload(null);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', code: '', classId: '', schoolId });
    setEditingId(null);
  };

  const handleSeedSubjects = async () => {
    if (!formData.classId) {
      toast.error('Please select a class to seed');
      return;
    }
    try {
      await axiosInstance.post(`/api/subjects/seed`, { classId: formData.classId });
      toast.success('Subjects seeded successfully');
      fetchSubjects();
    } catch (error) {
      console.error('Error seeding subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to seed subjects');
    }
  };

  const getClassName = (classId) => {
    const classObj = classes.find(cls => cls._id === classId);
    return classObj ? classObj.className : 'Unknown Class';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading subjects...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Subject Management</h1>

      {/* Create/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium mb-4">
          {editingId ? 'Edit Subject' : 'Create New Subject'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                value={`${formData.code || ''}|${formData.name || ''}`}
                onChange={(e) => {
                  const [code, name] = e.target.value.split('|');
                  setFormData(prev => ({ ...prev, code, name }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="|">Select a subject</option>
                {subjectCatalog.map((s) => (
                  <option key={s.code} value={`${s.code}|${s.name}`}>{`${s.name} (${s.code})`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                value={formData.classId}
                 onChange={(e) => {
                   const value = e.target.value;
                   setFormData(prev => ({ ...prev, classId: value, sectionId: '' }));
                   fetchSections(value);
                 }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={formData.sectionId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.classId}
              >
                <option value="">Select a section</option>
                {sections.map(sec => (
                  <option key={sec._id} value={sec._id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {editingId ? 'Update Subject' : 'Create Subject'}
            </button>
            <button
              type="button"
              onClick={handleSeedSubjects}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Seed class with default subjects
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bulk Delete Subjects */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium mb-4">Delete Subjects by Class & Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
            <select
              value={selectedClassForBulkDelete}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedClassForBulkDelete(value);
                setSelectedSectionForBulkDelete('');
                fetchSectionsForBulkDelete(value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={selectedSectionForBulkDelete}
              onChange={(e) => setSelectedSectionForBulkDelete(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={!selectedClassForBulkDelete}
            >
              <option value="">Select a section (Optional)</option>
              {sectionsForBulkDelete.map(sec => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleBulkDeleteClick}
          className={`px-4 py-2 rounded-md focus:ring-2 focus:ring-red-500 ${!selectedClassForBulkDelete ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
          disabled={!selectedClassForBulkDelete}
        >
          Delete All Subjects
          {selectedClassForBulkDelete && ` for ${getClassName(selectedClassForBulkDelete)}`}
          {selectedSectionForBulkDelete && ` (Section: ${sectionsForBulkDelete.find(s => s._id === selectedSectionForBulkDelete)?.name})`}
        </button>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">All Subjects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No subjects found. Create your first subject above.
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.code || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getClassName(subject.classId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
        onConfirm={confirmDelete}
        itemToDelete={pendingDeleteId}
      />
      <DeleteConfirmationModal
        show={showBulkDeleteModal}
        onClose={() => { setShowBulkDeleteModal(false); setBulkDeletePayload(null); }}
        onConfirm={confirmBulkDelete}
        itemToDelete={
          bulkDeletePayload
            ? `all subjects for Class: ${getClassName(bulkDeletePayload.classId)}${bulkDeletePayload.sectionId ? ` (Section: ${sectionsForBulkDelete.find(s => s._id === bulkDeletePayload.sectionId)?.name})` : ' (All Sections)'}`
            : ''
        }
        message="Are you sure you want to delete these subjects? This action cannot be undone."
      />
    </div>
  );
};

export default SubjectManagement;
