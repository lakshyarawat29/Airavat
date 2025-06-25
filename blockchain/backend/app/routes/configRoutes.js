const express = require("express");

const router = express.Router();
const CIBIL_THRESHOLD = 700; 

router.get("/", (req, res) => {
  res.json({ threshold: CIBIL_THRESHOLD });
});

module.exports = router;
