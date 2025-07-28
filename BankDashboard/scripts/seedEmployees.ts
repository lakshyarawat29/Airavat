import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

const initialEmployees = [
  {
    name: 'John Banker',
    email: 'banker@bank.com',
    role: 'banker',
    department: 'Customer Service',
    status: 'active',
    lastLogin: new Date('2024-01-15T10:30:00Z'),
  },
  {
    name: 'Sarah Auditor',
    email: 'auditor@bank.com',
    role: 'auditor',
    department: 'Compliance',
    status: 'active',
    lastLogin: new Date('2024-01-15T09:15:00Z'),
  },
  {
    name: 'Mike Manager',
    email: 'manager@bank.com',
    role: 'manager',
    department: 'Operations',
    status: 'active',
    lastLogin: new Date('2024-01-15T08:45:00Z'),
  },
  {
    name: 'Admin User',
    email: 'admin@bank.com',
    role: 'admin',
    department: 'IT',
    status: 'active',
    lastLogin: new Date('2024-01-15T07:30:00Z'),
  },
  {
    name: 'Lisa Compliance',
    email: 'lisa@bank.com',
    role: 'auditor',
    department: 'Compliance',
    status: 'active',
    lastLogin: new Date('2024-01-14T16:20:00Z'),
  },
  {
    name: 'David Operations',
    email: 'david@bank.com',
    role: 'manager',
    department: 'Operations',
    status: 'active',
    lastLogin: new Date('2024-01-14T15:45:00Z'),
  },
  {
    name: 'Emma Customer',
    email: 'emma@bank.com',
    role: 'banker',
    department: 'Customer Service',
    status: 'inactive',
    lastLogin: new Date('2024-01-10T12:00:00Z'),
  },
  {
    name: 'Tom Risk',
    email: 'tom@bank.com',
    role: 'auditor',
    department: 'Risk Management',
    status: 'active',
    lastLogin: new Date('2024-01-15T11:15:00Z'),
  },
];

async function seedEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('🌱 Starting employee seeding...');

    // Clear existing employees (except admin)
    await Employee.deleteMany({ role: { $ne: 'admin' } });
    console.log('🗑️  Cleared existing non-admin employees');

    // Insert new employees
    const createdEmployees = await Employee.insertMany(initialEmployees);
    console.log(`✅ Created ${createdEmployees.length} employees`);

    // Display created employees
    console.log('\n📋 Created Employees:');
    createdEmployees.forEach((emp) => {
      console.log(
        `  - ${emp.name} (${emp.email}) - ${emp.role} in ${emp.department}`
      );
    });

    console.log('\n🎉 Employee seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seeding function
seedEmployees();
