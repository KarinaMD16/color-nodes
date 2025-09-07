import { useState, useMemo } from "react"
import { hasDuplicateColors } from "@/utils/dupeColor"
import { usePlaceInitial } from "@/hooks/gameHooks"
import type { GameStateResponse } from "@/models/game"
import { useQueryClient } from "@tanstack/react-query"

export function useInitialPhase(game: GameStateResponse | null, userId: number, isMyTurn: boolean, setGame: (g: GameStateResponse) => void) {
  const [draft, setDraft] = useState<(string | null)[]>(Array(6).fill(null))
  const [pickedColor, setPickedColor] = useState<string | null>(null)
  const qc = useQueryClient()
  const placeInitial = usePlaceInitial(game?.gameId ?? '')

  const usedColors = useMemo(() => new Set(draft.filter(Boolean) as string[]), [draft])
  const canConfirm = draft.every(Boolean) && !hasDuplicateColors(draft)

  const handlePick = (hex: string) => { if (!usedColors.has(hex)) setPickedColor(hex) }
  const handlePlaceAt = (idx: number) => {
    if (!pickedColor || usedColors.has(pickedColor)) return
    setDraft(prev => { const next = [...prev]; next[idx] = pickedColor; return next })
  }
  const handleRemoveAt = (idx: number) => setDraft(prev => { const next = [...prev]; next[idx] = null; return next })

  const confirmInitial = () => {
    if (!game?.gameId || !userId || !isMyTurn) return
    if (!draft.every(Boolean) || hasDuplicateColors(draft)) return

    placeInitial.mutate(
      { playerId: userId, cups: draft as string[] },
      {
        onSuccess: (updated) => {
          setGame(updated)
          if (updated?.gameId) qc.setQueryData(['game', updated.gameId], updated)
          setDraft(Array(6).fill(null))
          setPickedColor(null)
        },
      }
    )
  }

    return { draft, pickedColor, usedColors, canConfirm, placeInitial, handlePick, handlePlaceAt, handleRemoveAt, confirmInitial }
}
