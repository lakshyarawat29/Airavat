import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ConsentPreference from '@/models/ConsentPreference';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'x-user-id,Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID header (x-user-id) is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const consentPreferences = await ConsentPreference.findOne({
      userID: userId,
    });

    if (!consentPreferences) {
      return NextResponse.json(
        { error: 'No consent preferences found for this user ID' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userID: consentPreferences.userID,
          transactions: consentPreferences.transactions,
          accountDetails: consentPreferences.accountDetails,
          personalInfo: consentPreferences.personalInfo,
          timeLimit: consentPreferences.timeLimit,
          purposes: consentPreferences.purposes,
          additionalNotes: consentPreferences.additionalNotes,
          createdAt: consentPreferences.createdAt,
          updatedAt: consentPreferences.updatedAt,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error(
      'Error fetching consent preferences by userID from header:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
