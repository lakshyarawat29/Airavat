import mongoose from 'mongoose';

export interface IDataRequest extends mongoose.Document {
  requestId: string;
  thirdParty: string;
  requestType: string;
  userId: string;
  status:
    | 'pending'
    | 'in-progress'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'terminated';
  dataTypes: string[];
  purpose: string;
  requestedBy: string;
  requestedByRole: string;
  approvedBy?: string;
  approvedByRole?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  dataScope: {
    startDate: Date;
    endDate: Date;
    fields: string[];
    records: number;
  };
  privacyImpact: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    impactAssessment: string;
    mitigationMeasures: string[];
  };
  consentStatus: {
    hasConsent: boolean;
    consentDate?: Date;
    consentMethod: 'explicit' | 'implicit' | 'none';
    consentExpiry?: Date;
  };
  dataSharing: {
    method: 'api' | 'file' | 'direct_access';
    encryption: boolean;
    retentionPeriod: number; // in days
    deletionDate?: Date;
  };
  auditTrail: Array<{
    action: string;
    performedBy: string;
    performedByRole: string;
    timestamp: Date;
    details: string;
  }>;
  currentAgent: number;
  completedAgents: number[];
  logs: Array<{
    id: string;
    message: string;
    timestamp: Date;
    agentId?: number;
    level: 'info' | 'warning' | 'error';
  }>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const dataRequestSchema = new mongoose.Schema<IDataRequest>(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    thirdParty: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requestType: {
      type: String,
      required: true,
      enum: [
        'credit_check',
        'fraud_detection',
        'compliance_report',
        'risk_assessment',
        'customer_verification',
        'transaction_analysis',
        'regulatory_reporting',
        'research_purpose',
      ],
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'in-progress',
        'approved',
        'rejected',
        'completed',
        'terminated',
      ],
      default: 'pending',
      index: true,
    },
    dataTypes: [
      {
        type: String,
        enum: [
          'personal_info',
          'financial_data',
          'transaction_history',
          'account_details',
          'credit_score',
          'risk_profile',
          'behavioral_data',
          'consent_preferences',
        ],
        required: true,
      },
    ],
    purpose: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    requestedBy: {
      type: String,
      required: true,
      index: true,
    },
    requestedByRole: {
      type: String,
      required: true,
      enum: ['banker', 'auditor', 'manager', 'admin'],
    },
    approvedBy: {
      type: String,
      index: true,
    },
    approvedByRole: {
      type: String,
      enum: ['banker', 'auditor', 'manager', 'admin'],
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    dataScope: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      fields: [
        {
          type: String,
          required: true,
        },
      ],
      records: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    privacyImpact: {
      riskLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      impactAssessment: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      mitigationMeasures: [
        {
          type: String,
          maxlength: 200,
        },
      ],
    },
    consentStatus: {
      hasConsent: {
        type: Boolean,
        required: true,
        default: false,
      },
      consentDate: {
        type: Date,
      },
      consentMethod: {
        type: String,
        required: true,
        enum: ['explicit', 'implicit', 'none'],
        default: 'none',
      },
      consentExpiry: {
        type: Date,
      },
    },
    dataSharing: {
      method: {
        type: String,
        required: true,
        enum: ['api', 'file', 'direct_access'],
        default: 'api',
      },
      encryption: {
        type: Boolean,
        required: true,
        default: true,
      },
      retentionPeriod: {
        type: Number,
        required: true,
        min: 1,
        default: 30, // 30 days
      },
      deletionDate: {
        type: Date,
      },
    },
    auditTrail: [
      {
        action: {
          type: String,
          required: true,
          enum: [
            'created',
            'submitted',
            'reviewed',
            'approved',
            'rejected',
            'modified',
            'data_shared',
            'completed',
            'terminated',
          ],
        },
        performedBy: {
          type: String,
          required: true,
        },
        performedByRole: {
          type: String,
          required: true,
          enum: ['banker', 'auditor', 'manager', 'admin'],
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        details: {
          type: String,
          required: true,
          maxlength: 500,
        },
      },
    ],
    currentAgent: {
      type: Number,
      required: true,
      default: 0,
    },
    completedAgents: [
      {
        type: Number,
      },
    ],
    logs: [
      {
        id: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
          maxlength: 500,
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        agentId: {
          type: Number,
        },
        level: {
          type: String,
          required: true,
          enum: ['info', 'warning', 'error'],
          default: 'info',
        },
      },
    ],
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
dataRequestSchema.index({ status: 1, createdAt: -1 });
dataRequestSchema.index({ thirdParty: 1, createdAt: -1 });
dataRequestSchema.index({ requestedBy: 1, createdAt: -1 });
dataRequestSchema.index({ approvedBy: 1, createdAt: -1 });
dataRequestSchema.index({ requestType: 1, createdAt: -1 });
dataRequestSchema.index({ 'privacyImpact.riskLevel': 1, createdAt: -1 });

// Compound indexes for common queries
dataRequestSchema.index({ status: 1, requestedByRole: 1, createdAt: -1 });
dataRequestSchema.index({ thirdParty: 1, status: 1, createdAt: -1 });
dataRequestSchema.index({
  'privacyImpact.riskLevel': 1,
  status: 1,
  createdAt: -1,
});

// TTL index to automatically delete old requests (keep for 5 years for compliance)
dataRequestSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 5 * 365 * 24 * 60 * 60 }
);

// Pre-save middleware to add audit trail entry
dataRequestSchema.pre('save', function (next) {
  if (this.isNew) {
    this.auditTrail.push({
      action: 'created',
      performedBy: this.requestedBy,
      performedByRole: this.requestedByRole,
      timestamp: new Date(),
      details: 'Data request created',
    });
  } else if (this.isModified('status')) {
    this.auditTrail.push({
      action: this.status,
      performedBy: this.approvedBy || this.requestedBy,
      performedByRole: this.approvedByRole || this.requestedByRole,
      timestamp: new Date(),
      details: `Request status changed to ${this.status}`,
    });
  }
  next();
});

export default mongoose.models.DataRequest ||
  mongoose.model<IDataRequest>('DataRequest', dataRequestSchema);
