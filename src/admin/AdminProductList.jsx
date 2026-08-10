import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listProducts,
  deleteProduct,
  setProductFlags,
  reorderProducts,
} from "../lib/adminApi.js";
import { formatPrice } from "../lib/format.js";
import { productImageUrl } from "../lib/api.js";

export default function AdminProductList() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    listProducts()
      .then(setItems)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleToggleFlag(product, flag) {
    setBusyId(product.id);
    try {
      const updated = await setProductFlags(product.id, { [flag]: !product[flag] });
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This also removes its uploaded photos.`)) return;
    setBusyId(product.id);
    try {
      await deleteProduct(product.id);
      setItems((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);

    setBusyId(reordered[index].id);
    try {
      const order = reordered.map((p, i) => ({ id: p.id, sortOrder: i }));
      const updated = await reorderProducts(order);
      setItems(updated);
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="admin-state">Couldn't load products — {error}</p>;
  if (!items) return <p className="admin-state">Loading…</p>;

  return (
    <>
      <div className="admin__toolbar">
        <h1>Products ({items.length})</h1>
        <Link to="/admin/products/new" className="admin-btn">
          + New Product
        </Link>
      </div>

      <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Style Code</th>
            <th>Category</th>
            <th>Price</th>
            <th>Featured</th>
            <th>New</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => {
            const thumb = productImageUrl(p, 0);
            return (
              <tr key={p.id}>
                <td>
                  {thumb ? (
                    <img className="admin-table__thumb" src={thumb} alt="" />
                  ) : (
                    <div className="admin-table__thumb-empty">No img</div>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.styleCode}</td>
                <td>{p.category}</td>
                <td>{formatPrice(p.price, p.currency)}</td>
                <td>
                  <button
                    className={"admin-tag" + (p.isFeatured ? " admin-tag--on" : "")}
                    onClick={() => handleToggleFlag(p, "isFeatured")}
                    disabled={busyId === p.id}
                  >
                    {p.isFeatured ? "Featured" : "—"}
                  </button>
                </td>
                <td>
                  <button
                    className={"admin-tag" + (p.isNew ? " admin-tag--on" : "")}
                    onClick={() => handleToggleFlag(p, "isNew")}
                    disabled={busyId === p.id}
                  >
                    {p.isNew ? "New" : "—"}
                  </button>
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => handleMove(i, -1)}
                      disabled={i === 0 || busyId === p.id}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => handleMove(i, 1)}
                      disabled={i === items.length - 1 || busyId === p.id}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <Link className="admin-btn admin-btn--ghost admin-btn--sm" to={`/admin/products/${p.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => handleDelete(p)}
                      disabled={busyId === p.id}
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
    </>
  );
}
