const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const verificationResultsPath = "../verificationResults.json";

router.get("/", (req, res) => {
  try {
    console.log(verificationResultsPath);
    console.log("Loading verification results...");
    const results = JSON.parse(fs.readFileSync(verificationResultsPath));
    res.json(results.verifications.verified);
    console.log("Successfully verified :" + results.verifications.verified)
  } catch (error) {
    res.status(500).json({ error: "Failed to load verifications" });
  }
});

module.exports = router;
