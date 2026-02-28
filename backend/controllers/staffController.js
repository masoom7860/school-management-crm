const Staff = require('../models/staffModel');
const Admin = require('../models/adminModel');
const School = require('../models/registarSchoolModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Otp = require('../models/otp');
const { verifyOtp } = require('./otpController');
const mongoose = require('mongoose');

const createStaff = async (req, res) => {
  console.log('✅ Received request body (Staff):', req.body); // Add this line
  console.log('✅ Received request files (Staff):', req.files); // Add this line

  const { name, email, phone, password, identityType, identityNumber, gender, dob, address, designation, emergencyContact, adminId } = req.body;
  const { schoolId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: 'Invalid adminId or schoolId format' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(403).json({ message: 'Only admin can create staff' });
    }

    const school = await School.findOne({ _id: schoolId, admin: adminId });
    if (!school) {
      return res.status(404).json({ message: 'School not found or not linked to this admin' });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Staff with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle uploaded files
    const photoUrl = req.files?.photo?.[0]?.path || '';
    const identityDocumentUrl = req.files?.identityDocument?.[0]?.path || '';

    const staff = new Staff({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'staff',
      schoolId,
      createdBy: adminId,
      photoUrl,
      identityType,
      identityNumber,
      identityDocumentUrl,
      gender,
      dob,
      address,
      designation,
      emergencyContact,
    });

    await staff.save();

    res.status(201).json({ message: 'Staff created successfully', staff });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  const { staffId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    return res.status(400).json({ message: 'Invalid staffId format' });
  }

  try {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const {
      name,
      email,
      phone,
      identityType,
      identityNumber,
      gender,
      dob,
      address,
      designation,
      emergencyContact,
    } = req.body;

    // Update fields if provided
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (phone) staff.phone = phone;
    if (identityType) staff.identityType = identityType;
    if (identityNumber) staff.identityNumber = identityNumber;
    if (gender) staff.gender = gender;
    if (dob) staff.dob = dob;
    if (address) staff.address = address;
    if (designation) staff.designation = designation;
    if (emergencyContact) staff.emergencyContact = emergencyContact;

    // Handle uploaded files
    if (req.files?.photo?.[0]) {
      staff.photoUrl = req.files.photo[0].path;
    }

    if (req.files?.identityDocument?.[0]) {
      staff.identityDocumentUrl = req.files.identityDocument[0].path;
    }

    await staff.save();

    res.status(200).json({ message: 'Staff updated successfully', staff });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
  
const staffLogin = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const staff = await Staff.findOne({ email });
      if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
      }
  
      const isMatch = await bcrypt.compare(password, staff.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { staffId: staff._id, schoolId: staff.schoolId, role: staff.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({
        message: 'Login successful',
        token,
        staff: {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// Delete Staff
const deleteStaff = async (req, res) => {
  const { staffId } = req.params;
  const adminId = req.query.adminId || req.body.adminId;

  if (!staffId || !adminId) {
    return res.status(400).json({ message: 'Staff ID and Admin ID are required' });
  }

  try {
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    if (staff.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: 'You are not authorized to delete this staff member' });
    }

    await Staff.findByIdAndDelete(staffId);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all staff for a school
const getAllStaffForSchool = async (req, res) => {
  const { schoolId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: 'Invalid schoolId' });
  }

  try {
    const staffList = await Staff.find({ schoolId }).select('-password');
    res.status(200).json({ staff: staffList });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





module.exports = {
  createStaff,
  staffLogin,
  deleteStaff,
  getAllStaffForSchool,
  updateStaff
};
