const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const verifyCibilRoutes = require("../routes/verifyRoutes");
const budgetRoutes = require("../routes/budgetRoutes");
const fraudRoutes = require("../routes/fraudRoutes"); // New line for fraud routes
const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000", "https://zk-cibil.vercel.app"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Airavat ZK Verification API",
    endpoints: {
      cibilVerification: "/verify-cibil",
      budgetVerification: "/verify-budget",
      fraudVerification: "/verify-fraud"  // Added fraud verification endpoint
    }
  });
});

// Routes
app.use("/verify-cibil", verifyCibilRoutes);
app.use("/verify-budget", budgetRoutes);
app.use("/verify-fraud", fraudRoutes); // New line to use fraud routes

app.listen(PORT, () => {
  console.log(`Airavat ZK server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - CIBIL Verification: http://localhost:${PORT}/verify-cibil`);
  console.log(`  - Budget Verification: http://localhost:${PORT}/verify-budget`);
  console.log(`  - Fraud Verification: http://localhost:${PORT}/verify-fraud`);  // Added fraud verification log
});
