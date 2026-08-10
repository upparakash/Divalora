import { Router } from "express";
import { sequelize } from "../db/sequelize.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", database: sequelize.config.database });
  } catch (err) {
    res.status(503).json({ status: "error", message: err.message });
  }
});
