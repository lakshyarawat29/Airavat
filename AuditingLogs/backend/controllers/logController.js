const { ethers } = require('ethers');
const abi = require('../contractABI');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { renderEmailTemplate } = require('../utils/emailTemplate');

// Cache for blockchain data to reduce API calls
let logsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 30; // Infura free tier limit
let requestWindowStart = Date.now();

const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

const USER_DASHBOARD_MONGODB_URI =
  process.env.USER_DASHBOARD_MONGODB_URI ||
  'mongodb://localhost:27017/airavat-user-dashboard';

// User schema for querying email
const userSchema = new mongoose.Schema({
  userID: String,
  email: String,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Helper function to add delay between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check if cache is valid
const isCacheValid = () => {
  return (
    logsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION
  );
};

// Rate limiting function
const checkRateLimit = async () => {
  const now = Date.now();

  // Reset counter if window has passed
  if (now - requestWindowStart >= 60000) {
    requestCount = 0;
    requestWindowStart = now;
  }

  // Check if we've exceeded the rate limit
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = 60000 - (now - requestWindowStart);
    console.log(
      `⚠️ Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`
    );
    await delay(waitTime);
    requestCount = 0;
    requestWindowStart = Date.now();
  }

  // Add delay between requests
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - (now - lastRequestTime));
  }

  lastRequestTime = Date.now();
  requestCount++;
};

// Helper function to fetch logs from blockchain with rate limiting
const fetchLogsFromBlockchain = async () => {
  try {
    await checkRateLimit();

    console.log('🔗 Fetching logs from blockchain...');
    const logCount = await contract.getLogCount();
    console.log(`📊 Found ${logCount} logs on blockchain`);

    const logs = [];
    for (let i = 0; i < logCount; i++) {
      // Add small delay between individual log fetches
      if (i > 0) {
        await delay(100);
        await checkRateLimit();
      }

      try {
        const logEntry = await contract.getLog(i);
        logs.push({
          logId: i,
          userId: logEntry.userId,
          organization: logEntry.organization,
          dataType: logEntry.dataType,
          purpose: logEntry.purpose,
          accessLevel: logEntry.accessLevel,
          status: logEntry.status,
          userConsent: logEntry.userConsent,
          dataMinimized: logEntry.dataMinimized,
          zkProofUsed: logEntry.zkProofUsed,
          retentionDays: Number(logEntry.retentionDays),
          timestamp: new Date(Number(logEntry.timestamp) * 1000).toISOString(),
        });
      } catch (logError) {
        console.warn(`⚠️ Failed to fetch log ${i}:`, logError.message);
        // Continue with other logs instead of failing completely
      }
    }

    return logs;
  } catch (error) {
    console.error('❌ Error fetching from blockchain:', error.message);

    // Check if it's a rate limit error
    if (
      error.message.includes('Too Many Requests') ||
      error.message.includes('-32005')
    ) {
      throw new Error(
        'Rate limit exceeded. Please try again in a few minutes.'
      );
    }

    throw error;
  }
};

async function getUserEmail(userId) {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(USER_DASHBOARD_MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
  const user = await User.findOne({ userID: userId });
  return user ? user.email : null;
}

// Email transporter setup for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: process.env.NOTIFY_EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.NOTIFY_EMAIL_USER,
    pass: process.env.NOTIFY_EMAIL_PASS,
  },
});

