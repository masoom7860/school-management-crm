const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyOtp } = require('../controllers/otpController'); 
const Otp = require('../models/otp'); 

// Import your models
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const Staff = require('../models/staffModel');
const Parent = require('../models/parentModel');
const Subadmin = require('../models/subAdmin');

// POST /user-login
router.post('/user', async (req, res) => {
  const { email, password, role, schoolId } = req.body;

  if (!email || !password || !role || !schoolId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let Model;

  switch (role.toLowerCase()) {
    case 'student': Model = Student; break;
    case 'teacher': Model = Teacher; break;
    case 'staff': Model = Staff; break;
    case 'parent': Model = Parent; break;
    case 'subadmin': Model = Subadmin; break;
    default: return res.status(400).json({ error: 'Invalid role provided' });
  }

  try {
   
    const user = await Model.findOne({ email, schoolId }).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found in this school' });
    }

  
    if (!user.password) {
      return res.status(500).json({ error: 'Password not set for this user' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role,
        schoolId,
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role,
      schoolId,
      name: user.name,
      userId: user._id, // Include the user's ID in the response
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', async (req, res) => {
    const { email, schoolId, role, otp, newPassword } = req.body;

    if (!email || !schoolId || !role || !otp || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let Model;

    switch (role.toLowerCase()) {
      case 'student': Model = Student; break;
      case 'teacher': Model = Teacher; break;
      case 'staff': Model = Staff; break;
      case 'parent': Model = Parent; break;
      case 'subadmin': Model = Subadmin; break;
      default: return res.status(400).json({ error: 'Invalid role provided' });
    }

    try {
        // Verify OTP
        const otpVerification = await verifyOtp({ email, otp });

        if (!otpVerification.valid) {
            return res.status(400).json({ error: otpVerification.message });
        }

        // Find the user
        const user = await Model.findOne({ email, schoolId });

        if (!user) {
            return res.status(404).json({ error: 'User not found in this school' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Delete the used OTP record
        await Otp.deleteMany({ email });

        res.status(200).json({ message: 'Password reset successfully.' });

    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
