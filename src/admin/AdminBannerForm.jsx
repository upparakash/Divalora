import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  getBanner,
  createBanner,
  updateBanner,
  uploadBannerMedia,
  deleteBannerMedia,
  uploadBannerPoster,
} from "../lib/adminApi.js";
import { bannerMediaUrl, bannerPosterUrl } from "../lib/api.js";
import { PLACEMENTS, TONES } from "../lib/banners.js";

const EMPTY_FORM = {
  placement: PLACEMENTS[0].value,
  eyebrow: "",
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaTo: "",
  tone: "charcoal",
  isActive: true,
};

export default function AdminBannerForm({ mode }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    placement: searchParams.get("placement") || EMPTY_FORM.placement,
  }));
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaInputRef = useRef(null);
  const posterInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    getBanner(id)
      .then((b) => {
        setBanner(b);
        setForm({
          placement: b.placement,
          eyebrow: b.eyebrow || "",
          title: b.title,
          subtitle: b.subtitle || "",
          ctaLabel: b.ctaLabel || "",
          ctaTo: b.ctaTo || "",
          tone: b.tone,
          isActive: b.isActive,
        });
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        const updated = await updateBanner(id, form);
        setBanner(updated);
      } else {
        const created = await createBanner(form);
        navigate(`/admin/banners/${created.id}/edit`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadMedia(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await uploadBannerMedia(id, file);
      setBanner(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  }

  async function handleRemoveMedia() {
    setError(null);
    try {
      const updated = await deleteBannerMedia(id);
      setBanner(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUploadPoster(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await uploadBannerPoster(id, file);
      setBanner(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (posterInputRef.current) posterInputRef.current.value = "";
    }
  }

  if (isEdit && !banner && !error) return <p className="admin-state">Loading…</p>;

  const mediaUrl = banner ? bannerMediaUrl(banner) : null;
  const posterUrl = banner ? bannerPosterUrl(banner) : null;

  return (
    <>
      <div className="admin__toolbar">
        <h1>{isEdit ? `Edit — ${banner?.title || ""}` : "New Banner"}</h1>
        <Link to="/admin/banners" className="admin-btn admin-btn--ghost">
          ← Back to list
        </Link>
      </div>

      {error && <div className="admin-form__error">{error}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__grid">
          <div className="admin-form__field">
            <label>Placement</label>
            <select value={form.placement} onChange={(e) => handleChange("placement", e.target.value)}>
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form__field">
            <label>Tone (text color on media)</label>
            <select value={form.tone} onChange={(e) => handleChange("tone", e.target.value)}>
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form__field">
            <label>Eyebrow</label>
            <input value={form.eyebrow} onChange={(e) => handleChange("eyebrow", e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Title</label>
            <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
          </div>
          <div className="admin-form__field admin-form__field--full">
            <label>Subtitle</label>
            <textarea value={form.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Button Label</label>
            <input value={form.ctaLabel} onChange={(e) => handleChange("ctaLabel", e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Button Link</label>
            <input
              value={form.ctaTo}
              onChange={(e) => handleChange("ctaTo", e.target.value)}
              placeholder="/handbags"
            />
            <span className="admin-form__hint">Leave both blank for no button.</span>
          </div>
        </div>

        <div className="admin-form__checkboxes">
          <label className="admin-form__checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
            />
            Active (included in this placement's rotation)
          </label>
        </div>

        <div className="admin-form__actions">
          <button className="admin-btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </form>

      {isEdit && banner && (
        <div className="admin-images">
          <h2>Media</h2>

          {mediaUrl ? (
            <div className="admin-banner-media-preview">
              {banner.mediaType === "video" ? (
                <video src={mediaUrl} poster={posterUrl || undefined} controls muted />
              ) : (
                <img src={mediaUrl} alt="" />
              )}
              <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={handleRemoveMedia}>
                Remove media
              </button>
            </div>
          ) : (
            <p className="admin-form__hint">No media uploaded yet — the page shows a placeholder graphic.</p>
          )}

          <input
            ref={mediaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={handleUploadMedia}
            disabled={uploading}
          />
          <p className="admin-form__hint">
            JPEG/PNG/WEBP image or MP4/WEBM video, up to 30MB. Saved to /public/banners/{banner.id}/.
          </p>

          {banner.mediaType === "video" && (
            <>
              <h2 style={{ marginTop: 24 }}>Poster (shown while the video loads)</h2>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadPoster}
                disabled={uploading}
              />
              {posterUrl && <img className="admin-banner-poster-preview" src={posterUrl} alt="" />}
            </>
          )}
        </div>
      )}
    </>
  );
}
