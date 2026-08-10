import { Router } from "express";
import { Banner, PLACEMENTS } from "../models/Banner.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const bannersRouter = Router();

bannersRouter.get(
  "/banners",
  asyncHandler(async (req, res) => {
    const { placement } = req.query;
    if (!placement || !PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: `placement must be one of: ${PLACEMENTS.join(", ")}` });
    }

    const banners = await Banner.findAll({
      where: { placement, isActive: true },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(banners);
  })
);
