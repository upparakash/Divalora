import { Router } from "express";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

export const sitemapRouter = Router();

// Mirrors src/lib/categories.js on the client — kept in sync manually since
// the two are separate packages. Update both if categories ever change.
const CATEGORY_SLUGS = [
  "totes",
  "shoulder-bags",
  "top-handle",
  "crossbody",
  "mini-bags",
  "clutches",
  "travel",
];

sitemapRouter.get(
  "/sitemap.xml",
  asyncHandler(async (_req, res) => {
    const base = env.siteUrl;
    const products = await Product.findAll({ attributes: ["slug", "updatedAt"] });

    const staticUrls = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/handbags", changefreq: "daily", priority: "0.9" },
      ...CATEGORY_SLUGS.map((slug) => ({
        loc: `/handbags/${slug}`,
        changefreq: "daily",
        priority: "0.8",
      })),
      { loc: "/about", changefreq: "monthly", priority: "0.5" },
    ];

    const productUrls = products.map((p) => ({
      loc: `/product/${p.slug}`,
      lastmod: p.updatedAt.toISOString().slice(0, 10),
      changefreq: "weekly",
      priority: "0.7",
    }));

    const urls = [...staticUrls, ...productUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${base}${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(xml);
  })
);

sitemapRouter.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${env.siteUrl}/sitemap.xml
`
  );
});
