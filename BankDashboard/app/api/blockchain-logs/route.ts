import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch logs from the AuditingLogs backend
    const response = await fetch('https://airavat-auditing-backend.onrender.com/api/logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const logs = await response.json();

    // Transform the blockchain logs to match our differential privacy format
    const transformedLogs = logs.map((log: any) => ({
      organization: log.organization,
      accessLevel: log.accessLevel,
      status: log.status,
      userConsent: log.userConsent,
      dataType: log.dataType,
      purpose: log.purpose,
      userId: log.userId,
      timestamp: log.timestamp,
      dataMinimized: log.dataMinimized,
      zkProofUsed: log.zkProofUsed,
      retentionDays: log.retentionDays,
    }));

    return NextResponse.json(transformedLogs);
  } catch (error) {
    console.error('Error fetching blockchain logs:', error);

    // Return sample data if blockchain logs are not available
    const sampleData = [
      {
        organization: 'RBI',
        accessLevel: 'High',
        status: 'Granted',
        userConsent: true,
        dataType: 'financial_data',
        purpose: 'Regulatory compliance',
        userId: 'USER_001',
        timestamp: new Date().toISOString(),
        dataMinimized: true,
        zkProofUsed: true,
        retentionDays: 30,
      },
      {
        organization: 'TestBank',
        accessLevel: 'Medium',
        status: 'Pending',
        userConsent: true,
        dataType: 'personal_info',
        purpose: 'Credit assessment',
        userId: 'USER_002',
        timestamp: new Date().toISOString(),
        dataMinimized: true,
        zkProofUsed: false,
        retentionDays: 60,
      },
      {
        organization: 'DemoCorp',
        accessLevel: 'Low',
        status: 'Approved',
        userConsent: true,
        dataType: 'transaction_history',
        purpose: 'Fraud detection',
        userId: 'USER_003',
        timestamp: new Date().toISOString(),
        dataMinimized: true,
        zkProofUsed: true,
        retentionDays: 90,
      },
    ];

    return NextResponse.json(sampleData);
  }
}
