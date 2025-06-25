const express = require("express");
const pdfMaster = require("pdf-master");
const router = express.Router();

router.get("/generate", async (req, res) => {
  // Simulated user data and skills – in a real app these might come from a database or state
  const user = {
    name: "Anonymous User",
    wallet: "0x720f...698b",
    bio: "A passionate developer with interest in blockchain and zero-knowledge proofs.",
    email: "anonymous@example.com",
    github: "https://github.com/anonymous",
    linkedin: "https://linkedin.com/in/anonymous",
    portfolio: "https://anonymous1231.dev"
  };

  const skills = ["JavaScript", "Node.js", "Blockchain", "Zero-Knowledge"];

  // Prepare the data object for the template
  const data = {
    user,
    skills,
    certificateTitle: "Zero-Knowledge Certified Resume"
  };

  // PDF options – adjust header, footer, and margins as needed
  const options = {
    displayHeaderFooter: true,
    format: "A5",
    headerTemplate: `<h3 style="text-align: center;">zk Certificate</h3>`,
    footerTemplate: `<h3 style="text-align: center;">© 2023 zkCertify</h3>`,
    margin: { top: "80px", bottom: "100px" }
  };

  try {
    // Generate the PDF using your Handlebars template (e.g. "zkCertificate.hbs")
    const PDF = await pdfMaster.generatePdf("../templates/zkCertificate.hbs", data, options);
    res.contentType("application/pdf");
    res.status(200).send(PDF);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
