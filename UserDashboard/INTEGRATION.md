# AuditingLogs Integration with UserDashboard

This document explains how the UserDashboard integrates with the AuditingLogs blockchain API to display real-time audit logs for users.

## Overview

The integration allows users to view their blockchain audit logs directly in the UserDashboard interface. The logs are fetched from the AuditingLogs smart contract deployed on Sepolia testnet and filtered by the user's unique userID.

## Architecture

```
UserDashboard (Port 3001) → API Route → AuditingLogs Backend (Port 3000) → Sepolia Blockchain
```

## Components

### 1. API Route (`/app/api/blockchain-logs/route.ts`)

- Authenticates users using JWT tokens from cookies
- Fetches logs from AuditingLogs API filtered by userID
- Transforms blockchain data to match frontend interface
- Handles error cases and authentication failures

### 2. Custom Hook (`/hooks/use-blockchain-logs.ts`)

- Manages state for logs, loading, and error states
- Handles API calls with proper error handling
- Provides refetch functionality for data updates

### 3. UI Component (`/components/blockchain-log-viewer.tsx`)

- Displays blockchain logs in a user-friendly interface
- Provides filtering and search capabilities
- Shows loading and error states
- Displays detailed modal for each log entry

## Data Flow

1. **Authentication**: User logs in and receives JWT token in HTTP-only cookie
2. **Token Verification**: API route verifies token and extracts userID
3. **Blockchain Query**: Fetches logs from AuditingLogs API using userID
4. **Data Transformation**: Maps blockchain data to frontend interface
5. **UI Rendering**: Displays logs with filtering and search capabilities

## Data Mapping

The integration maps blockchain data to the frontend interface:

| Blockchain Field | Frontend Field     | Transformation              |
| ---------------- | ------------------ | --------------------------- |
| `logId`          | `id`               | Convert to string           |
| `organization`   | `thirdParty.name`  | Direct mapping              |
| `dataType`       | `dataType`         | Mapped to frontend types    |
| `purpose`        | `purpose`          | Direct mapping              |
| `status`         | `status`           | Mapped to frontend statuses |
| `userConsent`    | `userConsent`      | Direct mapping              |
| `dataMinimized`  | `dataMinimization` | Direct mapping              |
| `retentionDays`  | `retentionPeriod`  | Direct mapping              |
| `accessLevel`    | `accessLevel`      | Mapped to frontend levels   |
| `zkProofUsed`    | `zkProofUsed`      | Direct mapping              |

## Setup Instructions

### 1. Environment Variables

Add to your UserDashboard environment:

```env
AUDITING_LOGS_API_URL=http://localhost:3000
```

### 2. Start Services

```bash
# Terminal 1: Start AuditingLogs Backend
cd AuditingLogs/backend
node index.js

# Terminal 2: Start UserDashboard
cd UserDashboard
npm run dev
```

### 3. Test Integration

1. Login to UserDashboard with a user account
2. Navigate to the blockchain log viewer
3. Verify that logs are displayed for the authenticated user

## Error Handling

The integration includes comprehensive error handling:

- **Authentication Errors**: Redirects to login if token is invalid
- **API Errors**: Shows user-friendly error messages with retry options
- **Network Errors**: Handles connection issues gracefully
- **Data Errors**: Validates and transforms data safely

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Prevents XSS attacks
- **User Isolation**: Logs are filtered by userID
- **Input Validation**: All inputs are validated and sanitized

## Performance Considerations

- **Caching**: Consider implementing caching for frequently accessed logs
- **Pagination**: For large datasets, implement pagination
- **Real-time Updates**: Consider WebSocket integration for live updates
- **Optimistic Updates**: Implement optimistic UI updates for better UX

## Troubleshooting

### Common Issues

1. **No logs displayed**

   - Check if AuditingLogs API is running
   - Verify user has logs in the blockchain
   - Check authentication token

2. **Authentication errors**

   - Ensure user is logged in
   - Check JWT token expiration
   - Verify cookie settings

3. **API connection errors**
   - Verify AUDITING_LOGS_API_URL is correct
   - Check if AuditingLogs backend is accessible
   - Verify network connectivity

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check authentication token validity
4. Test AuditingLogs API directly
5. Verify userID mapping is correct

## Future Enhancements

- Real-time log updates using WebSockets
- Advanced filtering and analytics
- Export functionality for audit reports
- Integration with additional blockchain networks
- Enhanced privacy controls and consent management
