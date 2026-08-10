import { Router } from "express";
import { Op } from "sequelize";
import fs from "fs/promises";
import path from "path";
import { Product, CATEGORIES } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, extForMimeType } from "../middleware/upload.js";
import { PUBLIC_PRODUCTS_DIR } from "../config/paths.js";

// Protected by requireAdminAuth where this router is mounted (see app.js).
export const adminRouter = Router();

const REQUIRED_FIELDS = ["styleCode", "slug", "name", "category", "price"];
const EDITABLE_FIELDS = [
  "styleCode",
  "slug",
  "name",
  "category",
  "price",
  "currency",
  "colorway",
  "material",
  "dimensions",
  "description",
  "details",
  "isFeatured",
  "isNew",
];

function validateProductBody(body, { partial = false } = {}) {
  if (!partial) {
    const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === "");
    if (missing.length) return `Missing required field(s): ${missing.join(", ")}`;
  }
  if (body.category !== undefined && !CATEGORIES.includes(body.category)) {
    return `Unknown category: ${body.category}`;
  }
  if (body.price !== undefined && Number.isNaN(Number(body.price))) {
    return "Price must be a number";
  }
  return null;
}

adminRouter.get(
  "/admin/products",
  asyncHandler(async (_req, res) => {
    const products = await Product.findAll({
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(products);
  })
);

adminRouter.get(
  "/admin/products/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  })
);

adminRouter.post(
  "/admin/products",
  asyncHandler(async (req, res) => {
    const error = validateProductBody(req.body);
    if (error) return res.status(400).json({ error });

    const payload = Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, req.body[f]]).filter(([, v]) => v !== undefined));

    const existing = await Product.findOne({
      where: { [Op.or]: [{ styleCode: payload.styleCode }, { slug: payload.slug }] },
    });
    if (existing) {
      return res.status(409).json({ error: "A product with this style code or slug already exists" });
    }

    const product = await Product.create(payload);
    res.status(201).json(product);
  })
);

adminRouter.put(
  "/admin/products/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const error = validateProductBody(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }
    await product.save();
    res.json(product);
  })
);

adminRouter.patch(
  "/admin/products/:id/flags",
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (req.body.isFeatured !== undefined) product.isFeatured = !!req.body.isFeatured;
    if (req.body.isNew !== undefined) product.isNew = !!req.body.isNew;
    await product.save();
    res.json(product);
  })
);

adminRouter.patch(
  "/admin/products/reorder",
  asyncHandler(async (req, res) => {
    const { order } = req.body; // [{ id, sortOrder }, ...]
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Body must be { order: [{ id, sortOrder }] }" });
    }

    await Promise.all(
      order.map(({ id, sortOrder }) => Product.update({ sortOrder }, { where: { id } }))
    );

    const products = await Product.findAll({
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(products);
  })
);

adminRouter.delete(
  "/admin/products/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();

    const dir = path.join(PUBLIC_PRODUCTS_DIR, product.slug);
    await fs.rm(dir, { recursive: true, force: true });

    res.status(204).end();
  })
);

adminRouter.post(
  "/admin/products/:id/images",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!req.file) return res.status(400).json({ error: "No image file provided" });

    const ext = extForMimeType(req.file.mimetype);
    const nextIndex = (product.images?.length || 0) + 1;
    const filename = `${nextIndex}.${ext}`;

    const dir = path.join(PUBLIC_PRODUCTS_DIR, product.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), req.file.buffer);

    product.images = [...(product.images || []), filename];
    await product.save();

    res.status(201).json(product);
  })
);

adminRouter.delete(
  "/admin/products/:id/images/:filename",
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { filename } = req.params;
    product.images = (product.images || []).filter((f) => f !== filename);
    await product.save();

    await fs.rm(path.join(PUBLIC_PRODUCTS_DIR, product.slug, filename), { force: true });

    res.json(product);
  })
);

adminRouter.use((err, _req, res, next) => {
  if (err.name === "MulterError" || err.message?.includes("Only JPEG, PNG, or WEBP")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
