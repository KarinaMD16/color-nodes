import { useState } from "react"
import { useSwapMove } from "@/hooks/gameHooks"
import type { GameStateResponse } from "@/models/game"

export function useSwap(
  game: GameStateResponse | null,
  userId: number,
  setGame: (g: GameStateResponse) => void,
  isAnimating: boolean
) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const swapMove = useSwapMove(game?.gameId ?? '')

  const isMyTurn = game?.currentPlayerId === userId

  const handleSlotClick = async (idx: number) => {
    if (!isMyTurn || swapMove.isPending || isAnimating) return
    if (selectedSlot === null) {
      setSelectedSlot(idx)
    } else if (selectedSlot === idx) {
      setSelectedSlot(null)
    } else {
      try {
        const updated = await swapMove.mutateAsync({
          playerId: userId,
          fromIndex: selectedSlot,
          toIndex: idx,
        })
        setGame(updated)
      } finally {
        setSelectedSlot(null)
      }
    }
  }

  return { isMyTurn, selectedSlot, swapMove, handleSlotClick }
}