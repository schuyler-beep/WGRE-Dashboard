"use client";

import { useEffect, useRef } from "react";
import { DASHBOARD_HTML } from "./dashboard-markup";

// Mounts the ORIGINAL dashboard markup unchanged, then loads the ORIGINAL
// /public/app.js exactly the way the old static index.html did (a plain
// <script src="app.js"> at the bottom of the body). Nothing about how the
// dashboard itself works has been touched.
export default function DashboardClient() {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/app.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: DASHBOARD_HTML }}
    />
  );
}
