# Cold Outreach CRM

A comprehensive CRM system for cold outreach to Hull & Yorkshire businesses, built with Node.js, React, and PostgreSQL.

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
