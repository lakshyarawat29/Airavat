import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SystemConfig from '@/models/SystemConfig';

const MONGODB_URI = process.env.MONGODB_URI!;

// GET - Fetch all system configurations
export async function GET() {
  try {
    console.log('🔍 Fetching system configs...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const configs = await SystemConfig.find({})
      .select('-isSensitive')
      .sort({ category: 1, key: 1 });

    console.log(`📊 Found ${configs.length} configurations`);
    console.log(
      '📋 Configs:',
      configs.map((c) => ({ key: c.key, value: c.value, category: c.category }))
    );

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching system configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configurations' },
      { status: 500 }
    );
  }
}

// POST - Create a new system configuration
export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI);

    const body = await request.json();
    const {
      key,
      value,
      type,
      category,
      description,
      defaultValue,
      validation,
      modifiedBy,
    } = body;

    // Validation
    if (!key || !value || !category || !description || !modifiedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if config already exists
    const existingConfig = await SystemConfig.findOne({ key });
    if (existingConfig) {
      return NextResponse.json(
        { error: 'Configuration key already exists' },
        { status: 409 }
      );
    }

    const newConfig = new SystemConfig({
      key: key.toUpperCase(),
      value,
      type: type || 'string',
      category,
      description,
      defaultValue: defaultValue || value,
      validation: validation || {},
      lastModifiedBy: modifiedBy,
    });

    await newConfig.save();

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error('Error creating system config:', error);
    return NextResponse.json(
      { error: 'Failed to create system configuration' },
      { status: 500 }
    );
  }
}
