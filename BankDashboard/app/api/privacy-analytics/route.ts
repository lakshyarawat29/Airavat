import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Differential Privacy Functions
function laplaceNoise(scale: number): number {
  const U = Math.random() - 0.5; // Uniform random number in [-0.5, 0.5]
  const sign = U >= 0 ? 1 : -1;
  return sign * scale * Math.log(1 - 2 * Math.abs(U));
}

function privateCount(data: any[], epsilon: number): number {
  const trueCount = data.length;
  const scale = 1 / epsilon;
  const noise = laplaceNoise(scale);
  return Math.max(0, trueCount + noise); // Ensure non-negative
}

function privateAvg(
  data: number[],
  epsilon: number,
  minVal: number,
  maxVal: number
): number {
  // Clip data to bounds
  const clippedData = data.map((val) =>
    Math.max(minVal, Math.min(maxVal, val))
  );

  // Split epsilon budget
  const epsilonSum = epsilon * 0.7;
  const epsilonCount = epsilon * 0.3;

  // Calculate private sum
  const trueSum = clippedData.reduce((sum, val) => sum + val, 0);
  const scaleSum = 1 / epsilonSum;
  const noiseSum = laplaceNoise(scaleSum);
  const privateSum = trueSum + noiseSum;

  // Calculate private count
  const trueCount = clippedData.length;
  const scaleCount = 1 / epsilonCount;
  const noiseCount = laplaceNoise(scaleCount);
  const privateCount = Math.max(1, trueCount + noiseCount); // Ensure at least 1

  return privateSum / privateCount;
}

function processData(data: any[]) {
  return data.map((log) => {
    // Convert accessLevel to risk_score
    let risk_score: number;
    switch (log.accessLevel) {
      case 'High':
        risk_score = 8;
        break;
      case 'Medium':
        risk_score = 5;
        break;
      case 'Low':
        risk_score = 2;
        break;
      default:
        risk_score = 5;
    }

    // Determine if compliant
    const is_compliant = log.status === 'Granted' || log.status === 'Approved';

    return {
      ...log,
      risk_score,
      is_compliant,
    };
  });
}

