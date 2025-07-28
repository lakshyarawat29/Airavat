import mongoose from 'mongoose';

export interface ISystemConfig extends mongoose.Document {
  configId: string;
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'security' | 'privacy' | 'general' | 'email' | 'session';
  description: string;
  isActive: boolean;
  isSensitive: boolean;
  defaultValue: string | number | boolean;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  lastModifiedBy: string;
  lastModifiedAt: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const systemConfigSchema = new mongoose.Schema<ISystemConfig>(
  {
    configId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `CONFIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z_]+$/,
        'Key must contain only uppercase letters and underscores',
      ],
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'json'],
      default: 'string',
    },
    category: {
      type: String,
      required: true,
      enum: ['security', 'privacy', 'general', 'email', 'session'],
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    isSensitive: {
      type: Boolean,
      required: true,
      default: false,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    validation: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      pattern: {
        type: String,
      },
      enum: [
        {
          type: String,
        },
      ],
    },
    lastModifiedBy: {
      type: String,
      required: true,
      index: true,
    },
    lastModifiedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
systemConfigSchema.index({ key: 1 });
systemConfigSchema.index({ category: 1, isActive: 1 });
systemConfigSchema.index({ lastModifiedBy: 1, lastModifiedAt: -1 });

// Pre-save middleware to increment version and update lastModifiedAt
systemConfigSchema.pre('save', function (next) {
  if (this.isModified('value') || this.isModified('isActive')) {
    this.version += 1;
    this.lastModifiedAt = new Date();
  }
  next();
});

// Static method to get configuration by key
systemConfigSchema.statics.getConfig = async function (key: string) {
  const config = await this.findOne({ key, isActive: true });
  return config ? config.value : null;
};

// Static method to set configuration
systemConfigSchema.statics.setConfig = async function (
  key: string,
  value: any,
  modifiedBy: string
) {
  const config = await this.findOne({ key });

  if (config) {
    config.value = value;
    config.lastModifiedBy = modifiedBy;
    await config.save();
  } else {
    throw new Error(`Configuration key '${key}' not found`);
  }

  return config;
};

// Static method to get all active configurations by category
systemConfigSchema.statics.getConfigsByCategory = async function (
  category: string
) {
  return await this.find({ category, isActive: true }).select('-isSensitive');
};

export default mongoose.models.SystemConfig ||
  mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
