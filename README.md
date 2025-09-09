# Cold Outreach CRM

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/nelcode-lee/Cold_Outreach_CRM)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)](https://postgresql.org/)

A comprehensive CRM system for cold outreach to Hull & Yorkshire businesses, built with Node.js, React, and PostgreSQL.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/nelcode-lee/Cold_Outreach_CRM.git
cd Cold_Outreach_CRM

# Set up the project
./setup.sh

# Start the system
cd backend && npm run dev
cd frontend && npm start
```

## Features

- **Business Management**: Add, edit, and track businesses with contact information
- **Cold Outreach Automation**: Automated email sequences with personalised templates
- **Dashboard Analytics**: Track outreach performance and business status
- **Queue Management**: Control automated outreach with pause/resume functionality
- **Email Templates**: Customisable email templates with variable substitution
- **Outreach History**: Complete tracking of all outreach activities

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database (Neon DB recommended)
- **SendGrid** for email delivery
- **BullMQ** for job queuing
- **Redis** for queue management

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Axios** for API communication

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Neon DB account (recommended) or PostgreSQL database
- SendGrid account (optional - mock system works without it)
- Redis server (optional - for queue management)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   FROM_EMAIL=you@nuvaru.co.uk
   PORT=5000
   NODE_ENV=development
   REDIS_URL=redis://localhost:6379
   ```

5. Set up the database:
   ```bash
   # For Neon DB (recommended)
   node setup-database.js
   
   # For local PostgreSQL
   psql -d your_database -f database/schema.sql
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Configure the API URL in `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## Database Schema

The system uses two main tables:

### Businesses Table
- Stores business contact information
- Tracks status (New, Contacted, Interested, Not Interested)
- Records last contact date
- Supports multiple data sources (manual, Companies House, scraper)

### Outreach Logs Table
- Tracks all outreach activities
- Records email sends, phone calls, and responses
- Links to businesses table
- Stores template usage and notes

## API Endpoints

### Businesses
- `GET /api/businesses` - List businesses with filters
- `GET /api/businesses/:id` - Get business details
- `POST /api/businesses` - Create new business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business
- `POST /api/businesses/:id/outreach` - Send cold outreach

### Outreach
- `GET /api/outreach` - List outreach logs
- `GET /api/outreach/stats` - Get outreach statistics
- `PUT /api/outreach/:id` - Update outreach log

### Automation
- `POST /api/automation/queue-cold-outreach` - Queue single outreach
- `POST /api/automation/queue-bulk-outreach` - Queue bulk outreach
- `GET /api/automation/queue-stats` - Get queue statistics
- `POST /api/automation/pause-queue` - Pause automation queue
- `POST /api/automation/resume-queue` - Resume automation queue

## Email Templates

The system includes two built-in email templates:

1. **Cold Outreach**: Initial contact template
2. **Follow-up**: Follow-up template for non-responders

Templates support variable substitution:
- `{{business_name}}` - Business name
- `{{first_name}}` - First name extracted from business name
- `{{location}}` - Business location

## Automation Features

- **Staggered Sending**: Configurable delays between emails
- **Retry Logic**: Automatic retry for failed sends
- **Queue Management**: Pause/resume functionality
- **Bulk Operations**: Queue multiple businesses at once
- **Status Tracking**: Real-time queue statistics

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Starts React development server
```

### Database Migrations
When making schema changes, update the `database/schema.sql` file and run it against your database.

## Deployment

### Backend Deployment
1. Set up production environment variables
2. Install dependencies: `npm install --production`
3. Start with: `npm start`

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Serve the `build` directory with a web server

### Database Setup
1. Create a production PostgreSQL database
2. Run the schema: `psql -d production_db -f database/schema.sql`
3. Update `DATABASE_URL` in production environment

## 📁 Repository Structure

```
Cold_Outreach_CRM/
├── backend/                 # Node.js/Express backend
│   ├── database/           # Database schema and connection
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── scrapers/           # Web scraping modules
│   └── services/           # Business logic services
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── services/       # API services
│   └── public/             # Static assets
├── docs/                   # Documentation files
└── scripts/                # Utility scripts
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository** on [GitHub](https://github.com/nelcode-lee/Cold_Outreach_CRM)
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m "Add your feature"`
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Submit a pull request** on GitHub

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/Cold_Outreach_CRM.git
cd Cold_Outreach_CRM

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Start development servers
cd backend && npm run dev
cd frontend && npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [https://github.com/nelcode-lee/Cold_Outreach_CRM](https://github.com/nelcode-lee/Cold_Outreach_CRM)
- **Issues**: [https://github.com/nelcode-lee/Cold_Outreach_CRM/issues](https://github.com/nelcode-lee/Cold_Outreach_CRM/issues)
- **Discussions**: [https://github.com/nelcode-lee/Cold_Outreach_CRM/discussions](https://github.com/nelcode-lee/Cold_Outreach_CRM/discussions)

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
