import React from 'react';

type CupPixelStrawProps = {
    size?: number;
    colors?: Partial<{
        outline: string;  // contorno
        body: string;     // vaso
        lid: string;      // tapa
        rim: string;      // línea clara bajo tapa
        straw: string;    // pajilla
    }>;
};

export default function CupPixelStraw({
    size = 128,
    colors = {},
}: CupPixelStrawProps) {
    const style = {
        '--outline': colors.outline ?? '#111111',
        '--body': colors.body ?? '#ef4444', // rojo
        '--lid': colors.lid ?? '#ffffff',
        '--rim': colors.rim ?? '#e5e7eb', // gris claro
        '--straw': colors.straw ?? '#ffffff',
    } as React.CSSProperties;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 28"
            width={size}
            height={size}
            shapeRendering="crispEdges"
            aria-label="pixel-cup-with-straw"
            style={style}
        >
            {/* ===== PAJILLA ===== */}
            {/* tramo vertical */}
            <rect x="12" y="2" width="2" height="6" fill="var(--straw)" />
            <rect x="11" y="2" width="1" height="6" fill="var(--outline)" />
            <rect x="14" y="2" width="1" height="6" fill="var(--outline)" />
            {/* codo + tramo horizontal */}
            <rect x="14" y="6" width="4" height="2" fill="var(--straw)" />
            <rect x="18" y="6" width="1" height="2" fill="var(--outline)" />
            <rect x="13" y="5" width="1" height="3" fill="var(--outline)" />

            {/* ===== TAPA ===== */}
            {/* contorno tapa */}
            <rect x="3" y="8" width="18" height="2" fill="var(--outline)" />
            {/* relleno tapa */}
            <rect x="4" y="8" width="16" height="1" fill="var(--lid)" />
            {/* rim claro bajo tapa */}
            <rect x="4" y="9" width="16" height="1" fill="var(--rim)" />

            {/* ===== CUERPO (contorno) ===== */}
            {/* laterales y base contorno grueso */}
            <rect x="4" y="10" width="2" height="14" fill="var(--outline)" />
            <rect x="18" y="10" width="2" height="14" fill="var(--outline)" />
            <rect x="6" y="24" width="12" height="2" fill="var(--outline)" />

            {/* escalonamiento del cuerpo (contorno interior) */}
            <rect x="6" y="10" width="12" height="1" fill="var(--outline)" />
            <rect x="7" y="11" width="10" height="1" fill="var(--outline)" />
            <rect x="8" y="12" width="8" height="1" fill="var(--outline)" />
            {/* base interior */}
            <rect x="7" y="23" width="10" height="1" fill="var(--outline)" />

            {/* ===== CUERPO (relleno) ===== */}
            <rect x="6" y="11" width="12" height="12" fill="var(--body)" />
            <rect x="7" y="12" width="10" height="10" fill="var(--body)" />
            <rect x="8" y="13" width="8" height="9" fill="var(--body)" />

            {/* pequeño brillo opcional (puedes quitarlo si lo quieres plano) */}
            <rect x="9" y="14" width="2" height="2" fill="#ffffff" opacity=".2" />
        </svg>
    );
}
