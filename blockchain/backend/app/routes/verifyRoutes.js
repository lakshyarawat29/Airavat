const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateProof } = require("../src/generateProof");
const { verify } = require("../src/zkverify");
const router = express.Router();
const CIBIL_THRESHOLD = 700;
const verificationResultsPath = "../verificationResults.json";

// Ensure verificationResults.json exists
if (!fs.existsSync(verificationResultsPath)) {
  fs.writeFileSync(
    verificationResultsPath,
    JSON.stringify({ verifications: { verified: [] } }, null, 2)
  );
}

router.post("/", async (req, res) => {
  console.log("Received verification request:", req.body);

  try {
    const { userId } = req.body;
    if (!userId) throw new Error("Missing required field: userId");

    console.log("Step 1: Generating proof...");
    const { proof, publicSignals } = await generateProof(userId, CIBIL_THRESHOLD);

    console.log("Step 2: Verifying proof with zkVerify...");
    const verificationResult = await verify(proof, publicSignals);
    if (!verificationResult) throw new Error("Proof verification failed");

    // Extract threshold result from publicSignals[0]: 1 = threshold met, 0 = threshold not met
    const thresholdResult = parseInt(publicSignals[0]);
    
    console.log(`✅ Verification completed! CIBIL threshold result: ${thresholdResult}`);
    
    // Save verification result
    const results = JSON.parse(fs.readFileSync(verificationResultsPath));
    results.verifications.verified.push({
      userId,
      timestamp: Date.now(),
      result: thresholdResult,
      verificationHash: publicSignals[1] || "N/A",
    });
    fs.writeFileSync(verificationResultsPath, JSON.stringify(results, null, 2));

    // Return the threshold result (1 = CIBIL >= 700, 0 = CIBIL < 700)
    res.json({ 
      success: true, 
      result: thresholdResult,
      userId: userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(400).json({ 
      success: false, 
      result: 0,
      error: error.message 
    });
  }
});

module.exports = router;
