// Test authentication token handling
export const testAuth = () => {
  console.log('=== Testing Authentication ===');
  
  // Check if token exists
  const token = localStorage.getItem('token');
  const schoolId = localStorage.getItem('schoolId');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');
  
  console.log('Token exists:', !!token);
  console.log('School ID:', schoolId);
  console.log('Role:', role);
  console.log('User Name:', userName);
  
  if (token) {
    try {
      // Try to decode the token (without verification)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        console.log('Token expiration:', new Date(payload.exp * 1000));
        console.log('Token is expired:', Date.now() > payload.exp * 1000);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  // Test API call
  const testApiCall = async () => {
    try {
      console.log('Testing debug endpoint...');
      const response = await fetch('http://localhost:5000/api/marksheets/debug', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Debug API Response:', data);
      console.log('Debug API Status:', response.status);
      
      if (response.status === 200) {
        console.log('✅ Authentication is working!');
      } else {
        console.log('❌ Authentication failed');
      }
      
    } catch (error) {
      console.error('API Error:', error);
    }
  };
  
  if (token) {
    testApiCall();
  }
  
  return { token, schoolId, role, userName };
};

export default testAuth; 