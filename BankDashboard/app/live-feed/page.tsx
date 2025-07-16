"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { RequestDetailModal } from "@/components/request-detail-modal"

export interface UserRequest {
  id: string
  thirdParty: string
  requestType: string
  userId: string
  status: "pending" | "in-progress" | "done"
  timestamp: string
  currentAgent: number
  completedAgents: number[]
  logs: Array<{
    id: string
    message: string
    timestamp: string
    agentId?: number
  }>
}

// Mock data for user requests
const mockRequests: UserRequest[] = [
  {
    id: "req-001",
    thirdParty: "Groww",
    requestType: "CIBIL Score",
    userId: "USER001",
    status: "in-progress",
    timestamp: "2024-01-15T10:30:00Z",
    currentAgent: 3,
    completedAgents: [1, 2, 3],
    logs: [
      { id: "log-1", message: "Request received from Groww", timestamp: "10:30:00", agentId: 1 },
      { id: "log-2", message: "Agent 1 → Agent 2: User verification initiated", timestamp: "10:30:15", agentId: 1 },
      { id: "log-3", message: "Agent 2 → Agent 3: KYC validation completed", timestamp: "10:30:45", agentId: 2 },
      { id: "log-4", message: "Agent 3: Processing CIBIL score request", timestamp: "10:31:00", agentId: 3 },
    ],
  },
  {
    id: "req-002",
    thirdParty: "Paytm",
    requestType: "Transaction History",
    userId: "USER002",
    status: "pending",
    timestamp: "2024-01-15T11:15:00Z",
    currentAgent: 1,
    completedAgents: [],
    logs: [{ id: "log-1", message: "Request queued from Paytm", timestamp: "11:15:00", agentId: 1 }],
  },
  {
    id: "req-003",
    thirdParty: "Groww",
    requestType: "KYC Verification",
    userId: "USER001",
    status: "done",
    timestamp: "2024-01-15T09:45:00Z",
    currentAgent: 8,
    completedAgents: [1, 2, 3, 4, 5, 6, 7, 8],
    logs: [
      { id: "log-1", message: "Request received from Groww", timestamp: "09:45:00", agentId: 1 },
      { id: "log-2", message: "Agent 1 → Agent 2: User verification initiated", timestamp: "09:45:15", agentId: 1 },
      { id: "log-3", message: "Agent 2 → Agent 3: Document validation started", timestamp: "09:45:30", agentId: 2 },
      { id: "log-4", message: "Agent 3 → Agent 4: Identity verification completed", timestamp: "09:46:00", agentId: 3 },
      { id: "log-5", message: "Agent 4 → Agent 5: Address verification initiated", timestamp: "09:46:30", agentId: 4 },
      { id: "log-6", message: "Agent 5 → Agent 6: Bank account validation", timestamp: "09:47:00", agentId: 5 },
      { id: "log-7", message: "Agent 6 → Agent 7: Final compliance check", timestamp: "09:47:30", agentId: 6 },
      { id: "log-8", message: "Agent 7 → Agent 8: KYC completion processing", timestamp: "09:48:00", agentId: 7 },
      { id: "log-9", message: "Agent 8: KYC verification completed successfully", timestamp: "09:48:30", agentId: 8 },
    ],
  },
  {
    id: "req-004",
    thirdParty: "PhonePe",
    requestType: "Account Balance",
    userId: "USER003",
    status: "in-progress",
    timestamp: "2024-01-15T12:00:00Z",
    currentAgent: 5,
    completedAgents: [1, 2, 3, 4, 5],
    logs: [
      { id: "log-1", message: "Request received from PhonePe", timestamp: "12:00:00", agentId: 1 },
      { id: "log-2", message: "Agent 1 → Agent 2: Authentication started", timestamp: "12:00:15", agentId: 1 },
      { id: "log-3", message: "Agent 2 → Agent 3: User permissions validated", timestamp: "12:00:30", agentId: 2 },
      { id: "log-4", message: "Agent 3 → Agent 4: Account access granted", timestamp: "12:00:45", agentId: 3 },
      { id: "log-5", message: "Agent 4 → Agent 5: Balance retrieval in progress", timestamp: "12:01:00", agentId: 4 },
    ],
  },
  {
    id: "req-005",
    thirdParty: "Google Pay",
    requestType: "Payment Verification",
    userId: "USER004",
    status: "pending",
    timestamp: "2024-01-15T12:30:00Z",
    currentAgent: 1,
    completedAgents: [],
    logs: [{ id: "log-1", message: "Request queued from Google Pay", timestamp: "12:30:00", agentId: 1 }],
  },
]

export default function LiveFeedPage() {
  const [requests, setRequests] = useState<UserRequest[]>(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests((prev) =>
        prev.map((req) => {
          if (req.status === "in-progress" && Math.random() > 0.8) {
            const nextAgent = Math.min(req.currentAgent + 1, 8)
            const newLog = {
              id: `log-${Date.now()}`,
              message: `Agent ${req.currentAgent} → Agent ${nextAgent}: Processing step completed`,
              timestamp: new Date().toLocaleTimeString(),
              agentId: req.currentAgent,
            }

            return {
              ...req,
              currentAgent: nextAgent,
              completedAgents: [...req.completedAgents, nextAgent],
              logs: [...req.logs, newLog],
              status: nextAgent === 8 ? "done" : "in-progress",
            }
          }
          return req
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800 border-red-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "done":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "done":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleRequestClick = (request: UserRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Live Feed Running
              </h1>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <p className="text-gray-600 mt-1">
              Banking Request System Powered By Airavat
            </p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Pending</span>
                <span className="ml-auto text-lg font-bold">
                  {requests.filter((r) => r.status === 'pending').length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">In Progress</span>
                <span className="ml-auto text-lg font-bold">
                  {requests.filter((r) => r.status === 'in-progress').length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Completed</span>
                <span className="ml-auto text-lg font-bold">
                  {requests.filter((r) => r.status === 'done').length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Total</span>
                <span className="ml-auto text-lg font-bold">
                  {requests.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleRequestClick(request)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {request.thirdParty}
                  </CardTitle>
                  <Badge
                    className={`${getStatusColor(
                      request.status
                    )} flex items-center gap-1`}
                  >
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Request Type</p>
                  <p className="font-medium">{request.requestType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium">{request.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (request.completedAgents.length / 8) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {request.completedAgents.length}/8
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </span>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
