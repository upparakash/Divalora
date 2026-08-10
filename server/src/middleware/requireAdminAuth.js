import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { COOKIE_NAME } from "../config/auth.js";

export function requireAdminAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    req.admin = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please log in again" });
  }
}
