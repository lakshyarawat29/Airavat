# Airavat User Dashboard

A secure fintech data protection platform with JWT authentication and multi-agent architecture.

## Features

- 🔐 JWT Token Authentication with MongoDB
- 👤 User Registration & Management
- 🌙 Dark/Light Theme Toggle
- 🛡️ Multi-Agent Security Architecture
- 📊 Consent Management Interface with Database Storage
- 🔗 Blockchain Transparency
- 🔒 Zero-Knowledge Proofs Demo
- 📄 PDF File Access Control

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   JWT_SECRET=airavat-super-secret-jwt-key-change-in-production-2025
   MONGODB_URI=mongodb+srv://lakshyarawatiitjee:<db_password>@cluster0.mi9jv8m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

   **Important:** Replace `<db_password>` with your actual MongoDB Atlas password.

3. **MongoDB Setup**

   - Using MongoDB Atlas (cloud database)
   - Connection string is already configured in the environment variables
   - No local MongoDB installation required

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to the login page

## User Management

### Registration

- Visit `/register` to create a new account
- Users get a unique `userID` automatically generated
- Default consent preferences are created for each user

### Login Credentials

**Demo Account:**

- **Email:** `user@airavat.com`
- **Password:** `password`

_Note: You can register new accounts or use the demo account_

### Test User Creation

To create a test user with default consent preferences:

```bash
npm run create-test-user
```

This script will:

- Create a test user if it doesn't exist
- Set up default consent preferences (all levels set to 'Minimal', all purposes set to false)
- Display the user credentials for login

## Security Features

- HTTP-only cookies for JWT storage
- Password hashing with bcrypt
- Route protection with middleware
- Automatic token validation
- Secure logout functionality

## Architecture

The application uses:

- **Next.js 15** with App Router
- **MongoDB** with Mongoose for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Tailwind CSS** for styling
- **Radix UI** components
- **Lucide React** icons

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/consent-preferences` - Get user consent preferences
- `POST /api/consent-preferences` - Save user consent preferences

## Consent Preferences

The application includes a consent management system that allows users to control their data sharing preferences:

### Data Sharing Levels (Enums)

- **Transaction Data**: `Minimal` | `Moderate` | `Full`
- **Account Details**: `Minimal` | `Moderate` | `Full`
- **Personal Information**: `Minimal` | `Moderate` | `Full`

### Additional Settings

- **Time Limit**: How long data can be accessed (1-365 days)
- **Purposes**: Boolean flags for different use cases:
  - `loanProcessing`: false (default)
  - `fraudDetection`: false (default)
  - `creditScoring`: false (default)
  - `marketing`: false (default)
- **Additional Notes**: Text field for user comments and specific requirements (empty by default)

### Default Values

- All data sharing levels default to `Minimal`
- All purpose flags default to `false`
- Time limit defaults to 30 days
- Additional notes default to empty string

Consent preferences are stored in MongoDB and linked to the user's unique userID. When a user logs in for the first time, default preferences are created. Users can modify these preferences through the dashboard interface.

## Multi-Agent System

The platform features 6 specialized AI agents:

1. **VRA** - Vigilant Risk Analyzer
2. **RBA** - Request Brainiac Agent
3. **TMA** - Task Maestro Agent
4. **BBA** - Blockchain Builder Ace
5. **ZKBA** - Zero-Knowledge Builder Ace
6. **OCA** - Orchestration Control Agent

## Team

Built by Team Airavat for SuRaksha Hackathon 2025:

- Lakshya Rawat - Project Lead & Blockchain Developer
- Abhinav Singh - Agentic AI Developer
- Akhil Murarka - AI Developer
- Ayush Bansal - Zero Knowledge Expert and Cyber Security Developer
