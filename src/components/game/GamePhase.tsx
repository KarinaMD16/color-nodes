import bgImage from '../../assets/orig.png'
import { useUser } from '@/context/userContext'
import { useAnimatedCups } from '@/hooks/useAnimateCups'
import { useSwap } from '@/hooks/useSwap'
import { SpectatorOverlay } from '@/utils/spec'
import { motion, LayoutGroup } from 'framer-motion'
import { Trophy } from 'lucide-react'
import CupPixelStraw from '../CupPixelStraw'
import type { GamePhaseProps } from '@/types/gameItems/items'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core'
import DraggableCup from './DraggableCup'
import DroppableSlot from './DroppableSlot'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AVATAR_SEEDS, Player } from '@/types/PlayerTypes'
import { PlayersList } from './PlaeyrList'

const CUP_SIZE = 110

const GamePhase = ({ game, setGame }: GamePhaseProps) => {
  const { id: userId } = useUser()
  const playerId = Number(userId) || 0

  const { items, isAnimating } = useAnimatedCups(game?.cups ?? [])
  const sig = (game?.cups ?? []).join('|')
  const board = useMemo(() => items.map((it) => ({ id: it.id, hex: it.hex })), [items])

  const { isMyTurn, selectedSlot, handleSlotClick, swapMove } =
    useSwap(game, playerId, setGame, isAnimating)

  // Lista de jugadores con avatares
  const players: Player[] = useMemo(() => {
    if (!game?.playerOrder) return []

    return game.playerOrder.map((playerId: number, index: number) => ({
      id: playerId,                   
      username: `Player ${playerId}`, 
      isHost: index === 0,
      avatar: AVATAR_SEEDS[index % AVATAR_SEEDS.length]
    }))
  }, [game?.playerOrder])

  const board = useMemo(() => items.map((it) => ({ id: it.id, hex: it.hex })), [items])

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeHex, setActiveHex] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor)
  )

  const sendSwap = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    await swapMove.mutateAsync({ playerId, fromIndex, toIndex })
  }

  const grid = (
    <motion.div
      layout
      className="grid grid-cols-6 gap-4 max-w-full mx-auto rounded-xl"
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      style={{ willChange: 'transform' }}
    >
      {board.map(({ id, hex }, idx) => {
        const isSelected = isMyTurn && selectedSlot === idx
        return (
          <DroppableSlot key={`slot-${idx}`} id={`slot-${idx}`}>
            <button
              disabled={!isMyTurn || swapMove.isPending || isAnimating}
              onClick={() => isMyTurn && handleSlotClick(idx)}
              className={[
                'aspect-square w-40 h-40 flex items-center justify-center rounded-xl transition-colors border-none',
                isSelected ? 'bg-white/20' : 'bg-transparent',
              ].join(' ')}
            >
              <motion.div
                key={id}
                layout
                layoutId={id}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                className={activeId === id ? 'opacity-0' : ''}
                style={{ width: CUP_SIZE, height: CUP_SIZE, display: 'grid', placeItems: 'center', willChange: 'transform' }}
              >
                {isMyTurn && !swapMove.isPending && !isAnimating ? (
                  <DraggableCup
                    id={id}
                    data={{ type: 'cup', from: 'board', slotIndex: idx, hex }}
                    activeId={activeId ?? undefined}
                  >
                    <CupPixelStraw size={CUP_SIZE} colors={{ body: hex }} />
                  </DraggableCup>
                ) : (
                  <CupPixelStraw size={CUP_SIZE} colors={{ body: hex }} />
                )}
              </motion.div>
            </button>
          </DroppableSlot>
        )
      })}
    </motion.div>
  )

  return (
    <div className="relative w-full min-h-screen bg-black">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen bg-black/50 text-white p-6">
          <div className="max-w-full mx-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl">🎮 Game in Progress</h2>
              <div className="flex flex-col items-end">
                <span className="text-xs text-white/70">Room Code</span>
                <span className="font-mono text-lg">{game.roomCode}</span>
              </div>
            </div>

            {/* Lista de jugadores con avatares */}
            <PlayersList
              players={players}
              currentPlayerId={game.currentPlayerId}
              myId={playerId}
            />

            <div className="mb-6 p-4 bg-white/10 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className={isMyTurn ? 'text-emerald-400 font-semibold' : 'text-orange-400'}>
                  {isMyTurn ? '🎯 Your Turn!' : `🎮 Player ${game.currentPlayerId}'s Turn`}
                </span>
                <span className="text-sm text-white/70">Moves: {game.totalMoves ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">
                  Current hits:{' '}
                  <span className="text-emerald-400 font-bold">{game.hits ?? 0}/6</span>
                </span>
                {game.hits === 6 && (
                  <span className="text-yellow-400 font-bold inline-flex items-center gap-2">
                    <Trophy size={18} /> You Won!
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="relative">
                <LayoutGroup id="game-board">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragStart={({ active }) => {
                      if (!isMyTurn || swapMove.isPending || isAnimating) return
                      setActiveId(String(active.id))
                      const hex = (active.data.current as any)?.hex as string | undefined
                      if (hex) setActiveHex(hex)
                    }}
                    onDragCancel={() => {
                      setActiveId(null)
                      setActiveHex(null)
                    }}
                    onDragEnd={async ({ active, over }) => {
                      setActiveId(null)
                      if (!isMyTurn || !over || swapMove.isPending || isAnimating) {
                        setActiveHex(null)
                        return
                      }
                      const overId = String(over.id)
                      if (!overId.startsWith('slot-')) {
                        setActiveHex(null)
                        return
                      }
                      const fromIndex = Number((active.data.current as any)?.slotIndex)
                      const toIndex = Number(overId.split('-')[1])
                      if (Number.isNaN(fromIndex) || Number.isNaN(toIndex) || fromIndex === toIndex) {
                        setActiveHex(null)
                        return
                      }
                      await sendSwap(fromIndex, toIndex)
                      setActiveHex(null)
                    }}
                  >
                    {grid}
                    <DragOverlay
                      dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}
                    >
                      {activeHex ? (
                        <div className="transform rotate-12 scale-110">
                          <CupPixelStraw size={CUP_SIZE} colors={{ body: activeHex }} />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </LayoutGroup>

                {!isMyTurn && (
                  <SpectatorOverlay text={`Player ${game.currentPlayerId} is playing...`} />
                )}
              </div>

              {isMyTurn ? (
                selectedSlot !== null ? (
                  <div className="text-center text-sm text-cyan-400 mt-3">
                    ✨ Slot {selectedSlot + 1} selected. Click another to swap.
                  </div>
                ) : (
                  <p className="text-center text-sm text-white/60 mt-3">
                    🖱️ Click two cups to swap them or drag a cup onto another to swap.
                  </p>
                )
              ) : (
                <p className="text-center text-sm text-white/60 mt-3">⏳ Wait for your turn</p>
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
                <div className="mt-2 text-yellow-400 text-sm flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {swapMove.isPending ? 'Processing swap...' : 'Moving cups...'}
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