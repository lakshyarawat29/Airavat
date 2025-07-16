"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, Mail, CheckCircle, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"

interface FormData {
  emailId: string
  userId: string
  file: File | null
}

interface FormErrors {
  emailId?: string
  userId?: string
  file?: string
}

export default function SendMailPage() {
  const [formData, setFormData] = useState<FormData>({
    emailId: "",
    userId: "",
    file: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({
      ...prev,
      file,
    }))

    if (errors.file) {
      setErrors((prev) => ({
        ...prev,
        file: undefined,
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.emailId.trim()) {
      newErrors.emailId = "Email ID is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = "Please enter a valid email address"
    }

    // User ID validation
    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required"
    } else if (formData.userId.length < 3) {
      newErrors.userId = "User ID must be at least 3 characters long"
    }

    // File validation (optional but if provided, should be valid)
    if (formData.file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ]

      if (formData.file.size > maxSize) {
        newErrors.file = "File size must be less than 10MB"
      } else if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "File type not supported. Please use PDF, DOC, DOCX, TXT, JPG, or PNG"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus("idle")

    if (!validateForm()) {
      setSubmitStatus("error")
      setStatusMessage("Please fix the errors above")
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("emailId", formData.emailId)
      submitData.append("userId", formData.userId)
      if (formData.file) {
        submitData.append("file", formData.file)
      }

      // Mock API call
      const response = await fetch("/api/sendMail", {
        method: "POST",
        body: submitData,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (response.ok) {
        setSubmitStatus("success")
        setStatusMessage("Mail sent successfully! The recipient will receive your message shortly.")

        // Reset form
        setFormData({
          emailId: "",
          userId: "",
          file: null,
        })

        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        throw new Error("Failed to send mail")
      }
    } catch (error) {
      setSubmitStatus("error")
      setStatusMessage("Failed to send mail. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send Mail</h1>
            <p className="text-gray-600 mt-1">Send communications to users and stakeholders</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>

        {/* Mail Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email ID */}
              <div className="space-y-2">
                <Label htmlFor="emailId">Email ID *</Label>
                <Input
                  id="emailId"
                  name="emailId"
                  type="email"
                  placeholder="recipient@example.com"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  className={`w-full ${errors.emailId ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.emailId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emailId}
                  </p>
                )}
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label htmlFor="userId">Unique User ID *</Label>
                <Input
                  id="userId"
                  name="userId"
                  type="text"
                  placeholder="Enter unique user identifier"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className={`w-full ${errors.userId ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.userId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.userId}
                  </p>
                )}
              </div>

              {/* File Attachment */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">File Attachment (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className={`w-full ${errors.file ? "border-red-500 focus:border-red-500" : ""}`}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  {formData.file && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">{formData.file.name}</span>
                      <span className="text-xs text-blue-600 ml-auto">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  {errors.file && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.file}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{statusMessage}</AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{statusMessage}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Mail...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Mail
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Integration Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Backend Integration Ready</p>
                <p>
                  This form submits to <code className="bg-blue-100 px-1 rounded">/api/sendMail</code>
                  with comprehensive validation and file upload support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
