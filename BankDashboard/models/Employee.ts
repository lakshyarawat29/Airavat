import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  role: 'banker' | 'auditor' | 'manager' | 'admin';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil?: Date;
  passwordHash?: string;
  otpSecret?: string;
  otpExpiry?: Date;

  // Methods
  updateLastLogin(): Promise<IEmployee>;
  incrementLoginAttempts(): Promise<IEmployee>;
  resetLoginAttempts(): Promise<IEmployee>;
  isAccountLocked(): boolean;
  generateOTP(): Promise<string>;
  validateOTP(otp: string): Promise<boolean>;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['banker', 'auditor', 'manager', 'admin'],
        message: 'Role must be one of: banker, auditor, manager, admin',
      },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [50, 'Department cannot exceed 50 characters'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: 'Status must be one of: active, inactive, suspended',
      },
      default: 'active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    otpSecret: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ role: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ lastLogin: -1 });

// Pre-save middleware to automatically assign permissions based on role
EmployeeSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    const rolePermissions = {
      banker: ['view_live_feed', 'send_mail', 'view_own_requests'],
      auditor: ['view_analytics', 'view_audit_logs', 'generate_reports'],
      manager: [
        'view_live_feed',
        'send_mail',
        'view_analytics',
        'manage_team',
        'approve_requests',
      ],
      admin: [
        'view_live_feed',
        'send_mail',
        'view_analytics',
        'manage_users',
        'system_config',
        'view_all_logs',
        'manage_roles',
      ],
    };

    this.permissions = rolePermissions[this.role] || [];
  }
  next();
});

// Method to update last login
EmployeeSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Method to increment login attempts
EmployeeSchema.methods.incrementLoginAttempts = function () {
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  return this.save();
};

// Method to reset login attempts
EmployeeSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = null;
  return this.save();
};

// Method to check if account is locked
EmployeeSchema.methods.isAccountLocked = function () {
  if (!this.isLocked) return false;

  if (this.lockUntil && this.lockUntil > new Date()) {
    return true; // Still locked
  } else {
    // Lock expired, reset
    this.isLocked = false;
    this.lockUntil = null;
    this.save();
    return false;
  }
};

// Method to generate OTP
EmployeeSchema.methods.generateOTP = function () {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpSecret = otp;
  this.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  return this.save().then(() => otp);
};

// Method to validate OTP
EmployeeSchema.methods.validateOTP = async function (otp: string) {
  if (!this.otpSecret || !this.otpExpiry) {
    return false;
  }

  if (new Date() > this.otpExpiry) {
    // OTP expired, clear it
    this.otpSecret = null;
    this.otpExpiry = null;
    await this.save();
    return false;
  }

  if (this.otpSecret === otp) {
    // Valid OTP, clear it after use
    this.otpSecret = null;
    this.otpExpiry = null;
    this.lastLogin = new Date();
    await this.resetLoginAttempts();
    return true;
  }

  return false;
};

// Static method to find by email
EmployeeSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get employees by role
EmployeeSchema.statics.findByRole = function (role: string) {
  return this.find({ role });
};

// Static method to get active employees
EmployeeSchema.statics.findActive = function () {
  return this.find({ status: 'active' });
};

// Static methods interface
export interface IEmployeeModel extends mongoose.Model<IEmployee> {
  findByEmail(email: string): Promise<IEmployee | null>;
  findByRole(role: string): Promise<IEmployee[]>;
  findActive(): Promise<IEmployee[]>;
}

export default mongoose.models.Employee ||
  mongoose.model<IEmployee, IEmployeeModel>('Employee', EmployeeSchema);
