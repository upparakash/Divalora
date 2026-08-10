import "./Logo.css";

export default function Logo({ variant = "full", tone = "dark", className = "" }) {
  const toneClass = tone === "light" ? "logo--light" : "logo--dark";

  if (variant === "compact") {
    return <span className={`logo logo--compact ${toneClass} ${className}`}>DIVELORA</span>;
  }

  return (
    <div className={`logo logo--full ${toneClass} ${className}`}>
      <span className="logo__word">DIVELORA</span>
      <span className="logo__rule" />
    </div>
  );
}
