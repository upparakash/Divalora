import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ImagePanel from "../components/ImagePanel.jsx";
import Accordion from "../components/Accordion.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Seo from "../components/Seo.jsx";
import NotFound from "./NotFound.jsx";
import { getProduct, getProducts, productImageUrl } from "../lib/api.js";
import { formatPrice } from "../lib/format.js";
import { categorySlugFromLabel } from "../lib/categories.js";
import "./ProductDetail.css";

// Static fallback shown when the API is unreachable, so the page never goes
// blank if the backend/DB is down — mirrors the BannerCarousel fallback
// pattern used on the home page.
const STATIC_FALLBACK_PRODUCT = {
  slug: "galleria-top-handle",
  styleCode: "DVL-0142",
  name: "Galleria Top-Handle",
  category: "Top Handle",
  price: 2450,
  currency: "USD",
  colorway: "Cognac",
  material: "Full-grain Italian calfskin, brass hardware, suede lining.",
  dimensions: '11" W x 8" H x 4.5" D',
  description:
    "Born from an archival sketch, the Galleria returns this season in supple leather — a study in structure and ease carried by hand since 1913.",
  details: [
    "Hand-cut and stitched in Milan",
    "Detachable, adjustable shoulder strap",
    "Interior zip and slip pockets",
    "Protective dust bag included",
  ],
  images: ["1.jpg"],
};

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState(null);
  const [brokenImages, setBrokenImages] = useState(() => new Set());
  const touchStartX = useRef(null);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setActiveImage(0);
    setRelated(null);
    setBrokenImages(new Set());

    getProduct(slug)
      .then(setProduct)
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
        else setProduct(STATIC_FALLBACK_PRODUCT);
      });
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    getProducts({ category: product.category, excludeSlug: product.slug, limit: 4 })
      .then((data) => setRelated(data.items))
      .catch(() => setRelated([]));
  }, [product]);

  if (notFound) return <NotFound />;

  if (!product) {
    // Mirrors the loaded layout's structure/heights so the real content
    // doesn't shove the footer down once it arrives (see development.md's
    // Phase 6 CLS fix).
    return (
      <div className="pdp" aria-busy="true">
        <div className="pdp__breadcrumb container">&nbsp;</div>
        <div className="pdp__layout container">
          <div className="pdp__gallery">
            <div className="pdp__main-image" />
          </div>
          <div className="pdp__info">
            <div className="pdp__skel-line pdp__skel-line--eyebrow" />
            <div className="pdp__skel-line pdp__skel-line--title" />
            <div className="pdp__skel-line pdp__skel-line--price" />
            <div className="pdp__skel-line pdp__skel-line--text" />
            <div className="pdp__skel-line pdp__skel-line--text" />
            <div className="pdp__skel-line pdp__skel-line--text short" />
          </div>
        </div>
        <div className="products-skeleton" aria-hidden="true" />
      </div>
    );
  }

  const images = product.images || [];
  const validIndices = images.map((_, i) => i).filter((i) => !brokenImages.has(i));
  const effectiveActive = validIndices.includes(activeImage) ? activeImage : validIndices[0];
  // When a product has no photography of its own, productImageUrl(product, 0)
  // falls back to a representative photo from the same category.
  const mainImage =
    effectiveActive !== undefined ? productImageUrl(product, effectiveActive) : productImageUrl(product, 0);
  const categorySlug = categorySlugFromLabel(product.category);

  function markBroken(index) {
    setBrokenImages((prev) => new Set(prev).add(index));
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;

    const pos = validIndices.indexOf(effectiveActive);
    if (pos === -1) return;
    if (deltaX < 0 && pos < validIndices.length - 1) {
      setActiveImage(validIndices[pos + 1]);
    } else if (deltaX > 0 && pos > 0) {
      setActiveImage(validIndices[pos - 1]);
    }
  }

  const accordionItems = [
    {
      title: "The Details",
      content:
        product.details?.length ? (
          <ul>
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p>{product.description}</p>
        ),
    },
  ];
  if (product.material) {
    accordionItems.push({ title: "Composition & Care", content: <p>{product.material}</p> });
  }
  if (product.dimensions) {
    accordionItems.push({ title: "Dimensions", content: <p>{product.dimensions}</p> });
  }

  return (
    <div className="pdp">
      <Seo
        title={product.name}
        description={product.description || `${product.name} — ${product.category} by DIVELORA.`}
        image={mainImage ? `${window.location.origin}${mainImage}` : undefined}
        type="product"
      />
      <div className="pdp__breadcrumb container">
        <Link to="/">Home</Link> / <Link to="/handbags">Handbags</Link>
        {categorySlug && (
          <>
            {" / "}
            <Link to={`/handbags/${categorySlug}`}>{product.category}</Link>
          </>
        )}
        {" / "}
        <span>{product.name}</span>
      </div>

      <div className="pdp__layout container">
        <div className="pdp__gallery">
          <div className="pdp__main-image" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {mainImage ? (
              <img src={mainImage} alt={product.name} onError={() => markBroken(effectiveActive)} />
            ) : (
              <ImagePanel tone="cream" fill title={product.name} caption={product.category} />
            )}
          </div>
          {validIndices.length > 1 && (
            <div className="pdp__thumbs">
              {validIndices.map((i) => (
                <button
                  key={i}
                  className={"pdp__thumb" + (i === effectiveActive ? " is-active" : "")}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={productImageUrl(product, i)} alt="" loading="lazy" onError={() => markBroken(i)} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <span className="pdp__price">{formatPrice(product.price, product.currency)}</span>
          <span className="pdp__style-code">Style {product.styleCode}</span>
          {product.colorway && <p className="pdp__colorway">Color: {product.colorway}</p>}
          {product.description && <p className="pdp__description">{product.description}</p>}

          <Accordion items={accordionItems} />
        </div>
      </div>

      {related === null && <div className="products-skeleton" aria-hidden="true" />}
      {related && related.length > 0 && (
        <div className="pdp__related">
          <h2 className="container">You May Also Like</h2>
          <ProductGrid items={related} />
        </div>
      )}
    </div>
  );
}
