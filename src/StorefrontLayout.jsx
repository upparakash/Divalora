import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import PageLoader from "./components/PageLoader.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Handbags = lazy(() => import("./pages/Handbags.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function StorefrontLayout() {
  const location = useLocation();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="page-fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/handbags" element={<Handbags />} />
              <Route path="/handbags/:categorySlug" element={<Handbags />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
