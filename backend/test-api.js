const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing UTH SIS API...\n');

  try {
    // Test 1: Login endpoint
    console.log('1️⃣ Testing login endpoint...');
    console.log('⚠️  Note: This test uses dummy credentials and will fail.');
    console.log('   Use real UTH credentials in the frontend for actual testing.\n');
    
    const loginResponse = await axios.post(`${API_BASE}/sis/login`, {
      username: 'test_user',
      password: 'test_password'
    });
    
    console.log('✅ Login endpoint responds correctly');
    console.log('Response:', loginResponse.data);
    
    if (loginResponse.data.success) {
      const sessionId = loginResponse.data.sessionId;
      
      // Test 2: Grades endpoint
      console.log('\n2️⃣ Testing grades endpoint...');
      const gradesResponse = await axios.post(`${API_BASE}/sis/grades`, {
        sessionId
      });
      
      console.log('✅ Grades endpoint responds correctly');
      console.log('Response:', gradesResponse.data);
      
      if (gradesResponse.data.success) {
        console.log(`📊 Found ${gradesResponse.data.count} grades`);
        gradesResponse.data.grades.forEach((grade, index) => {
          console.log(`  ${index + 1}. ${grade.course} - ${grade.grade} (${grade.status})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n📋 Expected behavior:');
    console.log('   - Test credentials should fail with "Λάθος username ή password"');
    console.log('   - Real UTH credentials should work in the frontend');
    console.log('   - Check backend terminal for detailed CAS login flow logs');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 