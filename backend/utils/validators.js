const { body, query, param, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Validation rules for creating a single marksheet
 */
const createMarksheetValidation = [
  body('schoolId')
    .isMongoId()
    .withMessage('School ID must be a valid MongoDB ID'),
  body('session')
    .isString()
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Session must be between 4 and 10 characters (e.g., 2024-2025)'),
  body('classId')
    .isMongoId()
    .withMessage('Class ID must be a valid MongoDB ID'),
  body('sectionId')
    .isMongoId()
    .withMessage('Section ID must be a valid MongoDB ID'),
  body('examId')
    .isMongoId()
    .withMessage('Exam ID must be a valid MongoDB ID'),
  body('studentId')
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ID'),
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  body('subjects.*.subjectId')
    .isMongoId()
    .withMessage('Subject ID must be a valid MongoDB ID'),
  body('subjects.*.subjectName')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Subject name must be between 1 and 50 characters'),
  body('subjects.*.maxMarks')
    .isFloat({ min: 1 })
    .withMessage('Max marks must be a positive number'),
  body('subjects.*.passingMarks')
    .isFloat({ min: 0 })
    .withMessage('Passing marks must be a non-negative number'),
  body('subjects.*.marksObtained')
    .isFloat({ min: 0 })
    .withMessage('Marks obtained must be a non-negative number'),
  body('remarks')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),
  handleValidationErrors
];

/**
 * Validation rules for bulk upsert marksheets
 */
const bulkUpsertMarksheetValidation = [
  body('schoolId')
    .isMongoId()
    .withMessage('School ID must be a valid MongoDB ID'),
  body('session')
    .isString()
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Session must be between 4 and 10 characters'),
  body('classId')
    .isMongoId()
    .withMessage('Class ID must be a valid MongoDB ID'),
  body('sectionId')
    .isMongoId()
    .withMessage('Section ID must be a valid MongoDB ID'),
  body('examId')
    .isMongoId()
    .withMessage('Exam ID must be a valid MongoDB ID'),
  body('entries')
    .isArray({ min: 1 })
    .withMessage('At least one entry is required'),
  body('entries.*.studentId')
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ID'),
  body('entries.*.subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required per student'),
  body('entries.*.subjects.*.subjectId')
    .isMongoId()
    .withMessage('Subject ID must be a valid MongoDB ID'),
  body('entries.*.subjects.*.maxMarks')
    .isFloat({ min: 1 })
    .withMessage('Max marks must be a positive number'),
  body('entries.*.subjects.*.passingMarks')
    .isFloat({ min: 0 })
    .withMessage('Passing marks must be a non-negative number'),
  body('entries.*.subjects.*.marksObtained')
    .isFloat({ min: 0 })
    .withMessage('Marks obtained must be a non-negative number'),
  handleValidationErrors
];

/**
 * Validation rules for updating marksheet
 */
const updateMarksheetValidation = [
  param('id')
    .isMongoId()
    .withMessage('Marksheet ID must be a valid MongoDB ID'),
  body('subjects')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  body('subjects.*.subjectId')
    .optional()
    .isMongoId()
    .withMessage('Subject ID must be a valid MongoDB ID'),
  body('subjects.*.marksObtained')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Marks obtained must be a non-negative number'),
  body('remarks')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),
  handleValidationErrors
];

/**
 * Validation rules for listing marksheets
 */
const listMarksheetsValidation = [
  query('schoolId')
    .optional()
    .isMongoId()
    .withMessage('School ID must be a valid MongoDB ID'),
  query('session')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Session must be between 4 and 10 characters'),
  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Class ID must be a valid MongoDB ID'),
  query('sectionId')
    .optional()
    .isMongoId()
    .withMessage('Section ID must be a valid MongoDB ID'),
  query('examId')
    .optional()
    .isMongoId()
    .withMessage('Exam ID must be a valid MongoDB ID'),
  query('studentId')
    .optional()
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  handleValidationErrors
];

/**
 * Validation rules for getting dropdowns
 */
const getDropdownsValidation = [
  query('schoolId')
    .isMongoId()
    .withMessage('School ID must be a valid MongoDB ID'),
  query('teacherId')
    .optional()
    .isMongoId()
    .withMessage('Teacher ID must be a valid MongoDB ID'),
  handleValidationErrors
];

/**
 * Validation rules for getting single marksheet
 */
const getMarksheetValidation = [
  param('id')
    .isMongoId()
    .withMessage('Marksheet ID must be a valid MongoDB ID'),
  handleValidationErrors
];

/**
 * Validation rules for getting student marksheets
 */
const getStudentMarksheetsValidation = [
  param('studentId')
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ID'),
  handleValidationErrors
];

/**
 * Validation rules for deleting marksheet
 */
const deleteMarksheetValidation = [
  param('id')
    .isMongoId()
    .withMessage('Marksheet ID must be a valid MongoDB ID'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  createMarksheetValidation,
  bulkUpsertMarksheetValidation,
  updateMarksheetValidation,
  listMarksheetsValidation,
  getDropdownsValidation,
  getMarksheetValidation,
  getStudentMarksheetsValidation,
  deleteMarksheetValidation
}; 