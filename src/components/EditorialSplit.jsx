import { Link } from "react-router-dom";
import ImagePanel from "./ImagePanel.jsx";
import "./EditorialSplit.css";

export default function EditorialSplit({
  eyebrow,
  title,
  copy,
  ctaLabel,
  ctaTo,
  tone = "gold",
  reverse = false,
  image,
  imageAlt = "",
}) {
  return (
    <section className={"editorial container" + (reverse ? " editorial--reverse" : "")}>
      <div className="editorial__media">
        <ImagePanel tone={tone} ratio="4 / 5" image={image} imageAlt={imageAlt} />
      </div>
      <div className="editorial__copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        <p>{copy}</p>
        {ctaLabel && (
          <Link to={ctaTo} className="btn-outline editorial__cta">
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
