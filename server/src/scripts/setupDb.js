import { readFile } from "node:fs/promises";
import pool from "../config/db.js";

const schemaFile = new URL("../../sql/schema.sql", import.meta.url);

try {
  const schema = await readFile(schemaFile, "utf8");
  await pool.query(schema);
  console.log("Database tables are ready.");
} catch (error) {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}