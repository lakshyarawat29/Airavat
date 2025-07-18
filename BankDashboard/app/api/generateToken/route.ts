import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { emailId, userId, file } = await request.json()

    // Validate input
    if (!emailId || !userId) {
      return NextResponse.json(
        { error: 'Email ID and User ID are required' },
        { status: 400 }
      )
    }

    // Call the webhook with the required format
    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:5678/webhook/data-submit-hook'
    const jwtToken = process.env.WEBHOOK_JWT_TOKEN || 'canarabankhackathon'

    // Prepare form data for the webhook
    const formData = new FormData()
    formData.append('email', emailId)
    formData.append('userID', userId)
    if (file) {
      formData.append('file', file)
    }

    console.log('Calling webhook:', webhookUrl)
    console.log('Data:', { email: emailId, userID: userId, hasFile: !!file })

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'User-Agent': 'BankDashboard/1.0',
        },
        body: formData,
      })

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`)
      }

      const webhookResult = await webhookResponse.json()
      console.log('Webhook response:', webhookResult)

      // Generate a local token for the UI flow
      const timestamp = Date.now()
      const randomBytes = crypto.randomBytes(16).toString('hex')
      const tokenId = `TLS-${timestamp}-${randomBytes.substring(0, 8).toUpperCase()}`

      return NextResponse.json({
        success: true,
        tokenId,
        message: 'Token generated successfully and data sent to webhook',
        webhookResponse: webhookResult,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })

    } catch (webhookError) {
      console.error('Webhook error:', webhookError)
      
      // Still generate a token even if webhook fails
      const timestamp = Date.now()
      const randomBytes = crypto.randomBytes(16).toString('hex')
      const tokenId = `TLS-${timestamp}-${randomBytes.substring(0, 8).toUpperCase()}`

      return NextResponse.json({
        success: true,
        tokenId,
        message: 'Token generated successfully (webhook failed)',
        webhookError: (webhookError as Error).message,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
