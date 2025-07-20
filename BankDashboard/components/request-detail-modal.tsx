'use client';

import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserRequest } from '@/app/live-feed/page';

interface RequestDetailModalProps {
  request: UserRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDetailModal({
  request,
  isOpen,
  onClose,
}: RequestDetailModalProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [request?.logs]);

  if (!request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'terminated':
        return 'bg-gray-200 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="mr-1">⏳</span>;
      case 'in-progress':
        return <span className="mr-1">🔄</span>;
      case 'done':
        return <span className="mr-1">✅</span>;
      case 'completed':
        return <span className="mr-1">🏁</span>;
      case 'terminated':
        return <span className="mr-1">⛔</span>;
      default:
        return null;
    }
  };

  // Agent positions in a circle
  const getAgentPosition = (index: number) => {
    const angle = index * 45 - 90; // Start from top, 45 degrees apart
    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

    return { x, y, angle };
  };

  // Get connection lines between agents
  const getConnectionLines = () => {
    const lines = [];
    const agentConnections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0], // Circular connections
      [0, 4],
      [2, 6],
      [1, 5],
      [3, 7], // Cross connections for complex flow
    ];

    agentConnections.forEach(([from, to], index) => {
      const fromPos = getAgentPosition(from);
      const toPos = getAgentPosition(to);

      lines.push(
        <line
          key={`line-${index}`}
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke="#e5e7eb"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      );
    });

    return lines;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col flex-grow min-w-0">
              <DialogTitle className="text-2xl break-words">
                {request.thirdParty} -{' '}
                <span className="break-all inline-block w-full align-bottom">
                  {request.requestType}
                </span>
              </DialogTitle>
              <p className="text-gray-600 mt-1 break-all overflow-x-auto text-xs w-full">
                User: {request.userId}
              </p>
            </div>
            <Badge className={`${getStatusColor(request.status)} text-sm`}>
              {getStatusIcon(request.status)}
              {request.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Agent Flow Visualizer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <svg width="300" height="300" className="mx-auto">
                  {/* Connection lines */}
                  {getConnectionLines()}

                  {/* Agents */}
                  {Array.from({ length: 8 }, (_, index) => {
                    const position = getAgentPosition(index);
                    const isCompleted = request.completedAgents.includes(
                      index + 1
                    );
                    const isCurrent = request.currentAgent === index + 1;
                    const isPending = !isCompleted && !isCurrent;
                    const isTerminated = request.status === 'terminated';

                    // Determine color for current agent
                    let fillColor = '#e5e7eb';
                    let strokeColor = '#9ca3af';
                    let animatePulse = false;
                    if (isCurrent) {
                      if (isTerminated) {
                        fillColor = '#ef4444'; // red-500
                        strokeColor = '#b91c1c'; // red-700
                        animatePulse = false;
                      } else {
                        fillColor = '#3b82f6'; // blue-500
                        strokeColor = '#1d4ed8'; // blue-700
                        animatePulse = true;
                      }
                    } else if (isCompleted) {
                      fillColor = '#10b981'; // green-500
                      strokeColor = '#059669'; // green-700
                    }

                    return (
                      <g key={index}>
                        {/* Agent circle */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r="20"
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="3"
                          className={animatePulse ? 'animate-pulse' : ''}
                        />

                        {/* Agent number */}
                        <text
                          x={position.x}
                          y={position.y + 5}
                          textAnchor="middle"
                          className="text-sm font-bold"
                          fill={isCurrent || isCompleted ? 'white' : '#374151'}
                        >
                          {index + 1}
                        </text>

                        {/* Agent label */}
                        <text
                          x={position.x}
                          y={position.y + 35}
                          textAnchor="middle"
                          className="text-xs"
                          fill="#6b7280"
                        >
                          Agent {index + 1}
                        </text>

                        {/* Glow effect for current agent (not for terminated) */}
                        {isCurrent && animatePulse && (
                          <circle
                            cx={position.x}
                            cy={position.y}
                            r="25"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            opacity="0.5"
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div ref={logContainerRef} className="space-y-3">
                  {request.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-xs text-gray-500 font-mono whitespace-nowrap mt-1">
                        {log.timestamp}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{log.message}</p>
                        {log.agentId && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Agent {log.agentId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Request Details */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Request ID</p>
                <p className="font-medium break-all overflow-x-auto max-w-xs">
                  {request.id}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Third Party</p>
                <p className="font-medium break-all overflow-x-auto max-w-xs">
                  {request.thirdParty}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Request Type</p>
                <p className="font-medium break-all overflow-x-auto max-w-xs">
                  {request.requestType}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Timestamp</p>
                <p className="font-medium">
                  {new Date(request.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
