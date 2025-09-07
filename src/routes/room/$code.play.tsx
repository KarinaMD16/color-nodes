import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import bgImage from '../../assets/orig.png'
import { useStartGame, usePlaceInitial, useSwapMove } from '../../hooks/gameHooks'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '../../context/userContext'
import { useGameHub } from '../../hooks/useGameHub'
import { GameStateResponse } from '@/models/game'
import CupPixelStraw from '@/components/CupPixelStraw'
import { nesStateClass } from '@/utils/btnClass'

export const playRoute = createRoute({
  component: PlayPage,
  getParentRoute: () => rootRoute,
  path: '/room/$code/play',
})

function PlayPage() {
  const { code } = playRoute.useParams()
  const roomCode = code
  const { id: userId, username } = useUser()

  const [game, setGame] = useState<GameStateResponse | null>(null)
  const [pickedColor, setPickedColor] = useState<string | null>(null)
  const [draft, setDraft] = useState<(string | null)[]>(Array(6).fill(null))

  // Estados para la fase InProgress
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  const start = useStartGame()
  const placeInitial = usePlaceInitial(game?.gameId ?? '')
  const swapMove = useSwapMove(game?.gameId ?? '')

  // --- Candado para no spamear /game/start ---
  const startedRef = useRef(false)
  useEffect(() => {
    if (!roomCode || startedRef.current) return
    startedRef.current = true

    // Llamamos start UNA vez y guardamos el estado inicial (incluye palette)
    start.mutate(
      { roomCode },
      {
        onSuccess: (gameState: GameStateResponse) => {
          console.log('🚀 Game started:', gameState)
          setGame(gameState)
        },
        onError: (e) => {
          console.error('❌ Error starting game:', e)
          startedRef.current = false // permite reintentar manual si quieres
        },
      }
    )
  }, [roomCode, start])

  // --- Conectar SignalR: escuchar updates ---
  useGameHub(roomCode, game?.gameId)

  // --- Handlers de UI ---
  const handlePick = (hex: string) => {
    setPickedColor(hex)
    console.log('🎨 Color picked:', hex)
  }

  const handlePlaceAt = (idx: number) => {
    if (!pickedColor) {
      console.warn('⚠️ No color selected')
      return
    }

    setDraft(prev => {
      const next = [...prev]
      next[idx] = pickedColor
      console.log(`🎯 Placed ${pickedColor} at position ${idx}`)
      return next
    })
  }

  const handleRemoveAt = (idx: number) => {
    setDraft(prev => {
      const next = [...prev]
      next[idx] = null
      console.log(`❌ Removed color from position ${idx}`)
      return next
    })
  }

  const handleSlotClick = (idx: number) => {
    if (!isMyTurn || swapMove.isPending) return

    if (selectedSlot === null) {
      setSelectedSlot(idx)
    } else if (selectedSlot === idx) {
      setSelectedSlot(null)
    } else {
      swapMove.mutate(
        {
          playerId: userId!,
          fromIndex: selectedSlot,
          toIndex: idx
        },
        {
          onSuccess: (updatedGame) => {
            setGame(updatedGame)
            setSelectedSlot(null)
          },
          onError: (e) => {
            console.error('❌ Error swapping:', e)
            setSelectedSlot(null)
          }
        }
      )
    }
  }

  const canConfirm = draft.every(Boolean)
  const isMyTurn = game?.currentPlayerId === userId

  const confirmInitial = () => {
    if (!game?.gameId || !canConfirm || !userId || !isMyTurn) {
      console.warn('⚠️ Cannot confirm placement:', {
        hasGame: !!game?.gameId,
        canConfirm,
        hasUserId: !!userId,
        isMyTurn
      })
      return
    }

    console.log('📤 Confirming initial placement:', draft)

    placeInitial.mutate(
      { playerId: userId, cups: draft as string[] },
      {
        onSuccess: (updated) => {
          console.log('✅ Initial placement confirmed:', updated)
          // SignalR debería actualizar automáticamente el estado
          setGame(updated)
          // Reset draft
          setDraft(Array(6).fill(null))
          setPickedColor(null)
        },
        onError: (e) => {
          console.error('❌ Error placing initial cups:', e)
        },
      }
    )
  }

  // Loading state esto lo debe aplicar orlando en la sala 
  if (!game) {
    return (
      <div className="relative w-full min-h-screen bg-black">
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center flex justify-center items-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="bg-black/70 p-8 rounded-lg">
            <h1 className="text-white font-bold text-lg text-center">
              {start.isPending ? 'Iniciando partida...' : `Conectando a sala ${roomCode}...`}
            </h1>
            {start.isError && (
              <div className="text-red-400 text-sm mt-4 space-y-2">
                <p>❌ Error al iniciar partida</p>
                <button
                  onClick={() => {
                    startedRef.current = false
                    window.location.reload()
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                >
                  🔄 Reintentar
                </button>
              </div>
            )}

            {/* Debug info más detallado */}
            <div className="mt-4 text-xs text-gray-400 space-y-1 bg-gray-800 p-3 rounded">
              <p><strong>Debug Info:</strong></p>
              <p>Room: {roomCode}</p>
              <p>User ID: {userId} {userId === 0 && '⚠️ NOT AUTHENTICATED'}</p>
              <p>Username: {username || 'N/A'}</p>
              <p>Started: {startedRef.current.toString()}</p>
              <p>Pending: {start.isPending.toString()}</p>
              <p>Success: {start.isSuccess.toString()}</p>
              <p>Error: {start.isError.toString()}</p>
              <p>Has Game Data: {(!!game).toString()}</p>

              {start.data && (
                <div className="mt-2 p-2 bg-green-800/20 rounded">
                  <p className="text-green-400">✅ Response received but game not set!</p>
                  <p className="text-xs">Response Status: {start.data?.status}</p>
                </div>
              )}

              {userId === 0 && (
                <div className="bg-yellow-600/20 border border-yellow-500 rounded p-2 mt-2">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Usuario no autenticado. Ve a /login primero.
                  </p>
                </div>
              )}

              {/* Botones para iniciar partida (hay algo funcionando raro, pero eso
              lo sufrira orlando en las salas) */}
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => {
                    console.log('🔄 Manual retry - resetting state')
                    startedRef.current = false
                    start.reset() // Reset the mutation state
                  }}
                  className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-white text-xs mr-2"
                >
                  🔄 Reset Mutation
                </button>

                <button
                  onClick={async () => {
                    console.log('🧪 Direct API test')
                    try {
                      const directResult = await fetch('https://localhost:7081/api/game/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomCode })
                      })
                      const directData = await directResult.json()
                      console.log('🧪 Direct fetch result:', directData)

                      setGame(directData)
                      console.log('🧪 Set game directly from fetch')
                    } catch (e) {
                      console.error('🧪 Direct fetch error:', e)
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-xs"
                >
                  🧪 Test Direct Fetch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (game.status === 'Setup') {
    return (
      <div className="relative w-full min-h-screen bg-black">
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="min-h-screen bg-black/50 text-white p-6">
            <div className="max-w-full mx-auto">
              <div className="nes-container with-title  bg-white">
                <p className="title text-black">Initial phase</p>

                {isMyTurn ? (
                  <p className="nes-text text-black">
                    You're first! Place the first 6 cups to start guessing.
                  </p>
                ) : (
                  <p className="nes-text is-warning">
                    Waiting for player {game.currentPlayerId} to place the cups...
                  </p>
                )}
              </div>

              {isMyTurn && (
                <>
                  <div className="mb-8 mt-8">
                    <h3 className="text-lg mb-3">Available cups</h3>
                    <div className="flex gap-3 flex-wrap">
                      {game.availableColors?.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => handlePick(hex)}
                          className={`
                            flex gap-2 w-30 h-30 rounded-lg 
                             transition-all transform hover:scale-110
                          `}
                          title={`Color: ${hex}`}>
                          <CupPixelStraw size={80} colors={{ body: hex }} />
                        </button>
                      )) || (
                          <p className="text-red-400"> No available colors</p>
                        )}
                    </div>
                    {pickedColor && (
                      <div className="flex mt-4 items-center ml-5 gap-3 mb-6 p-2 w-fit bg-white/10 rounded-lg">
                        <p className="text-md mt-2" style={{ color: pickedColor }}>
                          Current color:
                        </p>
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
                          className={`
                        aspect-square w-40 h-40 
                        flex items-center justify-center
                        transition-all transform hover:scale-105 
                        ${selectedSlot === idx
                              ? 'border-none bg-white/20 shadow-lg'
                              : 'border-none bg-transparent'
                            }
                        ${!isMyTurn || swapMove.isPending
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:border-white/70 cursor-pointer'
                            }
                      `}
                        >
                          {hex ? (
                            <CupPixelStraw key={idx} colors={{ body: hex }} />
                          ) : (
                            <div className="text-center">
                              <div className="text-2xl opacity-40"></div>
                              <span className="text-xs opacity-60 block">{idx +1}</span>
                            </div>
                          )}
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
                        ? "Sending..."
                        : !isMyTurn
                          ? "Not your turn"
                          : canConfirm
                            ? "Confirm positions"
                            : `Missing ${6 - draft.filter(Boolean).length} cups`}
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
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="min-h-screen bg-black/50 text-white p-6">
            <div className="max-w-full mx-auto">
              <div className='flex justify-between'>
                <h2 className="text-xl mb-4">Game in progress</h2>
                <div className='flex flex-col'>
                  <h2>Room code:</h2>
                  <h2>{game.roomCode}</h2>
                </div>
              </div>

              <div className="mb-6 p-4 bg-white/10 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className={isMyTurn ? 'text-emerald-400 font-semibold' : 'text-orange-400'}>
                    {isMyTurn ? 'Your turn' : `Player ${game.currentPlayerId}'s turn`}
                  </span>
                  <span className="text-sm text-white/70">
                    Moves: {game.totalMoves || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">
                    Current hits: <span className="text-emerald-400 font-bold">{game.hits || 0}</span>
                  </span>
                  {game.hits === 6 && (
                    <span className="text-yellow-400 font-bold">🏆 You won!</span>
                  )}
                </div>

              </div>

              <div className="mb-8">
                <div className="grid grid-cols-6 gap-4 max-w-full mx-auto">
                  {game.cups?.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSlotClick(idx)}
                      disabled={!isMyTurn || swapMove.isPending}
                      className={`
                        aspect-square w-40 h-40  
                        flex items-center justify-center
                        transition-all transform hover:scale-105
                        ${selectedSlot === idx
                          ? 'border-none bg-white/20 shadow-lg'
                          : 'border-none bg-transparent'
                        }
                        ${!isMyTurn || swapMove.isPending
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-white/70 cursor-pointer'
                        }
                      `}
                    >
                      <CupPixelStraw key={idx} colors={{ body: hex }} />
                    </button>
                  )) || (
                    <p className="nes-text is-error">
                        No available cups
                      </p>
                    )}
                </div>
                {isMyTurn && (
                  selectedSlot !== null ? (
                    <div className="text-center text-sm text-cyan-400 mt-3">
                      Slot {selectedSlot +1} selected. Click on another slot to swap.
                    </div>
                  ) : (
                      <p className="text-center text-sm text-white/60 mt-3">
                      Click on two cups to swap them
                    </p>
                  )
                )}
              </div>

              {isMyTurn && selectedSlot !== null && (
                <div className="text-center mb-4">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="nes-btn is-error"
                  >
                    Cancel selection
                  </button>
                </div>
              )}

              {/* target pattern */}
              <div className="mb-6">
                <div className="grid grid-cols-6 max-w-full mx-auto opacity-75">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-40 h-40  
                      flex items-center justify-center"
                    >
                      <CupPixelStraw colors={{ body: '#808080' }} />
                    </div>
                  ))}
                </div>
              </div>
              
                {swapMove.isPending && (<div className="mt-8 p-4 bg-white/5 rounded-lg text-sm text-white/70">
                  <div className="mt-2 text-yellow-400 text-sm">
                    ⏳ Processing swap...
                </div>
              </div>
                )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game finished or other states
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