const express = require("express");
const { generateBudgetProof } = require("../src/generateBudgetProof");
const { verifyBudgetWithZkVerify } = require("../src/zkverifyBudget");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userHash, spends, threshold, spendsHash } = req.body; // Changed from userId
    
    // Validate inputs
    if (!userHash || !spends || !threshold || !spendsHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userHash, spends, threshold, spendsHash"
      });
    }
    
    console.log(`\n🔄 Processing budget verification for userHash ${userHash}`);
    console.log(`📊 Threshold: ${threshold}`);
    console.log(`🔒 SpendsHash: ${spendsHash}`);
    
    // Generate proof
    const proofResult = await generateBudgetProof(userHash, spends, threshold, spendsHash);
    
    console.log("🔗 Verifying budget proof with zkVerify on-chain...");
    
    // Use zkVerify for on-chain verification - it returns the verification result
    const zkVerifyResult = await verifyBudgetWithZkVerify(
      proofResult.proof,
      proofResult.publicSignals
    );
    
    console.log("🎉 zkVerify on-chain verification result:", zkVerifyResult);
    
    // Return the on-chain verification result directly
    if (zkVerifyResult.verified) {
      // zkVerify confirmed the proof is valid on-chain
      // The actual budget check result is in the public signals
      res.send(zkVerifyResult.result.toString());
    } else {
      // zkVerify failed - proof is invalid
      res.send("0");
    }
    
  } catch (error) {
    console.error("❌ Budget verification error:", error.message);
    res.send("0");
  }
});

module.exports = router;
