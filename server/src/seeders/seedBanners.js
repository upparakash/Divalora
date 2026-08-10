// Seeds one default banner per placement, using the exact copy that used to
// be hardcoded in each page's <Hero> before banner management existed. No
// media is attached, so nothing changes visually until a real image/video
// is uploaded through /admin — this just moves the existing content into
// the DB so pages never render blank while banners are set up.
import { sequelize } from "../db/sequelize.js";
import { Banner } from "../models/Banner.js";

const DEFAULTS = [
  {
    placement: "home",
    eyebrow: "Fall / Winter 2026",
    title: "Crafted Rarity, Carried Daily",
    subtitle:
      "Discover the new DIVELORA handbag collection — leather goods shaped by four generations of Italian craftsmanship.",
    ctaLabel: "Discover the Collection",
    ctaTo: "/handbags",
    tone: "charcoal",
  },
  {
    placement: "handbags",
    eyebrow: "Bags & Accessories",
    title: "Leather Goods, Fall / Winter 2026",
    subtitle: "The Galleria, the Re-Nappa Hobo and the season's essential small leather goods.",
    tone: "gold",
  },
  {
    placement: "about",
    eyebrow: "The Maison",
    title: "A Century of Italian Craft",
    subtitle: "DIVELORA was founded on a simple belief: that rarity is not an accident, it is made by hand.",
    tone: "ink",
  },
];

async function seed() {
  await sequelize.authenticate();

  for (const defaults of DEFAULTS) {
    const existing = await Banner.findOne({ where: { placement: defaults.placement } });
    if (existing) {
      console.log(`Skipped ${defaults.placement} — already has a banner.`);
      continue;
    }
    await Banner.create({ ...defaults, sortOrder: 0, isActive: true });
    console.log(`✓ Seeded default banner for ${defaults.placement}`);
  }

  await sequelize.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
