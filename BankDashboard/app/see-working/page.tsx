"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home } from "lucide-react"
import Link from "next/link"

interface LogMessage {
  id: string
  message: string
  timestamp: string
}

interface AgentTransition {
  from: number
  to: number
  message: string
}

export default function SeeWorkingPage() {
  const [activeAgent, setActiveAgent] = useState<number | null>(null)
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTransition, setCurrentTransition] = useState<AgentTransition | null>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Mock agent workflow data
  const agentWorkflow = [
    { from: 0, to: 1, message: "Data preprocessing completed" },
    { from: 1, to: 2, message: "Feature extraction finished" },
    { from: 2, to: 3, message: "Model training initiated" },
    { from: 3, to: 4, message: "Validation process started" },
    { from: 4, to: 5, message: "Performance metrics calculated" },
    { from: 5, to: 6, message: "Results optimization completed" },
    { from: 6, to: 7, message: "Final report generation" },
    { from: 7, to: 0, message: "Workflow cycle completed" },
  ]

  const addLog = (message: string) => {
    const newLog: LogMessage = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toLocaleTimeString(),
    }
    setLogs((prev) => [...prev, newLog])
  }

  const simulateAgentWorkflow = async () => {
    setIsRunning(true)
    setLogs([])

    for (let i = 0; i < agentWorkflow.length; i++) {
      const transition = agentWorkflow[i]

      // Highlight current agent
      setActiveAgent(transition.from)
      setCurrentTransition(transition)

      // Add log message
      addLog(`Agent ${transition.from + 1} → Agent ${transition.to + 1}: ${transition.message}`)

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear transition
      setCurrentTransition(null)
      setActiveAgent(null)

      // Brief pause between transitions
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    addLog("Workflow simulation completed")
  }

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Agent Workflow Monitor</h1>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <Button onClick={simulateAgentWorkflow} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
            {isRunning ? "Running Simulation..." : "Start Agent Workflow"}
          </Button>
        </div>

        {/* Agent Grid */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Agent Network</h2>
          <div className="grid grid-cols-4 gap-8 relative">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <div
                  className={`
                    w-20 h-20 rounded-lg border-2 flex items-center justify-center font-semibold text-lg transition-all duration-500
                    ${
                      activeAgent === index
                        ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/50 animate-pulse"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }
                  `}
                >
                  {index + 1}
                </div>
                <span className="mt-2 text-sm text-gray-600">Agent {index + 1}</span>

                {/* Animated Arrow */}
                {currentTransition && currentTransition.from === index && (
                  <div className="absolute top-10 left-full w-8 flex items-center justify-center animate-bounce">
                    <ArrowRight className="w-6 h-6 text-blue-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Log Container */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Activity Log</h2>
          <div ref={logContainerRef} className="h-64 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-2 border">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">No activity yet. Start the workflow to see logs.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-500 font-mono text-xs whitespace-nowrap">{log.timestamp}</span>
                  <span className="text-gray-800">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
