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
  overlayOpacity = 0.55,
  scanlines = true,
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const loadedMapRef = useRef(new Map());
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const animFrameIdRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Draw a specific frame onto the canvas preserving aspect ratio ("cover" mode)
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Find the closest loaded frame if current frame isn't loaded yet
    let img = loadedMapRef.current.get(frameIndex);
    if (!img) {
      // Search nearest available frame
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
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

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
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

    // Fast image rendering without blur
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, nx, ny, nw, nh);
  }, []);

  // Preload frames progressively
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    const loadSingleImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
          if (isCancelled) return resolve();
          loadedMapRef.current.set(index, img);
          loadedCount++;
          if (loadedCount % 12 === 0 || loadedCount === TOTAL_FRAMES) {
            setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          }
          if (index === 1 && !isReady) {
            setIsReady(true);
            drawFrame(1);
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Priority 1: Key interval frames (1, 10, 20... and first 10 frames)
    const priorityIndices = [];
    for (let i = 1; i <= 15; i++) priorityIndices.push(i);
    for (let i = 16; i <= TOTAL_FRAMES; i += 6) priorityIndices.push(i);

    const remainingIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!priorityIndices.includes(i)) remainingIndices.push(i);
    }

    // Load initial frames sequentially/batch
    const loadAll = async () => {
      for (const idx of priorityIndices) {
        if (isCancelled) return;
        await loadSingleImage(idx);
      }
      setIsReady(true);
      // Load remaining frames
      for (const idx of remainingIndices) {
        if (isCancelled) return;
        loadSingleImage(idx);
      }
    };

    loadAll();

    return () => {
      isCancelled = true;
    };
  }, [drawFrame, isReady]);

  // Handle Canvas Resize with Retina / HiDPI DPR support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      drawFrame(Math.round(currentFrameRef.current));
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Scroll event listener: Map page scroll to frame 1 -> 240
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      let progress = 0;
      if (docHeight > 0) {
        progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      }

      // Calculate target frame (1 to TOTAL_FRAMES)
      const target = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1));
      targetFrameRef.current = target;

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial evaluation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Smooth frame interpolation loop (Lerp)
  useEffect(() => {
    let lastDrawnFrame = -1;

    const renderLoop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;

      // Smooth lerp easing factor
      const diff = target - current;
      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current = current + diff * 0.12;
      } else {
        currentFrameRef.current = target;
      }

      const frameToDraw = Math.round(currentFrameRef.current);
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
      className="scroll-sequence-container"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#02040a",
      }}
      aria-hidden="true"
    >
      {/* Crisp Canvas Frame Renderer without blur - 100% clarity */}
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
        }}
      />
    </div>
  );
}
