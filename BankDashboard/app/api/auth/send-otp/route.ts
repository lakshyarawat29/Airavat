import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Employee from '@/models/Employee';
import { sendOTPEmail } from '@/lib/email';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI);

    const { email } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find employee by email
    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if account is active
    if (employee.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (employee.isAccountLocked()) {
      return NextResponse.json(
        { error: 'Account is locked due to too many failed attempts' },
        { status: 423 }
      );
    }

    // Generate unique OTP
    const otp = await employee.generateOTP();

    try {
      // Send OTP via email
      await sendOTPEmail(employee.email, otp, employee.name);

      console.log(`📧 OTP ${otp} sent to ${employee.email}`);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully to your email',
        // For demo purposes only - in production, remove this
        otp: otp,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);

      // If email fails, still return success but with a warning
      return NextResponse.json({
        success: true,
        message:
          'OTP generated but email delivery failed. Please check your email configuration.',
        // For demo purposes only - in production, remove this
        otp: otp,
        warning: 'Email delivery failed',
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
