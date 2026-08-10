import { useState } from "react";
import { Link } from "react-router-dom";
import ImagePanel from "./ImagePanel.jsx";
import { productImageUrl } from "../lib/api.js";
import { formatPrice } from "../lib/format.js";

const TONES = ["gold", "cream", "charcoal", "line", "ink"];

export default function ProductCard({ item, index = 0 }) {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [hoverFailed, setHoverFailed] = useState(false);

  const primary = !primaryFailed ? productImageUrl(item, 0) : null;
  const hover = !hoverFailed ? productImageUrl(item, 1) : null;

  return (
    <Link to={`/product/${item.slug}`} className="products__item">
      <div className="products__media">
        {primary ? (
          <>
            <img
              className="products__img products__img--primary"
              src={primary}
              alt={item.name}
              loading={index < 4 ? "eager" : "lazy"}
              onError={() => setPrimaryFailed(true)}
            />
            {hover && (
              <img
                className="products__img products__img--hover"
                src={hover}
                alt=""
                loading="lazy"
                onError={() => setHoverFailed(true)}
              />
            )}
          </>
        ) : (
          <ImagePanel
            className="products__placeholder"
            tone={TONES[index % TONES.length]}
            caption={item.isNew ? "New Season" : item.category}
            fill
          />
        )}
      </div>
      <div className="products__info">
        <h3>{item.name}</h3>
        <span className="products__price">{formatPrice(item.price, item.currency)}</span>
      </div>
    </Link>
  );
}
