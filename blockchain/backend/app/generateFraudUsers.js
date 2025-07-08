const fs = require("fs");
const path = require("path");

function generateFraudUsers() {
    // Create a list of blacklisted users for testing
    const fraudUsers = [
        "BLACKLISTED_USER_1",
        "BLACKLISTED_USER_2", 
        "BLACKLISTED_USER_3",
        "FRAUDSTER_001",
        "FRAUDSTER_002",
        "BANNED_USER_1",
        "BANNED_USER_2",
        "SCAMMER_123",
        "FAKE_USER_001",
        "SUSPICIOUS_USER_1"
    ];
    
    // Add more users to reach 50 blacklisted users
    for (let i = 11; i <= 50; i++) {
        fraudUsers.push(`BLACKLISTED_USER_${i}`);
    }
    
    // Save to file
    fs.writeFileSync(
        path.join(__dirname, "fraudUsers.json"),
        JSON.stringify(fraudUsers, null, 2)
    );
    
    console.log("✅ Generated fraudUsers.json with 50 blacklisted users");
    console.log("📋 Sample blacklisted users:");
    fraudUsers.slice(0, 10).forEach(user => console.log(`  - ${user}`));
    console.log(`  ... and ${fraudUsers.length - 10} more`);
}

if (require.main === module) {
    generateFraudUsers();
}

module.exports = { generateFraudUsers };