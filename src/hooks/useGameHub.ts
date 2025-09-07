import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GameStateResponse } from '@/models/game'
import { createGameHub } from '@/services/gameHub'
import { useUser } from '@/context/userContext'

export function useGameHub(roomCode: string, gameId?: string) {
  const qc = useQueryClient()
  const { username } = useUser() 
  const hubRef = useRef<ReturnType<typeof createGameHub> | null>(null)

  useEffect(() => {
    if (!roomCode || !username) return

    const hub = createGameHub(roomCode, username, {
      onStateUpdated: (s: GameStateResponse) => {
        if (gameId && s.gameId === gameId) {
          qc.setQueryData(['game', gameId], s)
        }
      },
      onHitFeedback: (p) => {
        console.log('hit', p.message)
      },
      onTurnChanged: (p) => {
        console.log('cambio turno', p)
      },
      onFinished: (p) => {
        console.log('fin  juego', p)
      },
      onConn: (state) => {
        console.log('conexion exitosa', state)
      },
    })

    hubRef.current = hub
    hub.start().catch(console.error)

    return () => {
      hub.stop().catch(console.error)
    }
  }, [roomCode, gameId, username, qc])

  return {}
}