import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import bgImage from '../../assets/orig.png'
import { useUser } from '../../context/userContext'
import { useGameHub } from '../../hooks/useGameHub'
import type { GameStateResponse } from '@/models/game'
import CupPixelStraw from '@/components/CupPixelStraw'
import { nesStateClass } from '@/utils/btnClass'
import { hasDuplicateColors } from '@/utils/dupeColor'
import { SpectatorOverlay } from '@/utils/spec'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useSwap } from '@/hooks/useSwap'
import { useAnimatedCups } from '@/hooks/useAnimateCups'
import { useInitialPhase } from '@/hooks/useInitialPhase'
import { useStartGameWithWatchdog } from '@/hooks/useStartGame'
import { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export const playRoute = createRoute({
  component: PlayPage,
  getParentRoute: () => rootRoute,
  path: '/room/$code/play',
})

function PlayPage() {
  const { code } = playRoute.useParams()
  const roomCode = code
  const { id: userId, username } = useUser()

  const { game, setGame, start, startStuck } = useStartGameWithWatchdog(roomCode, userId ?? 0)

  useGameHub(roomCode, game?.gameId, setGame)

  const { items, isAnimating } = useAnimatedCups(game?.cups)

  const { isMyTurn, selectedSlot, handleSlotClick, swapMove } =
    useSwap(game, userId ?? 0, setGame, isAnimating)

  const {
    draft,
    pickedColor,
    usedColors,
    canConfirm,
    handlePick,
    handlePlaceAt,
    handleRemoveAt,
    confirmInitial,
    placeInitial,
  } = useInitialPhase(game, userId ?? 0, isMyTurn, setGame)

  const startedRef = useRef(false)
  const queryClient = useQueryClient()

if (!game) {
  return (
    <div className="relative w-full min-h-screen bg-black">
      <div className="fixed inset-0 w-full h-full bg-cover bg-center flex justify-center items-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="bg-black/70 p-8 rounded-lg w-[min(92vw,700px)]">
          <h1 className="text-white font-bold text-lg text-center mb-6">
            {start.isPending ? 'Starting Game...' : 'Connecting to Game...'}
          </h1>
          {/* Simple loading animation */}
            <div className="flex justify-center mb-6">
            <div className="animate-spin text-4xl">🎮</div>
            </div>

        </div>
      </div>
    </div>
  )
}

  if (game.status === 'Setup') {
    return (
      <div className="relative w-full min-h-screen bg-black">
        <div className="fixed inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="min-h-screen bg-black/50 text-white p-6">
            <div className="max-w-full mx-auto">
              <div className="nes-container with-title bg-white">
                <p className="title text-black">Initial phase</p>
                {isMyTurn
                  ? <p className="nes-text text-black">
                      You're first! Place the first 6 cups to start guessing.
                    </p>
                  : <p className="nes-text is-warning">
                      Waiting for player {game.currentPlayerId} to place the cups…
                    </p>
                }
              </div>

              {isMyTurn && (
                <>
                  <div className="mb-8 mt-8">
                    <h3 className="text-lg mb-3">Available cups</h3>
                    <div className="flex gap-3 flex-wrap">
                      {game.availableColors?.map((hex) => {
                        const isUsed = usedColors.has(hex)
                        return (
                          <button
                            key={hex}
                            onClick={() => handlePick(hex)}
                            disabled={isUsed}
                            title={isUsed ? 'Ya usado' : `Color: ${hex}`}
                            className={`w-12 h-12 rounded-lg border-2 transition-all ${pickedColor === hex ? 'border-emerald-400 shadow-lg' : 'border-white/30'} ${isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 hover:border-white/50'}`}
                            style={{ backgroundColor: hex }}
                          />
                        )
                      })}
                    </div>
                    {pickedColor && (
                      <div className="flex mt-4 items-center ml-1 gap-3 mb-6 p-2 w-fit bg-white/10 rounded-lg">
                        <p className="text-md mt-2" style={{ color: pickedColor }}>Current color:</p>
                        <CupPixelStraw size={40} colors={{ body: pickedColor }} />
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <div className="grid grid-cols-6 gap-4 max-w-full mx-auto">
                      {draft.map((hex, idx) => (
                        <button
                          key={idx}
                          onClick={() => hex ? handleRemoveAt(idx) : handlePlaceAt(idx)}
                          className={`aspect-square w-40 h-40 flex items-center justify-center transition-all transform hover:scale-105 border-none ${selectedSlot === idx ? 'bg-white/20 shadow-lg' : 'bg-transparent'}`}
                        >
                          {hex ? <CupPixelStraw colors={{ body: hex }} /> : <span className="text-xs opacity-60">{idx + 1}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <button
                      disabled={!canConfirm || placeInitial.isPending || !isMyTurn}
                      onClick={confirmInitial}
                      className={nesStateClass(!canConfirm || placeInitial.isPending || !isMyTurn)}
                    >
                      {placeInitial.isPending
                        ? 'Sending…'
                        : !isMyTurn
                          ? 'Waiting for your turn…'
                          : !draft.every(Boolean)
                            ? `Missing ${6 - draft.filter(Boolean).length} cups`
                            : hasDuplicateColors(draft)
                              ? "You can't repeat colors"
                              : 'Confirm cups'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (game.status === 'InProgress') {
    return (
      <div className="relative w-full min-h-screen bg-black">
        <div className="fixed inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="min-h-screen bg-black/50 text-white p-6">
            <div className="max-w-full mx-auto">
              <div className='flex justify-between'>
                <h2 className="text-xl mb-4">
                  Game in progress
                </h2>
                <div className='flex flex-col items-end'>
                  <span className="text-xs text-white/70">
                    Room code
                  </span>
                  <span className="font-mono">
                    {game.roomCode}
                  </span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-white/10 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className={isMyTurn ? 'text-emerald-400 font-semibold' : 'text-orange-400'}>
                    {isMyTurn ? 'Your turn' : `Player ${game.currentPlayerId}'s turn`}
                  </span>
                  <span className="text-sm text-white/70">Moves: {game.totalMoves || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">
                    Current hits: 
                    <span className="text-emerald-400 font-bold">
                      {game.hits || 0}
                    </span>
                  </span>
                  {game.hits === 6 && (<span className="text-yellow-400 font-bold">
                    <Trophy /> You won!
                  </span>)}
                </div>
              </div>

              <div className="mb-8">
                <div className="relative">

                  <motion.div
                    layout
                    className="grid grid-cols-6 gap-4 max-w-full mx-auto rounded-xl"
                  >
                    {items.map(({ hex, id }, idx) => {
                      const isSelected = selectedSlot === idx && isMyTurn
                      return (
                        <motion.button
                          key={id}
                          layout
                          disabled={!isMyTurn || swapMove.isPending || isAnimating}
                          onClick={() => isMyTurn && handleSlotClick(idx)}
                          className={[
                            'aspect-square w-40 h-40 flex items-center justify-center rounded-xl transition-colors border-none',
                            isSelected ? 'bg-white/20' : 'bg-transparent'
                          ].join(' ')}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25,
                            duration: 0.6
                          }}
                          whileHover={isMyTurn && !isAnimating ? { scale: 1.05 } : {}}
                          whileTap={isMyTurn && !isAnimating ? { scale: 0.95 } : {}}
                        >
                          <CupPixelStraw colors={{ body: hex }} />
                        </motion.button>
                      )
                    })}
                  </motion.div>
                  {!isMyTurn && (
                    <SpectatorOverlay text={`Turno del jugador ${game.currentPlayerId}`} />
                  )}
                </div>

                {isMyTurn ? (
                  selectedSlot !== null ? (
                    <div className="text-center text-sm text-cyan-400 mt-3">
                      Slot {selectedSlot + 1} selected. Click on another to swap.
                    </div>
                  ) : (
                    <p className="text-center text-sm text-white/60 mt-3">
                      Click two cups to swap them.
                    </p>
                  )
                ) : (
                  <p className="text-center text-sm text-white/60 mt-3">
                    Wait for your turn
                  </p>
                )}
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-6 max-w-full mx-auto opacity-75">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="w-40 h-40 flex items-center justify-center">
                      <CupPixelStraw colors={{ body: '#808080' }} />
                    </div>
                  ))}
                </div>
              </div>

              {(swapMove.isPending || isAnimating) && (
                <div className="mt-8 p-4 bg-white/5 rounded-lg text-sm text-white/70">
                  <div className="mt-2 text-yellow-400 text-sm">
                    ⏳ {swapMove.isPending ? 'Processing swap…' : 'Moving cups…'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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