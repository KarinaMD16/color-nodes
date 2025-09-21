

type CupPixelTallProps = {
  size?: number;
  className?: string;
  letters?: [string, string]; // por defecto: ["C","N"]
  colors?: Partial<{
    outline: string;    // contorno negro
    cup: string;        // cuerpo del vaso
    cupShade1: string;  // sombras cuerpo
    cupShade2: string;
    lidLight: string;   // tapa (luz)
    lidDark: string;    // tapa (sombra)
    rim: string;        // aro horizontal
    strawLight: string; // pajilla franja clara
    strawDark: string;  // pajilla franja oscura
    emblemBg: string;   // círculo/placa del emblema
    emblemInk: string;  // color de las letras
    base: string;       // base del vaso
  }>;
};

/**
 * Vaso pixel-art alto con emblema "CN" en bitmaps 5x7 píxeles.
 * ViewBox 0..48 x 96. Usa rects duros para look 8-bit (shapeRendering="crispEdges").
 */
export default function CupPixelTall({
  size = 256,
  className,
  letters = ["C", "N"],
  colors = {},
}: CupPixelTallProps) {
  const c = {
    outline:    colors.outline    ?? "#111111",
    cup:        colors.cup        ?? "#e34949",
    cupShade1:  colors.cupShade1  ?? "#c73e3e",
    cupShade2:  colors.cupShade2  ?? "#a83434",
    lidLight:   colors.lidLight   ?? "#dfe6ee",
    lidDark:    colors.lidDark    ?? "#b8c2cf",
    rim:        colors.rim        ?? "#e7ecf3",
    strawLight: colors.strawLight ?? "#ffe4d5",
    strawDark:  colors.strawDark  ?? "#c94141",
    emblemBg:   colors.emblemBg   ?? "#f6e1bf",
      emblemInk: colors.emblemInk ?? "#222222", // tinta de letras
    base:       colors.base       ?? "#222222",
  };

  // ---- Pajilla diagonal (bloques alternos claro/oscuro) ----
  const strawBlocks: JSX.Element[] = [];
  const startX = 24, startY = 8, bw = 3, bh = 3;
  for (let i = 0; i < 10; i++) {
    const x = startX + i * 2;
    const y = startY - i * 3;
    const fill = i % 2 === 0 ? c.strawLight : c.strawDark;
    strawBlocks.push(<rect key={i} x={x} y={y} width={bw} height={bh} fill={fill} />);
    strawBlocks.push(<rect key={`o${i}`} x={x} y={y} width={bw} height={bh} fill="none" stroke={c.outline} strokeWidth={1} />);
  }

  // ---- Letras 5x7 en píxeles (bitmap) ----
  // Cada letra es una matriz de 5 (ancho) x 7 (alto). 1 = pixel relleno.
  const glyphs: Record<string, number[][]> = {
    // C: marco superior e inferior + columna izquierda
    C: [
      [1,1,1,1,1],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,0,0,0,0],
      [1,1,1,1,1],
    ],
    // N: columnas extremas + diagonal
    N: [
      [1,0,0,0,1],
      [1,1,0,0,1],
      [1,0,1,0,1],
      [1,0,0,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
    ],
  };

  function drawLetter(letter: string, ox: number, oy: number) {
    const g = glyphs[(letter || "").toUpperCase()] ?? glyphs.C;
    // tamaño de pixel dentro del emblema
    const px = 1;
    const rects: JSX.Element[] = [];
    for (let y = 0; y < g.length; y++) {
      for (let x = 0; x < g[0].length; x++) {
        if (g[y][x]) {
          rects.push(
            <rect key={`${letter}-${x}-${y}`} x={ox + x * px} y={oy + y * px} width={px} height={px} fill={c.emblemInk} />
          );
        }
      }
    }
    return rects;
    }

  // Posiciones de las letras dentro del emblema (placa 16x16 en 16..32 x 53..69)
  // Margen de 2 px alrededor; separamos 2 px entre letras.
  const letterStartX = 18; // arranque de la C
  const letterStartY = 57.5; // pequeña separación del borde superior
  const letterGap   = 2;   // separación entre C y N
  const letterWidth = 5;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 96"
      width={size}
      height={size * 2}
      shapeRendering="crispEdges"
      className={className}
      aria-label="pixel-cup-tall CN"
    >

      {/* ======= TAPA ======= */}
      <rect x="6" y="18" width="36" height="8" fill={c.lidDark} />
      <rect x="8" y="18" width="28" height="5" fill={c.lidLight} />
      <rect x="2" y="26" width="44" height="5" fill={c.rim} />
      <rect x="2" y="26" width="44" height="5" fill="none" stroke={c.outline} strokeWidth={1}/>
      <rect x="6" y="18" width="36" height="8" fill="none" stroke={c.outline} strokeWidth={1}/>

      {/* ======= CUERPO ======= */}
      <rect x="6" y="31" width="4" height="56" fill={c.outline} />
      <rect x="38" y="31" width="4" height="56" fill={c.outline} />
      <rect x="10" y="87" width="28" height="4" fill={c.outline} />
      <rect x="10" y="31" width="28" height="2" fill={c.outline} />

      <rect x="10" y="33" width="28" height="54" fill={c.cup} />
      <rect x="12" y="33" width="9"  height="54" fill={c.cupShade2} />
      <rect x="22" y="33" width="8"  height="54" fill={c.cupShade1} />
      <rect x="31" y="33" width="7"  height="54" fill={c.cup} />
      <rect x="12" y="91" width="24" height="2" fill={c.base} />

      {/* ======= EMBLEMA (placa + CN) ======= */}
      {/* Borde exterior del emblema */}
      <rect x="15" y="52" width="18" height="18" fill={c.outline} />
      {/* Disco/placa interna */}
      <rect x="16" y="53" width="16" height="16" fill={c.emblemBg} />
      {/* Recortes de esquinas para look redondeado pixel */}
      <rect x="16" y="53" width="2" height="2" fill={c.outline} />
      <rect x="30" y="53" width="2" height="2" fill={c.outline} />
      <rect x="16" y="67" width="2" height="2" fill={c.outline} />
      <rect x="30" y="67" width="2" height="2" fill={c.outline} />

      {/* Letras C y N (bitmap 5x7) */}
      <g>
        {drawLetter(letters[0] ?? "C", letterStartX, letterStartY)}
        {drawLetter(letters[1] ?? "N", letterStartX + letterWidth + letterGap, letterStartY)}
      </g>

      {/* Contorno del cuerpo (extra) */}
      <rect x="10" y="33" width="28" height="54" fill="none" stroke={c.outline} strokeWidth={1}/>
    </svg>
  );
}
