2. Database Schema (Postgres)
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    telephone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    source VARCHAR(100), -- e.g. "companies_house", "scraper", "manual"
    created_at TIMESTAMP DEFAULT NOW(),
    last_contacted TIMESTAMP
);

CREATE TABLE outreach_logs (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id),
    email_sent BOOLEAN DEFAULT FALSE,
    phone_called BOOLEAN DEFAULT FALSE,
    notes TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
);
