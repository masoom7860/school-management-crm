const Teacher = require('../models/teacherModel');
const Subject = require('../models/Subject');

/**
 * Check if a teacher can edit marks for specific classes/sections/subjects
 * @param {string} schoolId - School ID
 * @param {string} teacherId - Teacher ID
 * @param {Array} classIds - Array of class IDs
 * @param {Array} sectionIds - Array of section IDs
 * @param {Array} subjectIds - Array of subject IDs
 * @returns {Promise<boolean>} True if teacher has permission
 */
const canTeacherEditMarks = async (schoolId, teacherId, classIds = [], sectionIds = [], subjectIds = []) => {
  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || teacher.schoolId.toString() !== schoolId.toString()) {
      return false;
    }

    // If no specific restrictions, teacher can edit marks for their school
    if (classIds.length === 0 && sectionIds.length === 0 && subjectIds.length === 0) {
      return true;
    }

    // Check class assignments
    if (classIds.length > 0) {
      const hasClassAccess = classIds.some(classId => 
        teacher.classesAssigned.includes(classId)
      );
      if (!hasClassAccess) {
        return false;
      }
    }

    // Check subject assignments
    if (subjectIds.length > 0) {
      const teacherSubjects = teacher.subjects || [];
      const hasSubjectAccess = subjectIds.some(subjectId => {
        // For now, we'll check if the teacher has any subjects assigned
        // In a more detailed implementation, you might want to map subject IDs to subject names
        return teacherSubjects.length > 0;
      });
      if (!hasSubjectAccess) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking teacher permissions:', error);
    return false;
  }
};

/**
 * Check if user has admin privileges
 * @param {Object} user - User object from request
 * @returns {boolean} True if user is admin or superadmin
 */
const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'superadmin');
};

/**
 * Check if user has teacher privileges
 * @param {Object} user - User object from request
 * @returns {boolean} True if user is teacher
 */
const isTeacher = (user) => {
  return user && user.role === 'teacher';
};

/**
 * Check if user has staff privileges
 * @param {Object} user - User object from request
 * @returns {boolean} True if user is staff
 */
const isStaff = (user) => {
  return user && user.role === 'staff';
};

/**
 * Check if user has subadmin privileges
 * @param {Object} user - User object from request
 * @returns {boolean} True if user is subadmin
 */
const isSubadmin = (user) => {
  return user && user.role === 'subadmin';
};

/**
 * Check if user can access school data
 * @param {Object} user - User object from request
 * @param {string} schoolId - School ID to check access for
 * @returns {boolean} True if user has access to the school
 */
const canAccessSchool = (user, schoolId) => {
  if (!user || !schoolId) {
    return false;
  }

  // Superadmin can access all schools
  if (user.role === 'superadmin') {
    return true;
  }

  // Other roles must match the schoolId
  return user.schoolId && user.schoolId.toString() === schoolId.toString();
};

/**
 * Get teacher's assigned classes and subjects
 * @param {string} teacherId - Teacher ID
 * @param {string} schoolId - School ID
 * @returns {Promise<Object>} Teacher's assignments
 */
const getTeacherAssignments = async (teacherId, schoolId) => {
  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || teacher.schoolId.toString() !== schoolId.toString()) {
      return { classes: [], subjects: [] };
    }

    return {
      classes: teacher.classesAssigned || [],
      subjects: teacher.subjects || []
    };
  } catch (error) {
    console.error('Error getting teacher assignments:', error);
    return { classes: [], subjects: [] };
  }
};

/**
 * Filter data based on user role and permissions
 * @param {Object} user - User object from request
 * @param {Array} data - Data to filter
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} Filtered data
 */
const filterDataByPermissions = async (user, data, schoolId) => {
  if (!user || !data) {
    return [];
  }

  // Admin and superadmin can see all data
  if (isAdmin(user)) {
    return data;
  }

  // Teacher can only see data for their assigned classes/subjects
  if (isTeacher(user)) {
    const assignments = await getTeacherAssignments(user._id || user.id, schoolId);
    
    return data.filter(item => {
      // Filter by class assignment
      if (item.classId && assignments.classes.length > 0) {
        return assignments.classes.includes(item.classId.toString());
      }
      
      // If no class assignment restrictions, allow access
      return true;
    });
  }

  // Staff and subadmin can see all data for their school
  if (isStaff(user) || isSubadmin(user)) {
    return data;
  }

  return [];
};

module.exports = {
  canTeacherEditMarks,
  isAdmin,
  isTeacher,
  isStaff,
  isSubadmin,
  canAccessSchool,
  getTeacherAssignments,
  filterDataByPermissions
}; 