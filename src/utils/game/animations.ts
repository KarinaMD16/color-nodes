import { useCallback, useRef, useState } from "react"
import type { Transition } from "framer-motion"

export type BumpDir = "left" | "right" | "swap" | null

export const cupVariants = {
    idle: { x: 0, scale: 1 },
    bump_right: { x: [0, 8, 0], transition: { duration: 0.18 } },
    bump_left: { x: [0, -8, 0], transition: { duration: 0.18 } },
    swap: { scale: [1, 1.08, 1], transition: { duration: 0.18 } },
}

export const LAYOUT_SPRING: Transition = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.32,
}

function diffMoves(before: (string | null)[], after: (string | null)[]) {
    const moves: Array<{ id: string; from: number; to: number }> = []
    const ids = new Set<string>()
    for (const x of before) if (x) ids.add(x)
    for (const x of after) if (x) ids.add(x)
    ids.forEach((id) => {
        const from = before.indexOf(id)
        const to = after.indexOf(id)
        if (from !== to) moves.push({ id, from, to })
    })
    return moves
}

export function useBumps() {
    const [bumpById, setBumpById] = useState<Record<string, BumpDir>>({})
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const triggerBumps = useCallback((before: (string | null)[], after: (string | null)[]) => {
        const moves = diffMoves(before, after)
        if (moves.length === 0) return

        const map: Record<string, BumpDir> = {}

        // swap si exactamente dos se movieron y son adyacentes
        if (moves.length === 2) {
            const [a, b] = moves
            if (Math.abs(a.to - b.to) === 1 && Math.abs(a.from - b.from) === 1) {
                map[a.id] = "swap"
                map[b.id] = "swap"
            }
        }

        // resto: dirección del movimiento
        moves.forEach((m) => {
            if (!map[m.id]) map[m.id] = m.to > m.from ? "right" : "left"
        })

        setBumpById(map)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setBumpById({}), 220)
    }, [])

    return { bumpById, triggerBumps }
}
