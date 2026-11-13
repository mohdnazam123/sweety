import assert from "node:assert/strict";
import test from "node:test";
import { getReportRanges } from "../src/routes/reportRoutes.js";

test("builds the ranges from the assignment example (15 Oct 2026)", () => {
  const ranges = getReportRanges("2026-10-15");

  assert.deepEqual(ranges.daily, { startDate: "2026-10-15", endDate: "2026-10-15" });
  assert.deepEqual(ranges.monthToDate, { startDate: "2026-10-01", endDate: "2026-10-15" });
  assert.deepEqual(ranges.previousMonth, { startDate: "2026-09-01", endDate: "2026-09-30" });
});

test("previous month in January is December of the previous year", () => {
  const ranges = getReportRanges("2027-01-10");

  assert.deepEqual(ranges.previousMonth, { startDate: "2026-12-01", endDate: "2026-12-31" });
});

test("previous month handles a leap year February", () => {
  const ranges = getReportRanges("2028-03-15");

  assert.deepEqual(ranges.previousMonth, { startDate: "2028-02-01", endDate: "2028-02-29" });
});