import { Router } from "express";
import pool from "../config/db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateText(date) {
  return date.toISOString().slice(0, 10);
}

function isRealDate(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return toDateText(new Date(Date.UTC(year, month - 1, day))) === dateText;
}

export function getReportRanges(selectedDate) {
  const [year, month] = selectedDate.split("-").map(Number);

  return {
    daily: { startDate: selectedDate, endDate: selectedDate },
    monthToDate: {
      startDate: toDateText(new Date(Date.UTC(year, month - 1, 1))),
      endDate: selectedDate,
    },
    previousMonth: {
      startDate: toDateText(new Date(Date.UTC(year, month - 2, 1))),
      endDate: toDateText(new Date(Date.UTC(year, month - 1, 0))),
    },
  };
}

async function buildReport(userId, range) {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS "totalReadings",
       MAX(glucose_value) AS highest,
       MIN(glucose_value) AS lowest,
       ROUND(AVG(glucose_value), 1)::float AS average
     FROM readings
     WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3`,
    [userId, range.startDate, range.endDate]
  );
  return { ...range, ...result.rows[0] };
}

router.get("/", async (req, res) => {
  const selectedDate = req.query.date;
  if (typeof selectedDate !== "string" || !DATE_PATTERN.test(selectedDate) || !isRealDate(selectedDate)) {
    return res.status(400).json({ message: "Please select a valid date." });
  }

  try {
    const ranges = getReportRanges(selectedDate);

    const [daily, monthToDate, previousMonth, dailyReadings] = await Promise.all([
      buildReport(req.userId, ranges.daily),
      buildReport(req.userId, ranges.monthToDate),
      buildReport(req.userId, ranges.previousMonth),
      pool.query(
        `SELECT
           id,
           to_char(reading_date, 'YYYY-MM-DD') AS "readingDate",
           time_slot AS "timeSlot",
           glucose_value AS "glucoseValue"
         FROM readings
         WHERE user_id = $1 AND reading_date = $2
         ORDER BY array_position(ARRAY['morning', 'after_breakfast', 'after_lunch', 'after_dinner'], time_slot)`,
        [req.userId, selectedDate]
      ),
    ]);

    res.json({
      daily: { ...daily, readings: dailyReadings.rows },
      monthToDate,
      previousMonth,
    });
  } catch (error) {
    console.error("Reports failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

export default router;