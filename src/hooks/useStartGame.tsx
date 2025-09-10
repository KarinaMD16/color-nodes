import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useStartGame } from "@/hooks/gameHooks"
import type { GameStateResponse } from "@/models/game"

export function useStartGameWithWatchdog(roomCode: string, userId: number) {
  const [game, setGame] = useState<GameStateResponse | null>(null)
  const [startStuck, setStartStuck] = useState(false)
  const startedRef = useRef(false)
  const qc = useQueryClient()
  const start = useStartGame()

  // Reset cuando cambian los parámetros
  useEffect(() => {
    if (!roomCode || !userId) {
      startedRef.current = false
      setGame(null)
      setStartStuck(false)
    }
  }, [roomCode, userId])

  useEffect(() => {
    if (!roomCode || roomCode === "" || !userId || userId === 0) return 

    if (startedRef.current) return
    startedRef.current = true
    setStartStuck(false)

    const watchdog = setTimeout(() => {setStartStuck(true)}, 5000)

    start.mutate(
      { roomCode },
      {
        onSuccess: (gs) => {
          clearTimeout(watchdog)
          setGame(gs)
          if (gs?.gameId) {
            qc.setQueryData(['game', gs.gameId], gs)
            // invalidar queries relacionadas
            qc.invalidateQueries({ queryKey: ['room', roomCode] })
          }
        },
        onError: () => {
          clearTimeout(watchdog)
          startedRef.current = false
          setStartStuck(true)
        },
        onSettled: () => clearTimeout(watchdog),
      }
    )

    return () => clearTimeout(watchdog)
  }, [roomCode, userId, start, qc])

  const retry = () => {
    startedRef.current = false
    setStartStuck(false)
    start.reset()
  }

  return { game, setGame, startStuck, start, retry }
}