import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

const firstAdmin = {
  name: 'System Admin',
  email: 'admin@bank.com',
  role: 'admin',
  department: 'IT',
  status: 'active',
};

async function addFirstAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('➕ Adding first admin account...');

    // Create the first admin
    const newAdmin = new Employee(firstAdmin);
    await newAdmin.save();

    console.log('✅ First admin account created successfully');
    console.log(`   - Name: ${newAdmin.name}`);
    console.log(`   - Email: ${newAdmin.email}`);
    console.log(`   - Role: ${newAdmin.role}`);
    console.log(`   - Department: ${newAdmin.department}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Login with: admin@bank.com');
    console.log('3. OTP: 123456');
    console.log('4. Access admin panel to add more employees');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding first admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
addFirstAdmin();
