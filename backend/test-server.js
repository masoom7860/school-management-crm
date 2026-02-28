require('dotenv').config({ path: './.env' });
const axios = require('axios');

console.log('=== Testing Server and Authentication ===');

// Test environment variables
console.log('Environment Check:');
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

// Test server startup
let server;
try {
  const app = require('./index.js');
  console.log('✅ Server module loaded successfully');
  
  // Wait a moment for server to start
  setTimeout(async () => {
    try {
      console.log('Testing server endpoints...');
      
      // Test basic endpoint
      const testResponse = await axios.get('http://localhost:5000/api/test');
      console.log('✅ Basic endpoint working:', testResponse.data);
      
      // Test authentication endpoint
      const authResponse = await axios.get('http://localhost:5000/api/marksheets/debug', {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication endpoint working (correctly rejected invalid token)');
      } else {
        console.log('❌ Server not responding:', error.message);
      }
    }
    
    console.log('Test completed');
    process.exit(0);
  }, 2000);
  
} catch (error) {
  console.error('❌ Server Error:', error.message);
  process.exit(1);
} 