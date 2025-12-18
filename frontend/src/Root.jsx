import { StrictMode, Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App.jsx";

const HeartExperiencePage = lazy(() => import("./pages/HeartExperiencePage.jsx"));

function RouteFallback() {
  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-5xl">❤️</div>
        <div className="mt-4 text-gray-700 font-medium">Loading…</div>
      </div>
    </div>
  );
}

export default function Root() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/heart" element={<HeartExperiencePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StrictMode>
  );
}
