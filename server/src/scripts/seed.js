import bcrypt from "bcrypt";
import pool from "../config/db.js";

const DEMO_USER = { name: "Demo User", email: "demo@sweety.app", password: "demo1234" };
const TIME_SLOTS = ["morning", "after_breakfast", "after_lunch", "after_dinner"];
const DAYS_OF_HISTORY = 45;

function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);

  await pool.query("DELETE FROM users WHERE email = $1", [DEMO_USER.email]);
  const userResult = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [DEMO_USER.name, DEMO_USER.email, passwordHash]
  );
  const userId = userResult.rows[0].id;

  let readingCount = 0;
  for (let daysAgo = 0; daysAgo < DAYS_OF_HISTORY; daysAgo++) {
    const readingsThatDay = (daysAgo % 4) + 1;

    for (let slotIndex = 0; slotIndex < readingsThatDay; slotIndex++) {
      const glucoseValue = 90 + ((daysAgo * 17 + slotIndex * 31) % 90);
      await pool.query(
        `INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)`,
        [userId, getDateDaysAgo(daysAgo), TIME_SLOTS[slotIndex], glucoseValue]
      );
      readingCount++;
    }
  }

  console.log(`Seeded ${DEMO_USER.email} (password: ${DEMO_USER.password}) with ${readingCount} readings.`);
}

try {
  await seed();
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}