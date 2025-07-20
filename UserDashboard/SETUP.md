# 🚀 Airavat UserDashboard Setup Guide

## Quick Setup with MongoDB Atlas

### 1. Create Environment File

Create a `.env.local` file in the root directory with the following content:

```env
JWT_SECRET=airavat-super-secret-jwt-key-change-in-production-2025
MONGODB_URI=mongodb+srv://lakshyarawatiitjee:<db_password>@cluster0.mi9jv8m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ Important:** Replace `<db_password>` with your actual MongoDB Atlas password.

### 2. Test Database Connection

Before starting the application, test your MongoDB connection:

```bash
npm run test-db
```

You should see:

```
✅ Successfully connected to MongoDB Atlas!
📊 Available collections: []
✅ Connection test completed successfully
```

### 3. Start the Application

```bash
npm run dev
```

### 4. Access the Application

- **Main App:** http://localhost:3000
- **Registration:** http://localhost:3000/register
- **Login:** http://localhost:3000/login

### 5. Create Your First User

1. Go to http://localhost:3000/register
2. Fill in your details:
   - Name: Your full name
   - Email: Your email address
   - Password: Choose a secure password
3. Click "Create Account"
4. You'll be redirected to login
5. Login with your credentials

### 6. Database Collections

The application will automatically create these collections in your MongoDB Atlas database:

- **users** - User accounts with unique userIDs
- **consentpreferences** - User consent settings

### 7. Features Available

✅ **User Registration & Login**
✅ **JWT Authentication**
✅ **Consent Preferences Management**
✅ **Database Persistence**
✅ **Multi-Agent Dashboard**
✅ **Theme Toggle**
✅ **Responsive Design**

### Troubleshooting

**Connection Issues:**

- Verify your MongoDB Atlas password is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure the connection string is properly formatted

**Authentication Issues:**

- Clear browser cookies if you encounter login loops
- Check browser console for error messages

**Database Issues:**

- Run `npm run test-db` to verify connection
- Check MongoDB Atlas dashboard for any errors

---

**🎉 You're all set! Your Airavat UserDashboard is now connected to MongoDB Atlas and ready to use!**
