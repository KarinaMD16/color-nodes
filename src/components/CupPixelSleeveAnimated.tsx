/**
 * Vaso pixel-art con tapa y manga (estilo café) + animación de tapa.
 * Animación por CSS keyframes (sin SMIL). La pajilla acompaña suavemente.
 * ViewBox 0..32 x 40
 */
type Props = {
  size?: number;         // ancho en px (alto ≈ size * 1.25)
  base?: string;
  outline?: string;      // contorno
  className?: string;

  // Animación
  speedSec?: number;     // duración del ciclo
  angleDeg?: number;     // apertura máxima de la tapa
  liftPx?: number;       // cuánto “sube” la tapa al abrir
  strawAngleDeg?: number; // inclinación máx. de la pajilla
  strawLiftPx?: number;   // elevación de la pajilla
};

export default function CupPixelSleeveAnimated({
  size = 192,
  base = "#c0843d",
  outline = "#111111",
  className,
  speedSec = 1.2,
  angleDeg = 12,
  liftPx = 1.2,
  strawAngleDeg = 6,
  strawLiftPx = 0.4,
}: Props) {
  const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const hexToRgb = (hex: string) => {
    const m = hex.replace('#', '').match(/^([a-f\d]{3}|[a-f\d]{6})$/i);
    if (!m) return { r: 192, g: 132, b: 61 };
    const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; }
      h /= 6;
    }
    return { h, s, l };
  };
  const hslToHex = (h: number, s: number, l: number) => {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p;
    };
    let r: number, g: number, b: number;
    if (s === 0) { r = g = b = l; } else {
      const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  const tweak = (hex: string, dl = 0, ds = 0) => {
    const { r, g, b } = hexToRgb(hex); const { h, s, l } = rgbToHsl(r, g, b);
    return hslToHex(h, clamp(s + ds), clamp(l + dl));
  };
  const lighten = (hex: string, amt = 0.15) => {
    const { r, g, b } = hexToRgb(hex); const { h, s, l } = rgbToHsl(r, g, b); return hslToHex(h, s, clamp(l + amt));
  };
  const darken = (hex: string, amt = 0.15) => {
    const { r, g, b } = hexToRgb(hex); const { h, s, l } = rgbToHsl(r, g, b); return hslToHex(h, s, clamp(l - amt));
  };

  const bodyMain = base;
  const bodyLight1 = lighten(base, 0.18);
  const bodyLight2 = lighten(base, 0.32);
  const bodyDark1 = darken(base, 0.18);
  const bodyDark2 = darken(base, 0.32);


  const lidLight = lighten("#cfd7e2", 0.10);
  const lidDark = darken("#cfd7e2", 0.15);

  const strawLight = tweak(base, 0.45, -0.50);

  const dur = `${speedSec}s`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 -8 36 48"
      width={size}
      height={size * 1.25}
      shapeRendering="crispEdges"
      className={className}
      aria-label="pixel-cup-sleeve (animated lid)"
    >
      <style>{`
        /* Tapa */
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

        /* Pajilla */
        .straw-anim {
          transform-box: view-box;
          transform-origin: 16px 5px;
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

      {/* ===== PAJILLA ===== */}
      <g className="straw-anim">
        <rect x="16" y="0" width="2" height="10" fill={strawLight} />
        <rect x="15" y="0" width="1" height="10" fill={outline} />
        <rect x="18" y="0" width="1" height="10" fill={outline} />
      </g>

      {/* ===== TAPA (grupo animado) ===== */}
      <g className="lid-anim">
        <rect x="5" y="5" width="22" height="4" fill={lidDark} />
        <rect x="7" y="5" width="16" height="3" fill={lidLight} />
        <rect x="3" y="9" width="26" height="3" fill={lidLight} />
        <rect x="5" y="5" width="22" height="4" fill="none" stroke={outline} strokeWidth={1} />
        <rect x="3" y="9" width="26" height="3" fill="none" stroke={outline} strokeWidth={1} />
      </g>

      {/* ===== CUERPO ===== */}
      <rect x="5" y="12" width="2" height="24" fill={outline} />
      <rect x="25" y="12" width="2" height="24" fill={outline} />
      <rect x="7" y="36" width="18" height="2" fill={outline} />
      <rect x="7" y="12" width="18" height="1" fill={outline} />
      <rect x="7" y="13" width="18" height="23" fill={bodyMain} />
      <rect x="8" y="13" width="6" height="23" fill={bodyDark2} />
      <rect x="14" y="13" width="6" height="23" fill={bodyDark1} />
      <rect x="20" y="13" width="5" height="23" fill={bodyLight1} />
      <rect x="21" y="14" width="2" height="6" fill={bodyLight2} />

      {/* BASE */}
      <rect x="8" y="38" width="16" height="1" fill={lidDark} />
      <rect x="8" y="38" width="16" height="1" fill="none" stroke={outline} strokeWidth={1} />
    </svg>
  );
}
