const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateBudgetProof } = require("../src/generateBudgetProof");
const { verifyBudgetWithZkVerify } = require("../src/zkverifyBudget");
const router = express.Router();

const BUDGET_THRESHOLD = 1000; // Default budget threshold
const verificationResultsPath = path.join(__dirname, "../budgetVerificationResults.json");

// Ensure budgetVerificationResults.json exists
if (!fs.existsSync(verificationResultsPath)) {
  fs.writeFileSync(
    verificationResultsPath,
    JSON.stringify({ verifications: { verified: [] } }, null, 2)
  );
}

router.post("/", async (req, res) => {
  console.log("Received budget verification request:", req.body);

  try {
    const { userId, spends, threshold } = req.body;
    
    if (!userId) throw new Error("Missing required field: userId");
    if (!spends || !Array.isArray(spends)) throw new Error("Missing required field: spends (array)");
    
    const budgetThreshold = threshold || BUDGET_THRESHOLD;
    
    console.log(`Step 1: Generating budget proof for user ${userId}...`);
    const { proof, publicSignals } = await generateBudgetProof(userId, spends, budgetThreshold);

    // Extract budget result from publicSignals[0]: 1 = under budget, 0 = over budget
    const budgetResult = parseInt(publicSignals[0]);
    console.log(`Proof generated - Budget result: ${budgetResult ? 'Under Budget' : 'Over Budget'}`);

    console.log("Step 2: Verifying budget proof with zkVerify...");
    const verificationResult = await verifyBudgetWithZkVerify(proof, publicSignals);
    if (!verificationResult) throw new Error("Budget proof verification failed");

    console.log(`✅ Budget verification completed! zkVerify confirmed the proof is valid.`);
    
    // Save verification result
    const results = JSON.parse(fs.readFileSync(verificationResultsPath));
    results.verifications.verified.push({
      userId,
      spends,
      threshold: budgetThreshold,
      timestamp: Date.now(),
      result: budgetResult,
      totalSpend: spends.reduce((sum, spend) => sum + spend, 0),
      merkleRoot: publicSignals[2] || "N/A",
    });
    fs.writeFileSync(verificationResultsPath, JSON.stringify(results, null, 2));

    // Return the budget result (1 = under budget, 0 = over budget)
    res.json({ 
      success: true, 
      result: budgetResult,
      message: budgetResult ? "Under budget" : "Over budget",
      userId: userId,
      totalSpend: spends.reduce((sum, spend) => sum + spend, 0),
      threshold: budgetThreshold,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Budget verification failed:", error);
    res.status(400).json({ 
      success: false, 
      result: 0,
      message: "Budget verification failed",
      error: error.message 
    });
  }
});

module.exports = router;
