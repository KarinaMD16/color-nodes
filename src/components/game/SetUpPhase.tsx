import bgImage from '../../assets/orig.png'
import { useInitialPhase } from "@/hooks/useInitialPhase"
import { nesStateClass } from "@/utils/btnClass"
import { hasDuplicateColors } from "@/utils/dupeColor"
import CupPixelStraw from "../CupPixelStraw"
import {
  useSensors, useSensor, PointerSensor, TouchSensor,
  DndContext, DragOverlay,
  closestCenter
} from "@dnd-kit/core"
import { useMemo, useState } from "react"
import DraggableCup from "./DraggableCup"
import DroppableSlot from "./DroppableSlot"
import { SetUpPhaseProps } from '@/types/gameItems/items'
import { insertAtWithNearestHole, moveWithinBoardNearest } from '@/utils/game/collisions'
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion'
import { cupVariants, LAYOUT_SPRING, useBumps } from '@/utils/game/animations'
import { useUser } from '@/context/userContext'

const CUP_SIZE = 100

const SetUpPhase = ({ game, setGame, isMyTurn }: SetUpPhaseProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayId, setOverlayId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { id: userId } = useUser()
  const myId = Number(userId ?? 0)

  const { bumpById, triggerBumps } = useBumps()
  
  const {
    draft,
    canConfirm,
    confirmInitial,
    placeInitial,
    applyDraft,
  } = useInitialPhase(game, myId, isMyTurn, setGame)

  // en el board
  const usedColors = useMemo(
    () => new Set((draft.filter(Boolean) as string[])),
    [draft]
  )

  const supplyColors = useMemo(
    () => (game.availableColors ?? []).filter(hex => !usedColors.has(hex)),
    [game.availableColors, usedColors]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor)
  )

  if (!game) return <div>Ocurrió un error.</div>

  return (
    <div className="relative w-full min-h-screen bg-black">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen bg-black/50 text-white p-6">
          <div className="max-w-full mx-auto">
            <div className="nes-container with-title bg-white">
              <p className="title text-black">Initial phase</p>
              {isMyTurn ? (
                <p className="nes-text text-black">
                  You're first! Place the first 6 cups to start guessing.
                </p>
              ) : (
                <p className="nes-text is-warning">
                  Waiting for player {game.currentPlayerId} to place the cups…
                </p>
              )}
            </div>

            {isMyTurn && (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}

                  onDragStart={({ active }) => {
                    const id = String(active.id)
                    setActiveId(id)
                    setOverlayId(id)
                    setIsDragging(true)
                  }}

                  onDragCancel={() => {
                    setActiveId(null)
                    setIsDragging(false) 
                  }}

                  onDragEnd={({ active, over }) => {
                    setActiveId(null);
                    setIsDragging(false);
                    
                    if (!over) return
                    const id = String(active.id)
                    const overId = String(over.id)
                    if (!overId.startsWith('slot-')) return

                    const toIdx = Number(overId.split('-')[1])

                    // del supply al board
                    if (active.data.current?.from === 'supply') {
                      if (usedColors.has(id)) return
                      const next = insertAtWithNearestHole(draft, toIdx, id, 'right');
                      triggerBumps(draft, next);
                      applyDraft(next);
                      return
                    }

                    // del board al board 
                    if (active.data.current?.from === 'board') {
                      const fromIdx = Number(active.data.current?.slotIndex)
                      if (fromIdx === toIdx) return

                      // ady
                      if (Math.abs(fromIdx - toIdx) === 1 && draft[fromIdx] && draft[toIdx]) {
                        const next = [...draft];
                        [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]]
                        triggerBumps(draft, next)
                        applyDraft(next)
                        return
                      }

                      // no ady
                      const id = String(active.id)
                      const next = moveWithinBoardNearest(draft, fromIdx, toIdx, id)
                      triggerBumps(draft, next)
                      applyDraft(next)
                      return
                    }
                  }}
                >
                  {/* ---------------- supply ---------------- */}
                  <h3 className="text-lg mb-3 mt-8">Available cups</h3>
                  <div className="flex gap-3 flex-wrap">
                    {supplyColors.map((hex) => (
                      <div
                        key={`supply-${hex}`}
                        className={activeId === hex ? 'opacity-0' : ''}
                        title={`Color: ${hex}`}
                      >
                        <DraggableCup
                          id={hex}
                          data={{ type: 'cup', from: 'supply' }}
                          activeId={activeId ?? undefined}>
                          <div className="inline-flex items-center justify-center"
                            style={{ width: CUP_SIZE, height: CUP_SIZE }}>
                            <CupPixelStraw size={CUP_SIZE} colors={{ body: hex }} />
                          </div>
                        </DraggableCup>
                      </div>
                    ))}
                  </div>

                  {/* ---------------- board ---------------- */}
                  <LayoutGroup id="setup-board">
                    <div className="grid grid-cols-6 gap-4 max-w-full mx-auto mt-8">
                      {draft.map((hex, idx) => (
                        <DroppableSlot key={`slot-${idx}`} id={`slot-${idx}`}>
                          <div
                            className="inline-flex items-center justify-center transition-all"
                            style={{ width: CUP_SIZE, height: CUP_SIZE }}
                            onClick={() => {
                              if (hex && !activeId) {
                                const next = [...draft]
                                next[idx] = null
                                triggerBumps(draft, next) 
                                applyDraft(next)
                              }
                            }}>
                            {hex ? (
                              <motion.div
                                  layout
                                  transition={LAYOUT_SPRING}
                                  variants={cupVariants}
                                  animate={
                                    bumpById[hex]
                                      ? bumpById[hex] === "left"
                                        ? "bump_left"
                                        : bumpById[hex] === "right"
                                          ? "bump_right"
                                          : "swap"
                                      : "idle"
                                  }
                                  className={activeId === hex ? "opacity-0" : ""}
                                >
                                <DraggableCup
                                  id={hex}
                                  data={{ type: 'cup', from: 'board', slotIndex: idx }}
                                  activeId={activeId ?? undefined}
                                >
                                  <CupPixelStraw size={CUP_SIZE} colors={{ body: hex }} />
                                </DraggableCup>
                              </motion.div>
                            ) : (
                              <span className="text-xs opacity-60 select-none">{idx + 1}</span>
                            )}
                          </div>
                        </DroppableSlot>
                      ))}
                    </div>
                  </LayoutGroup>

                  <DragOverlay
                    dropAnimation={{
                      duration: 180,
                      easing: 'cubic-bezier(0.2, 0, 0, 1)',
                    }}
                  >
                    <AnimatePresence onExitComplete={() => setOverlayId(null)}>
                      {overlayId && (
                        <motion.div
                          key={overlayId}
                          style={{ transformOrigin: "bottom center", willChange: "transform", pointerEvents: "none" }}
                          initial={{ rotate: 12, scale: 1.08 }}
                          animate={isDragging ? { rotate: 15, scale: 1.1 } : { rotate: 0, scale: 1 }}
                          exit={{ rotate: 0, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 110,
                            damping: 20,
                            mass: 0.7,
                          }}
                        >
                          <CupPixelStraw size={CUP_SIZE} colors={{ body: overlayId }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </DragOverlay>
                </DndContext>

                <div className="text-center space-y-4 mt-8">
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

export default SetUpPhase
