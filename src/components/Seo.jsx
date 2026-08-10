// React 19 hoists <title>/<meta>/<link> rendered anywhere in the tree into
// <head> automatically — no head-management library needed for this SPA.
export default function Seo({ title, description, image, type = "website", noindex = false }) {
  const fullTitle = title ? `${title} | DIVELORA` : "DIVELORA — Italian Handbags & Leather Goods";

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
    </>
  );
}
