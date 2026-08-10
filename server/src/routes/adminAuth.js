import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAdminAuth } from "../middleware/requireAdminAuth.js";
import { COOKIE_NAME, TOKEN_TTL, COOKIE_MAX_AGE_MS } from "../config/auth.js";

export const adminAuthRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE_MS,
};

adminAuthRouter.post(
  "/admin/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const validUsername = username === env.admin.username;
    const validPassword = validUsername && (await bcrypt.compare(password, env.admin.passwordHash));

    if (!validUsername || !validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ sub: username, role: "admin" }, env.jwtSecret, { expiresIn: TOKEN_TTL });
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({ username });
  })
);

adminAuthRouter.post("/admin/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: cookieOptions.secure });
  res.status(204).end();
});

adminAuthRouter.get("/admin/me", requireAdminAuth, (req, res) => {
  res.json({ username: req.admin.sub });
});
