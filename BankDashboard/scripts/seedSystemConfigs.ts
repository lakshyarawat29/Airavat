import mongoose from 'mongoose';
import SystemConfig from '../models/SystemConfig';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

const initialConfigs = [
  {
    key: 'SESSION_TIMEOUT',
    value: '30',
    type: 'number' as const,
    category: 'session' as const,
    description: 'Session timeout in minutes',
    defaultValue: '30',
    validation: { min: 5, max: 480 },
    lastModifiedBy: 'system',
  },
  {
    key: 'OTP_EXPIRY',
    value: '5',
    type: 'number' as const,
    category: 'security' as const,
    description: 'OTP expiry time in minutes',
    defaultValue: '5',
    validation: { min: 1, max: 30 },
    lastModifiedBy: 'system',
  },
  {
    key: 'DATA_RETENTION_PERIOD',
    value: '7',
    type: 'number' as const,
    category: 'privacy' as const,
    description: 'Data retention period in years',
    defaultValue: '7',
    validation: { min: 1, max: 50 },
    lastModifiedBy: 'system',
  },
  {
    key: 'MAX_LOGIN_ATTEMPTS',
    value: '3',
    type: 'number' as const,
    category: 'security' as const,
    description: 'Maximum failed login attempts before lockout',
    defaultValue: '3',
    validation: { min: 1, max: 10 },
    lastModifiedBy: 'system',
  },
  {
    key: 'ACCOUNT_LOCKOUT_DURATION',
    value: '30',
    type: 'number' as const,
    category: 'security' as const,
    description: 'Account lockout duration in minutes',
    defaultValue: '30',
    validation: { min: 5, max: 1440 },
    lastModifiedBy: 'system',
  },
  {
    key: 'PASSWORD_MIN_LENGTH',
    value: '8',
    type: 'number' as const,
    category: 'security' as const,
    description: 'Minimum password length',
    defaultValue: '8',
    validation: { min: 6, max: 32 },
    lastModifiedBy: 'system',
  },
  {
    key: 'AUDIT_LOG_RETENTION',
    value: '90',
    type: 'number' as const,
    category: 'privacy' as const,
    description: 'Audit log retention period in days',
    defaultValue: '90',
    validation: { min: 30, max: 365 },
    lastModifiedBy: 'system',
  },
  {
    key: 'ENABLE_EMAIL_NOTIFICATIONS',
    value: 'true',
    type: 'boolean' as const,
    category: 'email' as const,
    description: 'Enable email notifications for system events',
    defaultValue: 'true',
    validation: {},
    lastModifiedBy: 'system',
  },
];

async function seedSystemConfigs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing configs
    await SystemConfig.deleteMany({});
    console.log('🗑️  Cleared existing system configs');

    // Insert new configs
    const configs = await SystemConfig.insertMany(initialConfigs);
    console.log(`✅ Seeded ${configs.length} system configurations`);

    // Display the seeded configs
    console.log('\n📋 Seeded System Configurations:');
    configs.forEach((config) => {
      console.log(`  • ${config.key}: ${config.value} (${config.category})`);
    });

    console.log('\n🎉 System configuration seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding system configs:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedSystemConfigs();
