const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

// Step 1: Fetch Data from Blockchain Logs API
async function fetchBlockchainLogs() {
  try {
    console.log('🔗 Fetching blockchain logs from API...');

    // Try to fetch from our BankDashboard API first (which proxies to AuditingLogs)
    const response = await fetch('http://localhost:3003/api/blockchain-logs');

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const logs = await response.json();
    console.log(`✅ Fetched ${logs.length} blockchain log entries`);
    return logs;
  } catch (error) {
    console.log(
      '⚠️  Could not fetch from BankDashboard API, trying direct AuditingLogs API...'
    );

    try {
      // Try direct connection to AuditingLogs backend
      const response = await fetch('http://localhost:3000/api/logs');

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const logs = await response.json();
      console.log(`✅ Fetched ${logs.length} blockchain log entries directly`);
      return logs;
    } catch (directError) {
      console.log('⚠️  Could not fetch blockchain logs, using sample data...');

      // Fallback to sample data
      return [
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
    }
  }
}

// Step 2: Process and Transform the Data
function processData(data) {
  return data.map((log) => {
    // Convert accessLevel to risk_score
    let risk_score;
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

// Step 3: Implement Differential Privacy Functions

// Helper function to generate Laplace noise
function laplaceNoise(scale) {
  const U = Math.random() - 0.5; // Uniform random number in [-0.5, 0.5]
  const sign = U >= 0 ? 1 : -1;
  return sign * scale * Math.log(1 - 2 * Math.abs(U));
}

// Private count function using Laplace mechanism
function privateCount(data, epsilon) {
  const trueCount = data.length;
  const scale = 1 / epsilon;
  const noise = laplaceNoise(scale);
  return Math.max(0, trueCount + noise); // Ensure non-negative
}

// Private average function
function privateAvg(data, epsilon, minVal, maxVal) {
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

// Step 4: Calculate the Analytics
function calculateAnalytics(processedData) {
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

// Step 5: Generate Differentially Private Bar Chart
async function generateDPChart(processedData) {
  // Group data by organization
  const organizationGroups = {};
  processedData.forEach((item) => {
    if (!organizationGroups[item.organization]) {
      organizationGroups[item.organization] = [];
    }
    organizationGroups[item.organization].push(item);
  });

  // Calculate private counts for each organization
  const chartData = [];
  for (const [organization, items] of Object.entries(organizationGroups)) {
    const privateCountValue = Math.round(privateCount(items, 0.5));
    chartData.push({
      organization,
      count: privateCountValue,
    });
  }

  // Sort by count for better visualization
  chartData.sort((a, b) => b.count - a.count);

  // Create chart configuration
  const width = 800;
  const height = 400;
  const chartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback,
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: chartData.map((item) => item.organization),
      datasets: [
        {
          label: 'Private Request Count',
          data: chartData.map((item) => item.count),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'DP - Requests per Organization',
          font: {
            size: 16,
          },
        },
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Requests',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Organization',
          },
        },
      },
    },
  };

  // Generate and save the chart
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync('dp_organization_requests.png', imageBuffer);
  fs.writeFileSync('public/dp_organization_requests.png', imageBuffer);

  return chartData;
}

// Main execution function
async function main() {
  try {
    console.log('🔒 Starting Differential Privacy Analytics...\n');

    // Fetch blockchain logs
    const logsData = await fetchBlockchainLogs();

    // Process the data
    const processedData = processData(logsData);
    console.log('✅ Data processed successfully');

    // Calculate analytics
    const analytics = calculateAnalytics(processedData);
    console.log('✅ Analytics calculated with differential privacy');

    // Generate chart
    const chartData = await generateDPChart(processedData);
    console.log('✅ Differentially private chart generated');

    // Step 6: Final Output
    console.log('\n📊 Final Analytics Results:');
    console.log('========================');
    console.log(`Data Access Compliance: ${analytics.dataAccessCompliance}%`);
    console.log(`Consent Rate: ${analytics.consentRate}%`);
    console.log(`DP Privacy Score: ${analytics.dp_privacyScore}%`);
    console.log(`DP Data Breach Risk: ${analytics.dp_dataBreachRisk}%`);

    console.log('\n📈 Organization Request Counts (Differentially Private):');
    chartData.forEach((item) => {
      console.log(`  ${item.organization}: ${item.count} requests`);
    });

    console.log('\n💾 Chart saved as: dp_organization_requests.png');
    console.log('💾 Chart also saved to public/ for web access');
    console.log('\n🎉 Differential Privacy Analytics completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  processData,
  laplaceNoise,
  privateCount,
  privateAvg,
  calculateAnalytics,
  generateDPChart,
};
