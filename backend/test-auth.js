require('dotenv').config({ path: './.env' });
const jwt = require('jsonwebtoken');

// Test JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure';

console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Using JWT_SECRET:', JWT_SECRET ? 'AVAILABLE' : 'NOT AVAILABLE');

// Create a test token
const testPayload = {
  id: 'test123',
  role: 'teacher',
  schoolId: 'school123'
};

try {
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ Token created successfully');
  
  // Verify the token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('Decoded payload:', decoded);
  
} catch (error) {
  console.error('❌ JWT Error:', error.message);
}

console.log('Test completed'); 