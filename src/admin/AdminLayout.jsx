import { Link, NavLink } from "react-router-dom";
import "./admin.css";

export default function AdminLayout({ children, username, onLogout }) {
  return (
    <div className="admin">
      <div className="admin__banner">
        Internal tool — authorized staff only.
      </div>
      <header className="admin__header">
        <div className="admin__title">
          <Link to="/admin">DIVELORA Admin</Link>
        </div>
        <div className="admin__header-actions">
          <Link to="/" target="_blank" rel="noreferrer">
            View storefront ↗
          </Link>
          {username && <span> · Signed in as {username}</span>}
          {onLogout && (
            <>
              {" · "}
              <button className="admin-link-btn" onClick={onLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      </header>
      <div className="admin__body">
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            Products
          </NavLink>
          <NavLink to="/admin/banners" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Banners
          </NavLink>
        </nav>
        {children}
      </div>
    </div>
  );
}
