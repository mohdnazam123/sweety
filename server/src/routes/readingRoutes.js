import { Router } from "express";
import pool from "../config/db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth);

const SLOT_LABELS = {
  morning: "Morning (fasting)",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};
const TIME_SLOTS = Object.keys(SLOT_LABELS);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_GLUCOSE = 40;
const MAX_GLUCOSE = 600;
const MAX_READINGS_PER_DAY = 4;
const DUPLICATE_SLOT_MESSAGE = "You already have a reading for this time slot on this date.";

const READING_COLUMNS = `
  id,
  to_char(reading_date, 'YYYY-MM-DD') AS "readingDate",
  time_slot AS "timeSlot",
  glucose_value AS "glucoseValue"
`;

function getTodayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isRealDate(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function readReadingInput(body) {
  const { readingDate, timeSlot } = body;

  if (typeof readingDate !== "string" || !DATE_PATTERN.test(readingDate) || !isRealDate(readingDate)) {
    return { error: "Please select a valid date." };
  }
  if (readingDate > getTodayDate()) {
    return { error: "Date cannot be in the future." };
  }
  if (!TIME_SLOTS.includes(timeSlot)) {
    return { error: "Please select a time slot." };
  }
  if (body.glucoseValue === undefined || body.glucoseValue === null || body.glucoseValue === "") {
    return { error: "Please enter a glucose value." };
  }

  const glucoseValue = Number(body.glucoseValue);
  if (!Number.isInteger(glucoseValue) || glucoseValue < MIN_GLUCOSE || glucoseValue > MAX_GLUCOSE) {
    return { error: "Value must be a whole number between 40 and 600 mg/dL." };
  }

  return { readingDate, timeSlot, glucoseValue };
}

async function findBusinessRuleError(userId, input, readingIdToIgnore = 0) {
  const result = await pool.query(
    `SELECT time_slot FROM readings
     WHERE user_id = $1 AND reading_date = $2 AND id <> $3`,
    [userId, input.readingDate, readingIdToIgnore]
  );

  if (result.rows.length >= MAX_READINGS_PER_DAY) {
    return `You can add only ${MAX_READINGS_PER_DAY} readings per day.`;
  }

  const slotAlreadyUsed = result.rows.some((row) => row.time_slot === input.timeSlot);
  if (slotAlreadyUsed) {
    const label = SLOT_LABELS[input.timeSlot];
    const article = /^[aeiou]/i.test(label) ? "an" : "a";
    return `You already have ${article} ${label} reading for this date.`;
  }

  return null;
}

router.get("/summary", async (req, res) => {
  const today = req.query.today;
  if (typeof today !== "string" || !DATE_PATTERN.test(today)) {
    return res.status(400).json({ message: "Please provide today's date." });
  }

  try {
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS "totalReadings",
         COUNT(*) FILTER (WHERE reading_date = $2)::int AS "todaysReadings",
         ROUND(AVG(glucose_value), 1)::float AS "averageGlucose"
       FROM readings
       WHERE user_id = $1`,
      [req.userId, today]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Summary failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.get("/", async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || null;

  try {
    const result = await pool.query(
      `SELECT ${READING_COLUMNS}
       FROM readings
       WHERE user_id = $1
       ORDER BY reading_date DESC,
                array_position(ARRAY['morning', 'after_breakfast', 'after_lunch', 'after_dinner'], time_slot)
       LIMIT $2`,
      [req.userId, limit]
    );
    res.json({ readings: result.rows });
  } catch (error) {
    console.error("List readings failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.get("/:id", async (req, res) => {
  const readingId = Number.parseInt(req.params.id, 10);
  if (!readingId) {
    return res.status(404).json({ message: "Reading not found." });
  }

  try {
    const result = await pool.query(
      `SELECT ${READING_COLUMNS} FROM readings WHERE id = $1 AND user_id = $2`,
      [readingId, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reading not found." });
    }
    res.json({ reading: result.rows[0] });
  } catch (error) {
    console.error("Fetch reading failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/", async (req, res) => {
  const input = readReadingInput(req.body);
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }

  try {
    const ruleError = await findBusinessRuleError(req.userId, input);
    if (ruleError) {
      return res.status(409).json({ message: ruleError });
    }

    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
       VALUES ($1, $2, $3, $4)
       RETURNING ${READING_COLUMNS}`,
      [req.userId, input.readingDate, input.timeSlot, input.glucoseValue]
    );
    res.status(201).json({ reading: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: DUPLICATE_SLOT_MESSAGE });
    }
    console.error("Add reading failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.put("/:id", async (req, res) => {
  const readingId = Number.parseInt(req.params.id, 10);
  if (!readingId) {
    return res.status(404).json({ message: "Reading not found." });
  }

  const input = readReadingInput(req.body);
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }

  try {
    const ruleError = await findBusinessRuleError(req.userId, input, readingId);
    if (ruleError) {
      return res.status(409).json({ message: ruleError });
    }

    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1, time_slot = $2, glucose_value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING ${READING_COLUMNS}`,
      [input.readingDate, input.timeSlot, input.glucoseValue, readingId, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reading not found." });
    }
    res.json({ reading: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: DUPLICATE_SLOT_MESSAGE });
    }
    console.error("Update reading failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.delete("/:id", async (req, res) => {
  const readingId = Number.parseInt(req.params.id, 10);
  if (!readingId) {
    return res.status(404).json({ message: "Reading not found." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM readings WHERE id = $1 AND user_id = $2",
      [readingId, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Reading not found." });
    }
    res.json({ message: "Reading deleted." });
  } catch (error) {
    console.error("Delete reading failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

export default router;