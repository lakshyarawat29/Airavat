import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      message: 'No token found',
    });
  }

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET);
    return NextResponse.json({
      authenticated: true,
      user: decoded,
      tokenPreview: token.value.substring(0, 20) + '...',
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      message: 'Invalid token',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
