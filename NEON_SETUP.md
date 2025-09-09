# Neon DB Setup Guide

## 🚀 Quick Setup

### 1. Create Neon DB Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Choose a project name (e.g., "cold-outreach-crm")
5. Select a region close to you

### 2. Get Your Connection String
1. In your Neon dashboard, go to the "Connection Details" section
2. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Configure Environment Variables
1. Open `backend/.env` in your editor
2. Replace the `DATABASE_URL` with your actual Neon connection string:
   ```env
   DATABASE_URL=postgresql://your-username:your-password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 4. Set Up Database Schema
Run the database setup script:
```bash
node setup-database.js
```

This will:
- Test your database connection
- Create all necessary tables and indexes
- Verify everything is working correctly

### 5. Start the Application
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🔧 Troubleshooting

### Connection Issues
- **SSL Error**: Make sure your connection string includes `?sslmode=require`
- **Authentication Failed**: Double-check your username and password
- **Host Not Found**: Verify the hostname in your connection string

### Common Issues
- **"Database does not exist"**: This is normal - Neon will create it automatically
- **"Permission denied"**: Check that your user has the correct permissions
- **"Connection timeout"**: Verify your Neon project is active (not paused)

## 📊 Neon DB Features

### Free Tier Includes:
- 3 databases
- 0.5GB storage
- 10GB transfer per month
- Automatic scaling
- Branching (database branching for development)

### Production Considerations:
- Upgrade to paid plan for production use
- Set up monitoring and alerts
- Configure backups
- Use connection pooling for high traffic

## 🎯 Next Steps

Once your database is set up:
1. Test the CRM by adding some businesses
2. Try the cold outreach feature
3. Explore the data enrichment tools
4. Set up your SendGrid API key for real emails

## 📞 Support

- [Neon Documentation](https://neon.tech/docs)
- [Neon Community](https://community.neon.tech)
- [Neon Status](https://status.neon.tech)
