import { useState } from "react";
import Logo from "./Logo.jsx";
import "./Footer.css";

const COLUMNS = [
  {
    title: "Client Services",
    links: ["Contact Us", "Shipping & Returns", "Care & Repair", "Size Guide", "FAQ"],
  },
  {
    title: "The Maison",
    links: ["Our Story", "Sustainability", "Ateliers", "Careers", "Press"],
  },
  {
    title: "Legal",
    links: ["Terms of Sale", "Privacy Policy", "Cookie Policy", "Legal Area"],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  }

  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__newsletter">
          <h3>Join the House of DIVELORA</h3>
          <p>Be the first to know about new collections, private events and the DIVELORA world.</p>
          <form className="footer__form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn-outline">
              Subscribe
            </button>
          </form>
          {sent && <p className="footer__thanks">Thank you — welcome to DIVELORA.</p>}
        </div>

        <div className="footer__columns">
          {COLUMNS.map((col) => (
            <div key={col.title} className="footer__col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer__divider container" />

      <div className="container footer__bottom">
        <Logo variant="compact" tone="dark" />
        <p className="footer__copy">&copy; {new Date().getFullYear()} DIVELORA. All rights reserved.</p>
        <div className="footer__social">
          <a href="#">
            IG<span className="sr-only"> (Instagram)</span>
          </a>
          <a href="#">
            FB<span className="sr-only"> (Facebook)</span>
          </a>
          <a href="#">
            PT<span className="sr-only"> (Pinterest)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
