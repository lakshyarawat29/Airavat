'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { RequestDetailModal } from '@/components/request-detail-modal';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface UserRequest {
  id: string;
  thirdParty: string;
  requestType: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'done';
  timestamp: string;
  currentAgent: number;
  completedAgents: number[];
  logs: Array<{
    id: string;
    message: string;
    timestamp: string;
    agentId?: number;
  }>;
}

export default function LiveFeedPage() {
  const {
    data: requests,
    error,
    isLoading,
  } = useSWR('/api/user-requests', fetcher, {
    refreshInterval: 5000,
  });
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleRequestClick = (request: UserRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Live Feed Running
              </h1>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
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
        {isLoading && <p>Loading requests...</p>}
        {error && <p className="text-red-600">Error: {error.message}</p>}
        {!isLoading && !error && requests && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <Stat
                    label="Pending"
                    count={
                      requests.filter(
                        (r: UserRequest) => r.status === 'pending'
                      ).length
                    }
                    color="red"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Stat
                    label="In Progress"
                    count={
                      requests.filter(
                        (r: UserRequest) => r.status === 'in-progress'
                      ).length
                    }
                    color="yellow"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Stat
                    label="Completed"
                    count={
                      requests.filter((r: UserRequest) => r.status === 'done')
                        .length
                    }
                    color="green"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Stat label="Total" count={requests.length} color="blue" />
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request: UserRequest) => (
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
                    <Info label="Request Type" value={request.requestType} />
                    <Info label="User ID" value={request.userId} />
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
                          />
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
          </>
        )}
      </div>
      <RequestDetailModal
        request={
          isModalOpen && selectedRequest
            ? requests?.find((r: UserRequest) => r.id === selectedRequest.id) ??
              selectedRequest
            : null
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

const colorMap: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
};

const Stat = ({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-3 h-3 ${colorMap[color] || 'bg-gray-300'} rounded-full`}
    ></div>
    <span className="text-sm font-medium">{label}</span>
    <span className="ml-auto text-lg font-bold">{count}</span>
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
