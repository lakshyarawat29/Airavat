import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('🧪 Testing Authentication Logic:');

    // Test email lookup
    const testEmails = [
      'admin@bank.com',
      'ADMIN@BANK.COM',
      'Admin@Bank.com',
      'manager@bank.com',
      'banker@bank.com',
      'auditor@bank.com',
    ];

    for (const email of testEmails) {
      console.log(`\n🔍 Testing email: "${email}"`);

      // Test direct database lookup
      const employee = await Employee.findOne({ email: email.toLowerCase() });

      if (employee) {
        console.log(`✅ Found: ${employee.name} (${employee.email})`);
        console.log(`   Role: ${employee.role}`);
        console.log(`   Department: ${employee.department}`);
        console.log(`   Status: ${employee.status}`);
        console.log(`   Is Locked: ${employee.isAccountLocked()}`);
      } else {
        console.log(`❌ Not found`);

        // Check if there are any employees with similar emails
        const similarEmployees = await Employee.find({
          email: { $regex: email.split('@')[0], $options: 'i' },
        });

        if (similarEmployees.length > 0) {
          console.log(`   Similar emails found:`);
          similarEmployees.forEach((emp) => {
            console.log(`   - ${emp.email}`);
          });
        }
      }
    }

    // Test the exact email from the database
    console.log('\n🔍 Testing exact database email:');
    const allEmployees = await Employee.find({});
    allEmployees.forEach((emp) => {
      console.log(`   - "${emp.email}" (${emp.name})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing auth:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
testAuth();
