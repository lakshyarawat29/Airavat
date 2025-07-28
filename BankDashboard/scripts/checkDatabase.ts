import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

async function checkDatabase() {
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

    if (allEmployees.length === 0) {
      console.log('❌ No employees found in database');
    } else {
      console.log('\n📋 All Employees:');
      allEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.name} (${emp.email})`);
        console.log(`   Role: ${emp.role}`);
        console.log(`   Department: ${emp.department}`);
        console.log(`   Status: ${emp.status}`);
        console.log(`   Created: ${emp.createdAt}`);
        console.log(`   Last Login: ${emp.lastLogin || 'Never'}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
checkDatabase();
