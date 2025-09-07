import { useEffect, useRef, useState, useMemo } from "react"

export function useAnimatedCups(cups: string[] | null | undefined) {
  const [isAnimating, setIsAnimating] = useState(false)
  const prevCupsRef = useRef<string[] | null>(null)

  const items = useMemo(() => {
    const counts = new Map<string, number>()
    return (cups ?? []).map((hex) => {
      const n = counts.get(hex) ?? 0
      counts.set(hex, n + 1)
      return { hex, id: `${hex}-${n}` }
    })
  }, [cups])

  useEffect(() => {
    if (!cups) return
    const prev = prevCupsRef.current
    if (prev && prev.length === cups.length) {
      const changed = cups.some((c, i) => c !== prev[i])
      if (changed) {
        setIsAnimating(true)
        const timer = setTimeout(() => setIsAnimating(false), 600)
        return () => clearTimeout(timer)
      }
    }
    prevCupsRef.current = [...cups]
  }, [cups])

  return { items, isAnimating }
}
