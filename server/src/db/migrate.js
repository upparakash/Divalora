import { sequelize } from "./sequelize.js";
import { Product } from "../models/Product.js";
import { Banner } from "../models/Banner.js";

async function migrate() {
  await sequelize.authenticate();
  console.log(`Connected to ${sequelize.config.database} at ${sequelize.config.host}`);

  await Product.sync({ alter: true });
  console.log("Divalora_products table is up to date.");

  await Banner.sync({ alter: true });
  console.log("Divalora_banners table is up to date.");

  await sequelize.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
