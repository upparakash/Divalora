import { Router } from "express";
import { Product, CATEGORIES } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const categoriesRouter = Router();

categoriesRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const counts = await Product.findAll({
      attributes: ["category", [Product.sequelize.fn("COUNT", Product.sequelize.col("id")), "count"]],
      group: ["category"],
      raw: true,
    });

    const countByCategory = Object.fromEntries(counts.map((c) => [c.category, Number(c.count)]));

    res.json(
      CATEGORIES.map((category) => ({
        category,
        count: countByCategory[category] || 0,
      }))
    );
  })
);
