import React from "react";

type Props = {
  size?: number;      // tamaño en px
  face?: string;      // color de la cara
  ink?: string;       // color contorno / ojos
  shade?: string;     // sombra lateral
  hand?: string;      // color mano
  handShadow?: string; // sombra del dedo
  className?: string;
};

export default function PixelThinking({
  size = 48,
  face = "#facc15",
  ink = "#111111",
  shade = "#f59e0b",
  hand = "#facc15",
  handShadow = "#ea580c",
  className,
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="pensando"
      className={className}
    >
      <style>{`
        .brow { transform-box: fill-box; transform-origin: left center;
                animation: brow 1.8s ease-in-out infinite; }
        .hand { transform-box: fill-box; transform-origin: 15px 17px;
                animation: hand 1.8s ease-in-out infinite; }
        @keyframes brow {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-1px); }
        }
        @keyframes hand {
          0%,100% { transform: rotate(0deg); }
          50%     { transform: rotate(-6deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brow, .hand { animation: none !important; }
        }
      `}</style>

      {/* CARA */}
      <rect x="6" y="6" width="12" height="12" fill={face}/>
      {/* borde negro */}
      <rect x="6" y="6" width="12" height="1" fill={ink}/>
      <rect x="6" y="17" width="12" height="1" fill={ink}/>
      <rect x="6" y="6" width="1" height="12" fill={ink}/>
      <rect x="17" y="6" width="1" height="12" fill={ink}/>

      {/* brillo */}
      <rect x="7" y="7" width="2" height="1" fill="#fff" opacity=".8"/>
      <rect x="9" y="7" width="1" height="1" fill="#fff" opacity=".6"/>

      {/* sombra lateral */}
      <rect x="16" y="8" width="1" height="8" fill={shade} opacity=".6"/>

      {/* ojos */}
      <rect x="9" y="10" width="1" height="3" fill={ink}/>
      <rect x="14" y="10" width="1" height="3" fill={ink}/>

      {/* cejas */}
      <g className="brow">
        <rect x="8" y="9" width="3" height="1" fill={ink}/>
      </g>
      <rect x="13" y="9" width="3" height="1" fill={ink} opacity=".8"/>

      {/* boca */}
      <rect x="10" y="14" width="4" height="1" fill={ink}/>

      {/* mano */}
      <g className="hand">
        <rect x="9" y="16" width="6" height="2" fill={hand}/>
        <rect x="15" y="17" width="1" height="2" fill={ink}/>
        <rect x="14" y="18" width="1" height="1" fill={handShadow}/>
        <rect x="8" y="17" width="1" height="1" fill={ink}/>
        <rect x="13" y="16" width="1" height="1" fill={ink}/>
      </g>
    </svg>
  );
}