function calculateAnalytics(processedData: any[]) {
  const totalRequests = processedData.length;
  const compliantRequests = processedData.filter(
    (item) => item.is_compliant
  ).length;
  const consentRequests = processedData.filter(
    (item) => item.userConsent
  ).length;

  // Non-private metrics
  const dataAccessCompliance = (compliantRequests / totalRequests) * 100;
  const consentRate = (consentRequests / totalRequests) * 100;

  // Differentially private metrics
  const riskScores = processedData.map((item) => item.risk_score);
  const dp_dataBreachRisk = privateAvg(riskScores, 1.0, 0, 10) * 10; // Scale to percentage
  const dp_privacyScore = Math.max(0, Math.min(100, 100 - dp_dataBreachRisk));

  return {
    dataAccessCompliance: Math.round(dataAccessCompliance * 10) / 10,
    consentRate: Math.round(consentRate * 10) / 10,
    dp_dataBreachRisk: Math.round(dp_dataBreachRisk * 10) / 10,
    dp_privacyScore: Math.round(dp_privacyScore * 10) / 10,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch blockchain logs first
    let logsData = [];

    try {
      console.log('🔗 Fetching blockchain logs for privacy analytics...');
      const response = await fetch('http://localhost:3000/api/logs');

      if (response.ok) {
        const blockchainLogs = await response.json();
        logsData = blockchainLogs.map((log: any) => ({
          organization: log.organization,
          accessLevel: log.accessLevel,
          status: log.status,
          userConsent: log.userConsent,
        }));
        console.log(`✅ Using ${logsData.length} blockchain log entries`);
      } else {
        throw new Error('Blockchain logs not available');
      }
    } catch (error) {
      console.log('⚠️  Blockchain logs not available, trying database...');

      // Fallback to database
      const client = await clientPromise;
      const db = client.db('mydatabase');
      const dbLogs = await db.collection('userRequests').find({}).toArray();

      if (dbLogs.length > 0) {
        logsData = dbLogs.map((log: any) => ({
          organization: log.thirdParty || 'Unknown',
          accessLevel: log.requestType === 'credit_check' ? 'High' : 'Medium',
          status: log.status,
          userConsent: log.consentStatus?.hasConsent || false,
        }));
        console.log(`✅ Using ${logsData.length} database log entries`);
      } else {
        // Use sample data as final fallback
        logsData = [
          {
            organization: 'RBI',
            accessLevel: 'High',
            status: 'Granted',
            userConsent: true,
          },
          {
            organization: 'TestBank',
            accessLevel: 'Medium',
            status: 'Pending',
            userConsent: true,
          },
          {
            organization: 'DemoCorp',
            accessLevel: 'Low',
            status: 'Approved',
            userConsent: true,
          },
          {
            organization: 'TestBank',
            accessLevel: 'Medium',
            status: 'Granted',
            userConsent: true,
          },
          {
            organization: 'BankX',
            accessLevel: 'High',
            status: 'Granted',
            userConsent: true,
          },
          {
            organization: 'BankX',
            accessLevel: 'High',
            status: 'Granted',
            userConsent: true,
          },
          {
            organization: 'Paytm Banks',
            accessLevel: 'High',
            status: 'Granted',
            userConsent: true,
          },
          {
            organization: 'TestBank',
            accessLevel: 'Medium',
            status: 'Granted',
            userConsent: true,
          },
          {
            organization: 'RBI',
            accessLevel: 'High',
            status: 'Granted',
            userConsent: false,
          },
          {
            organization: 'Email Test Bank',
            accessLevel: 'High',
            status: 'Granted',
            userConsent: true,
          },
        ];
        console.log('✅ Using sample data');
      }
    }

    const dataToProcess = logsData;

    // Process the data
    const processedData = processData(dataToProcess);

    // Calculate analytics with differential privacy
    const analytics = calculateAnalytics(processedData);

    // Calculate trends (simulated for demo)
    const trends = {
      dataAccessCompliance: Math.random() > 0.5 ? 2.1 : -1.2,
      consentRate: Math.random() > 0.5 ? 1.8 : -1.3,
      privacyScore: Math.random() > 0.5 ? 3.2 : -2.1,
      dataBreachRisk: Math.random() > 0.5 ? -5.7 : 2.3,
    };

    // Determine status for each metric
    const getStatus = (value: number, trend: number) => {
      if (value >= 90) return 'good';
      if (value >= 70) return 'warning';
      return 'critical';
    };

    // Calculate organization breakdown with differential privacy
    const organizationGroups: { [key: string]: any[] } = {};
    dataToProcess.forEach((log: any) => {
      const org = log.organization;
      if (!organizationGroups[org]) {
        organizationGroups[org] = [];
      }
      organizationGroups[org].push(log);
    });

    const organizationBreakdown = Object.entries(organizationGroups)
      .map(([organization, items]) => ({
        name: organization,
        count: Math.round(privateCount(items, 0.5)),
      }))
      .sort((a, b) => b.count - a.count);

    const result = {
      dataAccessCompliance: {
        value: analytics.dataAccessCompliance,
        trend: trends.dataAccessCompliance,
        status: getStatus(
          analytics.dataAccessCompliance,
          trends.dataAccessCompliance
        ),
        description:
          'Percentage of data access requests that comply with privacy policies',
      },
      consentRate: {
        value: analytics.consentRate,
        trend: trends.consentRate,
        status: getStatus(analytics.consentRate, trends.consentRate),
        description: 'Percentage of users who have provided explicit consent',
      },
      privacyScore: {
        value: analytics.dp_privacyScore,
        trend: trends.privacyScore,
        status: getStatus(analytics.dp_privacyScore, trends.privacyScore),
        description:
          'Overall privacy protection score based on multiple factors',
      },
      dataBreachRisk: {
        value: analytics.dp_dataBreachRisk,
        trend: trends.dataBreachRisk,
        status: getStatus(
          100 - analytics.dp_dataBreachRisk,
          trends.dataBreachRisk
        ),
        description: 'Risk assessment score for potential data breaches',
      },
      organizationBreakdown,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching privacy analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy analytics' },
      { status: 500 }
    );
  }
}
