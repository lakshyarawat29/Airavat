const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const sampleUsersPath = path.join(__dirname, "../sampleUsers.json");

/**
 * Build a Merkle tree from an array of leaves.
 * @param {Array<any>} input - Array of leaf values.
 * @param {Function} leafHash - Function to hash a leaf.
 * @param {Function} nodeHash - Function to hash two child nodes.
 * @returns {Object} A Merkle tree object with .getRoot() and .getMerkleProof(index).
 */
async function merkleTree(input, leafHash, nodeHash) {
    const merkle = {
        inputs: [...input], // copy of the input leaves
        leafHash,
        nodeHash,
        depth: Math.log2(input.length),
        nodes: []
    };

    // Compute all levels of the tree.
    function calculateNodes() {
        const levels = [];
        let currentLevel = merkle.inputs.map(merkle.leafHash);
        levels.push(currentLevel);
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                // If odd number of nodes, duplicate the last node.
                const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
                nextLevel.push(merkle.nodeHash(left, right));
            }
            levels.push(nextLevel);
            currentLevel = nextLevel;
        }
        return levels.flat();
    }
    
    // Return the root of the tree (last element in the flattened nodes).
    function getRoot() {
        return merkle.nodes[merkle.nodes.length - 1];
    }
    
    /**
     * Generate a Merkle proof for a leaf at the given index.
     */
    function getMerkleProof(index) {
        if (index < 0 || index >= merkle.inputs.length) {
            throw new Error("Index out of bounds");
        }
        const path = [];
        const lemma = [];
        let currentIndex = index;
        let width = merkle.inputs.length;
        let offset = 0;
        
        // Start with the leaf hash.
        lemma.push(merkle.nodes[currentIndex]);
        
        while (width > 1) {
            const isLeft = (currentIndex % 2 === 0);
            const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
            // Record the direction: 0 if left, 1 if right.
            path.push(isLeft ? 0 : 1);
            lemma.push(merkle.nodes[offset + siblingIndex]);
            currentIndex = Math.floor(currentIndex / 2);
            offset += width;
            width = Math.ceil(width / 2);
        }
        // Append the computed root.
        lemma.push(getRoot());
        return { path, lemma, calculateRoot: () => {
            return path.reduce((hash, direction, i) => {
                const sibling = lemma[i + 1];
                return direction === 0 ? nodeHash(hash, sibling) : nodeHash(sibling, hash);
            }, lemma[0]);
        }};
    }
    
    merkle.nodes = calculateNodes();
    merkle.getRoot = getRoot;
    merkle.getMerkleProof = getMerkleProof;
    return merkle;
}

/**
 * Hash a user's identifier using SHA-256 and convert to BigInt.
 * @param {string} id - The user identifier.
 * @returns {BigInt} The hash as a BigInt.
 */
function getUserIDHash(id) {
    if (!id) {
        throw new Error("Invalid user id passed to getUserIDHash: " + id);
    }
    const hashHex = crypto.createHash("sha256").update(id).digest("hex");
    return BigInt("0x" + hashHex);
}

/**
 * Generate the Merkle tree for user records.
 * Each leaf is computed as: Poseidon( userIDHash, spendsHash )
 */
async function generateUserMerkleTree() {
    const poseidon = await circomlibjs.buildPoseidonOpt();
    const users = JSON.parse(fs.readFileSync(sampleUsersPath, "utf8"));

    // Leaf hash function: combine userIDHash and spendsHash.
    const hashUserLeaf = (user) => {
        const userIDHash = BigInt(user.userIDHash);
        const spendsHash = BigInt(user.spendsHash);
        return poseidon([userIDHash, spendsHash]);
    };

    const hashInternalNode = (left, right) => poseidon([left, right]);

    const treeDepth = 10;
    const maxLeaves = 2 ** treeDepth;
    const leaves = Array.from({ length: maxLeaves }, (_, index) => {
        if (index < users.length) {
            console.log(`Processing user ${index + 1}: ${users[index].id}`);
            return users[index];
        } else {
            return users[users.length - 1];
        }
    });

    console.log(`Total users: ${users.length}. Total leaves (with padding): ${leaves.length}.`);
    const merkleTreeInstance = await merkleTree(leaves, hashUserLeaf, hashInternalNode);
    const merkleRoot = poseidon.F.toString(merkleTreeInstance.getRoot());
    console.log("Merkle Tree Root:", merkleRoot);
    return { merkleTreeInstance, poseidon };
}

