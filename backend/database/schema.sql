-- Cold Outreach CRM Database Schema
-- PostgreSQL Database for Hull & Yorkshire Business Outreach

CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    telephone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    source VARCHAR(100), -- e.g. "companies_house", "scraper", "manual"
    status VARCHAR(50) DEFAULT 'New', -- "New", "Contacted", "Interested", "Not Interested"
    created_at TIMESTAMP DEFAULT NOW(),
    last_contacted TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE outreach_logs (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    email_sent BOOLEAN DEFAULT FALSE,
    phone_called BOOLEAN DEFAULT FALSE,
    notes TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    template_used VARCHAR(100),
    response_received BOOLEAN DEFAULT FALSE
);

-- Indexes for better performance
CREATE INDEX idx_businesses_email ON businesses(email);
CREATE INDEX idx_businesses_location ON businesses(location);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_last_contacted ON businesses(last_contacted);
CREATE INDEX idx_outreach_logs_business_id ON outreach_logs(business_id);
CREATE INDEX idx_outreach_logs_sent_at ON outreach_logs(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
