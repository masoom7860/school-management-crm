require('dotenv').config({ path: './.env' });

console.log('=== Starting Server ===');
console.log('Environment variables:');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('- PORT:', process.env.PORT || 5000);

// Test JWT functionality
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure';

try {
  const testToken = jwt.sign({ test: 'data' }, JWT_SECRET);
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('✅ JWT functionality working');
} catch (error) {
  console.error('❌ JWT Error:', error.message);
  process.exit(1);
}

// Start the server
try {
  require('./index.js');
  console.log('✅ Server started successfully');
} catch (error) {
  console.error('❌ Server Error:', error.message);
  process.exit(1);
} 