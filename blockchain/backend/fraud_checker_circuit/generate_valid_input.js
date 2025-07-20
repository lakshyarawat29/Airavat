const circomlibjs = require("circomlibjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function getUserHash(id, poseidon) {
    // Hash the identifier with SHA256, then Poseidon
    const hashHex = crypto.createHash("sha256").update(id).digest("hex");
    const hashBigInt = BigInt("0x" + hashHex);
    return poseidon([hashBigInt]);
}

async function generateFraudCheckInput() {
    const poseidon = await circomlibjs.buildPoseidonOpt();
    const depth = 10;
    const leafCount = 2 ** depth;

    // Blacklist: 20 blacklisted users
    const blacklistIds = [];
    for (let i = 1; i <= 20; i++) {
        blacklistIds.push(`BLACKLISTED_USER_${i}`);
    }
    const blacklistHashes = await Promise.all(blacklistIds.map(id => getUserHash(id, poseidon)));

    // Pad to full tree
    while (blacklistHashes.length < leafCount) {
        blacklistHashes.push(blacklistHashes[blacklistHashes.length - 1]);
    }

    // Build Merkle tree (bottom-up)
    let currentLevel = blacklistHashes.slice();
    const merkleTree = [currentLevel.slice()];
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

    // User to check (NOT in blacklist)
    const userId = "NOT_BLACKLISTED_USER";
    const userHash = getUserHash(userId, poseidon);

    // For demo: use a Merkle path for a random leaf (e.g., index 0)
    const fakeIndex = 0;
    let currentIndex = fakeIndex;
    const pathElements = [];
    const pathIndices = [];
    for (let level = 0; level < depth; level++) {
        const siblingIndex = currentIndex ^ 1;
        pathElements.push(poseidon.F.toString(merkleTree[level][siblingIndex]));
        pathIndices.push(currentIndex % 2);
        currentIndex = Math.floor(currentIndex / 2);
    }

    // Output for the fraud check circuit
    const input = {
        blacklistRoot: poseidon.F.toString(merkleRoot),
        userHash: poseidon.F.toString(userHash),
        pathElements: pathElements,
        pathIndices: pathIndices
    };
    fs.writeFileSync(path.join(__dirname, "input.json"), JSON.stringify(input, null, 2));
    console.log("Sample input written to fraud_checker_circuit/input.json");
}

if (require.main === module) generateFraudCheckInput();