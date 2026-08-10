import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { Banner, PLACEMENTS, TONES } from "../models/Banner.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, uploadBanner, extForBannerMimeType, isVideoMimeType } from "../middleware/upload.js";
import { PUBLIC_BANNERS_DIR } from "../config/paths.js";

// Protected by requireAdminAuth where this router is mounted (see app.js).
export const adminBannersRouter = Router();

const REQUIRED_FIELDS = ["placement", "title"];
const EDITABLE_FIELDS = [
  "placement",
  "eyebrow",
  "title",
  "subtitle",
  "ctaLabel",
  "ctaTo",
  "tone",
  "isActive",
];

function validateBannerBody(body, { partial = false } = {}) {
  if (!partial) {
    const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
    if (missing.length) return `Missing required field(s): ${missing.join(", ")}`;
  }
  if (body.placement !== undefined && !PLACEMENTS.includes(body.placement)) {
    return `Unknown placement: ${body.placement}`;
  }
  if (body.tone !== undefined && !TONES.includes(body.tone)) {
    return `Unknown tone: ${body.tone}`;
  }
  return null;
}

adminBannersRouter.get(
  "/admin/banners",
  asyncHandler(async (_req, res) => {
    const banners = await Banner.findAll({
      order: [
        ["placement", "ASC"],
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(banners);
  })
);

adminBannersRouter.get(
  "/admin/banners/:id",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });
    res.json(banner);
  })
);

adminBannersRouter.post(
  "/admin/banners",
  asyncHandler(async (req, res) => {
    const error = validateBannerBody(req.body);
    if (error) return res.status(400).json({ error });

    const payload = Object.fromEntries(
      EDITABLE_FIELDS.map((f) => [f, req.body[f]]).filter(([, v]) => v !== undefined)
    );
    const banner = await Banner.create(payload);
    res.status(201).json(banner);
  })
);

adminBannersRouter.put(
  "/admin/banners/:id",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    const error = validateBannerBody(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) banner[field] = req.body[field];
    }
    await banner.save();
    res.json(banner);
  })
);

adminBannersRouter.patch(
  "/admin/banners/:id/flags",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    if (req.body.isActive !== undefined) banner.isActive = !!req.body.isActive;
    await banner.save();
    res.json(banner);
  })
);

adminBannersRouter.patch(
  "/admin/banners/reorder",
  asyncHandler(async (req, res) => {
    const { order } = req.body; // [{ id, sortOrder }, ...]
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Body must be { order: [{ id, sortOrder }] }" });
    }

    await Promise.all(order.map(({ id, sortOrder }) => Banner.update({ sortOrder }, { where: { id } })));

    const banners = await Banner.findAll({
      order: [
        ["placement", "ASC"],
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(banners);
  })
);

adminBannersRouter.delete(
  "/admin/banners/:id",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    await banner.destroy();

    const dir = path.join(PUBLIC_BANNERS_DIR, String(req.params.id));
    await fs.rm(dir, { recursive: true, force: true });

    res.status(204).end();
  })
);

adminBannersRouter.post(
  "/admin/banners/:id/media",
  uploadBanner.single("media"),
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });
    if (!req.file) return res.status(400).json({ error: "No media file provided" });

    const ext = extForBannerMimeType(req.file.mimetype);
    const isVideo = isVideoMimeType(req.file.mimetype);
    const filename = `media.${ext}`;

    const dir = path.join(PUBLIC_BANNERS_DIR, String(banner.id));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), req.file.buffer);

    // Switching media type invalidates any poster from a previous video.
    if (!isVideo && banner.posterFilename) {
      await fs.rm(path.join(dir, banner.posterFilename), { force: true });
      banner.posterFilename = null;
    }

    banner.mediaType = isVideo ? "video" : "image";
    banner.mediaFilename = filename;
    await banner.save();

    res.status(201).json(banner);
  })
);

adminBannersRouter.delete(
  "/admin/banners/:id/media",
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    const dir = path.join(PUBLIC_BANNERS_DIR, String(banner.id));
    if (banner.mediaFilename) await fs.rm(path.join(dir, banner.mediaFilename), { force: true });
    if (banner.posterFilename) await fs.rm(path.join(dir, banner.posterFilename), { force: true });

    banner.mediaFilename = null;
    banner.posterFilename = null;
    await banner.save();

    res.json(banner);
  })
);

// Poster is an optional still frame shown while a video banner loads (and
// as its fallback image) — reuses the plain image-only `upload` middleware
// since a poster is always a photo, never itself a video.
adminBannersRouter.post(
  "/admin/banners/:id/poster",
  upload.single("poster"),
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });
    if (!req.file) return res.status(400).json({ error: "No poster file provided" });

    const ext = req.file.mimetype.split("/")[1];
    const filename = `poster.${ext === "jpeg" ? "jpg" : ext}`;

    const dir = path.join(PUBLIC_BANNERS_DIR, String(banner.id));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), req.file.buffer);

    banner.posterFilename = filename;
    await banner.save();

    res.status(201).json(banner);
  })
);

adminBannersRouter.use((err, _req, res, next) => {
  if (err.name === "MulterError" || err.message?.includes("MP4/WEBM") || err.message?.includes("JPEG, PNG, or WEBP")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
