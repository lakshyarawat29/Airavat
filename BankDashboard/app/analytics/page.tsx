'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  ArrowLeft,
  Download,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { usePrivacyAnalytics } from '@/hooks/use-privacy-analytics';
import logsData from '@/data/logs.json'; 
// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
}) as any;

interface PrivacyMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '1d' | '7d' | '30d' | '90d'
  >('7d');
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { analytics, loading, error, refetch, lastUpdated, isStale } =
    usePrivacyAnalytics();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Only process logs data on client side
  useEffect(() => {
    if (!isClient) return;

    // Sample data for charts - you can replace this with actual data fetching
    const sampleLogsData = [
      {
        timestamp: '2024-01-01T00:00:00Z',
        organization: 'RBI',
        userConsent: true,
        dataMinimized: true,
      },
      {
        timestamp: '2024-01-02T00:00:00Z',
        organization: 'TestBank',
        userConsent: true,
        dataMinimized: false,
      },
      {
        timestamp: '2024-01-03T00:00:00Z',
        organization: 'DemoCorp',
        userConsent: false,
        dataMinimized: true,
      },
      {
        timestamp: '2024-01-04T00:00:00Z',
        organization: 'RBI',
        userConsent: true,
        dataMinimized: true,
      },
      {
        timestamp: '2024-01-05T00:00:00Z',
        organization: 'TestBank',
        userConsent: true,
        dataMinimized: true,
      },
    ];

    const now = new Date();
    let startDate: Date;
    if (selectedTimeframe === '1d')
      startDate = new Date(now.setHours(0, 0, 0, 0));
    else if (selectedTimeframe === '7d')
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    else if (selectedTimeframe === '30d')
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    else startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    setFilteredLogs(
      logsData.filter((log) => new Date(log.timestamp) >= startDate)
    );
  }, [selectedTimeframe, isClient]);

  // Calculate chart data only on client side
  const dateCounts: Record<string, number> = {};
  filteredLogs.forEach((log) => {
    const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  const compliance: Record<string, number> = {};
  const total: Record<string, number> = {};

  filteredLogs.forEach((log) => {
    total[log.organization] = (total[log.organization] || 0) + 1;
    if (log.userConsent && log.dataMinimized) {
      compliance[log.organization] = (compliance[log.organization] || 0) + 1;
    }
  });

  const orgs = Object.keys(total);
  const compliancePercent = orgs.map(
    (org) => ((compliance[org] || 0) / total[org]) * 100
  );

  const sortedDates = Object.keys(dateCounts).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const sortedCounts = sortedDates.map((date) => dateCounts[date]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Transform analytics data to match the interface
  const privacyMetrics: PrivacyMetric[] = analytics
    ? [
        {
          id: '1',
          name: 'Data Access Compliance',
          value: analytics.dataAccessCompliance.value,
          change: analytics.dataAccessCompliance.trend,
          status: analytics.dataAccessCompliance.status,
          description: analytics.dataAccessCompliance.description,
        },
        {
          id: '2',
          name: 'Consent Rate',
          value: analytics.consentRate.value,
          change: analytics.consentRate.trend,
          status: analytics.consentRate.status,
          description: analytics.consentRate.description,
        },
        {
          id: '3',
          name: 'Privacy Score',
          value: analytics.privacyScore.value,
          change: analytics.privacyScore.trend,
          status: analytics.privacyScore.status,
          description: analytics.privacyScore.description,
        },
        {
          id: '4',
          name: 'Data Breach Risk',
          value: analytics.dataBreachRisk.value,
          change: analytics.dataBreachRisk.trend,
          status: analytics.dataBreachRisk.status,
          description: analytics.dataBreachRisk.description,
        },
      ]
    : [];

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
              <Badge className="bg-purple-100 text-purple-800 ml-2">
                <Shield className="w-3 h-3 mr-1" />
                DP Enabled
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 ml-2">
                <BarChart3 className="w-3 h-3 mr-1" />
                Blockchain Data
              </Badge>
              {isStale && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 ml-2"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Cached Data
                </Badge>
              )}
              {lastUpdated && (
                <span className="text-xs text-gray-500 ml-2">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Analytics
              </Button>
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
                onClick={() => setSelectedTimeframe(timeframe as any)}
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
          {loading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mt-2 animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Error Loading Analytics
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={refetch} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Success state
            privacyMetrics.map((metric) => (
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
            ))
          )}
        </div>

        {/* Differential Privacy Results Section */}
        {analytics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Blockchain-Based Differential Privacy Analytics</span>
                <Badge className="bg-purple-100 text-purple-800">
                  <Shield className="w-3 h-3 mr-1" />
                  DP Enabled
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Blockchain Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Privacy Metrics Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Data Access Compliance
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {analytics.dataAccessCompliance.value}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Consent Rate
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {analytics.consentRate.value}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        DP Privacy Score
                      </span>
                      <span className="text-lg font-bold text-purple-600">
                        {analytics.privacyScore.value}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        DP Data Breach Risk
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {analytics.dataBreachRisk.value}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Privacy Protection Details
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>
                        <strong>Blockchain Source:</strong> Real-time data from
                        AuditingLogs contract
                      </p>
                      <p>
                        <strong>Data Integrity:</strong> Immutable blockchain
                        records
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>
                        <strong>Differential Privacy:</strong> ε = 1.0 for risk
                        calculations
                      </p>
                      <p>
                        <strong>Laplace Mechanism:</strong> Calibrated noise for
                        privacy protection
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>
                        <strong>Data Protection:</strong> Individual records
                        cannot be identified
                      </p>
                      <p>
                        <strong>Statistical Accuracy:</strong> Maintained while
                        preserving privacy
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p>
                        <strong>Compliance:</strong> Meets GDPR and DPDP Act
                        requirements
                      </p>
                      <p>
                        <strong>Audit Trail:</strong> All privacy operations
                        logged on blockchain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              {loading ? (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    <span className="text-gray-500">Loading chart...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 text-sm">Failed to load chart</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <img
                    src="/dp_organization_requests.png"
                    alt="Differentially Private Organization Requests"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const nextElement =
                        target.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      Chart visualization would go here
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Run npm run dp:analytics to generate chart
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Organization Request Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    <span className="text-gray-500">Loading data...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 text-sm">Failed to load data</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      Organization
                    </span>
                    <span className="font-medium text-gray-700">
                      Requests (DP)
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {analytics?.organizationBreakdown?.map(
                      (org: { name: string; count: number }, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600">
                            {org.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {org.count} requests
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Data protected with differential privacy (ε = 0.5)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Data Access Frequency</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isClient ? (
                <Plot
                  data={[
                    {
                      x: sortedDates,
                      y: sortedCounts,
                      type: 'scatter',
                      mode: 'lines+markers',
                      marker: { color: 'blue' },
                    },
                  ]}
                  layout={{
                    margin: { t: 30, r: 20, l: 40, b: 40 },
                    title: { text: '' },
                    xaxis: { title: { text: 'Date' } },
                    yaxis: { title: { text: 'Access Count' } },
                  }}
                  style={{ width: '100%', height: '300px' }}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
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
              {isClient ? (
                <Plot
                  data={[
                    {
                      labels: orgs, // department names
                      values: compliancePercent, // compliance %
                      type: 'pie',
                      textinfo: 'label+percent', // show department + %
                      textposition: 'inside',

                      marker: {
                        line: {
                          color: 'black',
                          width: 1,
                        },
                        colors: ['#2ecc71', '#27ae60', '#1abc9c', '#16a085'], // green shades
                      },
                    },
                  ]}
                  layout={{
                    margin: { t: 30, r: 20, l: 20, b: 20 },
                    showlegend: true,
                  }}
                  style={{ width: '100%', height: '300px' }}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
