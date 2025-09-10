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

  const { game, setGame, start } = useStartGameWithWatchdog(
    ready ? roomCode : "",
    ready ? userId : 0
  )

  useGameHub(roomCode, game?.gameId, setGame)

  const {isAnimating } = useAnimatedCups(game?.cups)
  const { isMyTurn } =
    useSwap(game, userId ?? 0, setGame, isAnimating)

  if (!ready) {
    return <PantallaFondo texto="Obteniendo usuario..." />
  }

  if (!game) {
    return (
      <PantallaFondo
        texto={start?.isPending ? 'Starting Game...' : 'Connecting to Game...'}
      />
    )
  }

  if (game.status === 'Setup') {
    return (
      <SetUpPhase
        game={game}
        setGame={setGame}
        isMyTurn={isMyTurn}
        isAnimating={isAnimating}
      />
    )
  }

  if (game.status === 'InProgress') {
    return (
      <GamePhase game={game} setGame={setGame} />  
    )
  }

  // End / Other states -- daniel
  return (
    <div className="min-h-screen bg-black text-white grid place-items-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400 mb-4">🎉 Estado: {game.status}</h2>
        <div className="text-white/80 space-y-2">
          <p>Sala: {game.roomCode}</p>
          <p>Estado: {game.status}</p>
          <p>Jugador actual: {game.currentPlayerId}</p>
          <p>Movimientos totales: {game.totalMoves}</p>
          <p>Aciertos finales: {game.hits}/6</p>
        </div>
      </div>
    </div>
  )
}

export default PlayPage;