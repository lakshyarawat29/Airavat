import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const emailId = formData.get("emailId") as string
    const userId = formData.get("userId") as string
    const file = formData.get("file") as File | null

    // Validation
    if (!emailId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ID and User ID are required",
        },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // File validation
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message: "File size exceeds 10MB limit",
          },
          { status: 400 },
        )
      }
    }

    // Mock processing
    console.log("Processing mail request:", {
      emailId,
      userId,
      fileName: file?.name || "No file",
      fileSize: file?.size || 0,
      timestamp: new Date().toISOString(),
    })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock success response
    return NextResponse.json({
      success: true,
      message: "Mail sent successfully",
      data: {
        emailId,
        userId,
        fileName: file?.name || null,
        fileSize: file?.size || 0,
        timestamp: new Date().toISOString(),
        requestId: `mail-${Date.now()}`,
      },
    })
  } catch (error) {
    console.error("Error processing mail request:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "Failed to process request",
      },
      { status: 500 },
    )
  }
}
