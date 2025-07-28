import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SystemConfig from '@/models/SystemConfig';

const MONGODB_URI = process.env.MONGODB_URI!;

// GET - Fetch a specific system configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(MONGODB_URI);

    const config = await SystemConfig.findById(params.id).select(
      '-isSensitive'
    );

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update a system configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(MONGODB_URI);

    const body = await request.json();
    const { value, modifiedBy } = body;

    // Validation
    if (!value || !modifiedBy) {
      return NextResponse.json(
        { error: 'Value and modifiedBy are required' },
        { status: 400 }
      );
    }

    const config = await SystemConfig.findById(params.id);

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Update the configuration
    config.value = value;
    config.lastModifiedBy = modifiedBy;
    config.lastModifiedAt = new Date();

    await config.save();

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json(
      { error: 'Failed to update system configuration' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate a system configuration (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(MONGODB_URI);

    const config = await SystemConfig.findById(params.id);

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    config.isActive = false;
    config.lastModifiedAt = new Date();

    await config.save();

    return NextResponse.json({
      message: 'Configuration deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating system config:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate system configuration' },
      { status: 500 }
    );
  }
}
