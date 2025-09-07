import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { GameStateResponse } from '@/models/game'
import { createGameHub } from '@/services/gameHub'
import { useUser } from '@/context/userContext'

export function useGameHub(
  roomCode: string,
  gameId?: string,
  onUpdate?: (s: GameStateResponse) => void
) {
  const qc = useQueryClient()
  const { username } = useUser()
  const hubRef = useRef<ReturnType<typeof createGameHub> | null>(null)

  useEffect(() => {
    if (!roomCode || !username) return

    const hub = createGameHub(roomCode, username, {
      onStateUpdated: (s: GameStateResponse) => {
        if (s?.gameId) {
          qc.setQueryData(['game', s.gameId], s)
        }
        if (!gameId || s.gameId === gameId) {
          onUpdate?.(s)
        }
      },
      onTurnChanged: (p) => {
        if (!gameId) return
        const prev = qc.getQueryData<GameStateResponse>(['game', gameId])
        if (prev) {
          const patched = { ...prev, currentPlayerId: p.currentPlayerId }
          qc.setQueryData(['game', gameId], patched)
          onUpdate?.(patched)
        }
      },
      onHitFeedback: (p) => console.log('hit', p.message),
      onFinished: (p) => console.log('fin juego', p),
      onConn: (state) => console.log('hub', state),
    })

    hubRef.current = hub
    hub.start().catch(console.error)

    return () => { hub.stop().catch(console.error) }
  }, [roomCode, gameId, username, qc, onUpdate])

  useEffect(() => {
    if (!hubRef.current?.joinGame || !gameId) return
    hubRef.current.joinGame(gameId).catch(console.error)
  }, [gameId])

  return {}
}