import ProductCard from "./ProductCard.jsx";
import "./ProductGrid.css";

export default function ProductGrid({ items }) {
  return (
    <div className="products container">
      {items.map((item, i) => (
        <ProductCard key={item.id ?? item.slug} item={item} index={i} />
      ))}
    </div>
  );
}
