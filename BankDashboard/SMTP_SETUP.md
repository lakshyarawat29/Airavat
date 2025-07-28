# SMTP Email Setup Guide

This guide will help you configure SMTP email functionality for the Bank Dashboard OTP system.

## Prerequisites

1. A Gmail account (or other email provider)
2. 2-factor authentication enabled on your email account
3. An app password generated for this application

## Gmail Setup

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Click "Generate" and select "Mail"
5. Copy the generated 16-character password

### Step 3: Configure Environment Variables

Create a `.env.local` file in the BankDashboard directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bank-dashboard

# SMTP Configuration for Gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

## Other Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## Testing the Setup

1. Start the development server: `npm run dev`
2. Go to the login page
3. Enter an employee email
4. Click "Send OTP"
5. Check the console for the OTP (for demo purposes)
6. Check your email for the actual OTP email

## Troubleshooting

### Common Issues

1. **"Invalid login" error**

   - Make sure you're using an app password, not your regular password
   - Verify 2-factor authentication is enabled

2. **"SMTP credentials not configured"**

   - Check that `.env.local` file exists and has correct variables
   - Restart the development server after adding environment variables

3. **"Connection timeout"**
   - Check your internet connection
   - Verify SMTP host and port settings
   - Try using a different port (465 for SSL, 587 for TLS)

### Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of regular passwords
- Consider using environment-specific SMTP services for production
- Regularly rotate your app passwords

## Production Considerations

For production deployment:

1. Use environment variables in your hosting platform
2. Consider using email service providers like:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Brevo (Sendinblue)
3. Implement rate limiting for OTP requests
4. Add email templates for better branding
5. Monitor email delivery rates and bounce rates
