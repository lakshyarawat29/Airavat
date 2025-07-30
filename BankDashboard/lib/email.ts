import nodemailer from 'nodemailer';

// SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your app password
    },
    // Alternative configuration for custom SMTP servers:
    // host: process.env.SMTP_HOST,
    // port: parseInt(process.env.SMTP_PORT || '587'),
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP credentials missing!');
    throw new Error(
      'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.'
    );
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  userName: string
) {
  const subject = 'Your Bank Dashboard Login OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">Bank Dashboard Login</h2>
        <p style="color: #666; margin: 5px 0 0 0;">Hello ${userName},</p>
      </div>
      
      <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff;">
        <h3 style="color: #333; margin-top: 0;">Your One-Time Password (OTP)</h3>
        <p style="color: #555; line-height: 1.6;">
          You have requested to log in to the Bank Dashboard. Please use the following OTP to complete your login:
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${otp}
          </h1>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          <strong>Important:</strong>
        </p>
        <ul style="color: #555; line-height: 1.6;">
          <li>This OTP is valid for 5 minutes only</li>
          <li>Do not share this OTP with anyone</li>
          <li>If you didn't request this OTP, please ignore this email</li>
        </ul>
      </div>
      
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>This is an automated message from the Bank Dashboard system.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    </div>
  `;

  const text = `
Bank Dashboard Login

Hello ${userName},

You have requested to log in to the Bank Dashboard. Please use the following OTP to complete your login:

OTP: ${otp}

Important:
- This OTP is valid for 5 minutes only
- Do not share this OTP with anyone
- If you didn't request this OTP, please ignore this email

This is an automated message from the Bank Dashboard system.
Timestamp: ${new Date().toISOString()}
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
