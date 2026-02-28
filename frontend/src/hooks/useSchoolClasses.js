import { useState, useEffect, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { getClasses, getSectionsByClass } from '../api/classesApi';

const useSchoolClasses = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState({}); // Object to store sections by classId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      toast.error("Authentication token not found. Please log in again.");
      setLoading(false);
      setError("Authentication token not found.");
      return;
    }
    setToken(storedToken);

    try {
      const decodedToken = jwtDecode(storedToken);
      setSchoolId(decodedToken.schoolId);
    } catch (err) {
      console.error("Failed to decode token", err);
      toast.error("Invalid authentication token. Please log in again.");
      setLoading(false);
      setError("Invalid authentication token.");
    }
  }, []);

  useEffect(() => {
    const fetchClassesAndSections = async () => {
      if (!schoolId || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch classes
        const classesData = await getClasses();
        setClasses(classesData);

        // Fetch sections for each class
        const sectionsMap = {};
        for (const cls of classesData) {
          try {
            const sectionsData = await getSectionsByClass(cls._id);
            sectionsMap[cls._id] = sectionsData || []; // Corrected: sectionsData is already the array
          } catch (err) {
            console.error(`Error fetching sections for class ${cls.className}:`, err);
            sectionsMap[cls._id] = [];
          }
        }
        setSections(sectionsMap);
      } catch (err) {
        console.error('Error fetching classes:', err);
        toast.error('Error fetching classes: ' + (err.message || 'Unknown error'));
        setError('Failed to load classes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndSections();
  }, [schoolId, token]);

  // Helper function to get class name by ID
  const getClassNameById = useCallback((classId) => {
    const classObj = classes.find(cls => cls._id === classId);
    return classObj ? classObj.className : 'N/A';
  }, [classes]);

  // Helper function to get sections by class ID
  const getSectionsByClassId = useCallback((classId) => {
    return sections[classId] || [];
  }, [sections]);

  // Helper function to get all sections as a flat array
  const getAllSections = useCallback(() => {
    return Object.values(sections).flat();
  }, [sections]);

  // Helper function to get sections for a specific class name
  const getSectionsByClassName = useCallback((className) => {
    const classObj = classes.find(cls => cls.className === className);
    if (!classObj) return [];
    return sections[classObj._id] || [];
  }, [classes, sections]);

  // Helper function to get class options for dropdowns
  const getClassOptions = useCallback(() => {
    return classes.map(cls => ({
      value: cls._id,
      label: cls.className
    }));
  }, [classes]);

  // Helper function to get section options for a specific class
  const getSectionOptions = useCallback((classId) => {
    const classSections = sections[classId] || [];
    return classSections.map(section => ({
      value: section._id || section.name,
      label: section.name
    }));
  }, [sections]);

  // Helper function to get section options for a specific class (async version that fetches from API)
  const getSectionOptionsAsync = useCallback(async (classId) => {
    try {
      const { getSectionOptions } = await import('../api/classesApi');
      return await getSectionOptions(classId);
    } catch (error) {
      console.error('Error fetching section options:', error);
      return [];
    }
  }, []);

  // Helper function to get section options for a specific class name
  const getSectionOptionsByClassName = useCallback((className) => {
    const classObj = classes.find(cls => cls.className === className);
    if (!classObj) return [];
    const classSections = sections[classObj._id] || [];
    return classSections.map(section => ({
      value: section._id || section.name,
      label: section.name
    }));
  }, [classes, sections]);

  return {
    classes,
    sections,
    loading,
    error,
    getClassNameById,
    getSectionsByClassId,
    getAllSections,
    getSectionsByClassName,
    getClassOptions,
    getSectionOptions,
    getSectionOptionsAsync,
    getSectionOptionsByClassName
  };
};

export default useSchoolClasses;
