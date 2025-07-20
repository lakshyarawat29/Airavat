require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    console.log('Connection string:', MONGODB_URI ? 'Found' : 'Missing');

    if (!MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');

    // Test creating a collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      '📊 Available collections:',
      collections.map((c) => c.name)
    );

    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
