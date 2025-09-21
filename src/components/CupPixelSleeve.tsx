import React from "react";

/**
 * Vaso pixel-art con tapa y manga (estilo café).
 * Genera luces/sombras a partir de un único color base.
 * ViewBox 0..32 x 40. Usa rects para look 8-bit.
 */
type Props = {
  size?: number;         // ancho en px (alto ≈ size * 1.25)
  base?: string;         // color único de entrada (hex o rgb/rgba/hsl)  (p.ej #c0843d)
  outline?: string;      // opcional, contorno; por defecto #111
  className?: string;
};

export default function CupPixelSleeve({
  size = 192,
  base = "#c0843d",     // café dorado por defecto
  outline = "#111111",
  className,
}: Props) {
  // ---------- Helpers de color ----------
  function clamp(n: number, a = 0, b = 1) { return Math.min(b, Math.max(a, n)); }

  function hexToRgb(hex: string) {
    const m = hex.replace('#','').match(/^([a-f\d]{3}|[a-f\d]{6})$/i);
    if (!m) return { r: 192, g: 132, b: 61 }; // fallback
    const h = m[1].length === 3
      ? m[1].split('').map(c => c + c).join('')
      : m[1];
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHsl(r: number, g: number, b: number) {
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0, l = (max+min)/2;
    if (max !== min) {
      const d = max - min;
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h, s, l };
  }

  function hslToHex(h: number, s: number, l: number) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l; // achrom.
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x: number) => {
      const v = Math.round(x * 255).toString(16).padStart(2, "0");
      return v;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  const tweak = (hex: string, dl = 0, ds = 0) => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return hslToHex(h, clamp(s + ds), clamp(l + dl));
  };

  function lighten(hex: string, amt = 0.15) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return hslToHex(h, s, clamp(l + amt));
  }
  function darken(hex: string, amt = 0.15) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return hslToHex(h, s, clamp(l - amt));
  }
  function desaturate(hex: string, amt = 0.2) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return hslToHex(h, clamp(s - amt), l);
  }

  // Derivados a partir de "base"
  const bodyMain   = base;
  const bodyLight1 = lighten(base, 0.18);
  const bodyLight2 = lighten(base, 0.32);
  const bodyDark1  = darken(base, 0.18);
  const bodyDark2  = darken(base, 0.32);

  // Manga: el mismo tono, un poco más desaturado y oscuro para contrastar
  const sleeveMain = darken(desaturate(base, 0.25), 0.12);
  const sleeveDark = darken(sleeveMain, 0.22);
  const sleeveLite = lighten(sleeveMain, 0.14);

  // Tapa en grises generados desde un gris neutro nudged hacia la luminosidad del base
  const lidLight = lighten("#cfd7e2", 0.10);
  const lidDark  = darken("#cfd7e2", 0.15);

  // Pajilla derivada del base (claro = muy aclarado y desaturado, oscuro = base oscurecido)
  const strawLight = tweak(base, 0.45, -0.50); // casi blanco con tinte del base

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 40"
      width={size}
      height={size * 1.25}
      shapeRendering="crispEdges"
      className={className}
      aria-label="pixel-cup-sleeve"
    >
      {/* ===== PAJILLA (diagonal simple con franjas) ===== */}
      {/* tronco vertical corto que entra por la tapa */}
      <rect x="16" y="0" width="2" height="10" fill={strawLight} />
      <rect x="15" y="0" width="1" height="10" fill={outline} />
      <rect x="18" y="0" width="1" height="10" fill={outline} />

      {/* ===== TAPA ===== */}
      {/* cúpula (sombra y luz) */}
      <rect x="5" y="5" width="22" height="4" fill={lidDark} />
      <rect x="7" y="5" width="16" height="3" fill={lidLight} />
      {/* aro / visera */}
      <rect x="3" y="9" width="26" height="3" fill={lidLight} />
      {/* contornos tapa */}
      <rect x="5" y="5" width="22" height="4" fill="none" stroke={outline} strokeWidth={1}/>
      <rect x="3" y="9" width="26" height="3" fill="none" stroke={outline} strokeWidth={1}/>

      {/* ===== CUERPO ===== */}
      {/* columnas del contorno + base */}
      <rect x="5" y="12" width="2" height="24" fill={outline} />
      <rect x="25" y="12" width="2" height="24" fill={outline} />
      <rect x="7" y="36" width="18" height="2" fill={outline} />
      {/* borde superior del cuerpo */}
      <rect x="7" y="12" width="18" height="1" fill={outline} />

      {/* volumen del cuerpo en 4 bandas */}
      <rect x="7" y="13" width="18" height="23" fill={bodyMain} />
      <rect x="8" y="13" width="6"  height="23" fill={bodyDark2} />
      <rect x="14" y="13" width="6"  height="23" fill={bodyDark1} />
      <rect x="20" y="13" width="5"  height="23" fill={bodyLight1} />

      {/* reflejo muy sutil */}
      <rect x="21" y="14" width="2" height="6" fill={bodyLight2} />



      {/* ===== BASE ===== */}
      <rect x="8" y="38" width="16" height="1" fill={lidDark} />
      <rect x="8" y="38" width="16" height="1" fill="none" stroke={outline} strokeWidth={1}/>
    </svg>
  );
}
