import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "./staticProducts.js";

const API_BASE = "/api";

// --- Static fallbacks -------------------------------------------------
// No backend is deployed for this build yet, so every API call below
// degrades to filtering/sorting the static demo catalogue instead of
// throwing. This keeps every page functional for a demo even with no
// server reachable. Once a real backend is live, these fallbacks simply
// stop triggering (the real request already succeeded).

const SORTERS = {
  newest: (a, b) => b.id - a.id,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  curated: (a, b) => a.id - b.id,
};

function staticProductsResponse({ category, sort, page, limit, featured, isNew, excludeSlug } = {}) {
  let items = [...DEMO_PRODUCTS];
  if (category) items = items.filter((p) => p.category === category);
  if (featured !== undefined) items = items.filter((p) => p.isFeatured === (featured === true || featured === "true"));
  if (isNew !== undefined) items = items.filter((p) => p.isNew === (isNew === true || isNew === "true"));
  if (excludeSlug) items = items.filter((p) => p.slug !== excludeSlug);

  items = items.sort(SORTERS[sort] || SORTERS.newest);

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
  const start = (pageNum - 1) * limitNum;
  const paged = items.slice(start, start + limitNum);

  return { items: paged, total: items.length, page: pageNum, limit: limitNum };
}

function staticProduct(idOrSlug) {
  const product = DEMO_PRODUCTS.find((p) => p.slug === idOrSlug || p.styleCode === idOrSlug);
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return product;
}

function staticSearch(q, limit) {
  const query = (q || "").trim().toLowerCase();
  if (query.length < 2) return { items: [], total: 0, query: q };
  const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 8));
  const items = DEMO_PRODUCTS.filter((p) =>
    [p.name, p.styleCode, p.category, p.colorway].some((f) => f?.toLowerCase().includes(query))
  ).slice(0, limitNum);
  return { items, total: items.length, query: q };
}

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    // A real backend always answers with JSON, even for errors. If parsing
    // fails, this wasn't our API at all — e.g. Vercel's own 404 page when
    // no backend is deployed — so callers shouldn't treat it as a genuine
    // "not found" from the app.
    let body = {};
    let isApiResponse = true;
    try {
      body = await res.json();
    } catch {
      isApiResponse = false;
    }
    const error = new Error(body.error || `Request failed: ${res.status}`);
    error.status = res.status;
    error.isApiResponse = isApiResponse;
    throw error;
  }
  return res.json();
}

export function getProducts({ category, sort, page, limit, featured, isNew, excludeSlug } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (featured !== undefined) params.set("featured", featured);
  if (isNew !== undefined) params.set("isNew", isNew);
  if (excludeSlug) params.set("excludeSlug", excludeSlug);
  const query = params.toString();
  return request(`/products${query ? `?${query}` : ""}`).catch(() =>
    staticProductsResponse({ category, sort, page, limit, featured, isNew, excludeSlug })
  );
}

export function getProduct(idOrSlug) {
  return request(`/products/${encodeURIComponent(idOrSlug)}`).catch((err) => {
    // Only trust a 404 as "genuinely not found" if a real backend answered.
    if (err.status === 404 && err.isApiResponse) throw err;
    return staticProduct(idOrSlug);
  });
}

export function getCategories() {
  return request("/categories").catch(() => DEMO_CATEGORIES);
}

export function search(q, limit) {
  const params = new URLSearchParams({ q });
  if (limit) params.set("limit", limit);
  return request(`/search?${params.toString()}`).catch(() => staticSearch(q, limit));
}

// Product photography convention: /public/products/<slug>/<filename>.
//
// Not every product has real photography yet. For the primary (index 0)
// image, we fall back to a representative photo from the same category
// rather than showing a bare placeholder — see CATEGORY_FALLBACK_IMAGE.
// Secondary images (hover swap, extra thumbnails) still fall back to null
// since there's nothing meaningful to show there.
const CATEGORY_FALLBACK_IMAGE = {
  "Shoulder Bag": "/products/pebbled-leather-hobo/1.jpg",
  Crossbody: "/products/pebbled-leather-hobo/1.jpg",
  "Mini Bag": "/products/mini-top-handle/1.jpg",
  Clutch: "/products/leather-wristlet-pouch/1.jpg",
  Travel: "/products/soft-nappa-shopping-tote/1.jpg",
};

export function productImageUrl(product, index = 0) {
  const filename = product?.images?.[index];
  if (filename) return `/products/${product.slug}/${filename}`;
  if (index === 0) return CATEGORY_FALLBACK_IMAGE[product?.category] || null;
  return null;
}

export function getBanners(placement) {
  return request(`/banners?placement=${encodeURIComponent(placement)}`);
}

// Banner media convention: /public/banners/<id>/<filename>.
export function bannerMediaUrl(banner) {
  if (!banner?.mediaFilename) return null;
  return `/banners/${banner.id}/${banner.mediaFilename}`;
}

export function bannerPosterUrl(banner) {
  if (!banner?.posterFilename) return null;
  return `/banners/${banner.id}/${banner.posterFilename}`;
}
