import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ConsentPreference from '@/models/ConsentPreference';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find consent preferences by userID
    const consentPreferences = await ConsentPreference.findOne({
      userID: userId,
    });

    if (!consentPreferences) {
      return NextResponse.json(
        { error: 'No consent preferences found for this user ID' },
        { status: 404 }
      );
    }

    // Return the consent preferences in JSON format
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching consent preferences by userID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
