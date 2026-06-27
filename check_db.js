require("dotenv").config({ path: ".env" });
const { Client } = require("pg");

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    const res = await client.query("SELECT penalty_winner FROM score_configs LIMIT 1");
    console.log("Column exists:", res.rows);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

check();
