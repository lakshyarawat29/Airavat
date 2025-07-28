import connectDB from '../lib/mongodb';
import Employee from '../models/Employee';
import SystemConfig from '../models/SystemConfig';
import PrivacyMetric from '../models/PrivacyMetric';
import AuditLog from '../models/AuditLog';
import DataRequest from '../models/DataRequest';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Employee.deleteMany({});
    await SystemConfig.deleteMany({});
    await PrivacyMetric.deleteMany({});
    await AuditLog.deleteMany({});
    await DataRequest.deleteMany({});

    // Seed Employees
    console.log('Seeding employees...');
    const employees = [
      {
        email: 'banker@bank.com',
        name: 'John Banker',
        role: 'banker',
        department: 'Customer Service',
        status: 'active',
        permissions: ['view_live_feed', 'send_mail', 'view_own_requests'],
      },
      {
        email: 'auditor@bank.com',
        name: 'Sarah Auditor',
        role: 'auditor',
        department: 'Compliance',
        status: 'active',
        permissions: ['view_analytics', 'view_audit_logs', 'generate_reports'],
      },
      {
        email: 'manager@bank.com',
        name: 'Mike Manager',
        role: 'manager',
        department: 'Operations',
        status: 'active',
        permissions: [
          'view_live_feed',
          'send_mail',
          'view_analytics',
          'manage_team',
          'approve_requests',
        ],
      },
      {
        email: 'admin@bank.com',
        name: 'Admin User',
        role: 'admin',
        department: 'IT',
        status: 'active',
        permissions: [
          'view_live_feed',
          'send_mail',
          'view_analytics',
          'manage_users',
          'system_config',
          'view_all_logs',
          'manage_roles',
        ],
      },
    ];

    await Employee.insertMany(employees);
    console.log('Employees seeded successfully!');

    // Seed System Configurations
    console.log('Seeding system configurations...');
    const systemConfigs = [
      {
        key: 'SESSION_TIMEOUT',
        value: 30,
        type: 'number',
        category: 'security',
        description: 'Session timeout in minutes',
        isActive: true,
        isSensitive: false,
        defaultValue: 30,
        validation: { min: 5, max: 120 },
        lastModifiedBy: 'admin@bank.com',
      },
      {
        key: 'OTP_EXPIRY',
        value: 5,
        type: 'number',
        category: 'security',
        description: 'OTP expiry time in minutes',
        isActive: true,
        isSensitive: false,
        defaultValue: 5,
        validation: { min: 1, max: 15 },
        lastModifiedBy: 'admin@bank.com',
      },
      {
        key: 'DATA_RETENTION_PERIOD',
        value: 7,
        type: 'number',
        category: 'privacy',
        description: 'Data retention period in years',
        isActive: true,
        isSensitive: false,
        defaultValue: 7,
        validation: { min: 1, max: 10 },
        lastModifiedBy: 'admin@bank.com',
      },
      {
        key: 'MAX_LOGIN_ATTEMPTS',
        value: 3,
        type: 'number',
        category: 'security',
        description: 'Maximum failed login attempts before lockout',
        isActive: true,
        isSensitive: false,
        defaultValue: 3,
        validation: { min: 1, max: 10 },
        lastModifiedBy: 'admin@bank.com',
      },
      {
        key: 'ENABLE_AUDIT_LOGGING',
        value: true,
        type: 'boolean',
        category: 'privacy',
        description: 'Enable comprehensive audit logging',
        isActive: true,
        isSensitive: false,
        defaultValue: true,
        lastModifiedBy: 'admin@bank.com',
      },
      {
        key: 'PRIVACY_SCORE_THRESHOLD',
        value: 70,
        type: 'number',
        category: 'privacy',
        description: 'Minimum privacy score threshold for data sharing',
        isActive: true,
        isSensitive: false,
        defaultValue: 70,
        validation: { min: 0, max: 100 },
        lastModifiedBy: 'admin@bank.com',
      },
    ];

    await SystemConfig.insertMany(systemConfigs);
    console.log('System configurations seeded successfully!');

    // Seed Privacy Metrics
    console.log('Seeding privacy metrics...');
    const privacyMetrics = [
      {
        metricType: 'data_access_compliance',
        value: 94.2,
        unit: 'percentage',
        description:
          'Percentage of data access requests that comply with privacy policies',
        category: 'compliance',
        trend: 'increasing',
        threshold: { min: 0, max: 100, warning: 70, critical: 50 },
        status: 'good',
      },
      {
        metricType: 'consent_rate',
        value: 87.5,
        unit: 'percentage',
        description: 'Percentage of users who have provided explicit consent',
        category: 'consent',
        trend: 'decreasing',
        threshold: { min: 0, max: 100, warning: 70, critical: 50 },
        status: 'good',
      },
      {
        metricType: 'privacy_score',
        value: 91.8,
        unit: 'score',
        description:
          'Overall privacy protection score based on multiple factors',
        category: 'security',
        trend: 'increasing',
        threshold: { min: 0, max: 100, warning: 70, critical: 50 },
        status: 'good',
      },
      {
        metricType: 'data_breach_risk',
        value: 12.3,
        unit: 'risk_level',
        description: 'Risk assessment score for potential data breaches',
        category: 'risk',
        trend: 'decreasing',
        threshold: { min: 0, max: 100, warning: 30, critical: 50 },
        status: 'good',
      },
      {
        metricType: 'gdpr_compliance',
        value: 96.7,
        unit: 'percentage',
        description: 'GDPR compliance score based on data protection measures',
        category: 'compliance',
        trend: 'stable',
        threshold: { min: 0, max: 100, warning: 70, critical: 50 },
        status: 'good',
      },
      {
        metricType: 'dpdp_compliance',
        value: 89.4,
        unit: 'percentage',
        description: 'DPDP Act compliance score for Indian data protection',
        category: 'compliance',
        trend: 'increasing',
        threshold: { min: 0, max: 100, warning: 70, critical: 50 },
        status: 'good',
      },
    ];

    await PrivacyMetric.insertMany(privacyMetrics);
    console.log('Privacy metrics seeded successfully!');

    // Seed Sample Data Requests
    console.log('Seeding sample data requests...');
    const dataRequests = [
      {
        thirdParty: 'Credit Bureau',
        requestType: 'credit_check',
        userId: 'USER_123456789',
        status: 'in-progress',
        dataTypes: ['personal_info', 'financial_data'],
        purpose: 'Credit assessment for loan application',
        requestedBy: 'banker@bank.com',
        requestedByRole: 'banker',
        dataScope: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
          fields: ['name', 'email', 'account_balance', 'transaction_history'],
          records: 1,
        },
        privacyImpact: {
          riskLevel: 'low',
          impactAssessment: 'Minimal risk - only basic financial data shared',
          mitigationMeasures: ['Data encryption', 'Limited access scope'],
        },
        consentStatus: {
          hasConsent: true,
          consentDate: new Date('2024-01-10'),
          consentMethod: 'explicit',
        },
        dataSharing: {
          method: 'api',
          encryption: true,
          retentionPeriod: 30,
        },
        currentAgent: 3,
        completedAgents: [1, 2],
        logs: [
          {
            id: 'log_1',
            message: 'Request received and validated',
            timestamp: new Date('2024-01-15T10:00:00Z'),
            agentId: 1,
            level: 'info',
          },
          {
            id: 'log_2',
            message: 'Privacy impact assessment completed',
            timestamp: new Date('2024-01-15T10:05:00Z'),
            agentId: 2,
            level: 'info',
          },
          {
            id: 'log_3',
            message: 'Consent verification in progress',
            timestamp: new Date('2024-01-15T10:10:00Z'),
            agentId: 3,
            level: 'info',
          },
        ],
      },
      {
        thirdParty: 'Insurance Partner',
        requestType: 'risk_assessment',
        userId: 'USER_987654321',
        status: 'pending',
        dataTypes: ['personal_info', 'risk_profile'],
        purpose: 'Insurance risk assessment for policy underwriting',
        requestedBy: 'manager@bank.com',
        requestedByRole: 'manager',
        dataScope: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
          fields: ['name', 'age', 'occupation', 'risk_score'],
          records: 1,
        },
        privacyImpact: {
          riskLevel: 'medium',
          impactAssessment: 'Moderate risk - personal and risk data shared',
          mitigationMeasures: ['Data anonymization', 'Purpose limitation'],
        },
        consentStatus: {
          hasConsent: false,
          consentMethod: 'none',
        },
        dataSharing: {
          method: 'api',
          encryption: true,
          retentionPeriod: 60,
        },
        currentAgent: 1,
        completedAgents: [],
        logs: [
          {
            id: 'log_1',
            message: 'Request created and awaiting approval',
            timestamp: new Date('2024-01-15T09:00:00Z'),
            agentId: 1,
            level: 'info',
          },
        ],
      },
    ];

    await DataRequest.insertMany(dataRequests);
    console.log('Data requests seeded successfully!');

    // Seed Sample Audit Logs
    console.log('Seeding sample audit logs...');
    const auditLogs = [
      {
        userId: 'EMP_1',
        userEmail: 'banker@bank.com',
        userRole: 'banker',
        action: 'login',
        resource: 'bank_dashboard',
        resourceType: 'system_config',
        details: { ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0...' },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_123',
        riskLevel: 'low',
        status: 'success',
        metadata: { loginMethod: 'otp' },
      },
      {
        userId: 'EMP_2',
        userEmail: 'auditor@bank.com',
        userRole: 'auditor',
        action: 'view_data',
        resource: 'privacy_metrics',
        resourceType: 'analytics_report',
        details: {
          reportType: 'compliance_summary',
          filters: { dateRange: '7d' },
        },
        ipAddress: '192.168.1.101',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'session_124',
        riskLevel: 'low',
        status: 'success',
        metadata: { reportGenerated: true },
      },
      {
        userId: 'EMP_3',
        userEmail: 'manager@bank.com',
        userRole: 'manager',
        action: 'approve_request',
        resource: 'data_request_REQ_123',
        resourceType: 'third_party_data',
        details: {
          requestId: 'REQ_123',
          approvalReason: 'Valid business purpose',
        },
        ipAddress: '192.168.1.102',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_125',
        riskLevel: 'medium',
        status: 'success',
        metadata: { approvalTime: '2 minutes' },
      },
    ];

    await AuditLog.insertMany(auditLogs);
    console.log('Audit logs seeded successfully!');

    console.log('Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`- ${employees.length} Employees`);
    console.log(`- ${systemConfigs.length} System Configurations`);
    console.log(`- ${privacyMetrics.length} Privacy Metrics`);
    console.log(`- ${dataRequests.length} Data Requests`);
    console.log(`- ${auditLogs.length} Audit Logs`);

    console.log('\n🔐 Demo Accounts:');
    console.log('banker@bank.com (Banker)');
    console.log('auditor@bank.com (Auditor)');
    console.log('manager@bank.com (Manager)');
    console.log('admin@bank.com (Admin)');
    console.log('OTP for all accounts: 123456');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
