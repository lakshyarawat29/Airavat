'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NAVIGATION_ITEMS } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Mail,
  BarChart3,
  Settings,
  User,
  LogOut,
  Shield,
  TrendingUp,
  Users,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

const iconMap = {
  Activity,
  Mail,
  BarChart3,
  Settings,
  FileText,
};

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { stats, loading, error, refetch, lastUpdated, isStale } =
    useDashboardStats();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const navigationItems = NAVIGATION_ITEMS[user.role] || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'banker':
        return 'bg-blue-100 text-blue-800';
      case 'auditor':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'banker':
        return <User className="w-4 h-4" />;
      case 'auditor':
        return <FileText className="w-4 h-4" />;
      case 'manager':
        return <Users className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Bank Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(user.role)}>
                  {getRoleIcon(user.role)}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">{user.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-600">
              You're logged in as a {user.role} in the {user.department}{' '}
              department.
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {isStale && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Cached Data
                </Badge>
              )}
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span>Refresh Stats</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Requests
                  </p>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : error ? (
                    <p className="text-red-500 text-sm">Error loading data</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.activeRequests || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Today
                  </p>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : error ? (
                    <p className="text-red-500 text-sm">Error loading data</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.completedToday || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Team Members
                  </p>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : error ? (
                    <p className="text-red-500 text-sm">Error loading data</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.teamMembers || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Reviews
                  </p>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : error ? (
                    <p className="text-red-500 text-sm">Error loading data</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.pendingReviews || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Link key={item.href} href={item.href}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {IconComponent && (
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Access {item.label.toLowerCase()} functionality
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Role-specific Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Your Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="w-fit">
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
