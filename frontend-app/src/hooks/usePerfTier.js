import { useState, useEffect } from "react";

export function usePerfTier() {
  const [tier, setTier] = useState("Standard");
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const motionListener = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionListener);

    // Feature detect WebGL
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch {
      setWebGLSupported(false);
    }

    // Determine performance tier
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isHighEnd = window.devicePixelRatio >= 1.5 && width > 1200;

    if (motionQuery.matches) {
      setTier("Reduced");
    } else if (isMobile) {
      setTier("Mobile");
    } else if (isHighEnd) {
      setTier("Ultra");
    } else {
      setTier("Standard");
    }

    return () => motionQuery.removeEventListener("change", motionListener);
  }, []);

  return { tier, webGLSupported, prefersReducedMotion };
}
