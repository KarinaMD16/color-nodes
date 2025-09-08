import bgImage from '../../assets/orig.png'
import { useUser } from "@/context/userContext"
import { useAnimatedCups } from "@/hooks/useAnimateCups"
import { useGameHub } from "@/hooks/useGameHub"
import { useInitialPhase } from "@/hooks/useInitialPhase"
import { useStartGameWithWatchdog } from "@/hooks/useStartGame"
import { useSwap } from "@/hooks/useSwap"
import { playRoute } from "@/routes/room/$code.play"
import { nesStateClass } from "@/utils/btnClass"
import { hasDuplicateColors } from "@/utils/dupeColor"
import CupPixelStraw from "../CupPixelStraw"
import { useSensors, useSensor, PointerSensor, TouchSensor, DndContext, DragOverlay } from "@dnd-kit/core"
import { useState } from "react"
import DraggableCup from "./DraggableCup"
import DroppableSlot from "./DroppableSlot"

const SetUpPhase = () => {
    const { code } = playRoute.useParams()
    const roomCode = code
    const { id: userId } = useUser()
    const [activeId, setActiveId] = useState<string | null>(null)

    const { game, setGame } = useStartGameWithWatchdog(roomCode, userId ?? 0)

    useGameHub(roomCode, game?.gameId, setGame)

    const { isAnimating } = useAnimatedCups(game?.cups)

    const { isMyTurn } = useSwap(game, userId ?? 0, setGame, isAnimating)

    const {
        draft,
        usedColors,
        canConfirm,
        handlePick,
        handlePlaceAt,
        confirmInitial,
        placeInitial,
    } = useInitialPhase(game, userId ?? 0, isMyTurn, setGame)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor)
    )

    if(!game){
        return <div>ocurrio un error. </div>
    }
    return (
        <div className="relative w-full min-h-screen bg-black">
            <div className="fixed inset-0 w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${bgImage})` }}>
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
                                <DndContext
                                    sensors={sensors}
                                    onDragStart={({ active }) => {
                                        setActiveId(String(active.id))
                                        handlePick(String(active.id))
                                    }}
                                    onDragEnd={({ active, over }) => {
                                        setActiveId(null)
                                        if (!over) return
                                        if (over.id.toString().startsWith('slot-')) {
                                            const slotIdx = Number(over.id.toString().split('-')[1])
                                            handlePick(String(active.id))
                                            handlePlaceAt(slotIdx)
                                        }
                                    }}>
                                    {isMyTurn && (
                                        <>
                                            <h3 className="text-lg mb-3">Available cups</h3>
                                            <div className="flex gap-3 flex-wrap">
                                                {game.availableColors?.map((hex) => {
                                                    const isUsed = usedColors.has(hex)
                                                    return (
                                                        <DraggableCup
                                                            key={hex}
                                                            id={hex}
                                                            data={{ type: 'cup', from: 'supply' }}
                                                        >
                                                            <button
                                                                disabled={isUsed}
                                                                className={`w-12 h-12 rounded-lg border-2 ${isUsed ? 'opacity-40' : ''}`}
                                                                style={{ backgroundColor: hex }}
                                                            />
                                                        </DraggableCup>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {/* BOARD (grid de 6 slots fijos) */}
                                    <div className="grid grid-cols-6 gap-4 max-w-full mx-auto mt-8">
                                        {draft.map((hex, idx) => (
                                            <DroppableSlot key={`slot-${idx}`} id={`slot-${idx}`}>
                                                {hex
                                                    ? (
                                                        <DraggableCup
                                                            id={hex}
                                                            data={{ type: 'cup', from: 'board', slotIndex: idx }}
                                                        >
                                                            <CupPixelStraw colors={{ body: hex }} />
                                                        </DraggableCup>
                                                    )
                                                    : <span className="text-xs opacity-60">{idx + 1}</span>}
                                            </DroppableSlot>
                                        ))}
                                    </div>

                                    <DragOverlay>
                                        {activeId ? <CupPixelStraw colors={{ body: activeId }} /> : null}
                                    </DragOverlay>
                                </DndContext>

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

export default SetUpPhase
