#!/usr/bin/env node

const http = require('http');

async function testEndpoint(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, res => {
      let responseData = '';
      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', e => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Express.js API Template\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test API documentation endpoint
    console.log('2. Testing API documentation endpoint...');
    const docs = await testEndpoint('/api-docs/');
    console.log(`   Status: ${docs.status}\n`);

    // Test user registration
    console.log('3. Testing user registration...');
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    const register = await testEndpoint('/api/auth/register', 'POST', newUser);
    console.log(`   Status: ${register.status}`);
    if (register.status === 201) {
      console.log(`   User created: ${register.data.data.user.email}`);
      console.log(`   Token received: ${register.data.data.token ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   Error: ${JSON.stringify(register.data, null, 2)}\n`);
    }

    // Test user login
    console.log('4. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    const login = await testEndpoint('/api/auth/login', 'POST', loginData);
    console.log(`   Status: ${login.status}`);
    if (login.status === 200) {
      console.log(`   Login successful for: ${login.data.data.user.email}`);
      console.log(`   Token received: ${login.data.data.token ? 'Yes' : 'No'}\n`);

      // Test authenticated endpoint
      console.log('5. Testing authenticated endpoint...');
      const profile = await testEndpoint('/api/auth/me', 'GET', null, {
        Authorization: `Bearer ${login.data.data.token}`
      });
      console.log(`   Status: ${profile.status}`);
      if (profile.status === 200) {
        console.log(`   Profile loaded for: ${profile.data.data.email}\n`);
      } else {
        console.log(`   Error: ${JSON.stringify(profile.data, null, 2)}\n`);
      }
    } else {
      console.log(`   Error: ${JSON.stringify(login.data, null, 2)}\n`);
    }

    console.log('✅ API testing completed!');
    console.log('\n📚 Check the API documentation at: http://localhost:3000/api-docs');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
