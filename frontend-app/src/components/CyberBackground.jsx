import React from "react";

export default function CyberBackground() {
  return (
    <div
      className="black-red-background"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#07070a",
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(255, 42, 75, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 85% 80%, rgba(220, 38, 38, 0.06) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(153, 27, 27, 0.04) 0%, transparent 60%)
        `,
      }}
      aria-hidden="true"
    />
  );
}
