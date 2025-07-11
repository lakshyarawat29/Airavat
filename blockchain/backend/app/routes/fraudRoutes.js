const express = require("express");
const { generateFraudProof } = require("../src/generateFraudProof");
const { verifyFraudWithZkVerify } = require("../src/zkverifyFraud");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userHash } = req.body; // Changed from userId
    
    // Validate inputs
    if (!userHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: userHash"
      });
    }
    
    console.log(`\n🔍 Processing fraud verification for userHash ${userHash}`);
    
    // Generate proof
    const proofResult = await generateFraudProof(userHash);
    
    console.log("🔗 Verifying fraud proof with zkVerify on-chain...");
    
    // Use zkVerify for on-chain verification
    const zkVerifyResult = await verifyFraudWithZkVerify(
      proofResult.proof,
      proofResult.publicSignals
    );
    
    console.log("🎉 zkVerify on-chain verification result:", zkVerifyResult);
    
    // Return the on-chain verification result directly
    if (zkVerifyResult.verified) {
      // zkVerify confirmed the proof is valid on-chain
      // The actual fraud check result is in the public signals
      res.send(zkVerifyResult.result.toString());
    } else {
      // zkVerify failed - proof is invalid, consider as fraud
      res.send("0");
    }
    
  } catch (error) {
    console.error("❌ Fraud verification error:", error.message);
    res.send("0");
  }
});

module.exports = router;