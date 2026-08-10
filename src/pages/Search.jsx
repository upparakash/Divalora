import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoryIntro from "../components/CategoryIntro.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Seo from "../components/Seo.jsx";
import { search } from "../lib/api.js";

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setResults(null);
    setError(null);
    search(q, 60)
      .then((data) => setResults(data.items))
      .catch((err) => setError(err.message));
  }, [q]);

  return (
    <>
      <Seo title={q ? `Results for "${q}"` : "Search"} noindex />
      <CategoryIntro
        level={1}
        eyebrow="Search"
        title={q ? `Results for "${q}"` : "Search"}
        copy={
          q.length < 2
            ? "Enter at least two characters to search the collection."
            : "Handbags matching your search, across every category."
        }
      />

      {error && <p className="container products-state">Couldn't load results — {error}</p>}
      {!error && q.length >= 2 && !results && (
        <div className="products-skeleton" role="status">
          <span className="sr-only">Searching…</span>
        </div>
      )}
      {!error && results && results.length === 0 && q.length >= 2 && (
        <p className="container products-state">No handbags matched "{q}".</p>
      )}
      {results && results.length > 0 && (
        <>
          <h2 className="sr-only">Search Results</h2>
          <ProductGrid items={results} />
        </>
      )}
    </>
  );
}
