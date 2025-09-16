import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useUser } from '../../context/userContext'
import { useGameHub } from '../../hooks/useGameHub'
import { useSwap } from '@/hooks/useSwap'
import { useAnimatedCups } from '@/hooks/useAnimateCups'
import { useStartGameWithWatchdog } from '@/hooks/useStartGame'
import SetUpPhase from '@/components/game/SetUpPhase'
import PantallaFondo from '@/components/PantallaFondo'
import GamePhase from '@/components/game/GamePhase'
import { useEffect, useRef, useState } from 'react'
import { useGameState } from '@/hooks/gameHooks'
import { useGetRoom } from '@/hooks/userHooks'
import router from '@/router'
import { useQueryClient } from '@tanstack/react-query'
import { User } from '@/models/user'

export const playRoute = createRoute({
  component: PlayPage,
  getParentRoute: () => rootRoute,
  path: '/room/$code/play',
})

function PlayPage() {
  const { code } = playRoute.useParams()
  const roomCode = code
  const { id: userId } = useUser()
  const ready = !!roomCode && !!userId

  const qc = useQueryClient()
  const [gameId, setGameId] = useState<string | null>(null)
  const { data: room } = useGetRoom(roomCode)

  useEffect(() => {
    if (!ready) return
    const stored = localStorage.getItem(`game_${roomCode}`)
    if (stored) {
      setGameId(stored)
    } else if (room?.activeGameId) {
      setGameId(room.activeGameId)
      localStorage.setItem(`game_${roomCode}`, room.activeGameId)
    }
  }, [ready, roomCode, room?.activeGameId])

  const { data: currentGame, error } = useGameState(gameId || undefined)

  useEffect(() => {
    if (!error) return
    localStorage.removeItem(`game_${roomCode}`)
    setGameId(null)
  }, [error, roomCode])

  useGameHub(roomCode, gameId ?? undefined, (s) => {
    if (s?.gameId && !gameId) {
      setGameId(s.gameId)
      localStorage.setItem(`game_${roomCode}`, s.gameId)
    }
    if (s?.gameId) qc.setQueryData(['game', s.gameId], s)
  })

  const validUser = Number.isInteger(userId) && Number(userId) > 0
  if (!ready || !validUser) return <PantallaFondo texto="Obteniendo usuario..." />

  if (!currentGame) return <PantallaFondo texto="Waiting for game to start..." />

  const isMyTurn =
    currentGame?.currentPlayerId != null &&
    Number(currentGame.currentPlayerId) === Number(userId)

  const setGame = (next: any) => {
    if (!gameId) return
    const key = ['game', gameId] as const
    const prev = qc.getQueryData(key)
    const value = typeof next === 'function' ? next(prev) : next
    qc.setQueryData(key, value)
  }

  if (currentGame.status === 'Setup') {
    return (
      <SetUpPhase
        key={`${currentGame.gameId}-${Number(currentGame.currentPlayerId)}`}
        game={currentGame}
        setGame={setGame}
        isMyTurn={isMyTurn}
        isAnimating={false}
      />
    )
  }

  if (currentGame.status === 'InProgress') {
    return <GamePhase game={currentGame} setGame={setGame} />
  }

  const winner = (room?.users as User[])?.find((u: User) => u.id === currentGame.currentPlayerId);
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-6xl font-extrabold text-amber-400 mb-6 animate-pulse">
        🎉 ¡{winner ? winner.username : `Jugador ${currentGame.currentPlayerId}`} ganó! 🎉
      </h1>
      <p className="text-white/70 text-xl mb-4">¡Felicidades al ganador de esta partida!</p>
      <div className="bg-emerald-500 text-black font-bold px-6 py-3 rounded-lg text-2xl animate-bounce mt-8">
        🏆 Ganador 🏆
      </div>
      <button
        onClick={() => router.navigate({ to: '/room/$code', params: { code: roomCode } })}
        className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-2xl transition-all duration-200"
      >
        🔄 Volver a jugar
      </button>

    </div>
  );

}

export default PlayPage;