import { useState } from "react";
import "./ImagePanel.css";

const TONES = ["gold", "charcoal", "cream", "line", "ink"];

export default function ImagePanel({
  tone = "cream",
  ratio = "4 / 5",
  caption,
  title,
  className = "",
  fill = false,
  image = null,
  imageAlt = "",
}) {
  const safeTone = TONES.includes(tone) ? tone : "cream";
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = image && !imageFailed;

  return (
    <div
      className={`panel panel--${safeTone} ${className}`}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      {showImage ? (
        <img
          className="panel__img"
          src={image}
          alt={imageAlt}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="panel__monogram" aria-hidden="true">
          D
        </div>
      )}
      {(title || caption) && (
        <div className="panel__text">
          {caption && <span className="panel__caption">{caption}</span>}
          {title && <span className="panel__title">{title}</span>}
        </div>
      )}
    </div>
  );
}
