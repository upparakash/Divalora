import { useState } from "react";
import "./Accordion.css";

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className="accordion__item" key={item.title}>
            <button
              className="accordion__trigger"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              {item.title}
              <span className="accordion__icon">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <div className="accordion__panel">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
