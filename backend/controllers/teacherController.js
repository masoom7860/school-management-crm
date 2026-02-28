const Teacher = require('../models/teacherModel');
const Admin = require('../models/adminModel');
const School = require('../models/registarSchoolModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Otp = require('../models/otp');
const jwt = require('jsonwebtoken');
const { verifyOtp } = require('./otpController');
const path = require('path');
const fs = require('fs');

const generateEmployeeId = async (schoolId, role = 'teacher') => {
    // Ensure schoolId is valid and at least 4 characters
    if (!schoolId || schoolId.length < 4) {
      throw new Error('Invalid schoolId for employee ID generation');
    }

    // Fetch school details to get school name
    const school = await School.findById(schoolId);
    if (!school) {
      throw new Error('School not found');
    }

    let schoolPrefix = '';

    // Special case for "Faizabad Public Inter College"
    if (school.schoolName.toLowerCase().includes('faizabad public inter college')) {
      // Generate "FBPSST" prefix for Faizabad Public Inter College
      schoolPrefix = 'FBPSST';
    } else {
      // Generate prefix from school name (first letters of words)
      const schoolNameWords = school.schoolName.trim().split(' ');
      if (schoolNameWords.length >= 2) {
        // Take first letter of first two words
        schoolPrefix = (schoolNameWords[0][0] + schoolNameWords[1][0]).toUpperCase();
      } else if (schoolNameWords.length === 1) {
        // Take first two letters of single word
        schoolPrefix = school.schoolName.substring(0, 2).toUpperCase();
      } else {
        // Fallback to schoolId prefix if no valid school name
        schoolPrefix = schoolId.substring(schoolId.length - 2).toUpperCase();
      }

      // Ensure prefix is at least 2 characters
      if (schoolPrefix.length < 2) {
        schoolPrefix = schoolId.substring(schoolId.length - 2).toUpperCase();
      }
    }

    // Add role-based suffix for staff/teacher differentiation
    const roleSuffix = role === 'staff' ? 'ST' : 'TE';

    const timestamp = Date.now().toString().slice(-4); // Use last 4 digits of timestamp
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2-digit random number

    return `${schoolPrefix}${roleSuffix}${timestamp}${randomSuffix}`;
  };

// Create Teacher
const createTeacher = async (req, res) => {
  // Check if req.body is defined before destructuring
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing or empty.' });
  }

  const {
    name, gender, dob, nationalId,
    email, phone, address, emergencyContact,
    qualification, experience,
    employeeId, joiningDate, subjects, classesAssigned,
    password, adminId
  } = req.body;

  const { schoolId } = req.params;

  // Basic validation for required fields
  if (!name || !email || !password || !adminId || !schoolId) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password, adminId, schoolId' });
  }


  if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: 'Invalid adminId or schoolId format' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: 'Unauthorized' });

    const school = await School.findOne({ _id: schoolId, admin: adminId });
    if (!school) return res.status(404).json({ message: 'School not found or not linked to admin' });

    // Auto-generate employee ID if not provided
    let finalEmployeeId = employeeId;
    if (!finalEmployeeId) {
      try {
        finalEmployeeId = await generateEmployeeId(schoolId, 'teacher');
      } catch (error) {
        return res.status(400).json({ message: 'Error generating employee ID: ' + error.message });
      }
    }

    // Check if employee ID is unique within the school
    const existingTeacher = await Teacher.findOne({ employeeId: finalEmployeeId, schoolId });
    if (existingTeacher) {
      // If there's a collision, generate a new one
      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        try {
          finalEmployeeId = await generateEmployeeId(schoolId, 'teacher');
          const collisionCheck = await Teacher.findOne({ employeeId: finalEmployeeId, schoolId });
          if (!collisionCheck) break;
          attempts++;
        } catch (error) {
          return res.status(400).json({ message: 'Error generating unique employee ID: ' + error.message });
        }
      }
      if (attempts >= maxAttempts) {
        return res.status(500).json({ message: 'Unable to generate unique employee ID after multiple attempts' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get photo filename from multer file upload (if provided)
    let photoFilename = null;
    if (req.file) {
      photoFilename = req.file.filename;
    }

    const teacher = new Teacher({
      name,
      gender,
      dob,
      photo: photoFilename, // use uploaded photo filename or null
      nationalId,
      email,
      phone,
      address,
      emergencyContact,
      qualification,
      experience,
      employeeId: finalEmployeeId,
      joiningDate,
      subjects: typeof subjects === 'string' ? JSON.parse(subjects) : subjects,
      classesAssigned: typeof classesAssigned === 'string' ? JSON.parse(classesAssigned) : classesAssigned,
      password: hashedPassword,
      role: 'teacher',
      schoolId,
      createdBy: adminId
    });

    await teacher.save();

    res.status(201).json({ message: 'Teacher created successfully', teacher });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



const teacherLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Email and password are required' 
        });
    }

    try {
        // Check if teacher exists
        const teacher = await Teacher.findOne({ email }).select('+password');
        if (!teacher) {
            return res.status(404).json({ 
                success: false,
                message: 'Teacher not found' 
            });
        }

        // Check if account is active
        if (!teacher.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is not active. Please contact administrator.'
            });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Create JWT token payload
        const tokenPayload = {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            role: 'teacher',
            schoolId: teacher.schoolId
        };

        // Generate JWT token
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' }  // Longer expiration for better UX
        );

        // Get school details
        const school = await School.findById(teacher.schoolId).select('name');

        // Successful response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone,
                role: 'teacher',
                schoolId: teacher.schoolId,
                schoolName: school?.name || 'School'
            },
            expiresIn: 28800 // 8 hours in seconds
        });

    } catch (err) {
        console.error('Teacher login error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
};

const updateTeacher = async (req, res) => {
  const { teacherId } = req.params;

  let updateData = { ...req.body };

  // Parse JSON strings if needed
  if (typeof updateData.subjects === 'string') {
    updateData.subjects = JSON.parse(updateData.subjects);
  }
  if (typeof updateData.classesAssigned === 'string') {
    updateData.classesAssigned = JSON.parse(updateData.classesAssigned);
  }
  if (typeof updateData.isActive === 'string') {
    updateData.isActive = updateData.isActive === 'true';
  }

  try {
    // If password provided, hash it first
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Handle employee ID auto-generation for updates
    if (updateData.employeeId === '' || !updateData.employeeId) {
      // First get the existing teacher to know which school they belong to
      const existingTeacher = await Teacher.findById(teacherId);
      if (existingTeacher) {
        try {
          const newEmployeeId = await generateEmployeeId(existingTeacher.schoolId, 'teacher');
          updateData.employeeId = newEmployeeId;
        } catch (error) {
          return res.status(400).json({ message: 'Error generating employee ID: ' + error.message });
        }
      }
    }

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({ message: 'Teacher updated successfully', teacher });

  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Get all teachers of school
const getAllTeachers = async (req, res) => {
    const { schoolId } = req.params;

    try {
        const teachers = await Teacher.find({ schoolId });
        res.status(200).json({ teachers });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
    const { teacherId } = req.params;
    const { adminId } = req.query; // Changed from body to query

    if (!teacherId || !adminId) {
        return res.status(400).json({ message: 'Teacher ID and Admin ID are required' });
    }

    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const school = await School.findOne({ _id: teacher.schoolId, admin: adminId });
        if (!school) return res.status(403).json({ message: 'Unauthorized to delete this teacher' });

        await Teacher.findByIdAndDelete(teacherId);
        res.status(200).json({ message: 'Teacher deleted successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get single teacher by ID
const getTeacherById = async (req, res) => {
    const { teacherId } = req.params;

    if (!teacherId) {
        return res.status(400).json({ message: 'Teacher ID is required' });
    }

    try {
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json({ teacher });

    } catch (err) {
        console.error('Error fetching teacher by ID:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


module.exports = {
    createTeacher,
    getAllTeachers,
    deleteTeacher,
    teacherLogin,
    updateTeacher,
    getTeacherById // Add the new function to exports
};
