const circomlibjs = require("circomlibjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function regenerateSampleUsersWithPrivacy() {
  const poseidon = await circomlibjs.buildPoseidonOpt();
  
  // Original user data with actual spends (for testing) - 20 users
  const originalUsers = [
    {
      id: "user1",
      spends: ["202", "204", "245", "279", "122"]
    },
    {
      id: "user2", 
      spends: ["280", "290", "103", "192", "267"]
    },
    {
      id: "user3",
      spends: ["247", "269", "266", "270", "111"]
    },
    {
      id: "user4",
      spends: ["112", "237", "193", "124", "269"]
    },
    {
      id: "user5",
      spends: ["199", "174", "200", "300", "163"]
    },
    {
      id: "user6",
      spends: ["246", "188", "173", "224", "278"]
    },
    {
      id: "user7",
      spends: ["290", "280", "283", "290", "165"]
    },
    {
      id: "user8",
      spends: ["231", "292", "160", "103", "292"]
    },
    {
      id: "user9",
      spends: ["278", "103", "294", "269", "272"]
    },
    {
      id: "user10",
      spends: ["120", "297", "202", "199", "250"]
    },
    {
      id: "user11",
      spends: ["274", "218", "268", "108", "224"]
    },
    {
      id: "user12",
      spends: ["215", "284", "171", "266", "187"]
    },
    {
      id: "user13",
      spends: ["136", "288", "131", "268", "238"]
    },
    {
      id: "user14",
      spends: ["134", "135", "258", "251", "277"]
    },
    {
      id: "user15",
      spends: ["128", "185", "107", "185", "242"]
    },
    {
      id: "user16",
      spends: ["266", "293", "197", "202", "157"]
    },
    {
      id: "user17",
      spends: ["121", "289", "215", "140", "231"]
    },
    {
      id: "user18",
      spends: ["238", "252", "201", "109", "103"]
    },
    {
      id: "user19",
      spends: ["124", "143", "231", "170", "169"]
    },
    {
      id: "user20",
      spends: ["195", "210", "208", "297", "174"]
    }
  ];
  
  // Generate privacy-preserving user data
  const privacyUsers = await Promise.all(originalUsers.map(async (user) => {
    // Generate SHA-256 hash for user ID
    const userIDHash = crypto.createHash("sha256").update(user.id).digest("hex");
    
    // Convert spends to BigInt
    const spendsArray = user.spends.map(spend => BigInt(spend));
    
    // Hash the spends: spendsHash = Poseidon(spends[])
    const spendsHash = poseidon(spendsArray);
    
    // Hash the leaf: leafHash = Poseidon(userIdHash, spendsHash)
    const leafHash = poseidon([BigInt("0x" + userIDHash), spendsHash]);
    
    return {
      id: user.id,
      userIDHash: userIDHash,
      spendsHash: poseidon.F.toString(spendsHash),
      leafHash: poseidon.F.toString(leafHash)
    };
  }));
  
  // Write updated file
  fs.writeFileSync(
    path.join(__dirname, "sampleUsers.json"),
    JSON.stringify(privacyUsers, null, 2)
  );
  
  console.log("✅ Updated sampleUsers.json with privacy-preserving design");
  console.log(`📊 Generated ${privacyUsers.length} users`);
  console.log("📝 Note: Only spendsHash is stored, not actual spends");
  
  // Display summary
  console.log("\n📋 Summary:");
  privacyUsers.forEach(user => {
    console.log(`${user.id}: spendsHash=${user.spendsHash.substring(0, 10)}...`);
  });
}

regenerateSampleUsersWithPrivacy().catch(console.error);