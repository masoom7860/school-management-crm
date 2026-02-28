const mongoose = require('mongoose');
const FeeStructure = require('../models/feeStructureModel');
const Session = require('../models/sessionModel');
const StudentFee = require('../models/studentFeeModel');

// Create Fee Structure
const createFeeStructure = async (req, res) => {
  try {
    const { schoolId, classId, sectionId, academicYear, name, description, frequency = 'yearly', dueDate, isActive = true, components, lateFeeEnabled = false, lateFeePerDay = 10, lateFeeGraceDays = 0 } = req.body;

    // Validate required fields
    if (!schoolId || !classId || !academicYear || !name || !components) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, classId, academicYear, name, or components'
      });
    }

    // Validate components array
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Components must be a non-empty array'
      });
    }

    // Validate dueDate based on frequency
    if (frequency !== 'one-time' && !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'dueDate is required for the selected frequency'
      });
    }

    // Recalculate totalAmount with taxes
    const totalAmount = components.reduce((acc, curr) => {
      const amount = curr.amount || 0;
      const tax = curr.isTaxable ? amount * (curr.taxRate || 0) / 100 : 0;
      return acc + amount + tax;
    }, 0);

    // Normalize academicYear: if an ObjectId is provided (Session _id), store its yearRange string for consistency
    let academicYearValue = academicYear;
    if (mongoose.Types.ObjectId.isValid(academicYear)) {
      try {
        const sessionDoc = await Session.findById(academicYear).lean();
        if (sessionDoc?.yearRange) academicYearValue = sessionDoc.yearRange;
      } catch (e) {
        // ignore lookup errors and keep original value
      }
    }

    const feeStructure = await FeeStructure.create({
      schoolId,
      classId,
      sectionId,
      academicYear: academicYearValue,
      name,
      description,
      frequency,
      dueDate: frequency === 'one-time' ? undefined : dueDate,
      isActive,
      lateFeeEnabled,
      lateFeePerDay,
      lateFeeGraceDays,
      components,
      totalAmount,
      createdBy: req.decodedToken?.id || req.user?.id
    });

    res.status(201).json({ 
      success: true, 
      message: 'Fee structure created successfully',
      data: feeStructure 
    });
  } catch (err) {
    console.error('Error creating fee structure:', err.message);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${err.message}`
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error during fee structure creation: ' + err.message
    });
  }
};

// Get Fee Structures
const getFeeStructures = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { classId, sectionId, academicYear, isActive, frequency } = req.query;

    // Validate schoolId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID format'
      });
    }

    const filter = { schoolId };
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    // Accept academicYear as either Session ObjectId or yearRange string
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    if (frequency) filter.frequency = frequency;

    const feeStructures = await FeeStructure.find(filter)
      .populate({
        path: 'classId',
        select: 'className'
      })
      .populate({
        path: 'sectionId',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: feeStructures.length,
      data: feeStructures 
    });
  } catch (err) {
    console.error('Error fetching fee structures:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while retrieving fee structures' 
    });
  }
};

// Update Fee Structure
const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee structure ID format'
      });
    }
    
    // Recalculate totalAmount if components are updated
    if (update.components) {
      if (!Array.isArray(update.components)) {
        return res.status(400).json({
          success: false,
          message: 'Components must be an array'
        });
      }
      
      update.totalAmount = update.components.reduce((acc, curr) => {
        const amount = curr.amount || 0;
        const tax = curr.isTaxable ? amount * (curr.taxRate || 0) / 100 : 0;
        return acc + amount + tax;
      }, 0);
    }
    
    // Normalize academicYear on update if a Session ObjectId was provided
    if (update.academicYear && mongoose.Types.ObjectId.isValid(update.academicYear)) {
      try {
        const sessionDoc = await Session.findById(update.academicYear).lean();
        if (sessionDoc?.yearRange) update.academicYear = sessionDoc.yearRange;
      } catch (e) {
        // keep provided value if lookup fails
      }
    }

    // Validate dueDate if changing frequency
    if (update.frequency && update.frequency !== 'one-time' && !update.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'dueDate is required for the selected frequency'
      });
    }
    
    // Add updatedBy information
    update.updatedBy = req.decodedToken?.id || req.user?.id;
    
    const options = { 
      new: true,
      runValidators: true
    };
    
    const feeStructure = await FeeStructure.findByIdAndUpdate(id, update, options);
    
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }
    
    try {
      const setFields = {};
      if (Object.prototype.hasOwnProperty.call(update, 'lateFeeEnabled')) {
        setFields.lateFeeEnabled = !!update.lateFeeEnabled;
      }
      if (Object.prototype.hasOwnProperty.call(update, 'lateFeePerDay')) {
        setFields.lateFeePerDay = Number(update.lateFeePerDay || 0);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'lateFeeGraceDays')) {
        setFields.lateFeeGraceDays = Number(update.lateFeeGraceDays || 0);
      }
      if (Object.prototype.hasOwnProperty.call(update, 'dueDate') && update.dueDate) {
        setFields.dueDate = update.dueDate;
      }
      if (Object.keys(setFields).length > 0) {
        await StudentFee.updateMany(
          { feeStructureId: id, status: { $ne: 'Paid' } },
          { $set: setFields }
        );
      }
    } catch (e) {
      console.error('Failed to propagate late fee settings to StudentFee:', e?.message || e);
    }
    
    res.json({ 
      success: true, 
      message: 'Fee structure updated successfully',
      data: feeStructure 
    });
  } catch (err) {
    console.error('Error updating fee structure:', err.message);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${err.message}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during fee structure update: ' + err.message 
    });
  }
};

// Delete Fee Structure
const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee structure ID format'
      });
    }
    
    const feeStructure = await FeeStructure.findByIdAndDelete(id);
    
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Fee structure deleted successfully',
      data: { id } 
    });
  } catch (err) {
    console.error('Error deleting fee structure:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during fee structure deletion' 
    });
  }
};

// Get active academic years from sessions
const getAcademicYears = async (req, res) => {
  try {
    const schoolId = req.headers['school-id']; // Get schoolId from headers
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required in headers'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID format'
      });
    }

    const sessions = await Session.find({ 
      schoolId,
      isActive: true 
    }).sort({ yearRange: -1 });

    const years = sessions.map(session => ({
      value: session.yearRange,
      label: session.yearRange,
      startDate: session.startDate,
      endDate: session.endDate
    }));

    res.json({
      success: true,
      data: years
    });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching academic years'
    });
  }
};

module.exports = {
  createFeeStructure,
  getFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
  getAcademicYears
};
