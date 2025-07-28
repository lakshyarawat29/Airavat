import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

const adminEmployee = {
  name: 'Admin User',
  email: 'admin@bank.com',
  role: 'admin',
  department: 'IT',
  status: 'active',
  lastLogin: new Date('2024-01-15T07:30:00Z'),
};

async function addAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('🔍 Checking if admin already exists...');

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@bank.com' });

    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      console.log(`  - Name: ${existingAdmin.name}`);
      console.log(`  - Email: ${existingAdmin.email}`);
      console.log(`  - Role: ${existingAdmin.role}`);
      console.log(`  - Department: ${existingAdmin.department}`);
      console.log(`  - Status: ${existingAdmin.status}`);
    } else {
      console.log('➕ Creating admin account...');

      // Create new admin
      const newAdmin = new Employee(adminEmployee);
      await newAdmin.save();

      console.log('✅ Admin account created successfully');
      console.log(`  - Name: ${newAdmin.name}`);
      console.log(`  - Email: ${newAdmin.email}`);
      console.log(`  - Role: ${newAdmin.role}`);
      console.log(`  - Department: ${newAdmin.department}`);
      console.log(`  - Status: ${newAdmin.status}`);
    }

    // List all employees
    console.log('\n📋 All Employees in Database:');
    const allEmployees = await Employee.find({}).sort({ createdAt: -1 });
    allEmployees.forEach((emp) => {
      console.log(
        `  - ${emp.name} (${emp.email}) - ${emp.role} in ${emp.department} - ${emp.status}`
      );
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
addAdmin();
