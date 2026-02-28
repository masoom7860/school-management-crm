const mongoose = require('mongoose');
const Subadmin = require('../models/subAdmin');
const Admin = require('../models/adminModel');
const School = require('../models/registarSchoolModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Otp = require('../models/otp');
const { verifyOtp } = require('./otpController');


const createSubAdmin = async (req, res) => {
  console.log('✅ Received request body:', req.body); // Add this line
  const {
    name,
    email,
    phone,
    password,
    adminId,
    identityType,
    identityNumber,
    identityDocumentUrl,
    gender,
    dob,
    address,
    designation,
    emergencyContact
  } = req.body;
  const { schoolId } = req.params;

  console.log('✅ Received adminId:', adminId);
  console.log('✅ Received schoolId:', schoolId);

  if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: 'Invalid adminId or schoolId format' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(403).json({ message: 'Only admin can create subadmin' });
    }

    const school = await School.findOne({ _id: schoolId, admin: adminId });
    if (!school) {
      return res.status(404).json({ message: 'School not found or does not belong to the admin' });
    }

    const existing = await Subadmin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Subadmin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle photo upload file if exists
    let photoUrl = '';
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get('host')}/uploads/subadmins/${req.file.filename}`;
    }

    const subadmin = new Subadmin({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'subadmin',
      schoolId,
      createdBy: adminId,

      // Photo URL from uploaded file or empty
      photoUrl,

      identityType,
      identityNumber,
      identityDocumentUrl,
      gender,
      dob,
      address,
      designation,
      emergencyContact
    });

    await subadmin.save();

    res.status(201).json({
      message: 'Subadmin created successfully',
      subadmin
    });

  } catch (err) {
    console.error('❌ Error creating subadmin:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



const subadminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if subadmin exists
    const subadmin = await Subadmin.findOne({ email });
    if (!subadmin) {
      return res.status(404).json({ message: 'Subadmin not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, subadmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { subadminId: subadmin._id, schoolId: subadmin.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Adjust the token expiration time as needed
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      subadmin: {
        id: subadmin._id,
        name: subadmin.name,
        email: subadmin.email,
        phone: subadmin.phone,
      }
    });
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateSubadmin = async (req, res) => {
  const { adminId, subadminId } = req.params; // ⬅️ Now both are in the URL path
  const {
    name,
    email,
    phone,
    identityType,
    identityNumber,
    identityDocumentUrl,
    gender,
    dob,
    address,
    designation,
    emergencyContact
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(subadminId)) {
    return res.status(400).json({ message: 'Invalid adminId or subadminId format' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(403).json({ message: 'Only a valid admin can update subadmins' });
    }

    const subadmin = await Subadmin.findById(subadminId);
    if (!subadmin) {
      return res.status(404).json({ message: 'Subadmin not found' });
    }

    if (subadmin.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: 'You are not authorized to update this subadmin' });
    }

    // ✅ Update fields conditionally
    if (name) subadmin.name = name;
    if (email) subadmin.email = email;
    if (phone) subadmin.phone = phone;
    if (identityType) subadmin.identityType = identityType;
    if (identityNumber) subadmin.identityNumber = identityNumber;
    if (identityDocumentUrl) subadmin.identityDocumentUrl = identityDocumentUrl;
    if (gender) subadmin.gender = gender;
    if (dob) subadmin.dob = dob;
    if (address) subadmin.address = address;
    if (designation) subadmin.designation = designation;
    if (emergencyContact) subadmin.emergencyContact = emergencyContact;

    // ✅ Handle photo file update
    if (req.file) {
      subadmin.photoUrl = `${req.protocol}://${req.get('host')}/uploads/subadmins/${req.file.filename}`;
    }

    await subadmin.save();

    res.status(200).json({ message: 'Subadmin updated successfully', subadmin });
  } catch (error) {
    console.error('❌ Error updating subadmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const deleteSubadmin = async (req, res) => {
  const { subadminId } = req.params;
  const adminId = req.query.adminId || req.body.adminId;

  if (!subadminId || !adminId) {
    return res.status(400).json({ message: 'Subadmin ID and Admin ID are required' });
  }

  try {
    const subadmin = await Subadmin.findById(subadminId);
    if (!subadmin) {
      return res.status(404).json({ message: 'Subadmin not found' });
    }

    // Optional: Check if the admin has rights to delete
    if (subadmin.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: 'You are not authorized to delete this subadmin' });
    }

    await Subadmin.findByIdAndDelete(subadminId);

    res.status(200).json({ message: 'Subadmin deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting subadmin:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllSubadminsForSchool = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
    return res.status(400).json({ message: 'Valid schoolId is required' });
  }

  try {
    const subadmins = await Subadmin.find({ schoolId }).select('-password'); // Don't send password
    res.status(200).json({ subadmins });
  } catch (error) {
    console.error('❌ Error fetching subadmins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  createSubAdmin,
  subadminLogin,
  deleteSubadmin,
  updateSubadmin,
  getAllSubadminsForSchool
}
