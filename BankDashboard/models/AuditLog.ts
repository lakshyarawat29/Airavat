import mongoose from 'mongoose';

export interface IAuditLog extends mongoose.Document {
  logId: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceType: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ['banker', 'auditor', 'manager', 'admin'],
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'view_data',
        'modify_data',
        'delete_data',
        'export_data',
        'generate_report',
        'send_mail',
        'approve_request',
        'reject_request',
        'create_user',
        'update_user',
        'delete_user',
        'change_permissions',
        'system_config_change',
        'data_access',
        'consent_given',
        'consent_revoked',
        'privacy_settings_changed',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        'user_data',
        'financial_data',
        'personal_info',
        'transaction_history',
        'consent_preferences',
        'system_config',
        'audit_logs',
        'analytics_report',
        'email_communication',
        'third_party_data',
      ],
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    sessionId: {
      type: String,
      index: true,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failure', 'pending'],
      default: 'success',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, timestamp: -1 });
auditLogSchema.index({ riskLevel: 1, timestamp: -1 });
auditLogSchema.index({ userRole: 1, timestamp: -1 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, riskLevel: 1, timestamp: -1 });
auditLogSchema.index({ userRole: 1, action: 1, timestamp: -1 });

// TTL index to automatically delete old logs (keep for 7 years for compliance)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 }
);

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
