import React from "react";

export default function ScrollSequenceBackground({
  opacity = 1.0,
}) {
  return (
    <div
      className="hero-video-background-wrap"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "#000000",
      }}
      aria-hidden="true"
    >
      {/* Video Stream */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.9,
          display: "block",
        }}
      />

      {/* Cyber Scrim & Soft Dark Vignette for Razor-Sharp Readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 30%, rgba(2, 6, 16, 0.75) 100%), linear-gradient(180deg, rgba(2, 6, 16, 0.3) 0%, rgba(2, 6, 16, 0.7) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle Grain Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          pointerEvents: "none",
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
