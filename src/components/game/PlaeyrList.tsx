import { Player } from "@/types/PlayerTypes"
import { getPixelAvatarUrl } from "@/utils/getAvatar"

export const PlayersList = ({ 
  players, 
  currentPlayerId, 
  myId 
}: { 
  players: Player[], 
  currentPlayerId: number | null, 
  myId: number 
}) => {
  return (
    <div className="flex justify-center gap-4 mb-6">
      {players.map((player) => {
        const isCurrentPlayer = player.id === currentPlayerId
        const isMe = player.id === myId
        
        return (
          <div key={`player-${player.id}`} className="relative">
            {/* Avatar */}
            <div className={`
              relative w-16 h-16 rounded-full border-4 transition-all duration-300
              ${isCurrentPlayer ? 'border-yellow-400 scale-110 shadow-lg shadow-yellow-400/50' : 'border-white/30'}
            `}>
              <img
                src={getPixelAvatarUrl(player.avatar, 64)}
                alt={`${player.username} avatar`}
                className="w-full h-full rounded-full"
              />
              
              {/* Indicador de turno */}
              {isCurrentPlayer && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs">⭐</span>
                </div>
              )}

              {/* Indicador de host */}
              {player.isHost && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">👑</span>
                </div>
              )}
            </div>
            
            {/* Nombre del jugador */}
            <div className="text-center mt-2">
              <div className={`text-xs font-semibold ${isCurrentPlayer ? 'text-yellow-400' : 'text-white/70'}`}>
                {player.username}
                {isMe && ' (You)'}
              </div>
              
              {/* Mensaje de turno */}
              {isMe && isCurrentPlayer && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                               bg-green-500 text-white px-2 py-1 rounded text-xs animate-bounce whitespace-nowrap z-10">
                  🎯 My Turn!
                </div>
              )}
              {isCurrentPlayer && !isMe && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                               bg-orange-500 text-white px-2 py-1 rounded text-xs animate-pulse whitespace-nowrap z-10">
                  🤔 Thinking...
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}