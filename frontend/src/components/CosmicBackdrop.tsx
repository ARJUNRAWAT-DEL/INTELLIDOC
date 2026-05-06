import React from "react";

export default function CosmicBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ background: "#01030a", zIndex: 0 }}
    >
      {/* Enhanced cosmic gradient background with visible colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `
          radial-gradient(circle at 12% 35%, rgba(255, 130, 20, 0.45), transparent 18%),
          radial-gradient(circle at 70% 25%, rgba(80, 150, 255, 0.35), transparent 8%),
          radial-gradient(circle at 82% 65%, rgba(190, 90, 255, 0.32), transparent 7%),
          radial-gradient(circle at 38% 72%, rgba(255, 190, 70, 0.28), transparent 6%),
          #01030a
        `,
          zIndex: 0,
        }}
      />

      {/* Star field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.4) 0.5px, transparent 0.5px)",
          backgroundSize: "80px 80px",
          opacity: "0.12",
          zIndex: 1,
        }}
      />

      {/* Orbital rings */}
      <div
        className="absolute"
        style={{
          width: "400px",
          height: "400px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />
      <div
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />
      <div
        className="absolute"
        style={{
          width: "800px",
          height: "800px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />

      {/* Sun */}
      <div
        className="planet sun"
        style={{
          position: "absolute",
          width: "120px",
          height: "120px",
          left: "5%",
          top: "30%",
          background: "radial-gradient(circle, #ffd27a, #ff7a18, #7a2600)",
          boxShadow: "0 0 80px rgba(255, 120, 20, 0.8)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      {/* Earth */}
      <div
        className="planet earth"
        style={{
          position: "absolute",
          width: "52px",
          height: "52px",
          right: "22%",
          top: "22%",
          background:
            "radial-gradient(circle at 30% 30%, #9de7ff, #2563eb, #081a4d)",
          boxShadow: "0 0 35px rgba(80, 160, 255, 0.65)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      {/* Purple Planet */}
      <div
        className="planet purple"
        style={{
          position: "absolute",
          width: "46px",
          height: "46px",
          right: "12%",
          top: "58%",
          background:
            "radial-gradient(circle at 30% 30%, #f0abfc, #7c3aed, #1e103d)",
          boxShadow: "0 0 35px rgba(168, 85, 247, 0.6)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      {/* Gold Planet */}
      <div
        className="planet gold"
        style={{
          position: "absolute",
          width: "38px",
          height: "38px",
          left: "36%",
          top: "72%",
          background:
            "radial-gradient(circle at 30% 30%, #fde68a, #f59e0b, #3b1d02)",
          boxShadow: "0 0 28px rgba(245, 158, 11, 0.6)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      {/* Mercury */}
      <div
        className="planet mercury"
        style={{
          position: "absolute",
          width: "28px",
          height: "28px",
          left: "48%",
          top: "15%",
          background:
            "radial-gradient(circle at 30% 30%, #d4d4d8, #71717a, #27272a)",
          boxShadow: "0 0 20px rgba(200, 200, 200, 0.5)",
          borderRadius: "50%",
          zIndex: 3,
        }}
      />

      {/* Shooting star */}
      <div
        className="absolute h-px w-96 top-1/3 left-0"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent)",
          animation: "shooting-star 22s ease-in infinite",
          opacity: "0.35",
          zIndex: 4,
        }}
      />

      <style>{`
        @keyframes shooting-star {
          0% { transform: translateX(-20vw); opacity: 0; }
          5% { opacity: 0.35; }
          95% { opacity: 0.35; }
          100% { transform: translateX(90vw); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
