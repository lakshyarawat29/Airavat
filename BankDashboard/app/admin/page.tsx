'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Settings,
  Users,
  Shield,
  Activity,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface SystemUser {
  _id: string;
  name: string;
  email: string;
  role: 'banker' | 'auditor' | 'manager' | 'admin';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface AddUserForm {
  name: string;
  email: string;
  role: 'banker' | 'auditor' | 'manager' | 'admin';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface SystemConfig {
  _id: string;
  configId: string;
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'security' | 'privacy' | 'general' | 'email' | 'session';
  description: string;
  isActive: boolean;
  defaultValue: string | number | boolean;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  lastModifiedBy: string;
  lastModifiedAt: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [employees, setEmployees] = useState<SystemUser[]>([]);
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState<string | null>(null);
  const [addUserForm, setAddUserForm] = useState<AddUserForm>({
    name: '',
    email: '',
    role: 'banker',
    department: '',
    status: 'active',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Fetch employees and system configs when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchEmployees();
      fetchSystemConfigs();
    }
  }, [isAuthenticated, user]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch employees',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      const response = await fetch('/api/system-config');
      if (response.ok) {
        const data = await response.json();
        setSystemConfigs(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch system configurations',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching system configs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system configurations',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const handleSaveConfig = async (configId: string, newValue: string) => {
    setIsSavingConfig(configId);
    try {
      const response = await fetch(`/api/system-config/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: newValue,
          modifiedBy: user?.name || 'Admin',
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setSystemConfigs((prev) =>
          prev.map((config) =>
            config._id === configId ? updatedConfig : config
          )
        );
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update configuration',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSavingConfig(null);
    }
  };

  const handleResetConfig = async (configId: string) => {
    const config = systemConfigs.find((c) => c._id === configId);
    if (!config) return;

    setIsSavingConfig(configId);
    try {
      const response = await fetch(`/api/system-config/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: config.defaultValue,
          modifiedBy: user?.name || 'Admin',
        }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setSystemConfigs((prev) =>
          prev.map((c) => (c._id === configId ? updatedConfig : c))
        );
        toast({
          title: 'Success',
          description: 'Configuration reset to default',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to reset configuration',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSavingConfig(null);
    }
  };

  const handleAddUser = async () => {
    setIsAddingUser(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addUserForm),
      });

      if (response.ok) {
        const newEmployee = await response.json();
        setEmployees((prev) => [newEmployee, ...prev]);
        setShowAddUser(false);
        setAddUserForm({
          name: '',
          email: '',
          role: 'banker',
          department: '',
          status: 'active',
        });
        toast({
          title: 'Success',
          description: 'Employee added successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to add employee',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to add employee',
        variant: 'destructive',
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
        toast({
          title: 'Success',
          description: 'Employee deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete employee',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'privacy':
        return 'bg-blue-100 text-blue-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Control Panel
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'config', label: 'System Config', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'logs', label: 'System Logs', icon: Activity },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                User Management
              </h2>
              <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={addUserForm.name}
                        onChange={(e) =>
                          setAddUserForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={addUserForm.email}
                        onChange={(e) =>
                          setAddUserForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={addUserForm.role}
                        onValueChange={(value: any) =>
                          setAddUserForm((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banker">Banker</SelectItem>
                          <SelectItem value="auditor">Auditor</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={addUserForm.department}
                        onChange={(e) =>
                          setAddUserForm((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        placeholder="Enter department"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={addUserForm.status}
                        onValueChange={(value: any) =>
                          setAddUserForm((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddUser(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} disabled={isAddingUser}>
                      {isAddingUser ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Employee'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-600">Loading employees...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Department
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Last Login
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-8 text-center text-gray-500"
                            >
                              No employees found
                            </td>
                          </tr>
                        ) : (
                          employees.map((employee) => (
                            <tr
                              key={employee._id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {employee.email}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline">{employee.role}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {employee.department}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={getStatusColor(employee.status)}
                                >
                                  {employee.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {employee.lastLogin
                                  ? new Date(
                                      employee.lastLogin
                                    ).toLocaleString()
                                  : 'Never'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteEmployee(employee._id)
                                    }
                                    disabled={employee.role === 'admin'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              System Configuration
            </h2>

            {isLoadingConfigs ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">
                    Loading configurations...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemConfigs.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500">
                      No system configurations found
                    </p>
                  </div>
                ) : (
                  systemConfigs.map((config) => (
                    <Card key={config._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {config.key}
                          </CardTitle>
                          <Badge className={getCategoryColor(config.category)}>
                            {config.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={config._id}>Value</Label>
                          <Input
                            id={config._id}
                            value={String(config.value)}
                            onChange={(e) => {
                              setSystemConfigs((prev) =>
                                prev.map((c) =>
                                  c._id === config._id
                                    ? { ...c, value: e.target.value }
                                    : c
                                )
                              );
                            }}
                            className="mt-1"
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          {config.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Default: {String(config.defaultValue)}</span>
                          <span>v{config.version}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSaveConfig(config._id, String(config.value))
                            }
                            disabled={isSavingConfig === config._id}
                          >
                            {isSavingConfig === config._id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetConfig(config._id)}
                            disabled={isSavingConfig === config._id}
                          >
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Security Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Sessions
                      </p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Failed Logins
                      </p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Locked Accounts
                      </p>
                      <p className="text-2xl font-bold text-gray-900">1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: '2 minutes ago',
                      event: 'Failed login attempt for banker@bank.com',
                      severity: 'warning',
                    },
                    {
                      time: '5 minutes ago',
                      event: 'Account locked: auditor@bank.com',
                      severity: 'critical',
                    },
                    {
                      time: '10 minutes ago',
                      event: 'New user session started',
                      severity: 'info',
                    },
                  ].map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-gray-500">{event.time}</p>
                      </div>
                      <Badge
                        className={
                          event.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : event.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Timestamp
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Level
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          User
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Action
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          timestamp: '2024-01-15T10:30:00Z',
                          level: 'INFO',
                          user: 'John Banker',
                          action: 'Login',
                          details: 'Successful login from 192.168.1.100',
                        },
                        {
                          timestamp: '2024-01-15T10:25:00Z',
                          level: 'WARN',
                          user: 'Sarah Auditor',
                          action: 'Data Access',
                          details: 'Accessed sensitive customer data',
                        },
                        {
                          timestamp: '2024-01-15T10:20:00Z',
                          level: 'ERROR',
                          user: 'System',
                          action: 'API Error',
                          details: 'Failed to connect to external service',
                        },
                      ].map((log, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                log.level === 'ERROR'
                                  ? 'bg-red-100 text-red-800'
                                  : log.level === 'WARN'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            >
                              {log.level}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {log.user}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
