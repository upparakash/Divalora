import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";

const StorefrontLayout = lazy(() => import("./StorefrontLayout.jsx"));
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<StorefrontLayout />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
