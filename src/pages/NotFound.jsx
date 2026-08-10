import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found">
      <Seo title="Page Not Found" noindex />
      <span className="eyebrow">404</span>
      <h1>This Page Could Not Be Found</h1>
      <p>The page you are looking for may have been moved, renamed or is no longer available.</p>
      <Link to="/" className="btn-outline">
        Return Home
      </Link>
    </div>
  );
}
