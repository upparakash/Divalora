import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";
import AdminLoginPage from "./AdminLoginPage.jsx";
import AdminProductList from "./AdminProductList.jsx";
import AdminProductForm from "./AdminProductForm.jsx";
import AdminBannerList from "./AdminBannerList.jsx";
import AdminBannerForm from "./AdminBannerForm.jsx";
import { me, logout } from "../lib/adminApi.js";

export default function AdminApp() {
  const [session, setSession] = useState({ status: "loading", username: null });

  useEffect(() => {
    me()
      .then((data) => setSession({ status: "authed", username: data.username }))
      .catch(() => setSession({ status: "anon", username: null }));
  }, []);

  async function handleLogout() {
    await logout().catch(() => {});
    setSession({ status: "anon", username: null });
  }

  if (session.status === "loading") {
    return (
      <div className="admin">
        <p className="admin-state">Loading…</p>
      </div>
    );
  }

  if (session.status === "anon") {
    return <AdminLoginPage onSuccess={(user) => setSession({ status: "authed", username: user.username })} />;
  }

  return (
    <AdminLayout username={session.username} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<AdminProductList />} />
        <Route path="/products/new" element={<AdminProductForm mode="create" />} />
        <Route path="/products/:id/edit" element={<AdminProductForm mode="edit" />} />
        <Route path="/banners" element={<AdminBannerList />} />
        <Route path="/banners/new" element={<AdminBannerForm mode="create" />} />
        <Route path="/banners/:id/edit" element={<AdminBannerForm mode="edit" />} />
      </Routes>
    </AdminLayout>
  );
}
