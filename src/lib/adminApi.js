// Talks to /api/admin/* — protected by a session cookie set on login
// (see development.md's Phase 3 / auth entries). Internal tool only.

const API_BASE = "/api/admin";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { ...options, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function jsonBody(method, data) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export function login(username, password) {
  return request("/login", jsonBody("POST", { username, password }));
}

export function logout() {
  return request("/logout", { method: "POST" });
}

export function me() {
  return request("/me");
}

export function listProducts() {
  return request("/products");
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

export function createProduct(data) {
  return request("/products", jsonBody("POST", data));
}

export function updateProduct(id, data) {
  return request(`/products/${id}`, jsonBody("PUT", data));
}

export function setProductFlags(id, flags) {
  return request(`/products/${id}/flags`, jsonBody("PATCH", flags));
}

export function reorderProducts(order) {
  return request("/products/reorder", jsonBody("PATCH", { order }));
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

export function uploadProductImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  return request(`/products/${id}/images`, { method: "POST", body: formData });
}

export function deleteProductImage(id, filename) {
  return request(`/products/${id}/images/${encodeURIComponent(filename)}`, { method: "DELETE" });
}

export function listBanners() {
  return request("/banners");
}

export function getBanner(id) {
  return request(`/banners/${id}`);
}

export function createBanner(data) {
  return request("/banners", jsonBody("POST", data));
}

export function updateBanner(id, data) {
  return request(`/banners/${id}`, jsonBody("PUT", data));
}

export function setBannerFlags(id, flags) {
  return request(`/banners/${id}/flags`, jsonBody("PATCH", flags));
}

export function reorderBanners(order) {
  return request("/banners/reorder", jsonBody("PATCH", { order }));
}

export function deleteBanner(id) {
  return request(`/banners/${id}`, { method: "DELETE" });
}

export function uploadBannerMedia(id, file) {
  const formData = new FormData();
  formData.append("media", file);
  return request(`/banners/${id}/media`, { method: "POST", body: formData });
}

export function deleteBannerMedia(id) {
  return request(`/banners/${id}/media`, { method: "DELETE" });
}

export function uploadBannerPoster(id, file) {
  const formData = new FormData();
  formData.append("poster", file);
  return request(`/banners/${id}/poster`, { method: "POST", body: formData });
}
