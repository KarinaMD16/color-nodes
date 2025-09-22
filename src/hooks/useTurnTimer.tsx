import { useEffect, useRef, useState } from 'react'
import { useTick } from './gameHooks'
import { parseUtc } from '@/utils/parseUtc'

function fmt(total: number) {
  const s = Math.max(0, total | 0)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function useTurnTimer(turnEndsAtUtc?: string, gameId?: string) {
    const [secondsLeft, setSecondsLeft] = useState(0)
    const endMs = useRef<number>(0)
    const pollInterval = useRef<number | null>(null)

    // recalcular SIEMPRE que cambie turnEndsAtUtc (reactivo)
    useEffect(() => {
        if (!turnEndsAtUtc) {
            endMs.current = 0
            setSecondsLeft(0)
            return
        }
        endMs.current = parseUtc(turnEndsAtUtc)
        setSecondsLeft(Math.ceil((endMs.current - Date.now()) / 1000))
    }, [turnEndsAtUtc])

    // tick local cada 1s basado en end absoluto (sin drift)
    useEffect(() => {
        const id = window.setInterval(() => {
            setSecondsLeft(Math.ceil((endMs.current - Date.now()) / 1000))
        }, 1000)
        return () => window.clearInterval(id)
    }, [])

    // poll suave al backend (opcional) para asegurar avance por timeout
    const { mutateAsync: tick } = useTick(gameId ?? '')
    useEffect(() => {
        if (!gameId) return
        pollInterval.current = window.setInterval(async () => {
            try { await tick() } catch { }
        }, 4000)
        return () => {
            if (pollInterval.current) window.clearInterval(pollInterval.current)
            pollInterval.current = null
        }
    }, [gameId, tick])

    return {
        secondsLeft: Math.max(0, secondsLeft),
        formatted: fmt(Math.max(0, secondsLeft)),
    }
}