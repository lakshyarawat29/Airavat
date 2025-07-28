import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Employee from '@/models/Employee';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI);

    const { email, otp } = await request.json();

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find employee by email
    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if account is locked
    if (employee.isAccountLocked()) {
      return NextResponse.json(
        { error: 'Account is locked due to too many failed attempts' },
        { status: 423 }
      );
    }

    // Check if account is active
    if (employee.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Validate the OTP
    const isValidOTP = await employee.validateOTP(otp);

    if (isValidOTP) {
      // Return user data (without sensitive information)
      const userData = {
        id: employee._id.toString(),
        email: employee.email,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        permissions: employee.permissions,
        lastLogin: employee.lastLogin,
      };

      return NextResponse.json({
        success: true,
        user: userData,
      });
    } else {
      // Increment failed login attempts
      await employee.incrementLoginAttempts();

      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
