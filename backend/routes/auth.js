import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "../store/users.js";
import { authMiddleware } from "../middleware/auth.js";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

authRouter.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const normalized = String(email).trim().toLowerCase();
  if (users.has(normalized)) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  const hash = await bcrypt.hash(String(password), 10);
  users.set(normalized, { email: normalized, passwordHash: hash });
  const token = signToken({ sub: normalized, email: normalized });
  return res.status(201).json({
    token,
    user: { email: normalized },
  });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const normalized = String(email).trim().toLowerCase();
  const user = users.get(normalized);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  const token = signToken({ sub: normalized, email: normalized });
  return res.json({
    token,
    user: { email: normalized },
  });
});

authRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ user: { email: req.user.email } });
});
