const Parent = require('../models/parentModel');
const Student = require('../models/studentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Otp = require('../models/otp');
const { verifyOtp } = require('../controllers/otpController');

const createParent = async (req, res) => {
  try {
    const { name, email, phone, password, schoolId, createdBy } = req.body;

    // Validate required fields
    if (!name || !email || !password || !schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, password, and schoolId are required' 
      });
    }

    // Normalize and trim inputs
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Check if parent exists
    const existing = await Parent.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ 
        success: false,
        message: 'Parent already exists with this email' 
      });
    }

    // Validate password strength
    if (trimmedPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 8 characters' 
      });
    }

    // Create parent - password will be hashed by the model's pre-save hook
    const parent = await Parent.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      password: trimmedPassword, // Pass the plain password - model will hash it
      schoolId,
      createdBy: createdBy || 'system',
      role: 'parent',
      loginAttempts: 0,
      isLocked: false,
      lastLogin: null
    });

    // Link existing students
    const students = await Student.find({ parentId: parent._id });
    if (students.length > 0) {
      parent.children = students.map(student => student._id);
      await parent.save();
    }

    // Create JWT token for immediate login
    const token = jwt.sign(
      {
        id: parent._id,
        role: parent.role,
        schoolId: parent.schoolId,
        email: parent.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        issuer: 'school-management',
        audience: 'web-app'
      }
    );

    // Prepare response data
    const parentData = parent.toObject();
    delete parentData.password;
    delete parentData.loginAttempts;
    delete parentData.isLocked;

    res.status(201).json({
      success: true,
      message: 'Parent created and logged in successfully',
      token,
      parent: parentData,
      children: students
    });

  } catch (err) {
    console.error('❌ Error in createParent:', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false,
      message: 'Internal server error during parent creation',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Both email and password are required' 
      });
    }

    // Normalize and trim inputs
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Find parent with email
    const parent = await Parent.findOne({ email: normalizedEmail })
      .select('+password +loginAttempts +isLocked +lockUntil')
      .populate('children', 'name email class');

    // Parent not found
    if (!parent) {
      return res.status(404).json({ 
        success: false,
        message: 'Parent account not found' 
      });
    }

    // Check if account is locked
    if (parent.isLocked && parent.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed attempts',
        unlockTime: parent.lockUntil
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(trimmedPassword, parent.password);
    
    // Password mismatch
    if (!isMatch) {
      parent.loginAttempts = (parent.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (parent.loginAttempts >= 5) {
        parent.isLocked = true;
        parent.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
      
      await parent.save();
      
      const attemptsRemaining = Math.max(0, 5 - parent.loginAttempts);
      
      return res.status(401).json({ 
        success: false,
        message: 'Incorrect password',
        attemptsRemaining: attemptsRemaining
      });
    }

    // Reset login attempts on successful login
    parent.loginAttempts = 0;
    parent.isLocked = false;
    parent.lockUntil = undefined;
    parent.lastLogin = Date.now();
    await parent.save();

    // Create JWT token
    const token = jwt.sign(
      {
        id: parent._id,
        role: parent.role,
        schoolId: parent.schoolId,
        email: parent.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        issuer: 'school-management',
        audience: 'web-app'
      }
    );

    // Return success response
    const parentData = parent.toObject();
    delete parentData.password;
    delete parentData.loginAttempts;
    delete parentData.isLocked;
    delete parentData.lockUntil;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      parent: parentData,
      children: parent.children
    });

  } catch (err) {
    console.error('Login error:', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getAllParents = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const parents = await Parent.find({ schoolId }).populate('children', 'name email class');
    res.status(200).json({ parents });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parents', error: err.message });
  }
};

const getParentById = async (req, res) => {
  const { parentId } = req.params;

  try {
    const parent = await Parent.findById(parentId).populate('children');
    if (!parent) return res.status(404).json({ message: 'Parent not found' });

    res.status(200).json({ parent });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parent', error: err.message });
  }
};

const updateParentPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify OTP
    const otpResult = await verifyOtp({ email: normalizedEmail, otp });
    if (!otpResult.valid) {
      return res.status(400).json({ message: otpResult.message });
    }

    // 2. Find Parent by Email
    const parent = await Parent.findOne({ email: normalizedEmail });
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // 3. Update Password (model will hash it automatically)
    parent.password = newPassword.trim();
    await parent.save();

    // 4. Clear used OTPs
    await Otp.deleteMany({ email: normalizedEmail });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteParent = async (req, res) => {
  const { parentId } = req.params;

  try {
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });

    await Student.updateMany({ parentId: parent._id }, { $unset: { parentId: '' } });
    await Parent.findByIdAndDelete(parentId);

    res.status(200).json({ message: 'Parent deleted and unlinked from students' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting parent', error: err.message });
  }
};

module.exports = {
  createParent,
  loginParent,
  getAllParents,
  getParentById,
  updateParentPasswordWithOtp,
  deleteParent
};