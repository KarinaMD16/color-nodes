import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useUser } from '../../context/userContext'
import { useGameHub } from '../../hooks/useGameHub'
import SetUpPhase from '@/components/game/SetUpPhase'
import PantallaFondo from '@/components/PantallaFondo'
import GamePhase from '@/components/game/GamePhase'
import { useEffect, useState } from 'react'
import { useGameState } from '@/hooks/gameHooks'
import { useGetLeaderboard, useGetRoom, usePostLeaveRoom } from '@/hooks/userHooks'
import { useQueryClient } from '@tanstack/react-query'
import { User } from '@/models/user'
import Results from '@/components/game/Results'
import PlayAgainButton from '@/components/game/PlayAgainButton'

export const playRoute = createRoute({
  component: PlayPage,
  getParentRoute: () => rootRoute,
  path: '/room/$code/play',
})

function PlayPage() {
  const { code } = playRoute.useParams()
  const roomCode = code
  const { id: userId } = useUser()
  const [showResultModal, setShowResultModal] = useState(false);
  const [finalState, setFinalState] = useState<any | null>(null);
  const ready = !!roomCode && !!userId

  const qc = useQueryClient()
  const [gameId, setGameId] = useState<string | null>(null)
  const { data: room } = useGetRoom(roomCode)
  const { data: currentGame, error } = useGameState(gameId || undefined)

  useEffect(() => {
    if (!ready) return;
    const stored = localStorage.getItem(`game_${roomCode}`);

    if (room?.activeGameId && room.activeGameId !== stored) {
      setGameId(room.activeGameId);
      localStorage.setItem(`game_${roomCode}`, room.activeGameId);
    } else if (stored && stored !== gameId) {
      setGameId(stored);
    }
  }, [ready, roomCode, room?.activeGameId]);

  useEffect(() => {
    if (!error) return
    localStorage.removeItem(`game_${roomCode}`)
    setGameId(null)
  }, [error, roomCode])

  useGameHub(roomCode, gameId ?? undefined, {
    onStateUpdated: (s) => {
      if (s?.gameId && s.gameId !== gameId) {
        setGameId(s.gameId);
        localStorage.setItem(`game_${roomCode}`, s.gameId);
      }
      if (s?.gameId) {
        qc.setQueryData(['game', s.gameId], s);
      }
    },
    onFinished: (finalState) => {
      setFinalState(finalState);
      setShowResultModal(true);
    }
  });

  const validUser = Number.isInteger(userId) && Number(userId) > 0

  const leaderboardQuery = useGetLeaderboard(roomCode, false, {
    enabled: currentGame?.status === 'Finished',
  })
  const leaveMutation = usePostLeaveRoom()

  if (!ready || !validUser) return <PantallaFondo texto="Loading users..." />
  if (!currentGame) return <PantallaFondo texto="Waiting for game to start..." />

  const isMyTurn =
    currentGame?.currentPlayerId != null &&
    Number(currentGame.currentPlayerId) === Number(userId)

  const setGame = (next: any) => {
    if (!gameId) return
    const key = ['game', gameId] as const
    const prev = qc.getQueryData(key)
    const value = typeof next === 'function' ? next(prev) : next
    qc.setQueryData(key, value)
  }

  const isSetup = currentGame?.status === 'Setup'
  const isInProgress = currentGame?.status === 'InProgress'
  const winner = (room?.users as User[])?.find(u => u.id === currentGame.currentPlayerId)

  if (isSetup) {
    return (
      <SetUpPhase
        key={`${currentGame.gameId}-${Number(currentGame.currentPlayerId)}`}
        game={currentGame}
        setGame={setGame}
        isMyTurn={isMyTurn}
        isAnimating={false}
      />
    )
  }

  if (isInProgress) {
    return <GamePhase game={currentGame} setGame={setGame} />
  }
  
  return (
    <PantallaFondo texto="" subtexto="" overlay="none">
      {showResultModal && finalState && (
        <Results
          state={finalState}
          onContinue={() => setShowResultModal(false)}
        />
      )}
      <section
        className="nes-container mx-auto max-w-3xl p-6
                 !bg-white !border-4 !border-black
                 !shadow-[8px_8px_0_0_#000] !rounded-none"
      >
        <h1
          className="text-center mb-4 text-3xl md:text-4xl font-black uppercase tracking-wider"
          style={{
            color: '#000',
            textShadow:
              '0 2px 0 #caa24e, 0 0 1px #caa24e, 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
          }}
        >
          {`${winner ? winner.username : `player ${currentGame.currentPlayerId}`} wins!`}
        </h1>

        <div className="mx-auto mb-6 w-[min(92vw,620px)]
                      nes-container !border-4 !border-black !rounded-none"
          style={{ background: '#c6af85' }}>
          <table className="w-full text-left font-bold text-black">
            <thead className="border-b-2 border-black/80">
              <tr>
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardQuery.data?.length ? (
                leaderboardQuery.data.map(u => (
                  <tr key={u.rank} className="odd:bg-black/5">
                    <td className="px-3 py-2">#{u.rank}</td>
                    <td className="px-3 py-2">{u.username}</td>
                    <td className="px-3 py-2">{u.room_Score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center gap-8 mt-6">
          <button
            onClick={() => leaveMutation.mutate({ userId: userId!, roomCode })}
            disabled={leaveMutation.isPending}
            className="nes-btn is-error"
          >
            Leave
          </button>

          <PlayAgainButton code={roomCode} gameId={currentGame?.gameId} />
        </div>
      </section>
    </PantallaFondo>
  )
}

export default PlayPage
