import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import SearchOverlay from "./SearchOverlay.jsx";
import { CATEGORIES } from "../lib/categories.js";
import "./Navbar.css";

const LINKS = [
  { to: "/handbags?new=true", label: "New Arrivals" },
  { to: "/handbags", label: "Handbags", mega: true },
  { to: "/about", label: "Maison" },
];

// How far you can scroll before the transparent hero header gets a white
// strip behind it — small enough that any deliberate scroll triggers it.
const TRANSPARENT_THRESHOLD = 40;

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(() => typeof window === "undefined" || window.scrollY <= TRANSPARENT_THRESHOLD);
  const lastScrollY = useRef(0);
  const megaTriggerRef = useRef(null);

  const transparent = isHome && atTop && !open && !megaOpen && !searchOpen;

  function handleMegaBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setMegaOpen(false);
    }
  }

  function handleMegaKeyDown(e) {
    if (e.key === "Escape") {
      setMegaOpen(false);
      megaTriggerRef.current?.focus();
    }
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setAtTop(y <= TRANSPARENT_THRESHOLD);
      if (megaOpen || searchOpen) {
        lastScrollY.current = y;
        return;
      }
      const scrollingDown = y > lastScrollY.current;
      setHidden(scrollingDown && y > 120);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [megaOpen, searchOpen]);

  useEffect(() => {
    setAtTop(window.scrollY <= TRANSPARENT_THRESHOLD);
    lastScrollY.current = window.scrollY;
    setHidden(false);
  }, [location.pathname]);

  return (
    <>
      <header className={"navbar" + (hidden ? " navbar--hidden" : "") + (transparent ? " navbar--transparent" : "")}>
        <div className="navbar__bar container">
          <button
            className="navbar__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="navbar__links navbar__links--desktop">
            {LINKS.map((l) =>
              l.mega ? (
                <div
                  key={l.label}
                  className="navbar__mega-trigger"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                  onFocus={() => setMegaOpen(true)}
                  onBlur={handleMegaBlur}
                  onKeyDown={handleMegaKeyDown}
                >
                  <NavLink
                    ref={megaTriggerRef}
                    to={l.to}
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                    className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
                  >
                    {l.label}
                  </NavLink>

                  <div className={"navbar__mega" + (megaOpen ? " is-open" : "")}>
                    <div className="navbar__mega-inner container">
                      {CATEGORIES.map((c) => (
                        <NavLink key={c.slug} to={`/handbags/${c.slug}`} className="navbar__mega-link">
                          {c.plural}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
                >
                  {l.label}
                </NavLink>
              )
            )}
          </nav>

          <NavLink to="/" className="navbar__logo" aria-label="DIVELORA home">
            <Logo variant="compact" tone={transparent ? "light" : "dark"} />
          </NavLink>

          <div className="navbar__icons">
            <button
              className="navbar__icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.2" y2="16.2" />
              </svg>
            </button>
          </div>
        </div>

        <div className={"navbar__mobile" + (open ? " is-open" : "")}>
          {LINKS.map((l) => (
            <div key={l.label} className="navbar__mobile-group">
              <NavLink
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => "navbar__mobile-link" + (isActive ? " is-active" : "")}
              >
                {l.label}
              </NavLink>
              {l.mega && (
                <div className="navbar__mobile-sub">
                  {CATEGORIES.map((c) => (
                    <NavLink
                      key={c.slug}
                      to={`/handbags/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="navbar__mobile-sub-link"
                    >
                      {c.plural}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
