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

const SetUpPhase = () => {
    const { code } = playRoute.useParams()
    const roomCode = code
    const { id: userId } = useUser()

    const { game, setGame } = useStartGameWithWatchdog(roomCode, userId ?? 0)

    useGameHub(roomCode, game?.gameId, setGame)

    const { isAnimating } = useAnimatedCups(game?.cups)

    const { isMyTurn, selectedSlot } = useSwap(game, userId ?? 0, setGame, isAnimating)

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

export default SetUpPhase
