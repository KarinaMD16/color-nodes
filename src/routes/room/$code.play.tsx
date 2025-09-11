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

  const { data: currentGame } = useGameState(gameId || undefined)

  useGameHub(roomCode, currentGame?.gameId)

  const validUser = Number.isInteger(userId) && Number(userId) > 0
  if (!ready || !validUser) return <PantallaFondo texto="Obteniendo usuario..." />

  if (!currentGame) {
    // host aún no apretó Start o estamos esperando el broadcast del hub
    return <PantallaFondo texto="Waiting for game to start..." />
  }

  const isMyTurn =
    currentGame?.currentPlayerId != null &&
    Number(currentGame.currentPlayerId) === Number(userId)

  if (currentGame.status === 'Setup') {
    return (
      <SetUpPhase
        key={`${currentGame.gameId}-${Number(currentGame.currentPlayerId)}`}
        game={currentGame}
        setGame={() => { }}   // si tus componentes requieren setter, puedes pasar uno no-op;
        // o envolver react-query con un setGame que haga qc.setQueryData
        isMyTurn={isMyTurn}
        isAnimating={false}
      />
    )
  }

  if (currentGame.status === 'InProgress') {
    return <GamePhase game={currentGame} setGame={() => { }} />
  }

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400 mb-4">🎉 Estado: {currentGame.status}</h2>
        <div className="text-white/80 space-y-2">
          <p>Sala: {currentGame.roomCode}</p>
          <p>Estado: {currentGame.status}</p>
          <p>Jugador actual: {currentGame.currentPlayerId}</p>
          <p>Movimientos totales: {currentGame.totalMoves}</p>
          <p>Aciertos finales: {currentGame.hits}/6</p>
        </div>
      </div>
    </div>
  )
}

export default PlayPage;