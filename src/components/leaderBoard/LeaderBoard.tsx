import { useGetUsersOrderedByScore } from "@/hooks/userHooks"
import { getGameHub } from "@/services/gameHub"
import { useUser } from "@/context/userContext"

export default function Leaderboard({ roomCode, leaderId }: { roomCode: string, leaderId: number }) {
  const { data: users, isLoading, isError } = useGetUsersOrderedByScore()
  const { id: ctxId, username } = useUser()

  if (isLoading) return <div className="text-white">Loading leaderboard...</div>
  if (isError) return <div className="text-red-500">Error loading leaderboard</div>

  const handleBackToRoomForAll = async () => {
    try {
      const hub = getGameHub(roomCode, username || "")
      await hub.connection.invoke("RequestRoomReset", roomCode, username)
    } catch (e) {
      console.error("Error rejoining room:", e)
    }
  }

  return (
    <div className="absolute top-4 right-6 bg-gray-900 border-2 border-purple-500 rounded-xl shadow-lg p-3 w-60 h-64 z-20 flex flex-col">
      <h2 className="text-yellow-400 font-press-start text-xs mb-2 text-center flex-shrink-0">
        🏆 Leaderboard
      </h2>

      {/* Tabla scrollable */}
      <div className="flex-1 overflow-y-scroll scrollbar-none" style={{ paddingRight: '2px' }}>
        <table className="w-full text-white text-[10px] table-fixed">
          <tbody>
            {users?.map((u, i) => (
              <tr key={u.id} className={`${i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"} hover:bg-purple-700`}>
                <td className="px-1 py-1">{u.username}</td>
                <td className="px-1 py-1 text-right">{u.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón solo visible para el host */}
      {ctxId === leaderId && (
        <button
          onClick={handleBackToRoomForAll}
          className="nes-btn is-primary mt-2 text-xs"
        >
          Volver a la sala
        </button>
      )}

      <style>{`
        div::-webkit-scrollbar { display: none; }
        div { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
