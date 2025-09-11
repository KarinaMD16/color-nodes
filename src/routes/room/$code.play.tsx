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
  const [shouldStartGame, setShouldStartGame] = useState(false)

  const { data: existingGame } = useGameState(gameId || undefined)
  const { data: room } = useGetRoom(roomCode)

  // Lógica para decidir cuándo iniciar juego
  useEffect(() => {
    if (!ready) return

    const storedGameId = localStorage.getItem(`game_${roomCode}`)

    if (storedGameId) {
      setGameId(storedGameId)
      setShouldStartGame(false)

    } else if (room?.activeGameId) {
      setGameId(room.activeGameId)
      localStorage.setItem(`game_${roomCode}`, room.activeGameId)
      setShouldStartGame(false)
    } else {

      setShouldStartGame(true)
    }
  }, [ready, roomCode, room?.activeGameId])

  // Solo iniciar juego si no hay gameId existente
  const { game: newGame, setGame, start } = useStartGameWithWatchdog(
    shouldStartGame ? roomCode : "",
    shouldStartGame ? userId || 0 : 0
  )

  const currentGame = existingGame || newGame

  const isMyTurnById =
    currentGame?.currentPlayerId != null &&
    userId != null &&
    Number(currentGame.currentPlayerId) === Number(userId)
  
  // Escucha cuando se crea un nuevo juego
  useEffect(() => {
    if (newGame?.gameId && !gameId) {
      setGameId(newGame.gameId)
      localStorage.setItem(`game_${roomCode}`, newGame.gameId)
      setShouldStartGame(false)
    }
  }, [newGame?.gameId, gameId, roomCode])


  useGameHub(roomCode, currentGame?.gameId, setGame)

  const { isAnimating } = useAnimatedCups(currentGame?.cups)
  const swap = useSwap(currentGame, userId ?? 0, setGame, isAnimating)

  if (!ready) {
    return <PantallaFondo texto="Obteniendo usuario..." />
  }

  if (!currentGame) {
    const getLoadingText = () => {
      if (start?.isPending) return 'Starting Game...'
      if (shouldStartGame) return 'Initializing...'
      if (gameId) return 'Loading Game...'
      return 'Connecting to Game...'
    }

    return (
      <PantallaFondo
        texto={getLoadingText()}
      />
    )
  }

  if (currentGame.status === 'Setup') {
    return (
      <SetUpPhase
        key={`${currentGame.gameId}-${Number(currentGame.currentPlayerId)}`} // ✅ remount cuando cambie el turno
        game={currentGame}
        setGame={setGame}
        isMyTurn={isMyTurnById}
        isAnimating={isAnimating}
      />
    )
  }

  if (currentGame.status === 'InProgress') {
    return (
      <GamePhase game={currentGame} setGame={setGame} />
    )
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