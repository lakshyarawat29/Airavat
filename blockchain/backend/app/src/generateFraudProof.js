const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

// Import users with precomputed hashes
const { users } = require(`../userRecords.json`);

function getUserHash(userIDHash, poseidon) {
    // Convert precomputed hash to Poseidon hash for circuit
    const hashBigInt = BigInt(userIDHash);
    return poseidon([hashBigInt]);
}

async function generateBlacklistMerkleTree() {
    const poseidon = await circomlibjs.buildPoseidonOpt();
    const depth = 10;
    const leafCount = 2 ** depth;

    // Load fraud users from file
    let fraudUsers = [];
    const fraudUsersPath = path.join(__dirname, "../fraudUsers.json");
    
    if (fs.existsSync(fraudUsersPath)) {
        const rawFraudUsers = JSON.parse(fs.readFileSync(fraudUsersPath, "utf8"));
        
        // Convert to objects with precomputed hashes if needed
        fraudUsers = rawFraudUsers.map(item => {
            if (typeof item === 'string') {
                // Find corresponding user in userRecords by ID
                const userRecord = users.find(user => user.id === item);
                return {
                    id: item,
                    userIDHash: userRecord ? userRecord.userIDHash : "0"
                };
            }
            return item; // Already an object
        });
    }

    console.log(`📋 Loaded ${fraudUsers.length} blacklisted users`);
    console.log(`🎯 First 3 blacklisted users:`, fraudUsers.slice(0, 3).map(u => u.id));

    // Hash all blacklisted users using their precomputed hashes
    const blacklistHashes = [];
    for (let i = 0; i < fraudUsers.length; i++) {
        const userIDHash = fraudUsers[i].userIDHash;
        blacklistHashes.push(getUserHash(userIDHash, poseidon));
    }

    // Pad to full tree
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
 * @param {string} userHash - The user's precomputed hash identifier
 * @returns {Object} Proof and public signals
 */
async function generateFraudProof(userHash) {
    const { merkleTree, merkleRoot, poseidon, fraudUsers } = await generateBlacklistMerkleTree();
    
    console.log(`🔍 Processing userHash: ${userHash}`);
    
    // Check if the provided userHash is in the blacklisted hashes
    const isActuallyBlacklisted = fraudUsers.some(user => user.userIDHash === userHash);
    console.log(`📊 User hash ${userHash} actually blacklisted: ${isActuallyBlacklisted}`);
    
    // Convert userHash to circuit input format
    const circuitUserHash = getUserHash(userHash, poseidon);
    
    let pathElements, pathIndices;
    
    if (isActuallyBlacklisted) {
        // User IS blacklisted - find their position in the fraudUsers array
        const blacklistedIndex = fraudUsers.findIndex(user => user.userIDHash === userHash);
        const blacklistedUser = fraudUsers[blacklistedIndex];
        console.log(`🎯 Found blacklisted user ${blacklistedUser.id} at index: ${blacklistedIndex}`);
        
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
        userHash: poseidon.F.toString(circuitUserHash),
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
        userHash,
        result: publicSignals[0]
    };
}

module.exports = { generateFraudProof };