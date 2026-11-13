import assert from "node:assert/strict";
import test from "node:test";
import { readReadingInput } from "../src/routes/readingRoutes.js";

const RANGE_MESSAGE = "Value must be a whole number between 40 and 600 mg/dL.";
const validInput = { readingDate: "2020-01-15", timeSlot: "after_lunch", glucoseValue: 120 };

test("accepts a valid reading", () => {
  const result = readReadingInput(validInput);
  assert.equal(result.error, undefined);
  assert.equal(result.glucoseValue, 120);
});

test("accepts the boundary values 40 and 600", () => {
  assert.equal(readReadingInput({ ...validInput, glucoseValue: 40 }).error, undefined);
  assert.equal(readReadingInput({ ...validInput, glucoseValue: 600 }).error, undefined);
});

test("rejects values outside 40 to 600", () => {
  for (const glucoseValue of [39, 601, 0, -5]) {
    assert.equal(readReadingInput({ ...validInput, glucoseValue }).error, RANGE_MESSAGE);
  }
});

test("rejects decimal values", () => {
  assert.equal(readReadingInput({ ...validInput, glucoseValue: 120.5 }).error, RANGE_MESSAGE);
});

test("rejects a missing value", () => {
  assert.equal(
    readReadingInput({ ...validInput, glucoseValue: "" }).error,
    "Please enter a glucose value."
  );
});

test("rejects a future date", () => {
  assert.equal(
    readReadingInput({ ...validInput, readingDate: "2099-01-01" }).error,
    "Date cannot be in the future."
  );
});

test("rejects an unknown time slot", () => {
  assert.equal(
    readReadingInput({ ...validInput, timeSlot: "midnight" }).error,
    "Please select a time slot."
  );
});