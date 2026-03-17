"use client";

import { useState, useEffect } from "react";

export function useIsMobile(): { isMobile: boolean | null; mounted: boolean } {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setMounted(true);

    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, mounted };
}
