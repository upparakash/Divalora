import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "../lib/adminApi.js";
import { productImageUrl } from "../lib/api.js";

const CATEGORIES = ["Tote", "Shoulder Bag", "Top Handle", "Crossbody", "Mini Bag", "Clutch", "Travel"];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const EMPTY_FORM = {
  styleCode: "",
  slug: "",
  name: "",
  category: CATEGORIES[0],
  price: "",
  currency: "USD",
  colorway: "",
  material: "",
  dimensions: "",
  description: "",
  details: "",
  isFeatured: false,
  isNew: false,
};

export default function AdminProductForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(EMPTY_FORM);
  const [product, setProduct] = useState(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then((p) => {
        setProduct(p);
        setForm({
          styleCode: p.styleCode,
          slug: p.slug,
          name: p.name,
          category: p.category,
          price: p.price,
          currency: p.currency,
          colorway: p.colorway || "",
          material: p.material || "",
          dimensions: p.dimensions || "",
          description: p.description || "",
          details: (p.details || []).join("\n"),
          isFeatured: p.isFeatured,
          isNew: p.isNew,
        });
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "name" && !slugTouched) {
      setForm((f) => ({ ...f, slug: slugify(value) }));
    }
    if (field === "slug") setSlugTouched(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      price: Number(form.price),
      details: form.details
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    try {
      if (isEdit) {
        const updated = await updateProduct(id, payload);
        setProduct(updated);
      } else {
        const created = await createProduct(payload);
        navigate(`/admin/products/${created.id}/edit`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await uploadProductImage(id, file);
      setProduct(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveImage(filename) {
    setError(null);
    try {
      const updated = await deleteProductImage(id, filename);
      setProduct(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  if (isEdit && !product && !error) return <p className="admin-state">Loading…</p>;

  return (
    <>
      <div className="admin__toolbar">
        <h1>{isEdit ? `Edit — ${product?.name || ""}` : "New Product"}</h1>
        <Link to="/admin" className="admin-btn admin-btn--ghost">
          ← Back to list
        </Link>
      </div>

      {error && <div className="admin-form__error">{error}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__grid">
          <div className="admin-form__field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>
          <div className="admin-form__field">
            <label>Slug</label>
            <input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
            <span className="admin-form__hint">Used in the URL and as the image folder name.</span>
          </div>
          <div className="admin-form__field">
            <label>Style Code</label>
            <input value={form.styleCode} onChange={(e) => handleChange("styleCode", e.target.value)} required />
          </div>
          <div className="admin-form__field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form__field">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              required
            />
          </div>
          <div className="admin-form__field">
            <label>Currency</label>
            <input value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Colorway</label>
            <input value={form.colorway} onChange={(e) => handleChange("colorway", e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Dimensions</label>
            <input value={form.dimensions} onChange={(e) => handleChange("dimensions", e.target.value)} />
          </div>
          <div className="admin-form__field admin-form__field--full">
            <label>Material</label>
            <input value={form.material} onChange={(e) => handleChange("material", e.target.value)} />
          </div>
          <div className="admin-form__field admin-form__field--full">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>
          <div className="admin-form__field admin-form__field--full">
            <label>Details (one bullet per line)</label>
            <textarea value={form.details} onChange={(e) => handleChange("details", e.target.value)} />
          </div>
        </div>

        <div className="admin-form__checkboxes">
          <label className="admin-form__checkbox">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => handleChange("isFeatured", e.target.checked)}
            />
            Featured
          </label>
          <label className="admin-form__checkbox">
            <input type="checkbox" checked={form.isNew} onChange={(e) => handleChange("isNew", e.target.checked)} />
            New Season
          </label>
        </div>

        <div className="admin-form__actions">
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>

      {isEdit && product && (
        <div className="admin-images">
          <h2>Photos</h2>
          <div className="admin-images__grid">
            {(product.images || []).map((filename) => (
              <div className="admin-images__item" key={filename}>
                <img src={productImageUrl(product, product.images.indexOf(filename))} alt="" />
                <button
                  className="admin-images__remove"
                  onClick={() => handleRemoveImage(filename)}
                  aria-label={`Remove ${filename}`}
                  type="button"
                >
                  ×
                </button>
                <div className="admin-images__filename">{filename}</div>
              </div>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
          />
          <p className="admin-form__hint">JPEG, PNG or WEBP, up to 8MB. Saved to /public/products/{product.slug}/.</p>
        </div>
      )}
    </>
  );
}
