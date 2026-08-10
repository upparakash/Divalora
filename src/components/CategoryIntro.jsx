import "./CategoryIntro.css";

// `level` controls whether the title renders as the page's <h1> (when this
// component isn't preceded by a Hero, e.g. Search) or an <h2> (when a Hero
// above it already owns the page's <h1>, e.g. the handbags listing).
export default function CategoryIntro({ eyebrow, title, copy, level = 2 }) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="category-intro">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Heading>{title}</Heading>
      {copy && <p>{copy}</p>}
    </div>
  );
}
