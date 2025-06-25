const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function verifyUserProof(proofPath, publicPath, verificationKeyPath) {
    try {
        // Load the files
        const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));
        const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, "utf8"));
        
        // Verify the proof
        const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
        
        if (isValid) {
            console.log("✅ Proof is valid!");
            console.log("✅ User's CIBIL score exceeds the threshold");
            return {
                valid: true,
                result: publicSignals[0], // 1 = passed, 0 = failed
                merkleRoot: publicSignals[1],
                threshold: publicSignals[2]
            };
        } else {
            console.log("❌ Proof is invalid!");
            return { valid: false };
        }
    } catch (error) {
        console.error("Error verifying proof:", error);
        return { valid: false, error: error.message };
    }
}

// Example usage
async function main() {
    const result = await verifyUserProof(
        "../circuit/proof.json",
        "../circuit/public.json", 
        "../circuit/setup/verification_key.json"
    );
    
    console.log("Verification result:", result);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { verifyUserProof };