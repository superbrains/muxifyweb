"use client";

import { useState, useEffect } from "react";

export function useWindowWidth() {
  // Initialize with actual window width to prevent flash
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const updateWindowWidth = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      setWindowWidth(width);
      setIsDesktop(width >= 768);
    };

    // Update immediately in case window was resized during render
    updateWindowWidth();

    window.addEventListener("resize", updateWindowWidth);
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  return { windowWidth, isDesktop };
}
