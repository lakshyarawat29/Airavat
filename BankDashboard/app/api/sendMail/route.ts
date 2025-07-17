import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// SMTP configuration - you can use Gmail, Outlook, or any SMTP service
// For Gmail, you need to enable "App Passwords" in your Google Account settings
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
  })
}

export async function POST(request: NextRequest) {
  console.log('=== SENDMAIL API CALLED ===')
  console.log('Environment check:', {
    SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
    SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
  })
  
  try {
    const { tokenId, to, subject, messageBody } = await request.json()
    console.log('Request data:', { tokenId, to, subject: subject || 'default', messageBodyLength: messageBody?.length })

    // Validate input
    if (!tokenId || !to || !messageBody) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Token ID, recipient email, and message body are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP credentials missing!')
      return NextResponse.json(
        { error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' },
        { status: 500 }
      )
    }

    console.log('Creating transporter...')
    // Create transporter
    const transporter = createTransporter()

    console.log('Preparing email...', { from: process.env.SMTP_USER, to })
    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject || `Secure Message - Token ${tokenId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0;">Secure Message via TLS</h2>
            <p style="color: #666; margin: 5px 0 0 0;">Token ID: <strong>${tokenId}</strong></p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin-top: 0;">Message Content:</h3>
            <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${messageBody}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This message was sent securely through our TLS-enabled system.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
      text: `
Secure Message via TLS
Token ID: ${tokenId}

Message Content:
${messageBody}

This message was sent securely through our TLS-enabled system.
Timestamp: ${new Date().toISOString()}
      `
    }

    console.log('Attempting to send email...')
    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
      tokenId,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('=== EMAIL SENDING ERROR ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', (error as any)?.message)
    console.error('Full error:', error)
    
    // Handle specific nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'SMTP authentication failed. Please check your email credentials.' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
