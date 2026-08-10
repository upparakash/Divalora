const API_BASE = "/api";

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed: ${res.status}`);
    error.status = res.status;
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
  return request(`/products${query ? `?${query}` : ""}`);
}

export function getProduct(idOrSlug) {
  return request(`/products/${encodeURIComponent(idOrSlug)}`);
}

export function getCategories() {
  return request("/categories");
}

export function search(q, limit) {
  const params = new URLSearchParams({ q });
  if (limit) params.set("limit", limit);
  return request(`/search?${params.toString()}`);
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
