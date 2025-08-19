const axios = require('axios');

// Test CORS configuration
async function testCORS() {
  const baseURL = process.env.DEPLOYMENT_URL || 'http://localhost:5000';
  
  console.log('Testing CORS configuration...');
  console.log('Base URL:', baseURL);
  console.log('Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
  
  try {
    // Test preflight request
    const response = await axios.options(`${baseURL}/api/leaves`, {
      headers: {
        'Origin': process.env.FRONTEND_URL || 'http://localhost:3000'
      }
    });
    
    console.log('✅ CORS preflight test passed');
    console.log('Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    
    // Test actual request
    const actualResponse = await axios.get(`${baseURL}/api/leaves`, {
      headers: {
        'Origin': process.env.FRONTEND_URL || 'http://localhost:3000'
      }
    });
    
    console.log('✅ CORS actual request test passed');
    console.log('Response status:', actualResponse.status);
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Run the test
if (require.main === module) {
  testCORS();
}

module.exports = { testCORS };
