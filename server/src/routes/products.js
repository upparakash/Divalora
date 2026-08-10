import { Router } from "express";
import { Op } from "sequelize";
import { Product, CATEGORIES } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const productsRouter = Router();

const SORTS = {
  newest: [["createdAt", "DESC"]],
  price_asc: [["price", "ASC"]],
  price_desc: [["price", "DESC"]],
  curated: [["sortOrder", "ASC"], ["id", "ASC"]],
};

productsRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const { category, sort = "newest", page = "1", limit = "24", featured, isNew, excludeSlug } = req.query;

    const where = {};
    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Unknown category: ${category}` });
      }
      where.category = category;
    }
    if (featured !== undefined) where.isFeatured = featured === "true";
    if (isNew !== undefined) where.isNew = isNew === "true";
    if (excludeSlug) where.slug = { [Op.ne]: excludeSlug };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));

    const { rows, count } = await Product.findAndCountAll({
      where,
      order: SORTS[sort] || SORTS.newest,
      offset: (pageNum - 1) * limitNum,
      limit: limitNum,
    });

    res.json({
      items: rows,
      total: count,
      page: pageNum,
      limit: limitNum,
    });
  })
);

productsRouter.get(
  "/products/:idOrSlug",
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;

    const product = await Product.findOne({
      where: {
        [Op.or]: [{ slug: idOrSlug }, { styleCode: idOrSlug }],
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  })
);
