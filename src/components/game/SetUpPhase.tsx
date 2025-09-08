import bgImage from '../../assets/orig.png'
import { useInitialPhase } from "@/hooks/useInitialPhase"
import { nesStateClass } from "@/utils/btnClass"
import { hasDuplicateColors } from "@/utils/dupeColor"
import CupPixelStraw from "../CupPixelStraw"
import {
  useSensors, useSensor, PointerSensor, TouchSensor,
  DndContext, DragOverlay, pointerWithin
} from "@dnd-kit/core"
import { useMemo, useState } from "react"
import DraggableCup from "./DraggableCup"
import DroppableSlot from "./DroppableSlot"
import { SetUpPhaseProps } from '@/types/gameItems/items'
import { insertWithDirectionalPushPure } from '@/utils/game/collisions'


const CUP_SIZE = 80

const SetUpPhase = ({ game, setGame, isMyTurn }: SetUpPhaseProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const {
    draft,
    canConfirm,
    confirmInitial,
    placeInitial,
    applyDraft, 
  } = useInitialPhase(game, game.currentPlayerId ?? 0, isMyTurn, setGame)

  // Colores usados en el board
  const usedColors = useMemo(
    () => new Set((draft.filter(Boolean) as string[])),
    [draft]
  )

  // Supply real: SOLO colores no usados (evita ids duplicados en dnd-kit)
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
                  collisionDetection={pointerWithin}
                  onDragStart={({ active }) => {
                    setActiveId(String(active.id))
                  }}
                  onDragCancel={() => setActiveId(null)}
                  onDragEnd={({ active, over }) => {
                    setActiveId(null)
                    if (!over) return
                    const id = String(active.id)
                    const overId = String(over.id)
                    if (!overId.startsWith('slot-')) return

                    const toIdx = Number(overId.split('-')[1])

                    // del supply al board
                    if (active.data.current?.from === 'supply') {
                      if (usedColors.has(id)) return
                      const next = insertWithDirectionalPushPure(draft, toIdx, id, 'right')
                      applyDraft(next)
                      return
                    }

                    // del board al board 
                    if (active.data.current?.from === 'board' && overId.startsWith('slot-')) {
                      const fromIdx = Number(active.data.current?.slotIndex)
                      const toIdx = Number(overId.split('-')[1])
                      if (fromIdx === toIdx) return

                      // adyc
                      if (Math.abs(fromIdx - toIdx) === 1 && draft[fromIdx] && draft[toIdx]) {
                        const next = [...draft]
                        const tmp = next[fromIdx]
                        next[fromIdx] = next[toIdx]
                        next[toIdx] = tmp
                        applyDraft(next)
                        return
                      }

                      // no ady
                      const current = [...draft]
                      current[fromIdx] = null 
                      const prefer: 'right' | 'left' = fromIdx < toIdx ? 'right' : 'left'
                      const next = insertWithDirectionalPushPure(current, toIdx, String(active.id), prefer)
                      applyDraft(next)
                      return
                    }
                  }}
                >
                  {/* SUPPLY */}
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
                          activeId={activeId ?? undefined}
                        >
                          <div
                            className="inline-flex items-center justify-center"
                            style={{ width: CUP_SIZE, height: CUP_SIZE }}
                          >
                            <CupPixelStraw size={CUP_SIZE} colors={{ body: hex }} />
                          </div>
                        </DraggableCup>
                      </div>
                    ))}
                  </div>

                  {/* BOARD */}
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
                              applyDraft(next)
                            }
                          }}
                        >
                          {hex ? (
                            <div className={activeId === hex ? 'opacity-0' : ''}>
                              <DraggableCup
                                key={`board-${hex}`}
                                id={hex}
                                data={{ type: 'cup', from: 'board', slotIndex: idx }}
                                activeId={activeId ?? undefined}
                              >
                                <CupPixelStraw size={CUP_SIZE} colors={{ body: hex }} />
                              </DraggableCup>
                            </div>
                          ) : (
                            <span className="text-xs opacity-60 select-none">{idx + 1}</span>
                          )}
                        </div>
                      </DroppableSlot>
                    ))}
                  </div>

                  <DragOverlay>
                    {activeId ? <CupPixelStraw size={CUP_SIZE} colors={{ body: activeId }} /> : null}
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
