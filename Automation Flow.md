5. Cold Outreach Automation Flow

Option A: Internal Automation (Node.js worker or Python Celery)

Pulls new businesses daily from DB.

Sends personalized cold email (template system with variables: {{business_name}}, {{location}}).

Logs outreach in outreach_logs.

Updates last_contacted in businesses table.