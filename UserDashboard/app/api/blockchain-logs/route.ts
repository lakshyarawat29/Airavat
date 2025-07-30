import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const AUDITING_LOGS_API_URL =
  process.env.AUDITING_LOGS_API_URL || 'https://airavat-auditing-backend.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch logs for the specific user from the AuditingLogs API
    const response = await fetch(
      `${AUDITING_LOGS_API_URL}/api/logs/${decoded.userID}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const logs = await response.json();

    // Transform the logs to match the frontend interface
    const transformedLogs = logs.map((log: any) => ({
      id: log.logId.toString(),
      blockNumber: log.logId + 1000000, // Generate a mock block number
      timestamp: log.timestamp,
      thirdParty: {
        name: log.organization,
        type: getThirdPartyType(log.organization),
        logo: getThirdPartyLogo(log.organization),
      },
      dataType: mapDataType(log.dataType),
      purpose: log.purpose,
      status: mapStatus(log.status),
      userConsent: log.userConsent,
      dataMinimization: log.dataMinimized,
      retentionPeriod: log.retentionDays,
      accessLevel: mapAccessLevel(log.accessLevel),
      zkProofUsed: log.zkProofUsed,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
      gasUsed: Math.floor(Math.random() * 50000) + 15000, // Mock gas used
    }));

    return NextResponse.json(transformedLogs);
  } catch (error) {
    console.error('Error fetching blockchain logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain logs' },
      { status: 500 }
    );
  }
}

// Helper functions to map data from the smart contract to the frontend interface
function getThirdPartyType(organization: string): string {
  const org = organization.toLowerCase();
  if (
    org.includes('bank') ||
    org.includes('chase') ||
    org.includes('wells') ||
    org.includes('rbi')
  ) {
    return 'bank';
  } else if (
    org.includes('fintech') ||
    org.includes('paypal') ||
    org.includes('stripe')
  ) {
    return 'fintech';
  } else if (org.includes('insurance') || org.includes('farm')) {
    return 'insurance';
  } else if (org.includes('credit') || org.includes('experian')) {
    return 'credit_bureau';
  } else if (org.includes('government') || org.includes('irs')) {
    return 'government';
  }
  return 'fintech'; // default
}

function getThirdPartyLogo(organization: string): string {
  const org = organization.toLowerCase();
  if (org.includes('bank') || org.includes('chase') || org.includes('wells')) {
    return '🏦';
  } else if (org.includes('rbi')) {
    return '🏛️';
  } else if (org.includes('paypal')) {
    return '💳';
  } else if (org.includes('stripe')) {
    return '🔷';
  } else if (org.includes('insurance')) {
    return '🛡️';
  } else if (org.includes('credit') || org.includes('experian')) {
    return '📊';
  } else if (org.includes('government') || org.includes('irs')) {
    return '🏛️';
  }
  return '🏢'; // default
}

function mapDataType(dataType: string): string {
  const type = dataType.toLowerCase();
  if (
    type.includes('pan') ||
    type.includes('aadhaar') ||
    type.includes('passport')
  ) {
    return 'kyc_documents';
  } else if (type.includes('transaction')) {
    return 'transaction_history';
  } else if (type.includes('balance')) {
    return 'account_balance';
  } else if (type.includes('personal')) {
    return 'personal_info';
  } else if (type.includes('credit')) {
    return 'credit_score';
  }
  return 'personal_info'; // default
}

function mapStatus(status: string): string {
  const stat = status.toLowerCase();
  if (stat.includes('granted') || stat.includes('approved')) {
    return 'approved';
  } else if (stat.includes('denied')) {
    return 'denied';
  } else if (stat.includes('pending')) {
    return 'pending';
  } else if (stat.includes('revoked')) {
    return 'revoked';
  }
  return 'pending';
}

function mapAccessLevel(accessLevel: string): string {
  const level = accessLevel.toLowerCase();
  if (level.includes('high') || level.includes('full')) {
    return 'full';
  } else if (level.includes('medium') || level.includes('moderate')) {
    return 'moderate';
  } else if (level.includes('low') || level.includes('minimal')) {
    return 'minimal';
  }
  return 'moderate'; // default
}
