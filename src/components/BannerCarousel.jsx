import { useEffect, useRef, useState } from "react";
import Hero from "./Hero.jsx";
import { getBanners, bannerMediaUrl, bannerPosterUrl } from "../lib/api.js";
import "./BannerCarousel.css";

const AUTOPLAY_MS = 6000;

export default function BannerCarousel({ placement, fallback }) {
  const [banners, setBanners] = useState(null);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getBanners(placement)
      .then((data) => {
        if (!cancelled) setBanners(data);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  const slides = banners && banners.length > 0 ? banners : null;
  const count = slides?.length || 0;
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!slides || count < 2 || reducedMotion) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, count, reducedMotion, index]);

  function pause() {
    clearInterval(timerRef.current);
  }

  function resume() {
    if (!slides || count < 2 || reducedMotion) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
  }

  function goTo(i) {
    pause();
    setIndex(((i % count) + count) % count);
  }

  function handleKeyDown(e) {
    if (count < 2) return;
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null || count < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    goTo(delta < 0 ? index + 1 : index - 1);
  }

  // Loading, or fetched-but-empty (e.g. admin deactivated every banner for
  // this placement) — the fallback keeps the hero from ever going blank or
  // shifting layout, matching the lesson from Phase 6's CLS fix.
  if (!slides) {
    return <Hero {...fallback} />;
  }

  const active = slides[index];

  return (
    <div
      className="banner-carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      role={count > 1 ? "region" : undefined}
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={count > 1 ? "Featured banners" : undefined}
      tabIndex={count > 1 ? 0 : undefined}
    >
      <Hero
        key={active.id}
        eyebrow={active.eyebrow}
        title={active.title}
        subtitle={active.subtitle}
        ctaLabel={active.ctaLabel}
        ctaTo={active.ctaTo}
        tone={active.tone}
        mediaUrl={bannerMediaUrl(active)}
        mediaType={active.mediaType}
        posterUrl={bannerPosterUrl(active)}
      />

      {count > 1 && (
        <>
          <button
            className="banner-carousel__arrow banner-carousel__arrow--prev"
            onClick={() => goTo(index - 1)}
            aria-label="Previous banner"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            className="banner-carousel__arrow banner-carousel__arrow--next"
            onClick={() => goTo(index + 1)}
            aria-label="Next banner"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="banner-carousel__dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={"banner-carousel__dot" + (i === index ? " is-active" : "")}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1} of ${count}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
