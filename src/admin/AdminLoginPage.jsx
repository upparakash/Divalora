import { useState } from "react";
import { login } from "../lib/adminApi.js";
import "./admin.css";

export default function AdminLoginPage({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(username, password);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin">
      <div className="admin__banner">Internal tool — authorized staff only.</div>
      <div className="admin-login">
        <form className="admin-form admin-login__form" onSubmit={handleSubmit}>
          <h1 className="admin-login__title">DIVELORA Admin</h1>
          {error && <div className="admin-form__error">{error}</div>}
          <div className="admin-form__field">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="admin-form__field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="admin-form__actions">
            <button className="admin-btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
