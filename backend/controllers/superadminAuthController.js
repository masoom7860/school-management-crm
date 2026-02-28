const SuperAdmin = require('../models/superAdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const School = require('../models/registarSchoolModel');

// Register Super Admin
const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, registrationKey } = req.body;
    if (!name || !email || !password || !registrationKey) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Check registration key
    const VALID_KEY = process.env.SUPERADMIN_REGISTRATION_KEY;
    console.log('DEBUG: Received registrationKey:', registrationKey, 'Expected:', VALID_KEY);
    if (registrationKey !== VALID_KEY) {
      return res.status(403).json({ message: 'Invalid registration key.' });
    }
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const superAdmin = new SuperAdmin({ name, email, password: hashedPassword });
    await superAdmin.save();
    res.status(201).json({ message: 'Super Admin registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login Super Admin
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: superAdmin._id, role: 'superadmin' }, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure', { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, superAdmin: { id: superAdmin._id, name: superAdmin.name, email: superAdmin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all admins (no populate)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    
    // For each admin, find the school that references them
    const adminsWithSchools = await Promise.all(
      admins.map(async (admin) => {
        const school = await School.findOne({ admin: admin._id });
        return {
          ...admin.toObject(),
          school: school ? school.toObject() : null
        };
      })
    );
    
    res.json(adminsWithSchools);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admins', error: err.message });
  }
};

// Delete a school and its admin by schoolId
const deleteSchoolAndAdmin = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // First find the school to get the admin ID
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    const adminId = school.admin;
    
    // Delete the school first
    await School.findByIdAndDelete(schoolId);
    
    // Then delete the admin
    await Admin.findByIdAndDelete(adminId);
    
    res.json({ message: 'School and associated admin deleted successfully.' });
  } catch (err) {
    console.error('Error deleting school and admin:', err);
    res.status(500).json({ message: 'Failed to delete school/admin', error: err.message });
  }
};

// Get all super admins
const getAllSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await SuperAdmin.find({}, 'name email');
    res.status(200).json({ superAdmins });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch super admins', error: err.message });
  }
};

module.exports = {
  registerSuperAdmin,
  loginSuperAdmin,
  getAllAdmins,
  deleteSchoolAndAdmin,
  getAllSuperAdmins
}; 