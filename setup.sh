#!/bin/bash

# Cold Outreach CRM Setup Script
echo "🚀 Setting up Cold Outreach CRM..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp env.example .env
    echo "⚠️  Please update backend/.env with your configuration"
else
    echo "✅ Backend .env file already exists"
fi

cd ..

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cp env.example .env
    echo "✅ Frontend .env file created"
else
    echo "✅ Frontend .env file already exists"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your PostgreSQL database (or use Neon DB)"
echo "2. Update backend/.env with your database URL and API keys:"
echo "   - DATABASE_URL=postgresql://username:password@host:port/database"
echo "   - SENDGRID_API_KEY=your_sendgrid_api_key"
echo "   - COMPANIES_HOUSE_API_KEY=your_companies_house_api_key"
echo "3. Run the database schema: psql -d your_database -f backend/database/schema.sql"
echo "4. Start Redis server (for queue management)"
echo "5. Start the backend: cd backend && npm run dev"
echo "6. Start the frontend: cd frontend && npm start"
echo ""
echo "📚 See README.md for detailed instructions"
