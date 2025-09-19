import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useUser } from '../../context/userContext'
import { useGameHub } from '../../hooks/useGameHub'
import SetUpPhase from '@/components/game/SetUpPhase'
import PantallaFondo from '@/components/PantallaFondo'
import GamePhase from '@/components/game/GamePhase'
import { useEffect, useState } from 'react'
import { useGameState } from '@/hooks/gameHooks'
import { useGetLeaderboard, useGetRoom, usePostLeaveRoom } from '@/hooks/userHooks'
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

  // Guardar o recuperar gameId del localStorage
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

  // Si hay error, limpiar gameId
  useEffect(() => {
    if (!error) return
    localStorage.removeItem(`game_${roomCode}`)
    setGameId(null)
  }, [error, roomCode])

  // Conectar a hub
  useGameHub(roomCode, gameId ?? undefined, (s) => {
    if (s?.gameId && !gameId) {
      setGameId(s.gameId)
      localStorage.setItem(`game_${roomCode}`, s.gameId)
    }
    if (s?.gameId) qc.setQueryData(['game', s.gameId], s)
  })

  const validUser = Number.isInteger(userId) && Number(userId) > 0

  // Hooks siempre al inicio
  const leaderboardQuery = useGetLeaderboard(roomCode, false, {
    enabled: currentGame?.status === 'Finished',
  })
  const leaveMutation = usePostLeaveRoom()

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

  const isSetup = currentGame?.status === 'Setup'
  const isInProgress = currentGame?.status === 'InProgress'
  const winner = (room?.users as User[])?.find(u => u.id === currentGame.currentPlayerId)

  // Render fase Setup
  if (isSetup) {
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

  // Render fase InProgress
  if (isInProgress) {
    return <GamePhase game={currentGame} setGame={setGame} />
  }

  // Render final: ganador + leaderboard + botones
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-6xl font-extrabold text-amber-400 mb-6 animate-pulse">
        🎉 ¡{winner ? winner.username : `Jugador ${currentGame.currentPlayerId}`} ganó! 🎉
      </h1>
      <p className="text-white/70 text-xl mb-4">¡Felicidades al ganador de esta partida!</p>

      {/* Leaderboard */}
      <div className="bg-amber-200 border-4 border-black rounded-lg p-6 shadow-lg mb-6">
        <table className="table-auto text-black font-bold text-lg">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardQuery.data?.length ? (
              leaderboardQuery.data.map(u => (
                <tr key={u.rank}>
                  <td className="px-4 py-2">#{u.rank}</td>
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center">Cargando...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="flex gap-6">
        <button
          onClick={() => leaveMutation.mutate({ userId: userId!, roomCode })}
          disabled={leaveMutation.isPending}
          className="bg-red-500 border-4 border-black text-white font-bold px-8 py-3 rounded-lg text-xl shadow-md hover:bg-red-600 transition-all"
        >
          Leave
        </button>

        <button
          onClick={() => {
            localStorage.removeItem(`game_${roomCode}`)
            router.navigate({ to: '/room/$code', params: { code: roomCode } })
          }}
          className="bg-blue-500 border-4 border-black text-white font-bold px-8 py-3 rounded-lg text-xl shadow-md hover:bg-blue-600 transition-all"
        >
          Play again
        </button>
      </div>
    </div>
  )
}

export default PlayPage
