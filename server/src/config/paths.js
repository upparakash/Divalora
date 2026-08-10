import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// server/src/config -> server/src -> server -> project root -> public/products
export const PUBLIC_PRODUCTS_DIR = path.resolve(__dirname, "../../../public/products");

// server/src/config -> server/src -> server -> project root -> public/banners
export const PUBLIC_BANNERS_DIR = path.resolve(__dirname, "../../../public/banners");
