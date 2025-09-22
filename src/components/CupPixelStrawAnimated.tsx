import React from "react";

type Props = {
  size?: number;
  speedSec?: number;   // duración del ciclo
  angleDeg?: number;   // apertura máxima de la tapa
  liftPx?: number;     // cuánto sube la tapa
  strawAngleDeg?: number; // inclinación máxima de la pajilla
  strawLiftPx?: number;   // cuánto sube la pajilla
  colors?: Partial<{
    outline: string;
    body: string;
    lid: string;
    rim: string;
    straw: string;
  }>;
  className?: string;
};

export default function CupPixelStrawAnimated({
  size = 128,
  speedSec = 1.2,
  angleDeg = 10,
  liftPx = 1.5,
  strawAngleDeg = 8,   // un poco menos que la tapa para verse natural
  strawLiftPx = 3,
  colors = {},
  className,
}: Props) {
  const style = {
    "--outline": colors.outline ?? "#111111",
    "--body": colors.body ?? "#ef4444",
    "--lid": colors.lid ?? "#ffffff",
    "--rim": colors.rim ?? "#e5e7eb",
    "--straw": colors.straw ?? "#ffffff",
  } as React.CSSProperties;

  const dur = `${speedSec}s`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 28"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-label="pixel-cup-with-straw (loader)"
      style={style}
      className={className}
    >
      <style>{`
        /* Anim de tapa */
        .lid-anim {
          transform-box: fill-box;
          transform-origin: left center;
          animation: popLid ${dur} ease-in-out infinite;
        }
        @keyframes popLid {
          0%   { transform: rotate(0deg) translateY(0px); }
          50%  { transform: rotate(-${angleDeg}deg) translateY(-${liftPx}px); }
          100% { transform: rotate(0deg) translateY(0px); }
        }

        /* Anim de pajilla: pivot cerca del codo (x≈14,y≈7) */
        .straw-anim {
          transform-box: view-box;           /* usar coords del viewBox */
          transform-origin: 14px 7px;        /* pivot en el codo */
          animation: wobbleStraw ${dur} ease-in-out infinite;
        }
        @keyframes wobbleStraw {
          0%   { transform: rotate(0deg) translateY(0px); }
          50%  { transform: rotate(-${strawAngleDeg}deg) translateY(-${strawLiftPx}px); }
          100% { transform: rotate(0deg) translateY(0px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .lid-anim, .straw-anim { animation: none !important; }
        }
      `}</style>

      {/* ===== PAJILLA (agrupada + animada) ===== */}
      <g className="straw-anim">
        {/* tramo vertical */}
        <rect x="12" y="2" width="2" height="6" fill="var(--straw)" />
        <rect x="11" y="2" width="1" height="6" fill="var(--outline)" />
        <rect x="14" y="2" width="1" height="6" fill="var(--outline)" />
      </g>

      {/* ===== TAPA (animada) ===== */}
      <g className="lid-anim">
        <rect x="3" y="8" width="18" height="2" fill="var(--outline)" />
        <rect x="4" y="8" width="16" height="1" fill="var(--lid)" />
        <rect x="4" y="9" width="16" height="1" fill="var(--rim)" />
      </g>

      {/* ===== CUERPO (contorno) ===== */}
      <rect x="4" y="10" width="2" height="14" fill="var(--outline)" />
      <rect x="18" y="10" width="2" height="14" fill="var(--outline)" />
      <rect x="6" y="24" width="12" height="2" fill="var(--outline)" />
      <rect x="6" y="10" width="12" height="1" fill="var(--outline)" />
      <rect x="7" y="11" width="10" height="1" fill="var(--outline)" />
      <rect x="8" y="12" width="8" height="1" fill="var(--outline)" />
      <rect x="7" y="23" width="10" height="1" fill="var(--outline)" />

      {/* ===== CUERPO (relleno) ===== */}
      <rect x="6" y="11" width="12" height="12" fill="var(--body)" />
      <rect x="7" y="12" width="10" height="10" fill="var(--body)" />
      <rect x="8" y="13" width="8" height="9" fill="var(--body)" />

      {/* brillo */}
      <rect x="9" y="14" width="2" height="2" fill="#ffffff" opacity=".2" />
    </svg>
  );
}
