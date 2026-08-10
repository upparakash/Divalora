import { useEffect, useState } from "react";
import BannerCarousel from "../components/BannerCarousel.jsx";
import CollectionGrid from "../components/CollectionGrid.jsx";
import EditorialSplit from "../components/EditorialSplit.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Seo from "../components/Seo.jsx";
import { getProducts } from "../lib/api.js";
import "./Home.css";

export default function Home() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    getProducts({ featured: true, sort: "curated", limit: 4 })
      .then((data) => setFeatured(data.items))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <Seo
        title="Italian Handbags & Leather Goods"
        description="Discover the DIVELORA handbag collection — leather goods crafted by hand in Milan since 1913."
      />
      <div className="home-hero-bleed">
        <BannerCarousel
          placement="home"
          fallback={{
            eyebrow: "Fall / Winter 2026",
            title: "Crafted Rarity, Carried Daily",
            subtitle:
              "Discover the new DIVELORA handbag collection — leather goods shaped by four generations of Italian craftsmanship.",
            ctaLabel: "Discover the Collection",
            ctaTo: "/handbags",
            tone: "charcoal",
            mediaUrl: "/products/galleria-top-handle/1.jpg",
            mediaType: "image",
          }}
        />
      </div>

      <CollectionGrid
        heading="Shop by Category"
        subheading="One house, one craft — explore the silhouettes that define the DIVELORA handbag this season."
        items={[
          {
            title: "Totes",
            caption: "Structured Leather",
            tone: "cream",
            to: "/handbags/totes",
            image: "/products/structured-saffiano-tote/1.jpg",
          },
          {
            title: "Shoulder Bags",
            caption: "Everyday Carry",
            tone: "charcoal",
            to: "/handbags/shoulder-bags",
            image: "/products/pebbled-leather-hobo/1.jpg",
          },
          {
            title: "Top Handle",
            caption: "The Icons",
            tone: "gold",
            to: "/handbags/top-handle",
            image: "/products/galleria-top-handle/1.jpg",
          },
        ]}
      />

      {featured && featured.length > 0 && (
        <section className="home-featured">
          <div className="collection__head container">
            <span className="eyebrow">Season's Icons</span>
            <h2>Featured This Season</h2>
          </div>
          <ProductGrid items={featured} />
        </section>
      )}

      <EditorialSplit
        eyebrow="The Icons"
        title="The Galleria, Reimagined"
        copy="Born from an archival sketch, the Galleria returns this season in supple Re-Nappa leather and a new saffiano weave — a study in structure and ease carried by hand since 1913."
        ctaLabel="Explore Handbags"
        ctaTo="/handbags"
        tone="gold"
        image="/products/galleria-top-handle/1.jpg"
        imageAlt="Galleria Top-Handle"
      />

      <EditorialSplit
        eyebrow="Atelier"
        title="Made by Hand, Meant to Last"
        copy="Every piece begins in our Milan ateliers, where master artisans cut, stitch and finish each detail by hand — a process unchanged for a century, refined for today."
        ctaLabel="Discover the Maison"
        ctaTo="/about"
        tone="line"
        reverse
        image="/products/leather-wristlet-pouch/1.jpg"
        imageAlt="Hand-finished leather craftsmanship"
      />
    </>
  );
}
