import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
// Icons are used inside extracted components; not needed here
import { getClasses, getClassById } from '../../api/classesApi';
import { getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure } from '../../api/feeStructureApi';
import { getSessions } from '../../api/sessionsApi'; // Import getSessions
import { addStudentPayment, assignStudentFee as assignStudentFeeApi, generateMonthlyCollectionPdf, generateClassWiseRevenuePdf, generatePendingVsCollectedPdf, generateFeeDefaultersPdf } from '../../api/studentFeeApi'; // Add this import
import { getStudentsByQuery } from '../../api/studentApi'; // Use getStudentsByQuery instead of getStudentsByClass
import ActionToolbar from './fee-structure/ActionToolbar';
import ConfirmationModal from './fee-structure/ConfirmationModal';
import { AssignFeeModal, FilterSection, FeeStructureForm, FeeStructureList } from './fee-structure';

// Main FeeStructureManagement Component
const FeeStructureManagement = () => {
  const navigate = useNavigate();
  const [feeStructures, setFeeStructures] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [formData, setFormData] = useState({
    classId: '',
    academicYear: '',
    name: '',
    description: '',
    frequency: 'yearly',
    dueDate: '',
    lateFeeEnabled: false,
    lateFeePerDay: 10,
    lateFeeGraceDays: 0,
    isActive: true,
    components: [] 
  });
  const [selectedFeeNames, setSelectedFeeNames] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const [expandedStructure, setExpandedStructure] = useState(null);
  const [filter, setFilterState] = useState(() => {
    try {
      const savedFilter = localStorage.getItem('feeStructureFilter');
      return savedFilter ? JSON.parse(savedFilter) : {
        classId: '',
        academicYear: '',
        isActive: '',
        frequency: ''
      };
    } catch (error) {
      console.error("Failed to parse fee structure filter from localStorage", error);
      return {
        classId: '',
        academicYear: '',
        isActive: '',
        frequency: ''
      };
    }
  });

  const setFilter = (newFilter) => {
    setFilterState(prevFilter => {
      const updatedFilter = typeof newFilter === 'function' ? newFilter(prevFilter) : newFilter;
      localStorage.setItem('feeStructureFilter', JSON.stringify(updatedFilter));
      return updatedFilter;
    });
  };
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [assignFeeModalOpen, setAssignFeeModalOpen] = useState(false);
  const [assignType, setAssignType] = useState('bulk'); 
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  // Fetch classes directly from classesApi as requested
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const cls = await getClasses();
        setClasses(Array.isArray(cls) ? cls : []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);
  

  const predefinedFeeNames = [
    { id: 'admission', name: 'Admission Fee' },
    { id: 'tuition', name: 'Tuition Fee' },
    { id: 'examination', name: 'Examination Fee' },
    { id: 'lab', name: 'Lab Fee' },
    { id: 'library', name: 'Library Fee' },
    { id: 'transport', name: 'Transport Fee' },
    { id: 'hostel', name: 'Hostel Fee' },
    { id: 'sports', name: 'Sports Fee' },
    { id: 'miscellaneous', name: 'Miscellaneous / Activity Fee' }
  ];

  // Fetch academic years (sessions) for dropdowns and labels
  useEffect(() => {
    const fetchSessionsData = async () => {
      if (!schoolId) return;
      setLoadingAcademicYears(true);
      try {
        const sessionsResponse = await getSessions();
        // Handle both shapes: array or { data: [] }
        const sessions = Array.isArray(sessionsResponse)
          ? sessionsResponse
          : (sessionsResponse?.data || []);
        const academicYearsData = sessions.map(session => ({
          value: session._id,
          label: session.yearRange,
          isActive: !!session.isActive,
        }));
        setAcademicYears(academicYearsData);
      } catch (error) {
        console.error('Error fetching academic years from sessions:', error);
        toast.error('Failed to load academic years');
      } finally {
        setLoadingAcademicYears(false);
      }
    };
    fetchSessionsData();
  }, [schoolId]);

  // When academic years arrive, set defaults for form and filter if empty
  useEffect(() => {
    if (academicYears.length > 0) {
      setFormData(prev => ({
        ...prev,
        academicYear: prev.academicYear || academicYears[0].value,
      }));
    }
  }, [academicYears]);

  const handleFeeNameSelect = (feeName) => {
    setSelectedFeeNames(prev => {
      let newSelection;
      if (prev.includes(feeName.id)) {
        newSelection = prev.filter(id => id !== feeName.id);
      } else {
        newSelection = [...prev, feeName.id];
      }
      setFormData(prevFormData => {
        const allFeeNames = [...predefinedFeeNames, ...(prevFormData.customFeeNames || [])];
        const selectedComponents = allFeeNames
          .filter(fee => newSelection.includes(fee.id))
          .map(fee => {
            const existing = (Array.isArray(prevFormData.components) ? prevFormData.components : [])
              .find(c => c && typeof c === 'object' && !Array.isArray(c) && c.id === fee.id);
            return existing || {
              id: fee.id,
              name: fee.name,
              amount: 0,
              isTaxable: false,
              taxRate: 0,
              description: ''
            };
          });
        return {
          ...prevFormData,
          components: selectedComponents
        };
      });
      return newSelection;
    });
  };

  const handleRemoveComponent = (index) => {
    const componentToRemove = formData.components[index];
    setSelectedFeeNames(prev => prev.filter(id => id !== componentToRemove.id));
    
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  // Toolbar actions (PDF downloads)
  const handleDownloadMonthly = async () => {
    try {
      const blob = await generateMonthlyCollectionPdf(schoolId, { academicYear: filter.academicYear });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'monthly-collection.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Monthly collection PDF error:', e);
      toast.error('Failed to download monthly summary PDF');
    }
  };

  const handleDownloadClassWise = async () => {
    try {
      const blob = await generateClassWiseRevenuePdf(schoolId, { academicYear: filter.academicYear });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'class-wise-revenue.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Class-wise revenue PDF error:', e);
      toast.error('Failed to download class-wise revenue PDF');
    }
  };

  const handleDownloadPendingVsCollected = async () => {
    try {
      const blob = await generatePendingVsCollectedPdf(schoolId, { academicYear: filter.academicYear });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'pending-vs-collected.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Pending vs Collected PDF error:', e);
      toast.error('Failed to download pending vs collected PDF');
    }
  };

  const handleDownloadDefaulters = async () => {
    try {
      const blob = await generateFeeDefaultersPdf(schoolId, { academicYear: filter.academicYear, classId: filter.classId });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'fee-defaulters.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Fee Defaulters PDF error:', e);
      toast.error('Failed to download fee defaulters PDF');
    }
  };

  const fetchStudentsByClass = useCallback(async (classId) => {
    if (!classId || !schoolId) {
      setSelectedClassStudents([]);
      return;
    }
    setLoadingStudents(true);
    try {
      const response = await getStudentsByQuery({ schoolId, classId }); // Uses token/header for schoolId
      // Backend returns shape: { success: true, data: [...] }
      setSelectedClassStudents(response?.data || []);
    } catch (error) {
      console.error('Error fetching students by class:', error);
      toast.error('Failed to load students for selected class');
      setSelectedClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [schoolId]);

  // Get school ID from token
  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setSchoolId(decoded.schoolId);
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [token, navigate]);


  const fetchFeeStructures = useCallback(async (currentFilter) => {
    setLoading(true);
    try {
      let response = await getFeeStructures(schoolId, currentFilter);
      let feeStructuresData = response.data || [];

      // Fallback: if filtered by academicYear and nothing is found, try without academicYear to show existing records
      if (feeStructuresData.length === 0 && currentFilter?.academicYear) {
        // Try with yearRange label (resolve from sessions) in case backend cannot map the ID
        const yearLabel = (academicYears || []).find(y => y.value === currentFilter.academicYear)?.label;
        if (yearLabel) {
          const labelFilter = { ...currentFilter, academicYear: yearLabel };
          try {
            const byLabel = await getFeeStructures(schoolId, labelFilter);
            feeStructuresData = byLabel.data || [];
          } catch (e) {
            // ignore and proceed to final fallback
          }
        }
        // Final fallback: remove academicYear to at least show existing records
        if (feeStructuresData.length === 0) {
          const fallbackFilter = { ...currentFilter, academicYear: '' };
          response = await getFeeStructures(schoolId, fallbackFilter);
          feeStructuresData = response.data || [];
        }
      }

      // If still empty and classId is set, try without class filter too
      if (feeStructuresData.length === 0 && currentFilter?.classId) {
        const dropClassFilter = { ...currentFilter, classId: '' };
        try {
          const resp2 = await getFeeStructures(schoolId, dropClassFilter);
          feeStructuresData = resp2.data || [];
        } catch (e) {
          // ignore
        }
      }

      // Build a class map by fetching each class via getClassById (as requested)
      const uniqueClassIds = Array.from(new Set(
        feeStructuresData.map(s => (typeof s.classId === 'object' && s.classId?._id) ? s.classId._id : s.classId)
      )).filter(Boolean);

      const classMap = {};
      await Promise.all(uniqueClassIds.map(async (cid) => {
        try {
          const res = await getClassById(cid);
          // getClassById returns response.data; normalize to class object
          const cls = res?.data || res; // handle both shapes
          if (cls && cls._id) classMap[cid] = cls;
        } catch (e) {
          console.error('Failed to fetch class by id', cid, e);
        }
      }));

      // Enrich fee structures with class names from classMap
      const enrichedFeeStructures = feeStructuresData.map(structure => {
        const classId = (typeof structure.classId === 'object' && structure.classId?._id) ? structure.classId._id : structure.classId;
        const classInfo = classMap[classId] || {};
        return {
          ...structure,
          className: classInfo.className || 'Unknown Class',
          classData: classInfo
        };
      });

      setFeeStructures(enrichedFeeStructures);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch fee structures');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);
  // Note: dependency on getAllSections removed with section removal

  // Fetch fee structures and classes
  useEffect(() => {
    if (schoolId && token) {
      const fetchData = async () => {
        try {
          await fetchFeeStructures(filter);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load data');
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [schoolId, token, filter, fetchFeeStructures]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    const normalize = (c, idx) => {
      const isObj = c && typeof c === 'object' && !Array.isArray(c);
      const name = isObj ? c.name : String(c || '').trim();
      const base = isObj ? c : {};
      const idFromName = name ? `custom_${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}` : `custom_${Date.now()}_${idx}`;
      return {
        id: base.id || idFromName,
        name: name,
        amount: Number(base.amount || 0),
        isTaxable: Boolean(base.isTaxable),
        taxRate: Number(base.taxRate || 0),
        description: base.description || ''
      };
    };
    if (Array.isArray(formData.components)) {
      const needs = formData.components.some(c => !c || typeof c !== 'object' || Array.isArray(c));
      if (needs) {
        setFormData(prev => ({
          ...prev,
          components: (Array.isArray(prev.components) ? prev.components : []).map((c, idx) => normalize(c, idx))
        }));
      }
    }
  }, [formData.components]);

  const handleComponentChange = (index, field, value) => {
    const normalizeOne = (c, idx) => {
      const isObj = c && typeof c === 'object' && !Array.isArray(c);
      const name = isObj ? c.name : String(c || '').trim();
      return {
        id: (isObj && c.id) ? c.id : (name ? `custom_${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}` : `custom_${Date.now()}_${idx}`),
        name: name,
        amount: Number(isObj && c.amount ? c.amount : 0),
        isTaxable: Boolean(isObj && c.isTaxable),
        taxRate: Number(isObj && c.taxRate ? c.taxRate : 0),
        description: isObj && c.description ? c.description : ''
      };
    };
    const base = Array.isArray(formData.components) ? formData.components : [];
    const newComponents = base.map((c, idx) => normalizeOne(c, idx));
    if (!newComponents[index]) {
      newComponents[index] = normalizeOne('', index);
    }
    newComponents[index][field] = field === 'amount' || field === 'taxRate' ? Number(value) : value;
    setFormData(prev => ({ ...prev, components: newComponents }));

    // Clear errors for this field
    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.components?.[index]) {
        newErrors.components[index][field] = '';
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.classId) {
      errors.classId = 'Class is required';
      isValid = false;
    }

    if (!formData.academicYear) {
      errors.academicYear = 'Academic year is required';
      isValid = false;
    }

    if (!formData.name) {
      errors.name = 'Structure name is required';
      isValid = false;
    }

    if (!formData.frequency) {
      errors.frequency = 'Frequency is required';
      isValid = false;
    }

    if (formData.frequency !== 'one-time' && !formData.dueDate) {
      errors.dueDate = 'Due date is required for this frequency';
      isValid = false;
    }

    if (formData.lateFeeEnabled) {
      const perDay = Number(formData.lateFeePerDay);
      const grace = Number(formData.lateFeeGraceDays);
      if (isNaN(perDay) || perDay < 0) {
        errors.lateFeePerDay = 'Late fee per day must be a non-negative number';
        isValid = false;
      }
      if (isNaN(grace) || grace < 0) {
        errors.lateFeeGraceDays = 'Grace days must be a non-negative number';
        isValid = false;
      }
    }

    const componentErrors = [];
    formData.components.forEach((comp, index) => {
      const compError = {};
      if (!comp.name || comp.name.trim() === '') {
        compError.name = 'Component name is required';
        isValid = false;
      }
      if (isNaN(comp.amount)) {
        compError.amount = 'Amount must be a number';
        isValid = false;
      } else if (comp.amount <= 0) {
        compError.amount = 'Amount must be greater than 0';
        isValid = false;
      }
      if (comp.isTaxable && (isNaN(comp.taxRate) || comp.taxRate < 0 || comp.taxRate > 100)) {
        compError.taxRate = 'Tax rate must be between 0 and 100';
        isValid = false;
      }
      componentErrors[index] = compError;
    });

    if (componentErrors.some(err => Object.keys(err).length > 0)) {
      errors.components = componentErrors;
    }

    if (!formData.components || formData.components.length === 0) {
      errors.components = 'At least one fee component is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        schoolId,
        totalAmount: calculateTotal(formData.components)
      };

      const toId = (v) => {
        if (!v) return '';
        if (typeof v === 'object') return String(v._id || v.id || '');
        return String(v);
      };

      if (editingId) {
        // Update existing
        const response = await updateFeeStructure(editingId, data);
        toast.success(response.message);
        const updated = response.data;
        // Optimistically show updated in UI
        setFeeStructures(prev => {
          const list = Array.isArray(prev) ? prev.slice() : [];
          const idx = list.findIndex(s => s._id === (updated?._id || editingId));
          if (idx >= 0) list[idx] = updated; else list.unshift(updated);
          return list;
        });
        const nextFilter = {
          ...filter,
          classId: toId(updated?.classId) || toId(formData.classId) || '',
          academicYear: String(formData.academicYear || filter.academicYear || ''),
          // Widen filters to ensure visibility
          isActive: '',
          frequency: ''
        };
        setFilter(nextFilter);
        setExpandedStructure(updated?._id || editingId);
        await fetchFeeStructures(nextFilter);
      } else {
        // Create new
        const response = await createFeeStructure(data);
        toast.success(response.message);
        const created = response.data;
        // Optimistically show created in UI
        setFeeStructures(prev => [created, ...(Array.isArray(prev) ? prev : [])]);
        const nextFilter = {
          ...filter,
          classId: toId(created?.classId) || toId(formData.classId) || '',
          academicYear: String(formData.academicYear || filter.academicYear || ''),
          // Widen filters to ensure visibility
          isActive: '',
          frequency: ''
        };
        setFilter(nextFilter);
        setExpandedStructure(created?._id);
        await fetchFeeStructures(nextFilter);
      }

      resetForm();
    } catch (error) {
      const backendErrors = error.errors;
      const backendMessage = error.message;
      let errorMsg = backendMessage || 'Failed to save fee structure';

      if (backendErrors) {
        // Format validation errors
        const validationErrorMessages = Object.values(backendErrors)
          .map(err => err.message)
          .join(', ');
        errorMsg = `Validation failed: ${validationErrorMessages}`;
      }

      toast.error(errorMsg);
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFeeSubmit = async (assignFormData, type) => {
    setIsSubmitting(true);
    try {
      const payload = {
        schoolId,
        classId: assignFormData.classId,
        academicYear: assignFormData.academicYear,
        feeStructureId: assignFormData.feeStructureId,
      };

      if (type === 'single') {
        payload.studentId = assignFormData.studentId;
      }

      const response = await assignStudentFeeApi(payload);
      toast.success(response.message);
      setAssignFeeModalOpen(false);
      // Optionally refetch fee structures to update any related data
      fetchFeeStructures(filter);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to assign fee structure';
      toast.error(errorMsg);
      console.error('Assign fee error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (structure) => {
    // Some saved components may not have an 'id' field (stripped by Mongoose strict schema).
    // Derive stable ids from known names or generate custom ids so selection works.
    const deriveIdFromName = (name) => {
      const match = predefinedFeeNames.find(f => f.name.toLowerCase() === String(name || '').toLowerCase());
      if (match) return match.id;
      const slug = String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `custom-${Date.now()}`;
      return `custom_${slug}`;
    };

    const normalizedComponents = (structure.components && Array.isArray(structure.components)
      ? structure.components
      : []).map((c) => {
        const isObj = c && typeof c === 'object' && !Array.isArray(c);
        const name = isObj ? c.name : String(c || '').trim();
        return {
          id: (isObj && c.id) ? c.id : deriveIdFromName(name),
          name: name,
          amount: Number(isObj && c.amount ? c.amount : 0),
          isTaxable: Boolean(isObj && c.isTaxable),
          taxRate: Number(isObj && c.taxRate ? c.taxRate : 0),
          description: isObj && c.description ? c.description : ''
        };
      });

    setFormData({
      classId: structure.classId?._id || '',
      academicYear: structure.academicYear || '',
      name: structure.name || '',
      description: structure.description || '',
      frequency: structure.frequency || 'yearly',
      dueDate: structure.dueDate ? structure.dueDate.split('T')[0] : '',
      lateFeeEnabled: !!structure.lateFeeEnabled,
      lateFeePerDay: Number(structure.lateFeePerDay ?? 10),
      lateFeeGraceDays: Number(structure.lateFeeGraceDays ?? 0),
      components: normalizedComponents,
      isActive: structure.isActive !== undefined ? structure.isActive : true
    });
    setSelectedFeeNames(normalizedComponents.map(c => c.id));
    setEditingId(structure._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (id, data) => {
    setIsSubmitting(true);
    try {
      const response = await updateFeeStructure(id, data);
      toast.success(response.message);
      setFeeStructures(feeStructures.map(fs =>
        fs._id === id ? response.data : fs
      ));
      resetForm();
    } catch (error) {
      const errorMsg = error.message || 'Failed to update fee structure';
      toast.error(errorMsg);
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (structure) => {
    try {
      const newAcademicYear = prompt('Enter new academic year for the duplicate:', structure.academicYear);
      if (!newAcademicYear) return;

      const data = {
        ...structure,
        academicYear: newAcademicYear,
        name: `${structure.name} (Copy)`,
        isActive: true,
        schoolId
      };
      delete data._id;
      delete data.createdAt;
      delete data.updatedAt;
      delete data.__v;

      setLoading(true);
      const response = await createFeeStructure(data);
      toast.success('Fee structure duplicated successfully');
      setFeeStructures([...feeStructures, response.data]);
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate fee structure');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (structure) => {
    setStructureToDelete(structure);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!structureToDelete) return;

    setLoading(true);
    try {
      await deleteFeeStructure(structureToDelete._id);
      toast.success('Fee structure deleted successfully');
      setFeeStructures(feeStructures.filter(fs => fs._id !== structureToDelete._id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete fee structure');
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setStructureToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      classId: '',
      academicYear: '',
      name: '',
      description: '',
      frequency: 'yearly',
      dueDate: '',
      lateFeeEnabled: false,
      lateFeePerDay: 10,
      lateFeeGraceDays: 0,
      components: [], // Start with no components
      isActive: true
    });
    setEditingId(null);
    setFormErrors({});
  };

  const toggleExpandStructure = (id) => {
    setExpandedStructure(expandedStructure === id ? null : id);
  };

  const calculateTotal = (components) => {
    return (Array.isArray(components) ? components : []).reduce((sum, comp) => {
      if (!comp || typeof comp !== 'object' || Array.isArray(comp)) return sum;
      const amount = Number(comp.amount) || 0;
      const tax = comp.isTaxable ? amount * (Number(comp.taxRate) || 0) / 100 : 0;
      return sum + amount + tax;
    }, 0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilter({
      classId: '',
      academicYear: '',
      isActive: '',
      frequency: ''
    });
  };

  const exportToCSV = () => {
    // CSV export implementation
    const headers = ['Class', 'Name', 'Academic Year', 'Frequency', 'Status', 'Components', 'Total Amount'];
    const csvRows = feeStructures.map(structure => {
      const components = structure.components.map(c =>
        `${c.name}: ₹${c.amount}${c.isTaxable ? ` (+${c.taxRate}% tax)` : ''}`
      ).join('; ');
      return [
        structure.classId?.className || 'Unknown',
        structure.name,
        structure.academicYear,
        structure.frequency,
        structure.isActive ? 'Active' : 'Inactive',
        components,
        structure.totalAmount
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('hidden', '');
    link.setAttribute('href', url);
    link.setAttribute('download', `fee_structures_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Fee Structure Management</h1>

      <ActionToolbar
        onOpenAssignFeeModal={() => setAssignFeeModalOpen(true)}
        onDownloadMonthly={handleDownloadMonthly}
        onDownloadClassWise={handleDownloadClassWise}
        onDownloadPendingVsCollected={handleDownloadPendingVsCollected}
        onDownloadDefaulters={handleDownloadDefaulters}
      />
 
      <FilterSection
        filter={filter}
        setFilter={setFilter}
        clearFilters={clearFilters}
        exportToCSV={exportToCSV}
        classes={classes}
        classesLoading={classesLoading}
        academicYears={academicYears}
        loadingAcademicYears={loadingAcademicYears}
      />

      <FeeStructureForm
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        editingId={editingId}
        isSubmitting={isSubmitting}
        classes={classes}
        classesLoading={classesLoading}
        academicYears={academicYears}
        loadingAcademicYears={loadingAcademicYears}
        predefinedFeeNames={predefinedFeeNames}
        selectedFeeNames={selectedFeeNames}
        setSelectedFeeNames={setSelectedFeeNames} // <-- Added this prop
        handleInputChange={handleInputChange}
        handleFeeNameSelect={handleFeeNameSelect}
        handleComponentChange={handleComponentChange}
        handleRemoveComponent={handleRemoveComponent}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        calculateTotal={calculateTotal}
      />

      <FeeStructureList
        feeStructures={feeStructures}
        loading={loading}
        expandedStructure={expandedStructure}
        toggleExpandStructure={toggleExpandStructure}
        handleEdit={handleEdit}
        handleDuplicate={handleDuplicate}
        confirmDelete={confirmDelete}
        classes={classes}
        academicYears={academicYears} // Pass academicYears to FeeStructureList
      />

      {/* Assign Fee Modal */}
      <AssignFeeModal
        isOpen={assignFeeModalOpen}
        onClose={() => setAssignFeeModalOpen(false)}
        onSubmit={handleAssignFeeSubmit}
        classes={classes}
        academicYears={academicYears}
        feeStructures={feeStructures}
        isSubmitting={isSubmitting}
        students={selectedClassStudents}
        loadingStudents={loadingStudents}
        onClassChange={fetchStudentsByClass}
        assignType={assignType}
        setAssignType={setAssignType}
        selectedClassStudents={selectedClassStudents}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Fee Structure"
        message={`Are you sure you want to delete the fee structure "${structureToDelete?.name}" for ${structureToDelete?.className || 'Unknown Class'} - ${structureToDelete?.academicYear}?`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
      />
    </div>
  );
};

export default FeeStructureManagement;
