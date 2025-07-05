const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const verifyRoutes = require("../routes/verifyRoutes");
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
app.get("/", (req, res) => res.send("Hello from Express on Vercel!"));
app.use("/verify", verifyRoutes);
app.listen(PORT, () => {
  console.log(`ZkCertify server running on port ${PORT}`);
});
