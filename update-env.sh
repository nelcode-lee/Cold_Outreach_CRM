#!/bin/bash

echo "🔧 Cold Outreach CRM - Environment Setup"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found. Creating it..."
    cp backend/env.example backend/.env
fi

echo "📝 Current .env file contents:"
echo "=============================="
cat backend/.env
echo ""
echo ""

echo "🔑 You need to update the following values:"
echo "==========================================="
echo ""
echo "1. DATABASE_URL - Your Neon DB connection string"
echo "   Example: postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
echo ""
echo "2. SENDGRID_API_KEY - Your SendGrid API key (optional for now)"
echo "   Example: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo ""
echo "3. COMPANIES_HOUSE_API_KEY - Your Companies House API key (optional for now)"
echo "   Example: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo ""

echo "📋 To update your .env file:"
echo "============================"
echo "1. Open backend/.env in your editor"
echo "2. Replace the placeholder values with your actual values"
echo "3. Save the file"
echo "4. Restart the backend: cd backend && npm run dev"
echo ""

echo "🚀 Quick setup commands:"
echo "========================"
echo "nano backend/.env          # Edit with nano"
echo "code backend/.env          # Edit with VS Code"
echo "vim backend/.env           # Edit with vim"
echo ""

echo "✅ After updating, test with:"
echo "============================="
echo "node setup-database.js     # Test database connection"
echo "cd backend && npm run dev  # Start backend"
echo "cd frontend && npm start   # Start frontend"
