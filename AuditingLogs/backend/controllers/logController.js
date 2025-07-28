const { ethers } = require('ethers');
const abi = require('../contractABI');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { renderEmailTemplate } = require('../utils/emailTemplate');

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
    const logCount = await contract.getLogCount();

    const logs = [];
    for (let i = 0; i < logCount; i++) {
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
    }

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch logs', details: err.message });
  }
};

// GET LOGS BY USER ID
exports.getLogsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const logCount = await contract.getLogCount();

    const logs = [];
    for (let i = 0; i < logCount; i++) {
      const logEntry = await contract.getLog(i);
      if (logEntry.userId === userId) {
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
      }
    }

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch user logs', details: err.message });
  }
};
