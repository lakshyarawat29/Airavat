export type UserRole = 'banker' | 'auditor' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Role-based permissions
export const ROLE_PERMISSIONS = {
  banker: [
    'view_live_feed',
    'send_mail',
    'view_own_requests'
  ],
  auditor: [
    'view_analytics',
    'view_audit_logs',
    'generate_reports'
  ],
  manager: [
    'view_live_feed',
    'send_mail',
    'view_analytics',
    'manage_team',
    'approve_requests'
  ],
  admin: [
    'view_live_feed',
    'send_mail',
    'view_analytics',
    'manage_users',
    'system_config',
    'view_all_logs',
    'manage_roles'
  ]
} as const;

// Navigation items based on roles
export const NAVIGATION_ITEMS = {
  banker: [
    { href: '/live-feed', label: 'Live Feed', icon: 'Activity' },
    { href: '/send-mail', label: 'Send Mail', icon: 'Mail' }
  ],
  auditor: [
    { href: '/analytics', label: 'Analytics Dashboard', icon: 'BarChart3' },
    { href: '/audit-logs', label: 'Audit Logs', icon: 'FileText' }
  ],
  manager: [
    { href: '/live-feed', label: 'Live Feed', icon: 'Activity' },
    { href: '/send-mail', label: 'Send Mail', icon: 'Mail' },
    { href: '/analytics', label: 'Analytics Dashboard', icon: 'BarChart3' }
  ],
  admin: [
    { href: '/live-feed', label: 'Live Feed', icon: 'Activity' },
    { href: '/send-mail', label: 'Send Mail', icon: 'Mail' },
    { href: '/analytics', label: 'Analytics Dashboard', icon: 'BarChart3' },
    { href: '/admin', label: 'Admin Panel', icon: 'Settings' }
  ]
} as const; 