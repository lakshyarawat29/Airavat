require('dotenv').config();
const mongoose = require('mongoose');

// Try the UserDashboard's MongoDB connection
const USER_DASHBOARD_MONGODB_URI =
  process.env.USER_DASHBOARD_MONGODB_URI ||
  'mongodb+srv://airavat:airavat@cluster0.mongodb.net/airavat-user-dashboard?retryWrites=true&w=majority';

// User schema for querying email
const userSchema = new mongoose.Schema({
  userID: String,
  email: String,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testUserEmail() {
  try {
    console.log('Testing MongoDB connection and user lookup...');
    console.log('MongoDB URI:', USER_DASHBOARD_MONGODB_URI);

    await mongoose.connect(USER_DASHBOARD_MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully!');

    // First, let's see all users in the database
    console.log('Available users:');
    const allUsers = await User.find({}, 'userID email');

    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      allUsers.forEach((u) => console.log(`- ${u.userID}: ${u.email}`));

      // Test with the first available user
      const testUser = allUsers[0];
      console.log(
        `\nTesting with user: ${testUser.userID} (${testUser.email})`
      );
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testUserEmail();
