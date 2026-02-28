const SuperAdmin = require('../models/superAdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register SuperAdmin
const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'SuperAdmin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const superadmin = new SuperAdmin({ name, email, password: hashedPassword });
    await superadmin.save();
    res.status(201).json({ message: 'SuperAdmin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login SuperAdmin
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const superadmin = await SuperAdmin.findOne({ email });
    if (!superadmin) {
      return res.status(404).json({ message: 'SuperAdmin not found' });
    }
    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: superadmin._id, role: 'superadmin', name: superadmin.name, email: superadmin.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure',
      { expiresIn: '7d' }
    );
    res.status(200).json({ message: 'Login successful', token, role: 'superadmin', name: superadmin.name, email: superadmin.email });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

module.exports = { registerSuperAdmin, loginSuperAdmin }; 