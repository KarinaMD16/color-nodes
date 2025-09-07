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

  useEffect(() => {
    if (!roomCode || !userId || userId === 0 || startedRef.current) return
    startedRef.current = true
    setStartStuck(false)

    const watchdog = setTimeout(() => setStartStuck(true), 5000)

    start.mutate(
      { roomCode },
      {
        onSuccess: (gs) => {
          clearTimeout(watchdog)
          setGame(gs)
          if (gs?.gameId) qc.setQueryData(['game', gs.gameId], gs)
        },
        onError: () => {
          clearTimeout(watchdog)
          startedRef.current = false
          setStartStuck(true)
        },
        onSettled: () => clearTimeout(watchdog),
      }
    )
  }, [roomCode, start, userId, qc])

    return { game, setGame, startStuck, start }
}
