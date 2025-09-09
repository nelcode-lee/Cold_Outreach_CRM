3. Data Capture Flow

Scraper/API Layer

Query Companies House API for Hull & Yorkshire registered businesses.

Optionally scrape business directories (Yell, Yelp, LinkedIn).

Store results in businesses table.

Deduplication & Validation

Ensure no duplicates (check on email/phone).

Validate emails (Regex + ZeroBounce/SMTP ping).

Manual Upload Option

CSV import option in CRM dashboard.