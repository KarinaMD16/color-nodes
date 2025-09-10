import { useEffect, useMemo, useRef, useState } from "react"

export function useAnimatedCups(cups: string[] | null | undefined) {
  const [isAnimating, setIsAnimating] = useState(false)

  const sig = (cups ?? []).join('|')
  const sigRef = useRef<string>('')

  const queuesRef = useRef<Map<string, string[]>>(new Map())
  const countersRef = useRef<Map<string, number>>(new Map())

  const items = useMemo(() => {
    const nextQueues = new Map<string, string[]>()

    const getStableId = (hex: string) => {
      const prevQ = queuesRef.current.get(hex)
      if (prevQ && prevQ.length) {
        const id = prevQ.shift()!
        const q = nextQueues.get(hex) ?? []
        q.push(id)
        nextQueues.set(hex, q)
        return id
      }
      const n = countersRef.current.get(hex) ?? 0
      countersRef.current.set(hex, n + 1)
      const id = `${hex}#${n}`
      const q = nextQueues.get(hex) ?? []
      q.push(id)
      nextQueues.set(hex, q)
      return id
    }

    const list = (cups ?? []).map((hex) => ({ hex, id: getStableId(hex) }))
    queuesRef.current = nextQueues
    return list
  }, [sig])

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
