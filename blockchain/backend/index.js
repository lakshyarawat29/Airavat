require('dotenv').config({ path: '../.env' });
const express = require('express');
const { ethers } = require('ethers');
const AiravatLoggerJson = require('../artifacts/AiravatLogger.sol/AiravatLogger.json');
const app = express();
const cors = require('cors');
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log('Backend Wallet Address:', wallet.address);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  AiravatLoggerJson.abi,
  wallet
);

// POST /log - store a new log
app.post('/log', async (req, res) => {
  try {
    const { requestId, riskScore, status } = req.body;

    const tx = await contract.storeLog(requestId, riskScore, status);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error('❌ Error while calling storeLog:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
      reason: err.reason || null,
      code: err.code || null,
    });
  }
});

// GET /log/:index - get log by index
app.get('/logs/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const log = await contract.getLog(index);

    res.json({
      success: true,
      log: {
        agent: log.agent,
        role: Number(log.role), // assuming enum is uint8
        requestId: log.requestId,
        riskScore: Number(log.riskScore),
        status: log.status,
        timestamp: Number(log.timestamp),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /logs/count - get total number of logs
app.get('/logs/count', async (req, res) => {
  try {
    const count = await contract.getLogCount();
    res.json({ success: true, count: count.toString() }); // convert BigInt to string
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /logs - get all logs (careful if large number)
app.get('/logs', async (req, res) => {
  try {
    const countBN = await contract.getLogCount(); // returns BigInt in ethers v6
    const count = Number(countBN);

    const logs = [];
    for (let i = 0; i < count; i++) {
      const log = await contract.getLog(i);
      logs.push({
        agent: log.agent,
        role: Number(log.role), // assuming enum
        requestId: log.requestId,
        riskScore: Number(log.riskScore),
        status: log.status,
        timestamp: Number(log.timestamp),
      });
    }

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Middleware server listening on port ${PORT}`);
});
