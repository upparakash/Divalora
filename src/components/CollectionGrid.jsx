import { Link } from "react-router-dom";
import ImagePanel from "./ImagePanel.jsx";
import "./CollectionGrid.css";

export default function CollectionGrid({ heading, subheading, items }) {
  return (
    <section className="collection container">
      {(heading || subheading) && (
        <div className="collection__head">
          {heading && <h2>{heading}</h2>}
          {subheading && <p>{subheading}</p>}
        </div>
      )}
      <div className="collection__grid">
        {items.map((item) => (
          <Link key={item.title} to={item.to} className="collection__item">
            <ImagePanel
              tone={item.tone}
              caption={item.caption}
              title={item.title}
              image={item.image}
              imageAlt={item.title}
            />
            <div className="collection__meta">
              <span>{item.title}</span>
              <span className="collection__arrow">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
