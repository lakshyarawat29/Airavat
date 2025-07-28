import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Employee from '@/models/Employee';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(MONGODB_URI);

    const employee = await Employee.findById(params.id).select(
      'name email role department status lastLogin permissions createdAt updatedAt'
    );

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('GET /api/employees/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(MONGODB_URI);

    const body = await request.json();
    const { name, email, role, department, status } = body;

    // Check if employee exists
    const existingEmployee = await Employee.findById(params.id);
    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingEmployee.email) {
      const emailExists = await Employee.findOne({
        email: email.toLowerCase(),
        _id: { $ne: params.id },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update employee
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (status) updateData.status = status;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select(
      'name email role department status lastLogin permissions createdAt updatedAt'
    );

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('PUT /api/employees/[id] error:', error);

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
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(MONGODB_URI);

    const employee = await Employee.findById(params.id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin accounts
    if (employee.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin accounts' },
        { status: 403 }
      );
    }

    await Employee.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/employees/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
