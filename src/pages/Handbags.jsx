import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BannerCarousel from "../components/BannerCarousel.jsx";
import CategoryIntro from "../components/CategoryIntro.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Seo from "../components/Seo.jsx";
import NotFound from "./NotFound.jsx";
import { getProducts } from "../lib/api.js";
import { CATEGORIES, categoryLabelFromSlug } from "../lib/categories.js";
import "./Handbags.css";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function Handbags() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const newOnly = searchParams.get("new") === "true";

  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const categoryLabel = categorySlug ? categoryLabelFromSlug(categorySlug) : null;
  const invalidCategory = categorySlug && !categoryLabel;

  useEffect(() => {
    if (invalidCategory) return;
    setItems(null);
    setError(null);
    getProducts({ category: categoryLabel, sort, limit: 60, isNew: newOnly ? true : undefined })
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, [categoryLabel, sort, newOnly, invalidCategory]);

  if (invalidCategory) return <NotFound />;

  const title = newOnly
    ? "New Arrivals"
    : categoryLabel
    ? CATEGORIES.find((c) => c.label === categoryLabel).plural
    : "Icons & New Arrivals";

  return (
    <>
      <Seo
        title={title}
        description="Shop the DIVELORA handbag collection — signature saffiano, supple Re-Nappa and hand-finished hardware, crafted in Italy."
      />
      <BannerCarousel
        placement="handbags"
        fallback={{
          eyebrow: "Bags & Accessories",
          title: "Leather Goods, Fall / Winter 2026",
          subtitle: "The Galleria, the Re-Nappa Hobo and the season's essential small leather goods.",
          tone: "gold",
          mediaUrl: "/products/pebbled-leather-hobo/1.jpg",
          mediaType: "image",
        }}
      />
      <CategoryIntro
        eyebrow="The Selection"
        title={title}
        copy="Signature saffiano, supple Re-Nappa and hand-finished hardware — the house's most enduring shapes, alongside the season's new icons."
      />

      <div className="plp-toolbar container">
        <div className="plp-toolbar__tabs">
          <Link to="/handbags" className={"plp-toolbar__tab" + (!categorySlug ? " is-active" : "")}>
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/handbags/${c.slug}`}
              className={"plp-toolbar__tab" + (categorySlug === c.slug ? " is-active" : "")}
            >
              {c.plural}
            </Link>
          ))}
        </div>

        <select
          className="plp-toolbar__sort"
          value={sort}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams);
            if (e.target.value === "newest") next.delete("sort");
            else next.set("sort", e.target.value);
            setSearchParams(next);
          }}
          aria-label="Sort products"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="container products-state">Couldn't load the collection — {error}</p>}
      {!error && !items && <p className="container products-state">Loading the collection…</p>}
      {items && items.length === 0 && <p className="container products-state">No products in this category yet.</p>}
      {items && items.length > 0 && <ProductGrid items={items} />}
    </>
  );
}
