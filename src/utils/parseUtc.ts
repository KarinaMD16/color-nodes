export function parseUtc(iso: string | undefined) {
    if (!iso) return 0
    const s = /Z|[+\-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z'
    return Date.parse(s) || 0
}