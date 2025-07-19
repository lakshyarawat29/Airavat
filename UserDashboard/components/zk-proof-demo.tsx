"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Eye, EyeOff, CheckCircle, XCircle, DollarSign, Lock, Unlock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getThemeClasses } from "@/hooks/use-theme"

interface ZKProofDemoProps {
  theme: "dark" | "light"
}

export function ZKProofDemo({ theme }: ZKProofDemoProps) {
  const themeClasses = getThemeClasses(theme)
  const [actualBalance, setActualBalance] = useState([25000])
  const [requiredAmount, setRequiredAmount] = useState([15000])
  const [showBalance, setShowBalance] = useState(false)
  const [isProving, setIsProving] = useState(false)
  const [proofResult, setProofResult] = useState<"success" | "failure" | null>(null)
  const [animationStep, setAnimationStep] = useState(0)

  const hasSufficientFunds = actualBalance[0] >= requiredAmount[0]

  const handleProveWithZKP = async () => {
    setIsProving(true)
    setProofResult(null)
    setAnimationStep(0)

    // Animation sequence
    const steps = [
      { step: 1, delay: 500 }, // Encrypting data
      { step: 2, delay: 1000 }, // Generating proof
      { step: 3, delay: 1500 }, // Verifying proof
      { step: 4, delay: 2000 }, // Show result
    ]

    for (const { step, delay } of steps) {
      setTimeout(() => setAnimationStep(step), delay)
    }

    setTimeout(() => {
      setProofResult(hasSufficientFunds ? "success" : "failure")
      setIsProving(false)
      setAnimationStep(0)
    }, 2500)
  }

  const resetDemo = () => {
    setShowBalance(false)
    setProofResult(null)
    setIsProving(false)
    setAnimationStep(0)
  }

  useEffect(() => {
    resetDemo()
  }, [actualBalance, requiredAmount])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Controls */}
      <div className="space-y-8">
        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center gap-2`}>
              <DollarSign className="w-6 h-6 text-green-400" />
              Financial Scenario
            </CardTitle>
            <CardDescription className={themeClasses.mutedText}>
              Adjust the values to see how Zero-Knowledge Proofs work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Actual Balance */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`${themeClasses.text} font-medium`}>Your Actual Balance</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    ${actualBalance[0].toLocaleString()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className={`p-1 ${themeClasses.text}`}
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Slider
                value={actualBalance}
                onValueChange={setActualBalance}
                min={5000}
                max={100000}
                step={1000}
                className="mb-2"
              />
              <div className={`flex justify-between text-sm ${themeClasses.mutedText}`}>
                <span>$5,000</span>
                <span>$100,000</span>
              </div>
            </div>

            {/* Required Amount */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`${themeClasses.text} font-medium`}>Required Amount</label>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  ${requiredAmount[0].toLocaleString()}
                </Badge>
              </div>
              <Slider
                value={requiredAmount}
                onValueChange={setRequiredAmount}
                min={1000}
                max={50000}
                step={1000}
                className="mb-2"
              />
              <div className={`flex justify-between text-sm ${themeClasses.mutedText}`}>
                <span>$1,000</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => setShowBalance(true)}
                variant="outline"
                className={`w-full ${theme === "light" ? "border-red-300 text-red-600 hover:bg-red-50" : "border-red-500 text-red-400 hover:bg-red-500/10"} transition-colors duration-300`}
                disabled={isProving}
              >
                <Unlock className="w-4 h-4 mr-2" />
                Traditional Method: Reveal Balance
              </Button>

              <Button
                onClick={handleProveWithZKP}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                disabled={isProving}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isProving ? "Generating ZK Proof..." : "Prove with Zero-Knowledge"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization */}
      <div className="space-y-6">
        {/* Balance Display */}
        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardHeader>
            <CardTitle className={`text-xl font-bold ${themeClasses.text} flex items-center gap-2`}>
              <Shield className="w-5 h-5 text-cyan-400" />
              Data Privacy Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Traditional Method Result */}
              <div
                className={`p-4 rounded-lg border-2 ${showBalance ? (theme === "light" ? "border-red-300 bg-red-50" : "border-red-500 bg-red-500/10") : theme === "light" ? "border-gray-200 bg-gray-50" : "border-gray-700 bg-gray-800/50"} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-medium ${showBalance ? (theme === "light" ? "text-red-700" : "text-red-400") : themeClasses.text}`}
                  >
                    Traditional Method
                  </span>
                  {showBalance && (
                    <EyeOff className={`w-4 h-4 ${theme === "light" ? "text-red-600" : "text-red-400"}`} />
                  )}
                </div>
                <AnimatePresence>
                  {showBalance ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      <div className={`text-lg font-bold ${theme === "light" ? "text-red-700" : "text-red-400"}`}>
                        Balance: ${actualBalance[0].toLocaleString()}
                      </div>
                      <div className={`text-sm ${theme === "light" ? "text-red-600" : "text-red-300"}`}>
                        ⚠️ Your private financial data is exposed!
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-sm ${themeClasses.mutedText}`}
                    >
                      Click "Reveal Balance" to see traditional approach
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ZK Proof Process */}
              <div
                className={`p-4 rounded-lg border-2 ${isProving || proofResult ? (theme === "light" ? "border-purple-300 bg-purple-50" : "border-purple-500 bg-purple-500/10") : theme === "light" ? "border-gray-200 bg-gray-50" : "border-gray-700 bg-gray-800/50"} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-medium ${isProving || proofResult ? (theme === "light" ? "text-purple-700" : "text-purple-400") : themeClasses.text}`}
                  >
                    Zero-Knowledge Proof
                  </span>
                  <Lock
                    className={`w-4 h-4 ${isProving || proofResult ? (theme === "light" ? "text-purple-600" : "text-purple-400") : themeClasses.mutedText}`}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {isProving && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {/* Animation Steps */}
                      <div className="space-y-2">
                        <motion.div
                          className={`flex items-center gap-2 ${animationStep >= 1 ? (theme === "light" ? "text-purple-700" : "text-purple-300") : themeClasses.mutedText}`}
                          animate={{ opacity: animationStep >= 1 ? 1 : 0.5 }}
                        >
                          <motion.div animate={{ rotate: animationStep >= 1 ? 360 : 0 }} transition={{ duration: 0.5 }}>
                            🔐
                          </motion.div>
                          <span className="text-sm">Encrypting sensitive data...</span>
                        </motion.div>

                        <motion.div
                          className={`flex items-center gap-2 ${animationStep >= 2 ? (theme === "light" ? "text-purple-700" : "text-purple-300") : themeClasses.mutedText}`}
                          animate={{ opacity: animationStep >= 2 ? 1 : 0.5 }}
                        >
                          <motion.div
                            animate={{ scale: animationStep >= 2 ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            ⚡
                          </motion.div>
                          <span className="text-sm">Generating cryptographic proof...</span>
                        </motion.div>

                        <motion.div
                          className={`flex items-center gap-2 ${animationStep >= 3 ? (theme === "light" ? "text-purple-700" : "text-purple-300") : themeClasses.mutedText}`}
                          animate={{ opacity: animationStep >= 3 ? 1 : 0.5 }}
                        >
                          <motion.div
                            animate={{ rotate: animationStep >= 3 ? [0, 180, 360] : 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            🔍
                          </motion.div>
                          <span className="text-sm">Verifying proof validity...</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {proofResult && !isProving && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <div
                        className={`flex items-center gap-2 ${proofResult === "success" ? "text-green-400" : "text-red-400"}`}
                      >
                        {proofResult === "success" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-semibold">
                          {proofResult === "success" ? "Proof Verified ✓" : "Insufficient Funds ✗"}
                        </span>
                      </div>

                      <div className={`text-sm ${theme === "light" ? "text-purple-700" : "text-purple-300"}`}>
                        <div className="mb-2">
                          <strong>Proof Result:</strong>{" "}
                          {proofResult === "success"
                            ? "User has sufficient funds"
                            : "User does not have sufficient funds"}
                        </div>
                        <div className="text-xs opacity-75">
                          🔒 Actual balance remains completely private and encrypted
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!isProving && !proofResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-sm ${themeClasses.mutedText}`}
                    >
                      Click "Prove with Zero-Knowledge" to see the magic ✨
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Summary */}
        <Card
          className={`${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.cardBorder} transition-colors duration-300`}
        >
          <CardHeader>
            <CardTitle className={`text-lg font-bold ${themeClasses.text}`}>Privacy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${themeClasses.text}`}>Data Exposure</span>
                <div className="flex gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Traditional: Full
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                    ZKP: Zero
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${themeClasses.text}`}>Verification</span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                    Both: Accurate
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${themeClasses.text}`}>Trust Required</span>
                <div className="flex gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Traditional: High
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                    ZKP: Minimal
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
