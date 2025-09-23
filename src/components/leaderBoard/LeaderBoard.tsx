import { useGetUsersOrderedByScore } from "@/hooks/userHooks"
import CupLoader from "../CupPixelSleeveAnimated"

export default function Leaderboard() {
  const { data: users, isLoading, isError } = useGetUsersOrderedByScore()

  if (isLoading) {
    return <CupLoader />
  }
  if (isError) return <div className="text-red-500">Error loading leaderboard</div>

  return (
    <div className="absolute top-4 right-6 bg-gray-900 border-2 border-purple-500 rounded-xl shadow-lg p-3 w-60 h-64 z-20 flex flex-col">
      <h2 className="text-yellow-400 font-press-start text-xs mb-2 text-center flex-shrink-0">
        Leaderboard
      </h2>
      <div className="flex-shrink-0">
        <table className="w-full text-white text-[10px]">
          <thead className="bg-gray-900 sticky top-0">
            <tr className="text-purple-300">
              <th className="text-left">Player</th>
              <th className="text-right">Score</th>
            </tr>
          </thead>
        </table>
      </div>

      <div
        className="flex-1 overflow-y-scroll scrollbar-none"
        style={{ paddingRight: '2px' }}
      >
        <table className="w-full text-white text-[10px] table-fixed">
          <tbody>
            {users?.map((u, i) => (
              <tr
                key={u.id}
                className={`${i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                  } hover:bg-purple-700`}
              >
                <td className="px-1 py-1">{u.username}</td>
                <td className="px-1 py-1 text-right">{u.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
        div {
          -ms-overflow-style: none; /* IE y Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  )
}
