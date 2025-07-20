import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ConsentPreference from '@/models/ConsentPreference';
import { verifyToken } from '@/lib/auth';

// GET - Fetch consent preferences for a user (userID from query param)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userID = request.headers.get('x-user-id');
    if (!userID) {
      return NextResponse.json(
        { error: 'No userID provided' },
        { status: 400 }
      );
    }
    // Find existing consent preferences
    let consentPreferences = await ConsentPreference.findOne({ userID });
    // If no preferences exist, return default values
    if (!consentPreferences) {
      consentPreferences = {
        userID,
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
      };
    }
    return NextResponse.json(consentPreferences);
  } catch (error) {
    console.error('Error fetching consent preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update consent preferences (userID from body)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userID = decoded.userID;

    const body = await request.json();
    const {
      transactions,
      accountDetails,
      personalInfo,
      timeLimit,
      purposes,
      additionalNotes,
    } = body;
    if (!userID) {
      return NextResponse.json(
        { error: 'No userID provided' },
        { status: 400 }
      );
    }
    // Validate enum values
    const validLevels = ['Minimal', 'Moderate', 'Full'];
    if (transactions && !validLevels.includes(transactions)) {
      return NextResponse.json(
        { error: 'Invalid transactions level' },
        { status: 400 }
      );
    }
    if (accountDetails && !validLevels.includes(accountDetails)) {
      return NextResponse.json(
        { error: 'Invalid accountDetails level' },
        { status: 400 }
      );
    }
    if (personalInfo && !validLevels.includes(personalInfo)) {
      return NextResponse.json(
        { error: 'Invalid personalInfo level' },
        { status: 400 }
      );
    }
    // Validate timeLimit
    if (timeLimit && (timeLimit < 1 || timeLimit > 365)) {
      return NextResponse.json(
        { error: 'Time limit must be between 1 and 365 days' },
        { status: 400 }
      );
    }
    // Prepare update data with defaults
    const updateData = {
      userID,
      transactions: transactions || 'Minimal',
      accountDetails: accountDetails || 'Minimal',
      personalInfo: personalInfo || 'Minimal',
      timeLimit: timeLimit || 30,
      purposes: {
        loanProcessing: purposes?.loanProcessing ?? false,
        fraudDetection: purposes?.fraudDetection ?? false,
        creditScoring: purposes?.creditScoring ?? false,
        marketing: purposes?.marketing ?? false,
      },
      additionalNotes: additionalNotes || '',
    };
    // Upsert the consent preferences
    const result = await ConsentPreference.findOneAndUpdate(
      { userID },
      updateData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    return NextResponse.json({
      message: 'Consent preferences saved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error saving consent preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
