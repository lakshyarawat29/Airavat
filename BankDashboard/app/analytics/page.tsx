'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Shield,
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  ArrowLeft,
  Download,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

interface PrivacyMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface DataAccessLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  dataType: string;
  thirdParty: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user has access to analytics
    if (user && !['auditor', 'manager', 'admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Mock data for analytics
  const privacyMetrics: PrivacyMetric[] = [
    {
      id: '1',
      name: 'Data Access Compliance',
      value: 94.2,
      change: 2.1,
      status: 'good',
      description:
        'Percentage of data access requests that comply with privacy policies',
    },
    {
      id: '2',
      name: 'Consent Rate',
      value: 87.5,
      change: -1.3,
      status: 'warning',
      description: 'Percentage of users who have provided explicit consent',
    },
    {
      id: '3',
      name: 'Privacy Score',
      value: 91.8,
      change: 3.2,
      status: 'good',
      description: 'Overall privacy protection score based on multiple factors',
    },
    {
      id: '4',
      name: 'Data Breach Risk',
      value: 12.3,
      change: -5.7,
      status: 'good',
      description: 'Risk assessment score for potential data breaches',
    },
  ];

  const recentAccessLogs: DataAccessLog[] = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'John Banker',
      role: 'banker',
      action: 'view_customer_data',
      dataType: 'personal_info',
      thirdParty: 'Credit Bureau',
      riskLevel: 'low',
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'Sarah Auditor',
      role: 'auditor',
      action: 'generate_report',
      dataType: 'transaction_history',
      thirdParty: 'Internal',
      riskLevel: 'low',
    },
    {
      id: '3',
      timestamp: '2024-01-15T08:45:00Z',
      user: 'Mike Manager',
      role: 'manager',
      action: 'approve_request',
      dataType: 'financial_data',
      thirdParty: 'Insurance Partner',
      riskLevel: 'medium',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Privacy Analytics Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['1d', '7d', '30d', '90d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={
                  selectedTimeframe === timeframe ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe === '1d'
                  ? 'Today'
                  : timeframe === '7d'
                  ? '7 Days'
                  : timeframe === '30d'
                  ? '30 Days'
                  : '90 Days'}
              </Button>
            ))}
          </div>
        </div>

        {/* Privacy Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {privacyMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.name}
                  </CardTitle>
                  <Badge className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                    {metric.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value}%
                  </span>
                  <span
                    className={`text-sm ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change >= 0 ? '+' : ''}
                    {metric.change}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Data Access Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Chart visualization would go here
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy Compliance by Department</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Chart visualization would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Data Access Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Recent Data Access Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Data Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Third Party
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAccessLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {log.user}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {log.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.dataType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.thirdParty}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRiskColor(log.riskLevel)}>
                          {log.riskLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
