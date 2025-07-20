import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ConsentPreference from '@/models/ConsentPreference';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: 'user',
    });

    // Create default consent preferences for the user
    await ConsentPreference.create({
      userID: user.userID,
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

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          userID: user.userID,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
