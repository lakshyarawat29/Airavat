# Dynamic Dashboard Implementation

## Overview

The Bank Dashboard now features dynamic statistics panels that fetch real-time data from MongoDB Atlas. The dashboard displays four key metrics:

1. **Active Requests** - Total count of all data requests
2. **Completed Today** - Count of requests completed today
3. **Team Members** - Count of active team members
4. **Pending Reviews** - Count of requests awaiting review

## 🚀 Features

### Dynamic Data Fetching

- Real-time statistics from MongoDB Atlas
- Automatic loading states with spinners
- Error handling with user-friendly messages
- Manual refresh capability

### Database Integration

- **mydatabase** - Contains `userRequest` collection for data requests
- **test** - Contains `employees` collection for team member data
- Robust error handling for each database operation

### User Experience

- Loading indicators while fetching data
- Error states with clear messaging
- Refresh button to manually update statistics
- Responsive design for all screen sizes

## 📁 Files Modified/Created

### New Files

- `app/api/dashboard-stats/route.ts` - API endpoint for fetching statistics
- `hooks/use-dashboard-stats.ts` - Custom hook for data fetching
- `scripts/test-dashboard-stats.js` - Test script for database connection
- `MONGODB_SETUP.md` - Database setup guide
- `DYNAMIC_DASHBOARD_README.md` - This documentation

### Modified Files

- `app/dashboard/page.tsx` - Updated to use dynamic data
- `package.json` - Added test script

## 🗄️ Database Schema

### userRequests Collection (mydatabase)

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

### employees Collection (test)

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

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the BankDashboard directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mydatabase?retryWrites=true&w=majority
MONGODB_DATABASE=mydatabase
MONGODB_TEST_DATABASE=test
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Database Setup

Follow the instructions in `MONGODB_SETUP.md` to:

- Set up your MongoDB Atlas cluster
- Create the required collections
- Insert sample data

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Test the Implementation

```bash
npm run test:stats
```

## 📊 Dashboard Statistics Logic

### Active Requests

- **Query**: `db.userRequests.countDocuments()`
- **Description**: Total count of all documents in the userRequests collection

### Completed Today

- **Query**:
  ```javascript
  db.userRequests.countDocuments({
    status: 'completed',
    updatedAt: { $gte: today },
  });
  ```
- **Description**: Count of requests with status "completed" and updated today

### Pending Reviews

- **Query**:
  ```javascript
  db.userRequests.countDocuments({
    status: { $ne: 'completed' },
  });
  ```
- **Description**: Count of all requests except those with status "completed"

### Team Members

- **Query**:
  ```javascript
  db.employees.countDocuments({
    status: 'active',
  });
  ```
- **Description**: Count of active employees in the test database

## 🎨 UI Components

### Loading States

- Spinner animation with `Loader2` icon
- "Loading..." text for user feedback
- Disabled refresh button during loading

### Error States

- Red error text for failed data fetching
- Graceful fallback to "0" for missing data
- Console logging for debugging

### Success States

- Large, bold numbers displaying statistics
- Color-coded icons for each metric
- Responsive grid layout

## 🔄 API Endpoint

### GET /api/dashboard-stats

Returns JSON with the following structure:

```json
{
  "activeRequests": 24,
  "completedToday": 12,
  "pendingReviews": 5,
  "teamMembers": 8
}
```

### Error Response

```json
{
  "error": "Failed to fetch dashboard statistics"
}
```

## 🧪 Testing

### Manual Testing

1. Start the development server: `npm run dev`
2. Navigate to `/dashboard`
3. Verify loading states appear
4. Check that statistics display correctly
5. Test the refresh button functionality

### Automated Testing

Run the test script to verify database connectivity:

```bash
npm run test:stats
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**

   - Verify MONGODB_URI is correct
   - Check network connectivity
   - Ensure MongoDB Atlas cluster is accessible

2. **Empty Statistics**

   - Verify collections exist in the correct databases
   - Check that sample data has been inserted
   - Confirm collection names match exactly

3. **API Errors**
   - Check browser console for error messages
   - Verify the development server is running
   - Ensure environment variables are set correctly

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API endpoint returns data: `http://localhost:3000/api/dashboard-stats`
3. Test database connection with the test script
4. Verify environment variables are loaded correctly

## 🚀 Performance Considerations

- Database queries are optimized with proper indexes
- Error handling prevents single failures from breaking the entire dashboard
- Loading states provide immediate user feedback
- Manual refresh allows users to get latest data when needed

## 🔮 Future Enhancements

- Real-time updates using WebSockets
- Caching for improved performance
- More detailed statistics and charts
- Export functionality for reports
- Historical data tracking

---

The dynamic dashboard is now fully functional and ready for production use! 🎉
