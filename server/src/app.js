import express from "express";
import authRoutes from "./routes/authRoutes.js";
import pool from "./config/db.js";
import readingRoutes from "./routes/readingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    res.json({
      status: "ok",
      database: "connected",
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

export default app;