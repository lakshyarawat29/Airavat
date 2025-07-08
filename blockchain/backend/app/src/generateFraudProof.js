const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function getUserHash(id, poseidon) {
    // Hash the identifier with SHA256, then Poseidon
    const hashHex = crypto.createHash("sha256").update(id).digest("hex");
    const hashBigInt = BigInt("0x" + hashHex);
    return poseidon([hashBigInt]);
}

async function generateBlacklistMerkleTree() {
    const poseidon = await circomlibjs.buildPoseidonOpt();
    const depth = 10;
    const leafCount = 2 ** depth;

    // Load fraud users from file or create default blacklist
    let fraudUsers = [];
    const fraudUsersPath = path.join(__dirname, "../fraudUsers.json");
    
    if (fs.existsSync(fraudUsersPath)) {
        fraudUsers = JSON.parse(fs.readFileSync(fraudUsersPath, "utf8"));
    } else {
        // Create default blacklist
        for (let i = 1; i <= 50; i++) {
            fraudUsers.push(`BLACKLISTED_USER_${i}`);
        }
        // Make sure FRAUDSTER_001 is included
        if (!fraudUsers.includes("FRAUDSTER_001")) {
            fraudUsers[3] = "FRAUDSTER_001"; // Replace 4th element
        }
    }

    console.log(`📋 Loaded ${fraudUsers.length} blacklisted users`);
    console.log(`🎯 First 5 blacklisted users:`, fraudUsers.slice(0, 5));

    // Hash all blacklisted users - IMPORTANT: Keep order!
    const blacklistHashes = [];
    for (let i = 0; i < fraudUsers.length; i++) {
        blacklistHashes.push(getUserHash(fraudUsers[i], poseidon));
    }

    // Pad to full tree with zeros or last element
    const paddingHash = poseidon([BigInt(0)]);
    while (blacklistHashes.length < leafCount) {
        blacklistHashes.push(paddingHash);
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
    console.log("🌳 Blacklist Merkle Root:", poseidon.F.toString(merkleRoot));
    
    return { merkleTree, merkleRoot, poseidon, fraudUsers };
}

function getMerkleProof(merkleTree, index, depth) {
    const pathElements = [];
    const pathIndices = [];
    let currentIndex = index;
    
    for (let level = 0; level < depth; level++) {
        const siblingIndex = currentIndex ^ 1;
        const levelArr = merkleTree[level];
        pathElements.push(levelArr[siblingIndex] ? levelArr[siblingIndex] : levelArr[currentIndex]);
        pathIndices.push(currentIndex % 2);
        currentIndex = Math.floor(currentIndex / 2);
    }
    
    return { pathElements, pathIndices };
}

/**
 * Generate a zero-knowledge proof that a user is NOT in the blacklist
 * @param {string} userId - The user's identifier
 * @returns {Object} Proof and public signals
 */
async function generateFraudProof(userId) {
    const { merkleTree, merkleRoot, poseidon, fraudUsers } = await generateBlacklistMerkleTree();
    
    // Hash the user ID
    const userHash = getUserHash(userId, poseidon);
    
    console.log(`🔍 Checking user: ${userId}`);
    console.log(`🔐 User hash: ${poseidon.F.toString(userHash)}`);
    
    // Check if user is actually blacklisted
    const isActuallyBlacklisted = fraudUsers.includes(userId);
    console.log(`📊 User actually blacklisted: ${isActuallyBlacklisted}`);
    
    let pathElements, pathIndices;
    
    if (isActuallyBlacklisted) {
        // User IS blacklisted - find their actual position in the tree
        const blacklistedIndex = fraudUsers.indexOf(userId);
        console.log(`🎯 Found blacklisted user at index: ${blacklistedIndex}`);
        const merkleProof = getMerkleProof(merkleTree, blacklistedIndex, 10);
        pathElements = merkleProof.pathElements;
        pathIndices = merkleProof.pathIndices;
    } else {
        // User is NOT blacklisted - use a random proof (should fail to match)
        const randomIndex = Math.floor(Math.random() * (2 ** 10));
        console.log(`🎲 Using random proof index: ${randomIndex} (user not in blacklist)`);
        const merkleProof = getMerkleProof(merkleTree, randomIndex, 10);
        pathElements = merkleProof.pathElements;
        pathIndices = merkleProof.pathIndices;
    }
    
    // Circuit inputs
    const circuitInputs = {
        blacklistRoot: poseidon.F.toString(merkleRoot),
        userHash: poseidon.F.toString(userHash),
        pathElements: pathElements.map(x => poseidon.F.toString(x)),
        pathIndices: pathIndices
    };

    console.log("Circuit Inputs:", {
        blacklistRoot: circuitInputs.blacklistRoot,
        userHash: circuitInputs.userHash,
        pathElementsLength: circuitInputs.pathElements.length,
        pathIndicesLength: circuitInputs.pathIndices.length,
        expectedResult: isActuallyBlacklisted ? "0 (blacklisted)" : "1 (clean)"
    });

    const wasmPath = path.join(__dirname, "../../fraud_checker_circuit/setup/circuit.wasm");
    const zkeyPath = path.join(__dirname, "../../fraud_checker_circuit/setup/circuit_final.zkey");
    
    console.log("Using WASM Path:", wasmPath);
    console.log("Using ZKey Path:", zkeyPath);

    // Generate the proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
    );

    console.log("Proof generated successfully.");
    console.log("Public Signals:", publicSignals);
    console.log(`✅ Expected: ${isActuallyBlacklisted ? "0" : "1"}, Got: ${publicSignals[0]}`);
    
    return { 
        proof, 
        publicSignals,
        userId,
        result: publicSignals[0] // Fraud check result: 1 = clean, 0 = blacklisted
    };
}

module.exports = { generateFraudProof };