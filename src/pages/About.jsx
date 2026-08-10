import BannerCarousel from "../components/BannerCarousel.jsx";
import EditorialSplit from "../components/EditorialSplit.jsx";
import Seo from "../components/Seo.jsx";
import "./About.css";

const PILLARS = [
  {
    num: "I",
    title: "Heritage",
    copy: "Founded in Milan in 1913, DIVELORA has shaped four generations of Italian design, from the first travel trunk to today's handbags.",
  },
  {
    num: "II",
    title: "Craftsmanship",
    copy: "Every piece is cut, stitched and finished by hand in our Italian ateliers — a process of quiet precision passed down through apprenticeship.",
  },
  {
    num: "III",
    title: "Responsibility",
    copy: "From regenerated nylon to responsibly sourced leathers, we are committed to a future where craft and conscience move forward together.",
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="The Maison"
        description="Founded in Milan in 1913, DIVELORA is a house of handbags and leather goods built on four generations of Italian craftsmanship."
      />
      <BannerCarousel
        placement="about"
        fallback={{
          eyebrow: "The Maison",
          title: "A Century of Italian Craft",
          subtitle: "DIVELORA was founded on a simple belief: that rarity is not an accident, it is made by hand.",
          tone: "ink",
          mediaUrl: "/products/structured-saffiano-tote/1.jpg",
          mediaType: "image",
        }}
      />

      <div className="about-intro">
        <span className="eyebrow">Our Story</span>
        <h2>Founded in Milan, 1913</h2>
        <p>
          What began as a single leather workshop off the Galleria has grown, over four
          generations, into a house defined by its restraint — clean lines, considered materials
          and a refusal to chase trend over craft. Today DIVELORA designs handbags and leather
          goods from the same Milan ateliers where the house first began, each piece built to be
          carried for a lifetime, not a season.
        </p>
      </div>

      <div className="pillars container">
        {PILLARS.map((p) => (
          <div key={p.title} className="pillar">
            <span className="pillar__num">{p.num}</span>
            <h3>{p.title}</h3>
            <p>{p.copy}</p>
          </div>
        ))}
      </div>

      <EditorialSplit
        eyebrow="Ateliers"
        title="Where Every Piece Begins"
        copy="Our artisans train for years before a single stitch bears the DIVELORA name — a standard of quality we have never compromised, regardless of scale."
        tone="charcoal"
        image="/products/mini-top-handle/1.jpg"
        imageAlt="Hand-finished leather detail"
      />

      <EditorialSplit
        eyebrow="Sustainability"
        title="Craft Without Compromise"
        copy="From regenerated nylon to low-impact tanneries, we are reworking how the house sources and builds — because rarity should never come at the planet's expense."
        tone="cream"
        reverse
        image="/products/canvas-leather-tote/1.jpg"
        imageAlt="Canvas and leather tote"
      />

      <div className="quote container">
        <blockquote>
          &ldquo;Luxury is not what you add. It is what you dare to leave out.&rdquo;
        </blockquote>
        <cite>Founding Design Philosophy, DIVELORA</cite>
      </div>
    </>
  );
}
