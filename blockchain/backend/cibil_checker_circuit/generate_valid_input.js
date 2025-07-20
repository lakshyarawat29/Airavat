const circomlibjs = require("circomlibjs");
const crypto = require("crypto");
const fs = require("fs");

function getUserIDHash(id) {
    if (!id) {
        throw new Error("Invalid user id passed to getUserIDHash: " + id);
    }
    const hashHex = crypto.createHash("sha256").update(id).digest("hex");
    return BigInt("0x" + hashHex);
}

async function generateCorrectInput() {
    const poseidon = await circomlibjs.buildPoseidonOpt();
    
    // Create the same user data as in your generateProof.js
    const users = [];
    for (let i = 1; i <= 20; i++) {
        const userId = `user${i}`;
        const userIDHash = getUserIDHash(userId);
        const cibilScore = BigInt(700 + i * 10); // 710, 720, 730, ..., 900
        users.push({
            id: userId,
            userIDHash,
            cibilScore,
            leafHash: poseidon([userIDHash, cibilScore])
        });
    }
    
    // Pad to 1024 leaves (same as your generateProof.js)
    const targetSize = 1024;
    const paddingValue = BigInt(0);
    while (users.length < targetSize) {
        users.push({
            id: `padding_${users.length}`,
            userIDHash: paddingValue,
            cibilScore: paddingValue,
            leafHash: poseidon([paddingValue, paddingValue])
        });
    }
    
    // Build Merkle tree
    let currentLevel = users.map(user => user.leafHash);
    const merkleTree = [currentLevel.slice()]; // Store all levels
    
    while (currentLevel.length > 1) {
        const nextLevel = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1];
            nextLevel.push(poseidon([left, right]));
        }
        currentLevel = nextLevel;
        merkleTree.push(currentLevel.slice());
    }
    
    const merkleRoot = currentLevel[0];
    
    // Generate proof for user1 (index 0)
    const userIndex = 6;
    const targetUser = users[userIndex];
    
    // Generate authentication path
    const authPath = [targetUser.leafHash]; // Start with leaf
    let currentIndex = userIndex;
    
    for (let level = 0; level < merkleTree.length - 1; level++) {
        const isRightNode = currentIndex % 2 === 1;
        const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
        const sibling = merkleTree[level][siblingIndex];
        authPath.push(sibling);
        currentIndex = Math.floor(currentIndex / 2);
    }
    
    // The last element should be the root
    authPath.push(merkleRoot);
    
    // Convert to strings for JSON
    const input = {
        merkleRoot: poseidon.F.toString(merkleRoot),
        threshold: "700",
        userIndex: userIndex.toString(),
        authPath: authPath.map(h => poseidon.F.toString(h)),
        userIDHash: targetUser.userIDHash.toString(),
        userCIBILScore: targetUser.cibilScore.toString()
    };
    
    console.log("Generated correct input for user1:");
    console.log(JSON.stringify(input, null, 2));
    
    // Verify the path length
    console.log(`\nPath verification:`);
    console.log(`Auth path length: ${input.authPath.length}`);
    console.log(`Expected length: 12 (leaf + 10 levels + root)`);
    console.log(`Tree depth: ${merkleTree.length - 1}`);
    
    // Save to file
    fs.writeFileSync("input.json", JSON.stringify(input, null, 2));
    console.log("Saved to input.json");

    return input;
}

if (require.main === module) {
    generateCorrectInput().catch(console.error);
}

module.exports = { generateCorrectInput };