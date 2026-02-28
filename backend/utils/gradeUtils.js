/**
 * Grade calculation utilities for marksheet management
 */

// Grade boundaries configuration
const GRADE_BOUNDARIES = {
  'A+': { min: 90, max: 100 },
  'A': { min: 80, max: 89 },
  'B+': { min: 70, max: 79 },
  'B': { min: 60, max: 69 },
  'C+': { min: 50, max: 59 },
  'C': { min: 40, max: 49 },
  'D': { min: 33, max: 39 },
  'F': { min: 0, max: 32 }
};

/**
 * Calculate grade based on percentage
 * @param {number} percentage - Percentage score (0-100)
 * @returns {string} Grade (A+, A, B+, B, C+, C, D, F)
 */
const calculateGrade = (percentage) => {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }

  for (const [grade, bounds] of Object.entries(GRADE_BOUNDARIES)) {
    if (percentage >= bounds.min && percentage <= bounds.max) {
      return grade;
    }
  }

  return 'F'; // Default fallback
};

/**
 * Determine pass/fail status based on percentage
 * @param {number} percentage - Percentage score (0-100)
 * @param {number} passingPercentage - Minimum percentage to pass (default: 33)
 * @returns {string} Status ('PASS' or 'FAIL')
 */
const determinePassFail = (percentage, passingPercentage = 33) => {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }

  return percentage >= passingPercentage ? 'PASS' : 'FAIL';
};

/**
 * Calculate total marks and percentage from subjects
 * @param {Array} subjects - Array of subject objects with marksObtained and maxMarks
 * @returns {Object} { totalObtained, totalMaxMarks, percentage }
 */
const calculateTotals = (subjects) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error('Subjects array is required and cannot be empty');
  }

  const totalObtained = subjects.reduce((sum, subject) => {
    if (typeof subject.marksObtained !== 'number' || subject.marksObtained < 0) {
      throw new Error(`Invalid marks obtained for subject: ${subject.subjectName || 'Unknown'}`);
    }
    return sum + subject.marksObtained;
  }, 0);

  const totalMaxMarks = subjects.reduce((sum, subject) => {
    const max = typeof subject.totalMaxMarks === 'number' ? subject.totalMaxMarks : subject.maxMarks;
    if (typeof max !== 'number' || max <= 0) {
      throw new Error(`Invalid max marks for subject: ${subject.subjectName || 'Unknown'}`);
    }
    return sum + max;
  }, 0);

  const percentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;

  return {
    totalObtained,
    totalMaxMarks,
    percentage: Math.round(percentage * 100) / 100 // Round to 2 decimal places
  };
};

/**
 * Calculate grade for individual subject
 * @param {number} marksObtained - Marks obtained in subject
 * @param {number} maxMarks - Maximum marks for subject
 * @returns {string} Grade for the subject
 */
const calculateSubjectGrade = (marksObtained, maxMarks) => {
  if (maxMarks <= 0) {
    throw new Error('Max marks must be greater than 0');
  }
  
  const percentage = (marksObtained / maxMarks) * 100;
  return calculateGrade(percentage);
};

/**
 * Validate marks for a subject
 * @param {number} marksObtained - Marks obtained
 * @param {number} maxMarks - Maximum marks
 * @param {number} passingMarks - Passing marks
 * @returns {Object} Validation result
 */
const validateSubjectMarks = (marksObtained, maxMarks, passingMarks) => {
  const errors = [];

  if (typeof marksObtained !== 'number' || marksObtained < 0) {
    errors.push('Marks obtained must be a non-negative number');
  }

  if (typeof maxMarks !== 'number' || maxMarks <= 0) {
    errors.push('Max marks must be a positive number');
  }

  if (typeof passingMarks !== 'number' || passingMarks < 0) {
    errors.push('Passing marks must be a non-negative number');
  }

  if (marksObtained > maxMarks) {
    errors.push('Marks obtained cannot exceed max marks');
  }

  if (passingMarks > maxMarks) {
    errors.push('Passing marks cannot exceed max marks');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  calculateGrade,
  determinePassFail,
  calculateTotals,
  calculateSubjectGrade,
  validateSubjectMarks,
  GRADE_BOUNDARIES
}; 