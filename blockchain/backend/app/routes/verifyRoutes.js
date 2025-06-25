const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateProof } = require("../src/generateProof");
const { sendAttestation } = require("../src/sendAttestation");
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
    const { userId, network } = req.body;
    if (!userId || !network) throw new Error("Missing required fields: userId or network");

    console.log("Step 1: Generating proof...");
    const { proof, publicSignals } = await generateProof(userId, CIBIL_THRESHOLD);

    console.log("Step 2: Verifying proof...");
    const verificationResult = await verify(proof, publicSignals);
    if (!verificationResult) throw new Error("Proof verification failed");

    console.log("Step 3: Updating verification results...");
    const results = JSON.parse(fs.readFileSync(verificationResultsPath));

    results.verifications.verified.push({
      userId,
      timestamp: Date.now(),
      verificationHash: publicSignals[1] || "N/A",
    });

    fs.writeFileSync(verificationResultsPath, JSON.stringify(results, null, 2));

    console.log("Verification completed successfully!");
    console.log("Sending attestation data...");
    
    const attestationPath = path.join(__dirname, "../../attestation.json");
    if (!fs.existsSync(attestationPath)) {
      throw new Error("attestation.json file not found");
    }
    
    const attestationData = JSON.parse(fs.readFileSync(attestationPath, "utf8"));
    const receipt = await sendAttestation(attestationData, network);
    res.json({ success: true, receipt: receipt.hash });
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
