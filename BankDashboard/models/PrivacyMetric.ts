import mongoose from 'mongoose';

export interface IPrivacyMetric extends mongoose.Document {
  metricId: string;
  timestamp: Date;
  metricType: string;
  value: number;
  unit: string;
  description: string;
  category: 'compliance' | 'consent' | 'data_access' | 'security' | 'risk';
  department?: string;
  userId?: string;
  userRole?: string;
  metadata: Record<string, any>;
  trend: 'increasing' | 'decreasing' | 'stable';
  threshold: {
    min: number;
    max: number;
    warning: number;
    critical: number;
  };
  status: 'good' | 'warning' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const privacyMetricSchema = new mongoose.Schema<IPrivacyMetric>(
  {
    metricId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `METRIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    metricType: {
      type: String,
      required: true,
      enum: [
        'data_access_compliance',
        'consent_rate',
        'privacy_score',
        'data_breach_risk',
        'gdpr_compliance',
        'dpdp_compliance',
        'data_minimization_score',
        'consent_management_score',
        'audit_trail_completeness',
        'third_party_data_sharing',
        'data_retention_compliance',
        'user_rights_fulfillment',
        'anomaly_detection_score',
        'privacy_impact_assessment',
        'data_protection_officer_review',
      ],
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    unit: {
      type: String,
      required: true,
      enum: ['percentage', 'score', 'count', 'risk_level'],
      default: 'percentage',
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: ['compliance', 'consent', 'data_access', 'security', 'risk'],
      index: true,
    },
    department: {
      type: String,
      enum: [
        'Customer Service',
        'Compliance',
        'Operations',
        'IT',
        'Risk Management',
        'Legal',
      ],
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['banker', 'auditor', 'manager', 'admin'],
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    trend: {
      type: String,
      required: true,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable',
    },
    threshold: {
      min: {
        type: Number,
        required: true,
        default: 0,
      },
      max: {
        type: Number,
        required: true,
        default: 100,
      },
      warning: {
        type: Number,
        required: true,
        default: 70,
      },
      critical: {
        type: Number,
        required: true,
        default: 50,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['good', 'warning', 'critical'],
      default: 'good',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
privacyMetricSchema.index({ metricType: 1, timestamp: -1 });
privacyMetricSchema.index({ category: 1, timestamp: -1 });
privacyMetricSchema.index({ status: 1, timestamp: -1 });
privacyMetricSchema.index({ department: 1, timestamp: -1 });
privacyMetricSchema.index({ userRole: 1, timestamp: -1 });

// Compound indexes for common queries
privacyMetricSchema.index({ metricType: 1, status: 1, timestamp: -1 });
privacyMetricSchema.index({ category: 1, status: 1, timestamp: -1 });
privacyMetricSchema.index({ department: 1, category: 1, timestamp: -1 });

// TTL index to automatically delete old metrics (keep for 2 years)
privacyMetricSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }
);

// Pre-save middleware to calculate status based on value and thresholds
privacyMetricSchema.pre('save', function (next) {
  if (this.isModified('value')) {
    if (this.value >= this.threshold.warning) {
      this.status = 'good';
    } else if (this.value >= this.threshold.critical) {
      this.status = 'warning';
    } else {
      this.status = 'critical';
    }
  }
  next();
});

export default mongoose.models.PrivacyMetric ||
  mongoose.model<IPrivacyMetric>('PrivacyMetric', privacyMetricSchema);
