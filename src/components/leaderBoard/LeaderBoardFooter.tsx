import { getGameHub } from '@/services/gameHub';
import { useUser } from '@/context/userContext';

function LeaderboardFooter({ roomCode }: { roomCode: string }) {
  const { username } = useUser();

  const handleBackToRoomForAll = async () => {
    try {
      const hub = getGameHub(roomCode, username || ''); // ya tienes instancia viva
      await hub.connection.invoke('RequestRoomReset', roomCode, username);
      // No navegues manualmente aquí: todos recibirán ForceRejoin y navegarán sincronizados.
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button className="nes-btn is-primary" onClick={handleBackToRoomForAll}>
      Volver a la sala
    </button>
  );
}

export default LeaderboardFooter;