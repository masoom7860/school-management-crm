require('dotenv').config();
const axios = require('axios');

const testSuperAdminLogin = async () => {
  try {
    console.log('Testing Super Admin Login...');
    
    const response = await axios.post('http://localhost:5000/api/superadmin/login', {
      email: 'umar26@gmail.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Error:', error.response?.data || error.message);
  }
};

testSuperAdminLogin(); 