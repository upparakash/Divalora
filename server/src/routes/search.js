import { Router } from "express";
import { Op } from "sequelize";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchRouter = Router();

searchRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const query = (req.query.q || "").trim();
    const limitNum = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 8));

    if (query.length < 2) {
      return res.json({ items: [], total: 0, query });
    }

    const like = `%${query}%`;
    const { rows, count } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: like } },
          { styleCode: { [Op.like]: like } },
          { category: { [Op.like]: like } },
          { colorway: { [Op.like]: like } },
        ],
      },
      order: [["name", "ASC"]],
      limit: limitNum,
    });

    res.json({ items: rows, total: count, query });
  })
);
