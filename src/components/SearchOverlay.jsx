import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { search, getProduct, productImageUrl } from "../lib/api.js";
import { formatPrice } from "../lib/format.js";
import "./SearchOverlay.css";

export default function SearchOverlay({ open, onClose }) {
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    inputRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !overlayRef.current) return;

      const focusable = overlayRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      search(trimmed, 6)
        .then((data) => setResults(data.items))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function goToProduct(slug) {
    onClose();
    navigate(`/product/${slug}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const product = await getProduct(trimmed);
      goToProduct(product.slug);
    } catch {
      onClose();
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search" ref={overlayRef}>
      <button className="search-overlay__close" aria-label="Close search" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <div className="search-overlay__body container">
        <form className="search-overlay__form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="search-overlay__input"
            placeholder="Search handbags or a style code"
            aria-label="Search handbags or a style code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {query.trim().length >= 2 && (
          <div className="search-overlay__results">
            {loading && <p className="search-overlay__state">Searching…</p>}
            {!loading && results && results.length === 0 && (
              <p className="search-overlay__state">No results for "{query.trim()}"</p>
            )}
            {!loading && results && results.length > 0 && (
              <ul className="search-overlay__list">
                {results.map((item) => {
                  const img = productImageUrl(item, 0);
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/product/${item.slug}`}
                        className="search-overlay__result"
                        onClick={onClose}
                      >
                        <span className="search-overlay__thumb">
                          {img && <img src={img} alt="" loading="lazy" />}
                        </span>
                        <span className="search-overlay__result-info">
                          <span className="search-overlay__result-name">{item.name}</span>
                          <span className="search-overlay__result-meta">
                            {item.styleCode} · {formatPrice(item.price, item.currency)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
