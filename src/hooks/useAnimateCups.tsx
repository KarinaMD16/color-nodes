import { useEffect, useMemo, useRef, useState } from "react"

export function useAnimatedCups(cups: string[] | null | undefined) {
  const [isAnimating, setIsAnimating] = useState(false)
  const sig = (cups ?? []).join('|')
  const sigRef = useRef<string>('')

  const items = useMemo(
    () => (cups ?? []).map(hex => ({ hex, id: `cup:${hex}` })),
    [sig]
  )

  useEffect(() => {
    const prev = sigRef.current
    if (prev && prev !== sig) {
      setIsAnimating(true)
      sigRef.current = sig
      const t = setTimeout(() => setIsAnimating(false), 600)
      return () => clearTimeout(t)
    }
    sigRef.current = sig
  }, [sig])

  return { items, isAnimating }
}
