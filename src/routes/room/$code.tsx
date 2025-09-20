import { useState, useEffect, useMemo, useRef } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useUser } from '../../context/userContext'
import { useGetRoom, usePostLeaveRoom } from '../../hooks/userHooks'
import { useStartGame } from '../../hooks/gameHooks'
import { useGameHub } from '../../hooks/useGameHub'
import router from '../../router'
import { Player, AVATAR_SEEDS } from '@/types/PlayerTypes'
import { User } from '@/models/user'
import ChatGame from '@/components/game/ChatGame'
import GameInfo from '@/components/GameInfo'

export const route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$code',
  component: WaitingRoomPage,
})

function WaitingRoomPage() {
  const { code } = route.useParams()
  const { id: ctxId, username: ctxName, setUser } = useUser();
  const [copied, setCopied] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const { mutate: leaveRoom } = usePostLeaveRoom()
  const { data: roomData, isLoading } = useGetRoom(code, {
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  })
  const { mutate: startGame } = useStartGame()
  const navigated = useRef(false)

  useGameHub(code, undefined, (s) => {
    if (s?.gameId) {
      localStorage.setItem(`game_${code}`, s.gameId)
      if (!navigated.current) {
        navigated.current = true
        router.navigate({ to: '/room/$code/play', params: { code } })
      }
    }
  })

  const players: Player[] = useMemo(() => {
    if (!roomData?.users) return []
    return roomData.users.map((user: User, index: number) => ({
      id: user.id,
      username: user.username,
      isHost: user.id === roomData.leaderId, // host real
      avatar: AVATAR_SEEDS[index % AVATAR_SEEDS.length],
    }))
  }, [roomData?.users, roomData?.leaderId])

  const isHost = roomData?.leaderId === ctxId
  const canStartGame = isHost && players.length >= 2

  useEffect(() => {
    if (roomData?.activeGameId && !navigated.current) {
      localStorage.setItem(`game_${code}`, roomData.activeGameId)
      navigated.current = true
      router.navigate({ to: '/room/$code/play', params: { code } })
    }
  }, [roomData?.activeGameId, code])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if ((!ctxId || ctxId <= 0) && ctxName && roomData?.users?.length) {
      const me = roomData.users.find((u: any) =>
        String(u.username).toLowerCase() === String(ctxName).toLowerCase()
      );
      if (me?.id) setUser(me.id, me.username);
    }
  }, [ctxId, ctxName, roomData?.users, setUser]);

  const handleStartGame = () => {
    if (canStartGame && !isStartingGame) {
      setIsStartingGame(true)
      startGame(
        { roomCode: code },
        {
          onSuccess: (data: any) => {
            if (data?.gameId) {
              localStorage.setItem(`game_${code}`, data.gameId)
            }
            router.navigate({ to: '/room/$code/play', params: { code } })
          },
          onError: (error) => {
            console.error('Error starting game:', error)
            setIsStartingGame(false)
          }
        }
      )
    }
  }

  const handleLeaveRoom = () => {
    const myId = ctxId ?? roomData?.users?.find((u: User) => u.username === ctxName)?.id
    if (!myId) return
    leaveRoom({ userId: myId, roomCode: code })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center mb-6">
        <div className="animate-spin text-4xl">🎮</div>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white font-press-start text-center">
          <p className="mb-4">Room not found</p>
          <button 
            onClick={() => router.navigate({ to: '/' })}
            className="nes-btn is-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <video
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        src="/trees-background-video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="fixed inset-0 bg-black/50 z-1"></div>
      
      <div className="fixed inset-0 flex items-center font-press-start text-white justify-center p-4 z-10">
        <div className="w-full space-y-6 max-w-[65vw] mx-auto p-6">
          <h1 className="font-press-start text-center text-3xl md:text-4xl mb-8">
            <span style={{ color: '#7F5CC1' }}>Waiting</span>{' '}
            <span style={{ color: '#C15CAE' }}>Room</span>
            <span style={{ color: '#B0C15C' }}>!</span>
          </h1>

          {/* Room Code Section */}
          <div className="nes-container is-dark with-title mb-6">
            <p className="title">Room Code</p>
            <div className="flex items-center justify-center space-x-4">
              <code className="bg-black/30 px-4 py-2 rounded text-2xl font-mono tracking-wider">
                {code}
              </code>
              <button onClick={copyToClipboard} className="nes-btn is-primary">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Players List */}
            <div className="nes-container is-dark with-title min-w-0">
              <p className="title">Players ({players.length}/4)</p>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div key={`player-${player.id}-${index}`} className="flex items-center justify-between p-2 bg-black/20 rounded">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${player.avatar}`}
                        alt={`${player.username} avatar`}
                        className="w-8 h-8 rounded"
                      />
                      <span className="text-sm text-white">#{index + 1}</span>
                      <span className={player.username === ctxName ? 'text-yellow-300' : 'text-white'}>
                        {player.username}
                      </span>
                      {player.isHost && <span className="text-yellow-400 text-xs">(HOST)</span>}
                      {player.username === ctxName && <span className="text-green-400 text-xs">(YOU)</span>}
                    </div>
                  </div>
                ))}

                {Array.from({ length: 4 - players.length }).map((_, index) => (
                  <div key={`empty-slot-${index}`} className="flex items-center p-2 bg-black/10 rounded opacity-50">
                    <div className="w-8 h-8 bg-gray-600 rounded mr-3 flex items-center justify-center">
                      <span className="text-xs text-gray-400">?</span>
                    </div>
                    <span className="text-sm">#{players.length + index + 1}</span>
                    <span className="ml-3 text-gray-400">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Settings & Actions */}
            <div className="space-y-4">
              <div className="nes-container is-dark with-title">
                <p className="title">Game Settings</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Max Players:</span>
                    <span>4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turn Time:</span>
                    <span>30s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Host:</span>
                    <span>{players.find(p => p.isHost)?.username}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={!canStartGame || isStartingGame}
                    className="nes-btn is-primary"
                  >
                    {isStartingGame ? 'Starting...' : 'Start Game'}
                  </button>
                )}

                <button
                  onClick={handleLeaveRoom}
                  disabled={isStartingGame}
                  className="nes-btn"
                >
                  Leave Room
                </button>
              </div>

              {/* Status Messages */}
              <div className="nes-container is-dark">
                {isStartingGame && <p className="text-xs text-blue-400">Starting game...</p>}
                {!canStartGame && isHost && players.length < 2 && !isStartingGame && (
                  <p className="text-xs text-yellow-400">Waiting for more players to join...</p>
                )}
                {!isHost && !isStartingGame && (
                  <p className="text-xs text-blue-400">Waiting for host to start the game...</p>
                )}
                {canStartGame && isHost && !isStartingGame && (
                  <p className="text-xs text-green-400">Ready to start! Click "Start Game" when you're ready.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-16 left-20 z-50">
          <GameInfo />
        </div>
      </div>

      {/* Chat */}
      <div className="z-10">
        <ChatGame roomCode={code} />
      </div>
    </div>
  )
}

export default WaitingRoomPage
