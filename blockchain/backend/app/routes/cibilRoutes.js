const express = require("express");
const { generateProof } = require("../src/generateCibilProof");
const { verifyCibilWithZkVerify } = require("../src/zkverifyCibil");
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, threshold } = req.body;
    
    // Validate inputs
    if (!userId || !threshold) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId and threshold"
      });
    }
    
    // Validate threshold is a number
    const thresholdNum = parseInt(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      return res.status(400).json({
        success: false,
        error: "Threshold must be a positive number"
      });
    }
    
    console.log(`\n🔍 Processing CIBIL verification for ${userId} with threshold ${thresholdNum}`);
    
    // Generate proof
    const proofResult = await generateProof(userId, thresholdNum);
    
    console.log("🔗 Verifying CIBIL proof with zkVerify on-chain...");
    
    // Use zkVerify for on-chain verification
    const zkVerifyResult = await verifyCibilWithZkVerify(
      proofResult.proof,
      proofResult.publicSignals
    );

    console.log("🎉 zkVerify on-chain verification result:", zkVerifyResult);

    // Return the on-chain verification result directly
    if (zkVerifyResult.verified) {
      // zkVerify confirmed the proof is valid on-chain
      // The actual CIBIL check result is in the public signals
      res.send(zkVerifyResult.result.toString());
    } else {
      // zkVerify failed - proof is invalid
      res.send("0");
    }
    
  } catch (error) {
    console.error("❌ CIBIL verification error:", error.message);
    res.send("0");
  }
});

module.exports = router;
