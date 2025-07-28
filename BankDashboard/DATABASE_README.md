# Bank Dashboard Database Schema

## Overview

This document describes the MongoDB collections and schemas used in the Bank Dashboard RBAC system. The database is designed for fintech privacy and security compliance with comprehensive audit trails and role-based access control.

## 🗄️ Collections

### 1. **employees** Collection

**Purpose**: Store employee information with role-based permissions and OTP authentication.

**Schema**: `models/Employee.ts`

**Key Fields**:

- `employeeId`: Unique identifier (EMP_timestamp_random)
- `email`: Employee email (unique, indexed)
- `name`: Employee full name
- `role`: Employee role (banker, auditor, manager, admin)
- `department`: Department assignment
- `permissions`: Array of role-based permissions
- `status`: Account status (active, inactive, suspended)
- `otpSecret`: Temporary OTP for authentication
- `otpExpiry`: OTP expiration timestamp
- `loginAttempts`: Failed login attempt counter
- `lockUntil`: Account lockout timestamp

**Indexes**:

```javascript
{
  email: 1;
}
{
  role: 1;
}
{
  department: 1;
}
{
  status: 1;
}
```

**Sample Document**:

```json
{
  "_id": ObjectId("..."),
  "employeeId": "EMP_1705123456789_abc123def",
  "email": "banker@bank.com",
  "name": "John Banker",
  "role": "banker",
  "department": "Customer Service",
  "permissions": ["view_live_feed", "send_mail", "view_own_requests"],
  "status": "active",
  "lastLogin": ISODate("2024-01-15T10:30:00Z"),
  "loginAttempts": 0,
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 2. **auditlogs** Collection

**Purpose**: Comprehensive audit trail for all system activities and data access.

**Schema**: `models/AuditLog.ts`

**Key Fields**:

- `logId`: Unique log identifier (LOG_timestamp_random)
- `timestamp`: Action timestamp
- `userId`: User who performed the action
- `userEmail`: User email
- `userRole`: User role at time of action
- `action`: Type of action performed
- `resource`: Resource being accessed/modified
- `resourceType`: Type of resource
- `details`: Detailed action information
- `ipAddress`: IP address of user
- `userAgent`: Browser/user agent information
- `riskLevel`: Risk assessment (low, medium, high, critical)
- `status`: Action status (success, failure, pending)

**Indexes**:

```javascript
{ timestamp: -1 }
{ userId: 1, timestamp: -1 }
{ action: 1, timestamp: -1 }
{ resourceType: 1, timestamp: -1 }
{ riskLevel: 1, timestamp: -1 }
{ userRole: 1, timestamp: -1 }
{ userId: 1, action: 1, timestamp: -1 }
{ resourceType: 1, riskLevel: 1, timestamp: -1 }
{ userRole: 1, action: 1, timestamp: -1 }
// TTL index: expires after 7 years
{ timestamp: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 }
```

**Sample Document**:

```json
{
  "_id": ObjectId("..."),
  "logId": "LOG_1705123456789_xyz789abc",
  "timestamp": ISODate("2024-01-15T10:30:00Z"),
  "userId": "EMP_1",
  "userEmail": "banker@bank.com",
  "userRole": "banker",
  "action": "login",
  "resource": "bank_dashboard",
  "resourceType": "system_config",
  "details": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "sessionId": "session_123",
  "riskLevel": "low",
  "status": "success",
  "metadata": { "loginMethod": "otp" },
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 3. **privacymetrics** Collection

**Purpose**: Track privacy compliance metrics and KPIs.

**Schema**: `models/PrivacyMetric.ts`

**Key Fields**:

- `metricId`: Unique metric identifier (METRIC_timestamp_random)
- `timestamp`: Metric calculation timestamp
- `metricType`: Type of privacy metric
- `value`: Metric value (0-100)
- `unit`: Unit of measurement (percentage, score, count, risk_level)
- `description`: Metric description
- `category`: Metric category (compliance, consent, data_access, security, risk)
- `trend`: Metric trend (increasing, decreasing, stable)
- `threshold`: Threshold values for status calculation
- `status`: Calculated status (good, warning, critical)

**Indexes**:

```javascript
{ metricType: 1, timestamp: -1 }
{ category: 1, timestamp: -1 }
{ status: 1, timestamp: -1 }
{ department: 1, timestamp: -1 }
{ userRole: 1, timestamp: -1 }
{ metricType: 1, status: 1, timestamp: -1 }
{ category: 1, status: 1, timestamp: -1 }
{ department: 1, category: 1, timestamp: -1 }
// TTL index: expires after 2 years
{ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }
```

**Sample Document**:

```json
{
  "_id": ObjectId("..."),
  "metricId": "METRIC_1705123456789_def456ghi",
  "timestamp": ISODate("2024-01-15T10:00:00Z"),
  "metricType": "data_access_compliance",
  "value": 94.2,
  "unit": "percentage",
  "description": "Percentage of data access requests that comply with privacy policies",
  "category": "compliance",
  "trend": "increasing",
  "threshold": {
    "min": 0,
    "max": 100,
    "warning": 70,
    "critical": 50
  },
  "status": "good",
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00Z")
}
```

### 4. **systemconfigs** Collection

**Purpose**: Store system configuration settings with version control.

**Schema**: `models/SystemConfig.ts`

**Key Fields**:

- `configId`: Unique config identifier (CONFIG_timestamp_random)
- `key`: Configuration key (uppercase with underscores)
- `value`: Configuration value
- `type`: Value type (string, number, boolean, json)
- `category`: Config category (security, privacy, general, email, session)
- `description`: Configuration description
- `isActive`: Whether config is active
- `isSensitive`: Whether config contains sensitive data
- `defaultValue`: Default configuration value
- `validation`: Validation rules
- `lastModifiedBy`: User who last modified
- `version`: Configuration version number

**Indexes**:

```javascript
{ key: 1 }
{ category: 1, isActive: 1 }
{ lastModifiedBy: 1, lastModifiedAt: -1 }
```

**Sample Document**:

```json
{
  "_id": ObjectId("..."),
  "configId": "CONFIG_1705123456789_jkl789mno",
  "key": "SESSION_TIMEOUT",
  "value": 30,
  "type": "number",
  "category": "security",
  "description": "Session timeout in minutes",
  "isActive": true,
  "isSensitive": false,
  "defaultValue": 30,
  "validation": {
    "min": 5,
    "max": 120
  },
  "lastModifiedBy": "admin@bank.com",
  "lastModifiedAt": ISODate("2024-01-15T10:00:00Z"),
  "version": 1,
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00Z")
}
```

### 5. **datarequests** Collection

**Purpose**: Track third-party data requests with privacy impact assessment.

**Schema**: `models/DataRequest.ts`

**Key Fields**:

- `requestId`: Unique request identifier (REQ_timestamp_random)
- `thirdParty`: Third-party requesting data
- `requestType`: Type of request
- `userId`: User whose data is requested
- `status`: Request status
- `dataTypes`: Types of data requested
- `purpose`: Purpose of data request
- `requestedBy`: Employee who made request
- `approvedBy`: Employee who approved request
- `dataScope`: Scope of data being shared
- `privacyImpact`: Privacy impact assessment
- `consentStatus`: User consent status
- `dataSharing`: Data sharing configuration
- `auditTrail`: Complete audit trail of request
- `currentAgent`: Current processing agent
- `completedAgents`: Completed processing agents
- `logs`: Processing logs

**Indexes**:

```javascript
{ status: 1, createdAt: -1 }
{ thirdParty: 1, createdAt: -1 }
{ requestedBy: 1, createdAt: -1 }
{ approvedBy: 1, createdAt: -1 }
{ requestType: 1, createdAt: -1 }
{ "privacyImpact.riskLevel": 1, createdAt: -1 }
{ status: 1, requestedByRole: 1, createdAt: -1 }
{ thirdParty: 1, status: 1, createdAt: -1 }
{ "privacyImpact.riskLevel": 1, status: 1, createdAt: -1 }
// TTL index: expires after 5 years
{ createdAt: 1 }, { expireAfterSeconds: 5 * 365 * 24 * 60 * 60 }
```

**Sample Document**:

```json
{
  "_id": ObjectId("..."),
  "requestId": "REQ_1705123456789_pqr123stu",
  "thirdParty": "Credit Bureau",
  "requestType": "credit_check",
  "userId": "USER_123456789",
  "status": "in-progress",
  "dataTypes": ["personal_info", "financial_data"],
  "purpose": "Credit assessment for loan application",
  "requestedBy": "banker@bank.com",
  "requestedByRole": "banker",
  "dataScope": {
    "startDate": ISODate("2024-01-01T00:00:00Z"),
    "endDate": ISODate("2024-01-15T00:00:00Z"),
    "fields": ["name", "email", "account_balance", "transaction_history"],
    "records": 1
  },
  "privacyImpact": {
    "riskLevel": "low",
    "impactAssessment": "Minimal risk - only basic financial data shared",
    "mitigationMeasures": ["Data encryption", "Limited access scope"]
  },
  "consentStatus": {
    "hasConsent": true,
    "consentDate": ISODate("2024-01-10T00:00:00Z"),
    "consentMethod": "explicit"
  },
  "dataSharing": {
    "method": "api",
    "encryption": true,
    "retentionPeriod": 30
  },
  "currentAgent": 3,
  "completedAgents": [1, 2],
  "auditTrail": [...],
  "logs": [...],
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:10:00Z")
}
```

## 🔧 Database Operations

### Seeding the Database

```bash
# Install dependencies
npm install

# Seed the database with initial data
npm run seed

# Seed in development mode
npm run seed:dev
```

### Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/bank-dashboard
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bank-dashboard
```

### Database Connection

```typescript
import connectDB from '@/lib/mongodb';

// Connect to database
await connectDB();
```

## 📊 Data Relationships

### Role-Based Access Control Flow

1. **Employee Login** → `employees` collection
2. **OTP Validation** → `employees.otpSecret` and `employees.otpExpiry`
3. **Permission Check** → `employees.permissions` array
4. **Action Logging** → `auditlogs` collection
5. **Privacy Metrics** → `privacymetrics` collection

### Data Request Flow

1. **Request Creation** → `datarequests` collection
2. **Privacy Assessment** → `datarequests.privacyImpact`
3. **Consent Verification** → `datarequests.consentStatus`
4. **Approval Process** → `datarequests.auditTrail`
5. **Data Sharing** → `datarequests.dataSharing`
6. **Audit Logging** → `auditlogs` collection

## 🛡️ Security Features

### Data Protection

- **Encryption**: Sensitive data encrypted at rest
- **Access Control**: Role-based permissions
- **Audit Trails**: Complete action logging
- **TTL Indexes**: Automatic data expiration
- **Validation**: Schema-level data validation

### Compliance Features

- **GDPR Compliance**: Data retention and deletion
- **DPDP Act**: Indian data protection compliance
- **Audit Logging**: 7-year retention for compliance
- **Consent Management**: Explicit consent tracking
- **Privacy Impact Assessment**: Risk evaluation

## 🔍 Query Examples

### Get Active Employees by Role

```javascript
const bankers = await Employee.find({
  role: 'banker',
  status: 'active',
});
```

### Get Recent Audit Logs

```javascript
const recentLogs = await AuditLog.find({
  timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
}).sort({ timestamp: -1 });
```

### Get Privacy Metrics by Category

```javascript
const complianceMetrics = await PrivacyMetric.find({
  category: 'compliance',
  timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
});
```

### Get Pending Data Requests

```javascript
const pendingRequests = await DataRequest.find({
  status: 'pending',
}).populate('requestedBy', 'name email');
```

## 📈 Performance Optimization

### Index Strategy

- **Single Field Indexes**: For frequently queried fields
- **Compound Indexes**: For complex queries
- **TTL Indexes**: For automatic data cleanup
- **Text Indexes**: For search functionality

### Query Optimization

- **Projection**: Select only needed fields
- **Limit**: Limit result sets
- **Skip**: For pagination
- **Sort**: Use indexed fields for sorting

## 🔄 Backup and Recovery

### Backup Strategy

```bash
# MongoDB dump
mongodump --uri="mongodb://localhost:27017/bank-dashboard" --out=./backup

# MongoDB restore
mongorestore --uri="mongodb://localhost:27017/bank-dashboard" ./backup
```

### Data Retention

- **Audit Logs**: 7 years (compliance requirement)
- **Privacy Metrics**: 2 years
- **Data Requests**: 5 years
- **System Configs**: Indefinite
- **Employees**: Indefinite (until deactivated)

This database schema provides a robust foundation for fintech privacy and security compliance, with comprehensive audit trails and role-based access control. 🏆
