import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { healthRouter } from "./routes/health.js";
import { productsRouter } from "./routes/products.js";
import { categoriesRouter } from "./routes/categories.js";
import { searchRouter } from "./routes/search.js";
import { sitemapRouter } from "./routes/sitemap.js";
import { bannersRouter } from "./routes/banners.js";
import { adminAuthRouter } from "./routes/adminAuth.js";
import { adminRouter } from "./routes/admin.js";
import { adminBannersRouter } from "./routes/adminBanners.js";
import { requireAdminAuth } from "./middleware/requireAdminAuth.js";

export const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRouter);
app.use("/api", productsRouter);
app.use("/api", categoriesRouter);
app.use("/api", searchRouter);
app.use("/api", sitemapRouter);
app.use("/api", bannersRouter);
app.use("/api", adminAuthRouter); // /admin/login, /admin/logout, /admin/me — not protected as a group; /me guards itself
app.use("/api", requireAdminAuth, adminRouter); // everything else under /admin/* requires a valid session
app.use("/api", requireAdminAuth, adminBannersRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
