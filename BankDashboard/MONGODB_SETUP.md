# MongoDB Atlas Setup for Dynamic Dashboard

## Environment Variables

Create a `.env.local` file in the BankDashboard directory with the following variables:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mydatabase?retryWrites=true&w=majority

# Database Names
MONGODB_DATABASE=mydatabase
MONGODB_TEST_DATABASE=test

# Application Settings
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Database Collections

### 1. mydatabase Database

**Collection: userRequests**
This collection stores data requests with the following structure:

```json
{
  "_id": ObjectId("..."),
  "requestId": "REQ_123456789",
  "status": "pending|in-progress|approved|rejected|completed|terminated",
  "thirdParty": "Company Name",
  "requestType": "credit_check|fraud_detection|compliance_report",
  "userId": "USER_123",
  "dataTypes": ["personal_info", "financial_data"],
  "purpose": "Request purpose description",
  "requestedBy": "employee@bank.com",
  "requestedByRole": "banker|auditor|manager|admin",
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00Z")
}
```

### 2. test Database

**Collection: employees**
This collection stores employee information:

```json
{
  "_id": ObjectId("..."),
  "name": "Employee Name",
  "email": "employee@bank.com",
  "role": "banker|auditor|manager|admin",
  "department": "IT|HR|Finance|Operations",
  "status": "active|inactive|suspended",
  "permissions": ["view_live_feed", "send_mail"],
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00Z")
}
```

## Dashboard Statistics Logic

The dynamic dashboard fetches the following statistics:

1. **Active Requests**: Total count of all documents in `userRequest` collection
2. **Completed Today**: Count of documents with `status: "completed"` and `updatedAt` from today
3. **Pending Reviews**: Count of documents with `status` not equal to "completed"
4. **Team Members**: Count of documents in `employees` collection with `status: "active"`

## Sample Data

You can insert sample data using MongoDB Compass or the MongoDB shell:

### Insert Sample Data Requests

```javascript
// Connect to mydatabase
use mydatabase

// Insert sample userRequests documents
db.userRequests.insertMany([
  {
    requestId: "REQ_001",
    status: "pending",
    thirdParty: "Credit Bureau",
    requestType: "credit_check",
    userId: "USER_001",
    dataTypes: ["personal_info", "financial_data"],
    purpose: "Credit assessment",
    requestedBy: "banker@bank.com",
    requestedByRole: "banker",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    requestId: "REQ_002",
    status: "completed",
    thirdParty: "Fraud Detection",
    requestType: "fraud_detection",
    userId: "USER_002",
    dataTypes: ["transaction_history"],
    purpose: "Fraud analysis",
    requestedBy: "auditor@bank.com",
    requestedByRole: "auditor",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    requestId: "REQ_003",
    status: "in-progress",
    thirdParty: "Compliance Agency",
    requestType: "compliance_report",
    userId: "USER_003",
    dataTypes: ["account_details"],
    purpose: "Regulatory compliance",
    requestedBy: "manager@bank.com",
    requestedByRole: "manager",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### Insert Sample Employees

```javascript
// Connect to test database
use test

// Insert sample employees
db.employees.insertMany([
  {
    name: "John Banker",
    email: "john@bank.com",
    role: "banker",
    department: "Customer Service",
    status: "active",
    permissions: ["view_live_feed", "send_mail"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sarah Auditor",
    email: "sarah@bank.com",
    role: "auditor",
    department: "Compliance",
    status: "active",
    permissions: ["view_analytics", "view_audit_logs"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mike Manager",
    email: "mike@bank.com",
    role: "manager",
    department: "Operations",
    status: "active",
    permissions: ["view_live_feed", "manage_team", "approve_requests"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Running the Application

1. Set up your environment variables in `.env.local`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the dashboard at `http://localhost:3000/dashboard`

The dashboard will now show dynamic statistics fetched from your MongoDB Atlas database!
