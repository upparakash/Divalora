// One-off script: copies real product photography (dropped by the user into
// the project-root Products/ folder) into /public/products/<slug>/ and
// updates each product's `images` field in the DB — the DB field is what
// actually drives rendering (src/lib/api.js's productImageUrl), not just the
// presence of a file on disk, so both steps are required.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../db/sequelize.js";
import { Product } from "../models/Product.js";
import { PUBLIC_PRODUCTS_DIR } from "../config/paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.resolve(__dirname, "../../../Products");

// slug -> { source filename, optional field corrections to match the real photo }
const ASSIGNMENTS = {
  "soft-nappa-shopping-tote": {
    source: "1.jpeg",
  },
  "structured-box-top-handle": {
    source: "2.jpeg",
    colorway: "Cognac",
    material: "Python-embossed calfskin",
  },
  "mini-top-handle": {
    source: "3.jpeg",
    material: "Zebra-embossed leather",
  },
  "galleria-top-handle": {
    source: "4.jpeg",
  },
  "structured-saffiano-tote": {
    source: "5.jpeg",
    colorway: "Mint / Nero",
  },
  "pebbled-leather-hobo": {
    source: "6.jpeg",
    colorway: "Nero",
    material: "Crocodile-embossed leather",
  },
  "canvas-leather-tote": {
    source: "7.jpeg",
    colorway: "Multicolor",
  },
  "leather-wristlet-pouch": {
    source: "8.jpeg",
    colorway: "Verde",
    material: "Crocodile-embossed leather",
  },
};

// These carried placeholder filenames from early seed data that never had
// real files behind them — clear them now that we're doing a real content
// pass, so the DB stops claiming photos exist that don't.
const CLEAR_FAKE_IMAGES = ["quilted-nappa-shoulder-bag", "saffiano-crossbody", "chain-mini-bag"];

async function run() {
  await sequelize.authenticate();

  for (const [slug, { source, ...fields }] of Object.entries(ASSIGNMENTS)) {
    const product = await Product.findOne({ where: { slug } });
    if (!product) {
      console.warn(`No product found for slug "${slug}", skipping.`);
      continue;
    }

    const destDir = path.join(PUBLIC_PRODUCTS_DIR, slug);
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(path.join(SOURCE_DIR, source), path.join(destDir, "1.jpg"));

    product.images = ["1.jpg"];
    Object.assign(product, fields);
    await product.save();
    console.log(`✓ ${slug} <- ${source}${Object.keys(fields).length ? ` (+ ${Object.keys(fields).join(", ")})` : ""}`);
  }

  for (const slug of CLEAR_FAKE_IMAGES) {
    const product = await Product.findOne({ where: { slug } });
    if (!product) continue;
    product.images = [];
    await product.save();
    console.log(`✓ ${slug} images cleared (were pointing at non-existent files)`);
  }

  await sequelize.close();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