/**
 * Generate a zero-knowledge proof that a given user's spending is within budget.
 * @param {string} userId - The user's identifier (e.g., "user1").
 * @param {Array<number>} spends - Array of user's spending amounts.
 * @param {number} threshold - The budget threshold.
 * @returns {Object} Proof and public signals.
 */
async function generateBudgetProof(userId, spends, threshold) {
    const users = JSON.parse(fs.readFileSync(sampleUsersPath, "utf8"));
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        throw new Error(`User with id ${userId} not found.`);
    }
    const userRecord = users[userIndex];

    const { merkleTreeInstance, poseidon } = await generateUserMerkleTree();
    const merkleRoot = poseidon.F.toString(merkleTreeInstance.getRoot());

    // Convert spends to BigInt and calculate hash
    const spendsArray = spends.map(spend => BigInt(spend));
    const calculatedSpendsHash = poseidon(spendsArray);

    // Verify the provided spends match the registered hash
    const calculatedHashStr = poseidon.F.toString(calculatedSpendsHash);
    const registeredHashStr = userRecord.spendsHash;
    
    console.log("Calculated hash:", calculatedHashStr);
    console.log("Registered hash:", registeredHashStr);
    console.log("Match:", calculatedHashStr === registeredHashStr);

    if (calculatedHashStr !== registeredHashStr) {
        throw new Error("Provided spends do not match registered spending hash");
    }

    const userIDHash = BigInt(userRecord.userIDHash);
    const thresholdBigInt = BigInt(threshold);

    const proofData = merkleTreeInstance.getMerkleProof(userIndex);
    
    // Debug: log the proof data structure
    console.log("Proof data structure:", {
        pathLength: proofData.path.length,
        lemmaLength: proofData.lemma.length,
        path: proofData.path,
        lemma: proofData.lemma.map(x => poseidon.F.toString(x))
    });

    // Convert path directions to pathElements for the circuit
    const pathElements = [];

    // The lemma array contains: [leaf, sibling1, sibling2, ..., root]
    // We need siblings only (skip leaf and root)
    for (let i = 1; i < proofData.lemma.length - 1 && pathElements.length < 10; i++) {
        pathElements.push(poseidon.F.toString(proofData.lemma[i]));
    }

    // Pad pathElements to depth 10
    while (pathElements.length < 10) {
        pathElements.push("0");
    }

    console.log("Final pathElements:", pathElements);
    console.log("User index (pathIndex):", userIndex);

    // Circuit inputs for budget verification
    const circuitInputs = {
        userIdHash: userIDHash.toString(),
        spends: spends.map(s => s.toString()),
        threshold: thresholdBigInt.toString(),
        merkleRoot: merkleRoot,
        spendsHash: calculatedHashStr,
        pathElements: pathElements,
        pathIndex: userIndex.toString()  // Only pathIndex, not pathIndices
    };

    console.log("Circuit Inputs:", {
        userIdHash: circuitInputs.userIdHash,
        spends: circuitInputs.spends,
        threshold: circuitInputs.threshold,
        merkleRoot: circuitInputs.merkleRoot,
        spendsHash: circuitInputs.spendsHash,
        pathElementsLength: circuitInputs.pathElements.length,
        pathElements: circuitInputs.pathElements,
        pathIndex: circuitInputs.pathIndex
    });

    const wasmPath = path.join(__dirname, "../../budget_checker_circuit/setup/circuit.wasm");
    const zkeyPath = path.join(__dirname, "../../budget_checker_circuit/setup/circuit_final.zkey");
    console.log("Using WASM Path:", wasmPath);
    console.log("Using ZKey Path:", zkeyPath);

    // Generate the proof using snarkjs.
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
    );

    console.log("Proof generated successfully.");
    console.log("Public Signals:", publicSignals);
    
    return { 
        proof, 
        publicSignals,
        userId,
        result: publicSignals[0] // Budget check result
    };
}

// If this file is run directly, generate a proof for an example user.
if (require.main === module) {
    (async () => {
        try {
            // Example: prove that user "user1" has spending within budget.
            const userId = "user1";
            const spends = [202, 204, 245, 279, 122];
            const threshold = 1000;
            const { proof, publicSignals } = await generateBudgetProof(userId, spends, threshold);
            console.log("Zero-Knowledge Proof:", JSON.stringify(proof, null, 2));
            console.log("Public Signals:", publicSignals);
        } catch (error) {
            console.error("Error during proof generation:", error);
        }
    })();
}

module.exports = { generateBudgetProof, generateUserMerkleTree };
