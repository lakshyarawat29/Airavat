const { MongoClient } = require('mongodb');

async function testDashboardStats() {
  const uri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

  try {
    console.log('🔌 Connecting to MongoDB...');
    const client = await MongoClient.connect(uri);
    console.log('✅ Connected to MongoDB successfully!');

    const db = client.db('mydatabase');
    const testDb = client.db('test');

    console.log('\n📊 Testing Dashboard Statistics...\n');

    // Test Active Requests
    try {
      const activeRequestsCount = await db
        .collection('userRequests')
        .countDocuments();
      console.log(`✅ Active Requests: ${activeRequestsCount}`);
    } catch (error) {
      console.log(`❌ Error counting active requests: ${error.message}`);
    }

    // Test Completed Today
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedTodayCount = await db
        .collection('userRequests')
        .countDocuments({
          status: 'completed',
          updatedAt: { $gte: today },
        });
      console.log(`✅ Completed Today: ${completedTodayCount}`);
    } catch (error) {
      console.log(`❌ Error counting completed today: ${error.message}`);
    }

    // Test Pending Reviews
    try {
      const pendingReviewsCount = await db
        .collection('userRequests')
        .countDocuments({
          status: { $ne: 'completed' },
        });
      console.log(`✅ Pending Reviews: ${pendingReviewsCount}`);
    } catch (error) {
      console.log(`❌ Error counting pending reviews: ${error.message}`);
    }

    // Test Team Members
    try {
      const teamMembersCount = await testDb
        .collection('employees')
        .countDocuments({
          status: 'active',
        });
      console.log(`✅ Team Members: ${teamMembersCount}`);
    } catch (error) {
      console.log(`❌ Error counting team members: ${error.message}`);
    }

    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
      } else {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ API Error: ${error.message}`);
      console.log(
        '💡 Make sure the development server is running (npm run dev)'
      );
    }

    await client.close();
    console.log('\n🎉 Test completed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Set MONGODB_URI environment variable');
    console.log('2. Have sample data in your collections');
    console.log('3. Run the development server (npm run dev)');
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testDashboardStats();
