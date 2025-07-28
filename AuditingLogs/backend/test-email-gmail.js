require('dotenv').config();
const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NOTIFY_EMAIL_USER || 'your-gmail@gmail.com',
    pass: process.env.NOTIFY_EMAIL_PASS || 'your-app-password',
  },
});

async function testEmail() {
  try {
    console.log('Testing Gmail email configuration...');
    console.log('User:', process.env.NOTIFY_EMAIL_USER || 'Not set');
    console.log(
      'Pass length:',
      process.env.NOTIFY_EMAIL_PASS
        ? process.env.NOTIFY_EMAIL_PASS.length
        : 'Not set'
    );

    // Test the connection first
    await transporter.verify();
    console.log('Gmail SMTP connection verified successfully!');

    const mailOptions = {
      from: process.env.NOTIFY_EMAIL_USER || 'your-gmail@gmail.com',
      to: 'tech.airavat@gmail.com', // Send to yourself for testing
      subject: 'Test Email from Airavat (Gmail)',
      text: 'This is a test email using Gmail SMTP to verify the email notification system is working correctly.',
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your inbox at: tech.airavat@gmail.com');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.code === 'EAUTH') {
      console.error(
        'Authentication failed. Please check your Gmail credentials.'
      );
      console.error('Make sure you have:');
      console.error('1. Enabled 2-Factor Authentication on your Gmail account');
      console.error('2. Generated an App Password for this application');
      console.error('3. Updated the .env file with correct credentials');
    }
  }
}

testEmail();
