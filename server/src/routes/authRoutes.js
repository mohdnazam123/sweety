import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

router.post("/register", async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!name) {
    return res.status(400).json({ message: "Please enter your name." });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash]
    );

    res.status(201).json({ message: "Account created. Please log in.", user: result.rows[0] });
  } catch (error) {
    console.error("Register failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter your email and password." });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    const passwordMatches = user && (await bcrypt.compare(password, user.password_hash));
    if (!passwordMatches) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    res.json({
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [req.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Account not found." });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Fetch current user failed:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

export default router;