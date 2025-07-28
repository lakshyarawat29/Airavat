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

async function addAdminToExisting() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('📊 Current Database State:');

    // Count total employees
    const totalEmployees = await Employee.countDocuments();
    console.log(`Total employees: ${totalEmployees}`);

    // List all employees
    const allEmployees = await Employee.find({}).sort({ createdAt: -1 });
    console.log('\n📋 Current Employees:');
    allEmployees.forEach((emp, index) => {
      console.log(
        `${index + 1}. ${emp.name} (${emp.email}) - ${emp.role} in ${
          emp.department
        }`
      );
    });

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ email: 'admin@bank.com' });

    if (existingAdmin) {
      console.log('\n✅ Admin account already exists');
      console.log(`   - Name: ${existingAdmin.name}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
    } else {
      console.log('\n➕ Creating admin account...');

      // Create new admin
      const newAdmin = new Employee(adminEmployee);
      await newAdmin.save();

      console.log('✅ Admin account created successfully');
      console.log(`   - Name: ${newAdmin.name}`);
      console.log(`   - Email: ${newAdmin.email}`);
      console.log(`   - Role: ${newAdmin.role}`);
    }

    // Show final state
    console.log('\n📊 Final Database State:');
    const finalEmployees = await Employee.find({}).sort({ createdAt: -1 });
    finalEmployees.forEach((emp, index) => {
      console.log(
        `${index + 1}. ${emp.name} (${emp.email}) - ${emp.role} in ${
          emp.department
        }`
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
addAdminToExisting();