async function sendAccessNotification(email, logDetails) {
  try {
    console.log(`Attempting to send email notification to: ${email}`);

    // Render the HTML email template
    const htmlContent = renderEmailTemplate({
      organization: logDetails.organization,
      dataType: logDetails.dataType,
      purpose: logDetails.purpose,
      accessLevel: logDetails.accessLevel,
      status: logDetails.status,
      retentionDays: logDetails.retentionDays,
      userConsent: logDetails.userConsent,
      dataMinimized: logDetails.dataMinimized,
      zkProofUsed: logDetails.zkProofUsed,
      timestamp: new Date().toLocaleString(),
      txHash: logDetails.txHash,
    });

    const mailOptions = {
      from: process.env.NOTIFY_EMAIL_USER,
      to: email,
      subject: '🛡️ Data Access Alert - Airavat',
      html: htmlContent,
      text: `Your data was accessed by ${
        logDetails.organization
      } for the purpose: "${
        logDetails.purpose
      }" on ${new Date().toLocaleString()}. If this was not you, please contact support. - Airavat Team`,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
}

// CREATE LOG
exports.createLog = async (req, res) => {
  try {
    const {
      userId,
      organization,
      dataType,
      purpose,
      accessLevel,
      status,
      userConsent,
      dataMinimized,
      zkProofUsed,
      retentionDays,
    } = req.body;

    // Clear cache when new log is created
    logsCache = null;
    cacheTimestamp = null;

    const tx = await contract.createLog(
      userId,
      organization,
      dataType,
      purpose,
      accessLevel,
      status,
      userConsent,
      dataMinimized,
      zkProofUsed,
      retentionDays
    );
    await tx.wait();

    // Email notification logic
    const userEmail = await getUserEmail(userId);
    if (userEmail) {
      try {
        await sendAccessNotification(userEmail, {
          organization,
          purpose,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        res.status(500).json({
          error: 'Failed to send email notification',
          details: emailError.message,
        });
        return;
      }
    } else {
      console.warn(
        `User with ID ${userId} not found in database. Cannot send email notification.`
      );
    }

    res.status(201).json({ message: 'Log stored on chain!', txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to store log', details: err.message });
  }
};

// GET ALL LOGS
exports.getAllLogs = async (req, res) => {
  try {
    // Check if we have valid cached data
    if (isCacheValid()) {
      console.log('✅ Returning cached logs');
      return res.status(200).json(logsCache);
    }

    // Try to fetch from blockchain
    try {
      const logs = await fetchLogsFromBlockchain();

      // Update cache
      logsCache = logs;
      cacheTimestamp = Date.now();

      console.log(
        `✅ Successfully fetched ${logs.length} logs from blockchain`
      );
      res.status(200).json(logs);
    } catch (blockchainError) {
      console.error('❌ Blockchain fetch failed:', blockchainError.message);

      // If we have stale cache, return it with a warning
      if (logsCache) {
        console.log('⚠️ Returning stale cached data due to blockchain error');
        res.status(200).json({
          logs: logsCache,
          warning: 'Using cached data due to blockchain connectivity issues',
          error: blockchainError.message,
          cachedAt: new Date(cacheTimestamp).toISOString(),
        });
        return;
      }

      // If no cache available, return error
      res.status(503).json({
        error: 'Blockchain service temporarily unavailable',
        details: blockchainError.message,
        suggestion: 'Please try again in a few minutes',
      });
    }
  } catch (err) {
    console.error('❌ Unexpected error in getAllLogs:', err);
    res.status(500).json({
      error: 'Failed to fetch logs',
      details: err.message,
    });
  }
};

// GET LOGS BY USER ID
exports.getLogsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if we have valid cached data
    if (isCacheValid()) {
      console.log('✅ Filtering cached logs for user:', userId);
      const userLogs = logsCache.filter((log) => log.userId === userId);
      return res.status(200).json(userLogs);
    }

    // Try to fetch from blockchain
    try {
      const logs = await fetchLogsFromBlockchain();

      // Update cache
      logsCache = logs;
      cacheTimestamp = Date.now();

      // Filter for specific user
      const userLogs = logs.filter((log) => log.userId === userId);

      console.log(
        `✅ Successfully fetched ${userLogs.length} logs for user ${userId}`
      );
      res.status(200).json(userLogs);
    } catch (blockchainError) {
      console.error('❌ Blockchain fetch failed:', blockchainError.message);

      // If we have stale cache, filter and return it with a warning
      if (logsCache) {
        console.log('⚠️ Returning stale cached data due to blockchain error');
        const userLogs = logsCache.filter((log) => log.userId === userId);
        res.status(200).json({
          logs: userLogs,
          warning: 'Using cached data due to blockchain connectivity issues',
          error: blockchainError.message,
          cachedAt: new Date(cacheTimestamp).toISOString(),
        });
        return;
      }

      // If no cache available, return error
      res.status(503).json({
        error: 'Blockchain service temporarily unavailable',
        details: blockchainError.message,
        suggestion: 'Please try again in a few minutes',
      });
    }
  } catch (err) {
    console.error('❌ Unexpected error in getLogsByUserId:', err);
    res.status(500).json({
      error: 'Failed to fetch user logs',
      details: err.message,
    });
  }
};

// REFRESH CACHE
exports.refreshCache = async (req, res) => {
  try {
    console.log('🔄 Manually refreshing cache...');

    // Clear existing cache
    logsCache = null;
    cacheTimestamp = null;

    // Try to fetch fresh data
    try {
      const logs = await fetchLogsFromBlockchain();
      logsCache = logs;
      cacheTimestamp = Date.now();

      console.log(`✅ Cache refreshed with ${logs.length} logs`);
      res.status(200).json({
        message: 'Cache refreshed successfully',
        logCount: logs.length,
        cachedAt: new Date(cacheTimestamp).toISOString(),
      });
    } catch (blockchainError) {
      console.error('❌ Failed to refresh cache:', blockchainError.message);
      res.status(503).json({
        error: 'Failed to refresh cache',
        details: blockchainError.message,
        suggestion: 'Please try again in a few minutes',
      });
    }
  } catch (err) {
    console.error('❌ Unexpected error in refreshCache:', err);
    res.status(500).json({
      error: 'Failed to refresh cache',
      details: err.message,
    });
  }
};
