import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and FormData requests
    let emailId, userId, file, activeDurationSeconds
    
    const contentType = request.headers.get('content-type') || ''
    console.log('Request content-type:', contentType)
    
    // Check if content-type indicates multipart/form-data AND has boundary
    const isValidFormData = contentType.startsWith('multipart/form-data') && contentType.includes('boundary=')
    
    if (isValidFormData) {
      console.log('Parsing as FormData (valid boundary detected)')
      const formData = await request.formData()
      emailId = formData.get('emailId') as string
      userId = formData.get('userId') as string
      file = formData.get('file') as File
      activeDurationSeconds = parseInt(formData.get('activeDurationSeconds') as string)
      console.log('Successfully parsed as FormData')
    } else if (contentType.startsWith('multipart/form-data')) {
      // FormData without proper boundary - this is the problematic case
      console.log('Invalid FormData detected (missing boundary)')
      return NextResponse.json(
        { 
          error: 'Invalid FormData format',
          message: 'FormData request is missing boundary parameter. Make sure you are not manually setting Content-Type header when sending FormData.',
          contentType: contentType
        },
        { status: 400 }
      )
    } else {
      console.log('Parsing as JSON')
      const data = await request.json()
      emailId = data.emailId
      userId = data.userId
      file = data.file
      activeDurationSeconds = data.activeDurationSeconds
      console.log('Successfully parsed as JSON')
    }

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
    const webhookUrl = 'https://lower-classifieds-une-material.trycloudflare.com/webhook/data-submit-hook'
    const jwtToken = process.env.WEBHOOK_JWT_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.e30.NO3TAh5-AR98dkx9UIgBDE-u4hZs4Rh7F0qu8iRfob8'

    // Prepare form data for the webhook
    const formData = new FormData()
    formData.append('email', emailId)
    
    const hashedUserId = crypto.createHash("sha256").update(userId).digest("hex")
    formData.append('userHash', hashedUserId)
    
    formData.append('ttl', activeDurationSeconds.toString())
    if (file) {
      // Ensure file is properly handled as binary
      if (file instanceof File) {
        formData.append('file', file, file.name);
      } else {
        // If file is base64 or other format, convert to blob
        console.log("file",file);
        const blob = new Blob([file])
        console.log("blob",blob);
        formData.append('file', blob, 'file')
      }
    }

    console.log('Calling webhook:', webhookUrl)
    console.log('Data:', { email: emailId, userHash: hashedUserId, activeDurationSeconds, hasFile: !!file })

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'User-Agent': 'BankDashboard/1.0',
        },
        body: formData,
      })

      console.log('Webhook response status:', webhookResponse.status)
      console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()))

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`)
      }

      let webhookResult;
      const contentType = webhookResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        webhookResult = await webhookResponse.json();
      } else {
        webhookResult = await webhookResponse.text(); // or .blob() for files
      }

      console.log('Webhook response body:', webhookResult)

      // Use the token from the webhook response - handle the actual response format
      const tokenId = webhookResult.token || webhookResult.tokenId || webhookResult.id
      
      if (!tokenId) {
        console.error('No token found in webhook response. Available fields:', Object.keys(webhookResult))
        console.error('Full webhook response:', webhookResult)
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
    
    // Provide specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('FormData') || error.message.includes('boundary')) {
        return NextResponse.json(
          { 
            error: 'Invalid request format',
            message: 'Request must be sent as proper FormData with boundary or valid JSON. If using FormData, do not manually set Content-Type header.',
            details: error.message
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Could not parse request body')) {
        return NextResponse.json(
          { 
            error: 'Invalid request body',
            message: 'Request body could not be parsed as either FormData or JSON',
            details: error.message
          },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate token', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
