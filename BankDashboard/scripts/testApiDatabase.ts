import mongoose from 'mongoose';
import Employee from '../models/Employee';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-dashboard';

async function testApiDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB with API connection string...');
    console.log('📡 URI:', MONGODB_URI);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get database info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('📊 Database name:', dbName);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(
      '📁 Collections:',
      collections.map((c) => c.name)
    );

    // Check employees collection
    const employeesCollection = db.collection('employees');
    const employeeCount = await employeesCollection.countDocuments();
    console.log('👥 Total employees in collection:', employeeCount);

    // Get all employees from the collection directly
    const allEmployees = await employeesCollection.find({}).toArray();
    console.log('\n📋 All employees in collection:');
    allEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name} (${emp.email}) - ${emp.role}`);
    });

    // Test Employee model
    console.log('\n🧪 Testing Employee model...');
    const modelEmployees = await Employee.find({});
    console.log('👥 Total employees from model:', modelEmployees.length);

    modelEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name} (${emp.email}) - ${emp.role}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing API database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
testApiDatabase();
