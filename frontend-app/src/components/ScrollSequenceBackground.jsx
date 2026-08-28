import React, { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 240;

/**
 * Generates frame file path for a 1-based index: /frames/ezgif-frame-001.jpg -> ezgif-frame-240.jpg
 */
const getFramePath = (index) => {
  const paddedIndex = String(index).padStart(3, "0");
  return `/frames/ezgif-frame-${paddedIndex}.jpg`;
};

export default function ScrollSequenceBackground({
  overlayOpacity = 0.40, // Balanced transparency so animation is crisp & clearly visible
  opacity = 1.0,
}) {
  const canvasRef = useRef(null);
  const loadedMapRef = useRef(new Map());
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const animFrameIdRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Draw frame with 100% crisp sharpness without blur
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let img = loadedMapRef.current.get(frameIndex);
    if (!img) {
      for (let offset = 1; offset < 20; offset++) {
        if (loadedMapRef.current.has(frameIndex - offset)) {
          img = loadedMapRef.current.get(frameIndex - offset);
          break;
        }
        if (loadedMapRef.current.has(frameIndex + offset)) {
          img = loadedMapRef.current.get(frameIndex + offset);
          break;
        }
      }
    }

    const cw = canvas.width;
    const ch = canvas.height;

    if (!img || !img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, cw, ch);
      return;
    }

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    // Object-fit: cover calculation
    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const nw = iw * ratio;
    const nh = ih * ratio;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    // High quality crisp image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, nx, ny, nw, nh);
  }, []);

  // Preload all 240 frames
  useEffect(() => {
    let isCancelled = false;

    const loadSingleImage = (index) => {
      return new Promise((resolve) => {
        if (loadedMapRef.current.has(index)) return resolve();
        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
          if (isCancelled) return resolve();
          loadedMapRef.current.set(index, img);
          if (index === 1 && !isReady) {
            setIsReady(true);
            drawFrame(1);
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Priority 1: Key interval frames for instant scrubbing
    const priorityIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 3) priorityIndices.push(i);

    const remainingIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!priorityIndices.includes(i)) remainingIndices.push(i);
    }

    const loadAll = async () => {
      for (const idx of priorityIndices) {
        if (isCancelled) return;
        await loadSingleImage(idx);
      }
      setIsReady(true);

      for (let i = 0; i < remainingIndices.length; i += 8) {
        if (isCancelled) return;
        const chunk = remainingIndices.slice(i, i + 8);
        await Promise.all(chunk.map(loadSingleImage));
      }
    };

    loadAll();

    return () => {
      isCancelled = true;
    };
  }, [drawFrame, isReady]);

  // Handle Canvas Resize with pixel-perfect Retina / HiDPI DPR
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      drawFrame(Math.round(currentFrameRef.current));
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Map Page Scroll to Frame 1 -> 240
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);

      const target = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1));
      targetFrameRef.current = target;

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Butter Smooth Lerp Interpolation
  useEffect(() => {
    let lastDrawnFrame = -1;
    let idleCounter = 0;

    const renderLoop = () => {
      const current = currentFrameRef.current;
      let target = targetFrameRef.current;

      // Subtle ambient motion when idle
      if (!isScrollingRef.current) {
        idleCounter += 0.03;
        const ambientOffset = Math.sin(idleCounter * 0.4) * 2;
        target = Math.max(1, Math.min(TOTAL_FRAMES, target + ambientOffset));
      }

      // Butter smooth lerp easing factor (0.12)
      const diff = target - current;
      if (Math.abs(diff) > 0.02) {
        currentFrameRef.current = current + diff * 0.12;
      } else {
        currentFrameRef.current = target;
      }

      const frameToDraw = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(currentFrameRef.current)));
      if (frameToDraw !== lastDrawnFrame) {
        drawFrame(frameToDraw);
        lastDrawnFrame = frameToDraw;
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [drawFrame]);

  return (
    <div
      className="scroll-sequence-clean-container"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#030712",
      }}
      aria-hidden="true"
    >
      {/* 100% Crisp, High-Clarity Canvas with ZERO blur */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
          filter: "none",
          transform: "translate3d(0, 0, 0)",
          opacity: opacity,
        }}
      />

      {/* Gentle Cyber Tint - Keeps the scrolling animation clearly visible while giving cards clean contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(3, 7, 18, ${overlayOpacity})`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
