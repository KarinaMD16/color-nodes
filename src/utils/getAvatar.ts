export function getPixelAvatarUrl(seed: string, size = 80) {
    const s = encodeURIComponent(seed);
    return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${s}&size=${size}&backgroundType=gradientLinear&backgroundRotation=180`;
}