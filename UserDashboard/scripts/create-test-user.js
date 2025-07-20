require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

// Define schemas directly for the script
const userSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
  },
  {
    timestamps: true,
  }
);

const consentPreferenceSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    },
    transactions: {
      type: String,
      required: true,
      enum: ['Minimal', 'Moderate', 'Full'],
      default: 'Minimal',
    },
    accountDetails: {
      type: String,
      required: true,
      enum: ['Minimal', 'Moderate', 'Full'],
      default: 'Minimal',
    },
    personalInfo: {
      type: String,
      required: true,
      enum: ['Minimal', 'Moderate', 'Full'],
      default: 'Minimal',
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
      default: 30,
    },
    purposes: {
      loanProcessing: {
        type: Boolean,
        default: false,
      },
      fraudDetection: {
        type: Boolean,
        default: false,
      },
      creditScoring: {
        type: Boolean,
        default: false,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const ConsentPreference =
  mongoose.models.ConsentPreference ||
  mongoose.model('ConsentPreference', consentPreferenceSchema);

async function createTestUser() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas!');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'user@airavat.com' });

    if (existingUser) {
      console.log('⚠️  Test user already exists!');
      console.log('User ID:', existingUser.userID);
      console.log('Email:', existingUser.email);
      console.log('Name:', existingUser.name);

      // Check if consent preferences exist
      const existingConsent = await ConsentPreference.findOne({
        userID: existingUser.userID,
      });
      if (existingConsent) {
        console.log('✅ Consent preferences already exist for test user');
        console.log('Transaction Data:', existingConsent.transactions);
        console.log('Account Details:', existingConsent.accountDetails);
        console.log('Personal Info:', existingConsent.personalInfo);
        console.log('Purposes:', existingConsent.purposes);
      } else {
        console.log('⚠️  Creating consent preferences for existing user...');
        await ConsentPreference.create({
          userID: existingUser.userID,
          transactions: 'Minimal',
          accountDetails: 'Minimal',
          personalInfo: 'Minimal',
          timeLimit: 30,
          purposes: {
            loanProcessing: false,
            fraudDetection: false,
            creditScoring: false,
            marketing: false,
          },
          additionalNotes: '',
        });
        console.log('✅ Consent preferences created!');
      }
    } else {
      console.log('Creating test user...');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);

      // Create test user
      const testUser = await User.create({
        email: 'user@airavat.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'user',
      });

      console.log('✅ Test user created successfully!');
      console.log('User ID:', testUser.userID);
      console.log('Email:', testUser.email);
      console.log('Name:', testUser.name);

      // Create default consent preferences
      console.log('Creating default consent preferences...');
      await ConsentPreference.create({
        userID: testUser.userID,
        transactions: 'Minimal',
        accountDetails: 'Minimal',
        personalInfo: 'Minimal',
        timeLimit: 30,
        purposes: {
          loanProcessing: false,
          fraudDetection: false,
          creditScoring: false,
          marketing: false,
        },
        additionalNotes: '',
      });
      console.log('✅ Default consent preferences created!');
    }

    // Display test credentials
    console.log('\n🎯 Test Account Credentials:');
    console.log('Email: user@airavat.com');
    console.log('Password: password');
    console.log('\nYou can now use these credentials to login!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
