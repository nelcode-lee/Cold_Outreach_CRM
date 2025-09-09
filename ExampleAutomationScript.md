7. Example Automation Script (Node.js + SendGrid)
import sgMail from "@sendgrid/mail";
import { Client } from "pg";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function sendOutreach() {
  await client.connect();
  const res = await client.query(
    `SELECT * FROM businesses WHERE last_contacted IS NULL LIMIT 10`
  );

  for (const biz of res.rows) {
    const msg = {
      to: biz.email,
      from: "you@nuvaru.co.uk",
      subject: `Helping ${biz.name} with AI & Automation`,
      text: `Hi ${biz.name},\n\nI help Hull & Yorkshire businesses automate tasks...`,
    };

    try {
      await sgMail.send(msg);
      await client.query(
        `UPDATE businesses SET last_contacted = NOW() WHERE id = $1`,
        [biz.id]
      );
      console.log(`Email sent to ${biz.name}`);
    } catch (err) {
      console.error(`Failed to email ${biz.name}:`, err);
    }
  }
  await client.end();
}

sendOutreach();