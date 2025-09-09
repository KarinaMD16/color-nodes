import bgImage from '../../assets/orig.png'
import { useUser } from '@/context/userContext'
import { useAnimatedCups } from '@/hooks/useAnimateCups'
import { useSwap } from '@/hooks/useSwap'
import { SpectatorOverlay } from '@/utils/spec'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import CupPixelStraw from '../CupPixelStraw'
import type { GamePhaseProps } from '@/types/gameItems/items'

const GamePhase = ({ game, setGame }: GamePhaseProps) => {
  const { id: userId } = useUser()

  // Animación de layout (cambios suaves al reordenar desde SignalR/acciones)
  const { items, isAnimating } = useAnimatedCups(game?.cups ?? [])

  // Lógica de turno + swap por click (tu hook)
  const { isMyTurn, selectedSlot, handleSlotClick, swapMove } =
    useSwap(game, userId ?? 0, setGame, isAnimating)

  return (
    <div className="relative w-full min-h-screen bg-black">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen bg-black/50 text-white p-6">
          <div className="max-w-full mx-auto">

            {/* Header */}
            <div className="flex justify-between">
              <h2 className="text-xl mb-4">
                Game in progress
              </h2>
              <div className="flex flex-col items-end">
                <span className="text-xs text-white/70">Room code</span>
                <span className="font-mono">{game.roomCode}</span>
              </div>
            </div>

            {/* Estado */}
            <div className="mb-6 p-4 bg-white/10 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className={isMyTurn ? 'text-emerald-400 font-semibold' : 'text-orange-400'}>
                  {isMyTurn ? 'Your turn' : `Player ${game.currentPlayerId}'s turn`}
                </span>
                <span className="text-sm text-white/70">Moves: {game.totalMoves ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">
                  Current hits:{' '}
                  <span className="text-emerald-400 font-bold">{game.hits ?? 0}</span>
                </span>
                {game.hits === 6 && (
                  <span className="text-yellow-400 font-bold inline-flex items-center gap-2">
                    <Trophy size={18}/> You won!
                  </span>
                )}
              </div>
            </div>

            {/* Tablero */}
            <div className="mb-8">
              <div className="relative">
                <motion.div
                  layout
                  className="grid grid-cols-6 gap-4 max-w-full mx-auto rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                >
                  {items.map(({ hex, id }, idx) => {
                    const isSelected = isMyTurn && selectedSlot === idx
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
                        whileHover={isMyTurn && !isAnimating ? { scale: 1.05 } : undefined}
                        whileTap={isMyTurn && !isAnimating ? { scale: 0.95 } : undefined}
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

              {/* Mensajito de ayuda */}
              {isMyTurn ? (
                selectedSlot !== null ? (
                  <div className="text-center text-sm text-cyan-400 mt-3">
                    Slot {selectedSlot + 1} selected. Click another to swap.
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

            {/* (opcional) patrón meta/objetivo como referencia visual, si aplica */}
            <div className="mb-6">
              <div className="grid grid-cols-6 max-w-full mx-auto opacity-75">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="w-40 h-40 flex items-center justify-center">
                    <CupPixelStraw colors={{ body: '#808080' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Estado de movimiento */}
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

export default GamePhase
