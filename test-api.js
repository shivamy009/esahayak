// Simple API test - you can run this in your browser console or as a Node script
async function testAPI() {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://your-vercel-app.vercel.app' 
    : 'http://localhost:3000';

  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test debug endpoint
    console.log('1️⃣ Testing debug endpoint...');
    const debugResponse = await fetch(`${baseURL}/api/debug`);
    const debugData = await debugResponse.json();
    console.log('✅ Debug endpoint response:', debugData.status);

    // Test health endpoint  
    console.log('\n2️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint - configured:', healthData.configured);

    // Test buyers endpoint (this will require authentication in production)
    console.log('\n3️⃣ Testing buyers endpoint...');
    const buyersResponse = await fetch(`${baseURL}/api/buyers`);
    console.log('📊 Buyers endpoint status:', buyersResponse.status);
    
    if (buyersResponse.status === 401) {
      console.log('✅ Authentication required (expected for production)');
    } else if (buyersResponse.ok) {
      const buyersData = await buyersResponse.json();
      console.log('✅ Buyers data retrieved successfully');
    } else {
      console.log('❌ Buyers endpoint error:', buyersResponse.statusText);
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// For browser console: testAPI();
// For Node: 
testAPI();