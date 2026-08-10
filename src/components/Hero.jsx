import { useState } from "react";
import { Link } from "react-router-dom";
import ImagePanel from "./ImagePanel.jsx";
import "./Hero.css";

const LIGHT_BG_TONES = ["cream", "line", "gold"];

export default function Hero({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  tone = "charcoal",
  mediaUrl,
  mediaType,
  posterUrl,
}) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const onLight = LIGHT_BG_TONES.includes(tone);
  const showMedia = mediaUrl && !mediaFailed;

  return (
    <section className={"hero" + (onLight ? " hero--on-light" : "") + (showMedia ? " hero--has-media" : "")}>
      {showMedia ? (
        mediaType === "video" ? (
          <video
            className="hero__panel hero__media"
            src={mediaUrl}
            poster={posterUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setMediaFailed(true)}
          />
        ) : (
          <img
            className="hero__panel hero__media"
            src={mediaUrl}
            alt=""
            onError={() => setMediaFailed(true)}
          />
        )
      ) : (
        <ImagePanel tone={tone} fill className="hero__panel" />
      )}
      <div className="hero__overlay container">
        {eyebrow && <span className="eyebrow hero__eyebrow">{eyebrow}</span>}
        <h1 className="hero__title">{title}</h1>
        {subtitle && <p className="hero__subtitle">{subtitle}</p>}
        {ctaLabel && (
          <Link to={ctaTo} className="btn-gold hero__cta">
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
