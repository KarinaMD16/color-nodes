type CupLoaderProps = {
  size?: number;              // tamaño del SVG en px (ancho = alto)
  speedSec?: number;          // duración del ciclo en segundos
  cupColor?: string;          // color del vaso
  rimColor?: string;          // color del borde/trazo
  lidColor?: string;          // color de la tapa
  strawColor?: string;        // color de la pajilla
  bg?: string;                // color de fondo (o 'transparent')
  showText?: boolean;         // mostrar "Cargando…"
  label?: string;             // texto accesible y/o mostrado
  className?: string;         // clases extra
};

export default function CupLoader({
  size = 180,
  speedSec = 1.2,
  cupColor = "#6ee7b7",
  rimColor = "#0f172a",
  lidColor = "#94a3b8",
  strawColor = "#f43f5e",
  bg = "transparent",
  showText = true,
  label = "Cargando…",
  className,
}: CupLoaderProps) {
  const dur = `${speedSec}s`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Sombra suave */}
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip de la boca del vaso para simular “abrir/cerrar” */}
        <clipPath id="mouthClip">
          {/* Este rect se escala para revelar u ocultar el interior */}
          <rect id="mouthRect" x="30" y="22" width="140" height="35" rx="18">
            <animate
              attributeName="height"
              values="35;10;35"
              dur={dur}
              repeatCount="indefinite"
              keyTimes="0;0.5;1"
            />
            <animate
              attributeName="y"
              values="22;35;22"
              dur={dur}
              repeatCount="indefinite"
              keyTimes="0;0.5;1"
            />
            <animate
              attributeName="rx"
              values="18;8;18"
              dur={dur}
              repeatCount="indefinite"
              keyTimes="0;0.5;1"
            />
          </rect>
        </clipPath>
      </defs>

      {/* Fondo */}
      <rect width="100%" height="100%" fill={bg} />

      {/* Pajilla */}
      <g filter="url(#blur)">
        <rect x="98" y="20" width="6" height="70" rx="3" fill={strawColor}>
          <animate attributeName="y" values="20;14;20" dur={dur} repeatCount="indefinite" />
          <animate
            attributeName="height"
            values="70;82;70"
            dur={dur}
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Cuerpo del vaso */}
      <g filter="url(#blur)">
        {/* Rim fijo (borde/sombra superior) */}
        <ellipse cx="100" cy="40" rx="70" ry="22" fill={rimColor} opacity="0.18" />

        {/* Vaso */}
        <path
          d="M40 45
             L58 170
             Q100 178 142 170
             L160 45
             Q100 62 40 45 Z"
          fill={cupColor}
          stroke={rimColor}
          strokeWidth={6}
        />

        {/* Banda/sombra interior */}
        <path
          d="M50 80 Q100 95 150 80"
          fill="none"
          stroke={rimColor}
          strokeOpacity="0.15"
          strokeWidth={10}
          strokeLinecap="round"
        />
      </g>

      {/* Boca (apertura con clip) */}
      <g clipPath="url(#mouthClip)">
        {/* Interior oscuro para profundidad */}
        <ellipse cx="100" cy="40" rx="68" ry="20" fill={rimColor} opacity="0.25" />
        {/* Líquido que ondula */}
        <path
          id="liquid"
          d="M36 40
             q32 12 64 0
             q32 -12 64 0
             v18 h-128 z"
          fill={cupColor}
          opacity="0.9"
        >
          <animate
            attributeName="d"
            dur={dur}
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            values="
              M36 40 q32 12 64 0 q32 -12 64 0 v18 h-128 z;
              M36 44 q32  6 64 0 q32  -6 64 0 v14 h-128 z;
              M36 40 q32 12 64 0 q32 -12 64 0 v18 h-128 z"
          />
        </path>
      </g>

      {/* Tapa que rota (abre/cierra) */}
      <g transform="translate(100,25)">
        {/* Bisagra visual */}
        <circle cx="-60" cy="10" r="2" fill={rimColor} opacity="0.5" />
        {/* Tapa */}
        <g transform="translate(-60,10)">
          <ellipse
            cx="60"
            cy="5"
            rx="72"
            ry="18"
            fill={lidColor}
            stroke={rimColor}
            strokeWidth={6}
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            dur={dur}
            repeatCount="indefinite"
            values="rotate(0 0 0); rotate(-22 0 0); rotate(0 0 0)"
            keyTimes="0;0.5;1"
          />
        </g>
      </g>

      {/* Texto opcional */}
      {showText && (
        <text
          x="50%"
          y="190"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial"
          fontSize="14"
          fill={rimColor}
          opacity="0.7"
        >
          {label}
        </text>
      )}

      {/* Respeta reduce motion */}
      <style>
        {`
        @media (prefers-reduced-motion: reduce) {
          svg animate, svg animateTransform {
            display: none !important;
          }
        }
      `}
      </style>
    </svg>
  );
}
