require('dotenv').config();
const nodemailer = require('nodemailer');

// Email transporter setup for Brevo (Sendinblue)
const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.NOTIFY_EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.NOTIFY_EMAIL_USER,
    pass: process.env.SMTP_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('Host:', process.env.NOTIFY_EMAIL_HOST);
    console.log('Port:', process.env.NOTIFY_EMAIL_PORT);
    console.log('User:', process.env.NOTIFY_EMAIL_USER);
    console.log(
      'SMTP Key length:',
      process.env.SMTP_KEY ? process.env.SMTP_KEY.length : 'Not set'
    );

    // Test the connection first
    await transporter.verify();
    console.log('SMTP connection verified successfully!');

    const mailOptions = {
      from: process.env.NOTIFY_EMAIL_USER,
      to: 'tech.airavat@gmail.com', // Send to yourself for testing
      subject: 'Test Email from Airavat',
      text: 'This is a test email to verify the Brevo SMTP configuration is working correctly.',
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
  }
}

testEmail();
