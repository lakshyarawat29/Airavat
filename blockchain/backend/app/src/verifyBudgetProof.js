const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function verifyBudgetProof(proof, publicSignals) {
  try {
    const vkPath = path.join(__dirname, "../../budget_checker_circuit/verification_key.json");
    
    if (!fs.existsSync(vkPath)) {
      throw new Error(`Verification key not found: ${vkPath}`);
    }

    const vKey = JSON.parse(fs.readFileSync(vkPath, "utf8"));
    
    console.log("Verifying budget proof with snarkjs...");
    
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    console.log("Budget proof verification result:", isValid);
    
    return isValid;
  } catch (error) {
    console.error("Error verifying budget proof:", error);
    throw error;
  }
}

module.exports = { verifyBudgetProof };
