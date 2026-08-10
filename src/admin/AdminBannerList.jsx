import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listBanners, deleteBanner, setBannerFlags, reorderBanners } from "../lib/adminApi.js";
import { bannerMediaUrl } from "../lib/api.js";
import { PLACEMENTS } from "../lib/banners.js";

export default function AdminBannerList() {
  const [banners, setBanners] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    listBanners()
      .then(setBanners)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleToggleActive(banner) {
    setBusyId(banner.id);
    try {
      const updated = await setBannerFlags(banner.id, { isActive: !banner.isActive });
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(banner) {
    if (!window.confirm(`Delete the "${banner.title}" banner? This also removes its uploaded media.`)) return;
    setBusyId(banner.id);
    try {
      await deleteBanner(banner.id);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(group, index, direction) {
    const target = index + direction;
    if (target < 0 || target >= group.length) return;

    const reordered = [...group];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setBanners((prev) => {
      const others = prev.filter((b) => b.placement !== group[0].placement);
      return [...others, ...reordered].sort((a, b) => a.placement.localeCompare(b.placement));
    });

    setBusyId(reordered[index].id);
    try {
      const order = reordered.map((b, i) => ({ id: b.id, sortOrder: i }));
      await reorderBanners(order);
      load();
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="admin-state">Couldn't load banners — {error}</p>;
  if (!banners) return <p className="admin-state">Loading…</p>;

  return (
    <>
      <div className="admin__toolbar">
        <h1>Banners ({banners.length})</h1>
      </div>

      {PLACEMENTS.map(({ value, label }) => {
        const group = banners.filter((b) => b.placement === value);
        return (
          <div key={value} className="admin-banner-group">
            <div className="admin-banner-group__head">
              <h2>{label}</h2>
              <Link to={`/admin/banners/new?placement=${value}`} className="admin-btn admin-btn--sm">
                + New Banner
              </Link>
            </div>

            {group.length === 0 ? (
              <p className="admin-state admin-state--inline">
                No banners yet — the page falls back to its built-in default content.
              </p>
            ) : (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Active</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((b, i) => {
                      const thumb = bannerMediaUrl(b);
                      return (
                        <tr key={b.id}>
                          <td>
                            {thumb ? (
                              b.mediaType === "video" ? (
                                <div className="admin-table__thumb-empty">▶ Video</div>
                              ) : (
                                <img className="admin-table__thumb" src={thumb} alt="" />
                              )
                            ) : (
                              <div className="admin-table__thumb-empty">No media</div>
                            )}
                          </td>
                          <td>{b.title}</td>
                          <td>{b.mediaType}</td>
                          <td>
                            <button
                              className={"admin-tag" + (b.isActive ? " admin-tag--on" : "")}
                              onClick={() => handleToggleActive(b)}
                              disabled={busyId === b.id}
                            >
                              {b.isActive ? "Active" : "—"}
                            </button>
                          </td>
                          <td>
                            <div className="admin-table__actions">
                              <button
                                className="admin-btn admin-btn--ghost admin-btn--sm"
                                onClick={() => handleMove(group, i, -1)}
                                disabled={i === 0 || busyId === b.id}
                                aria-label="Move up"
                              >
                                ↑
                              </button>
                              <button
                                className="admin-btn admin-btn--ghost admin-btn--sm"
                                onClick={() => handleMove(group, i, 1)}
                                disabled={i === group.length - 1 || busyId === b.id}
                                aria-label="Move down"
                              >
                                ↓
                              </button>
                              <Link className="admin-btn admin-btn--ghost admin-btn--sm" to={`/admin/banners/${b.id}/edit`}>
                                Edit
                              </Link>
                              <button
                                className="admin-btn admin-btn--danger admin-btn--sm"
                                onClick={() => handleDelete(b)}
                                disabled={busyId === b.id}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
