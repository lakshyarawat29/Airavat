import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { emailId, userId, file, activeDurationSeconds } = await request.json()

    // Validate input
    if (!emailId || !userId) {
      return NextResponse.json(
        { error: 'Email ID and User ID are required' },
        { status: 400 }
      )
    }

    if (!activeDurationSeconds || activeDurationSeconds <= 0) {
      return NextResponse.json(
        { error: 'Active duration must be provided and greater than 0' },
        { status: 400 }
      )
    }

    // Call the webhook with the required format
    const webhookUrl = process.env.WEBHOOK_URL || 'https://pastor-serum-mauritius-span.trycloudflare.com/webhook/TLS_data_put'
    const jwtToken = process.env.WEBHOOK_JWT_TOKEN || 'canarabankhackathon'

    // Prepare form data for the webhook
    const formData = new FormData()
    formData.append('email', emailId)
    
    const hashedUserId = crypto.createHash("sha256").update(userId).digest("hex")
    formData.append('userID', hashedUserId)
    
    formData.append('ttl', activeDurationSeconds.toString())
    if (file) {
      formData.append('file', file)
    }

    console.log('Calling webhook:', webhookUrl)
    console.log('Data:', { email: emailId, userID: hashedUserId, activeDurationSeconds, hasFile: !!file })

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'User-Agent': 'BankDashboard/1.0',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })

      console.log('Webhook response status:', webhookResponse.status)
      console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()))

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`)
      }

      const webhookResult = await webhookResponse.json()
      console.log('Webhook response body:', webhookResult)

      // Use the token from the webhook response
      const tokenId = webhookResult.tokenId || webhookResult.token || webhookResult.id
      
      if (!tokenId) {
        console.error('No token found in webhook response. Available fields:', Object.keys(webhookResult))
        throw new Error('No token received from webhook')
      }

      return NextResponse.json({
        success: true,
        tokenId,
        message: 'Token received from webhook successfully',
        webhookResponse: webhookResult,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })

    } catch (webhookError) {
      console.error('Webhook error details:', webhookError)
      
      const errorMessage = (webhookError as Error).message || String(webhookError)
      
      // Check if it's a connection error (webhook not running)
      if (errorMessage.includes('fetch failed') || 
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('Failed to fetch')) {
        return NextResponse.json({
          success: false,
          error: 'Webhook server is not running',
          message: `Cannot connect to webhook at ${webhookUrl}. Please start your webhook server.`,
          webhookUrl: webhookUrl,
        }, { status: 503 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to get token from webhook',
        webhookError: errorMessage,
        webhookUrl: webhookUrl,
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
