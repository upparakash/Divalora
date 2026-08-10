// Maps URL-friendly slugs <-> the category strings stored in the database.
export const CATEGORIES = [
  { slug: "totes", label: "Tote", plural: "Totes" },
  { slug: "shoulder-bags", label: "Shoulder Bag", plural: "Shoulder Bags" },
  { slug: "top-handle", label: "Top Handle", plural: "Top Handle" },
  { slug: "crossbody", label: "Crossbody", plural: "Crossbody" },
  { slug: "mini-bags", label: "Mini Bag", plural: "Mini Bags" },
  { slug: "clutches", label: "Clutch", plural: "Clutches" },
  { slug: "travel", label: "Travel", plural: "Travel" },
];

export function categoryLabelFromSlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label;
}

export function categorySlugFromLabel(label) {
  return CATEGORIES.find((c) => c.label === label)?.slug;
}
