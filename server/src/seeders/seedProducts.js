import { sequelize } from "../db/sequelize.js";
import { Product } from "../models/Product.js";
import { products } from "./products.data.js";

async function seed() {
  await sequelize.authenticate();

  for (const product of products) {
    await Product.upsert(product, { conflictFields: ["style_code"] });
  }

  console.log(`Seeded ${products.length} products into Divalora_products.`);
  await sequelize.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
