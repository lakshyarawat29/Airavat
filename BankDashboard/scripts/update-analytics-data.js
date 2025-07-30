const fs = require('fs');
const path = require('path');

// Function to update the analytics page with latest DP results
function updateAnalyticsData() {
  try {
    console.log(
      '🔄 Updating analytics data with latest differential privacy results...'
    );

    // Read the current analytics page
    const analyticsPath = path.join(__dirname, '../app/analytics/page.tsx');
    let content = fs.readFileSync(analyticsPath, 'utf8');

    // Run the differential privacy script to get latest results
    const { execSync } = require('child_process');
    const dpOutput = execSync(
      'node scripts/differential-privacy-analytics.js',
      { encoding: 'utf8' }
    );

    // Parse the output to extract organization data
    const orgMatch = dpOutput.match(
      /Organization Request Counts \(Differentially Private\):\s*((?:.*\n)*?)(?=\n💾)/
    );
    if (orgMatch) {
      const orgData = orgMatch[1]
        .trim()
        .split('\n')
        .map((line) => {
          const match = line.match(/\s*([^:]+):\s*(\d+)\s*requests/);
          if (match) {
            return { name: match[1].trim(), count: parseInt(match[2]) };
          }
          return null;
        })
        .filter(Boolean);

      // Sort by count (descending)
      orgData.sort((a, b) => b.count - a.count);

      // Update the analytics page with new data
      const orgArrayString = orgData
        .map((org) => `{ name: '${org.name}', count: ${org.count} }`)
        .join(',\n                        ');

      // Replace the organization data in the file
      const orgDataRegex = /(\[\s*\{[\s\S]*?\}\s*\]\.map\()/;
      const newOrgData = `[\n                        ${orgArrayString},\n                      ].map(`;

      content = content.replace(orgDataRegex, newOrgData);

      // Write the updated content back
      fs.writeFileSync(analyticsPath, content, 'utf8');

      console.log(
        '✅ Analytics page updated with latest differential privacy results'
      );
      console.log('📊 Organization data updated:');
      orgData.forEach((org) => {
        console.log(`   ${org.name}: ${org.count} requests`);
      });
    } else {
      console.log(
        '⚠️  Could not parse organization data from DP script output'
      );
    }
  } catch (error) {
    console.error('❌ Error updating analytics data:', error.message);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateAnalyticsData();
}

module.exports = { updateAnalyticsData };
