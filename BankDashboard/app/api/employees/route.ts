import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Employee from '@/models/Employee';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI);

    const employees = await Employee.find({})
      .select(
        'name email role department status lastLogin permissions createdAt'
      )
      .sort({ createdAt: -1 });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI);

    const body = await request.json();
    const { name, email, role, department, status = 'active' } = body;

    // Validation
    if (!name || !email || !role || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, role, department' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase(),
    });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 409 }
      );
    }

    // Create new employee
    const employee = new Employee({
      name,
      email: email.toLowerCase(),
      role,
      department,
      status,
    });

    await employee.save();

    // Return the created employee without sensitive fields
    const employeeResponse = {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      status: employee.status,
      permissions: employee.permissions,
      lastLogin: employee.lastLogin,
      createdAt: employee.createdAt,
    };

    return NextResponse.json(employeeResponse, { status: 201 });
  } catch (error) {
    console.error('POST /api/employees error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
