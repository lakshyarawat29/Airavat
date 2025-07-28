import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

async function clearSeededData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('📊 Current Database State:');

    // List all employees before clearing
    const allEmployees = await Employee.find({}).sort({ createdAt: -1 });
    console.log(`Total employees: ${allEmployees.length}`);

    allEmployees.forEach((emp, index) => {
      console.log(
        `${index + 1}. ${emp.name} (${emp.email}) - ${emp.role} in ${
          emp.department
        }`
      );
    });

    // Clear all seeded data (keep only real employees)
    console.log('\n🗑️  Clearing seeded data...');

    // Remove all employees except the real one
    const result = await Employee.deleteMany({
      email: {
        $in: [
          'admin@bank.com',
          'banker@bank.com',
          'auditor@bank.com',
          'manager@bank.com',
          'lisa@bank.com',
          'david@bank.com',
          'tom@bank.com',
          'emma@bank.com',
        ],
      },
    });

    console.log(`✅ Removed ${result.deletedCount} seeded employees`);

    // Show final state
    console.log('\n📊 Final Database State:');
    const finalEmployees = await Employee.find({}).sort({ createdAt: -1 });
    console.log(`Total employees: ${finalEmployees.length}`);

    if (finalEmployees.length === 0) {
      console.log('❌ No employees left in database');
    } else {
      finalEmployees.forEach((emp, index) => {
        console.log(
          `${index + 1}. ${emp.name} (${emp.email}) - ${emp.role} in ${
            emp.department
          }`
        );
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing seeded data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
clearSeededData();
