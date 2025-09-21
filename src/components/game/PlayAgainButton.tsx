import { getGameHub, clearGameHubInstance } from '@/services/gameHub';
import router from '@/router';
import { useUser } from '@/context/userContext';
import { useState } from 'react';

function PlayAgainButton({ code, gameId }: { code: string, gameId?: string | null }) {
  const { username } = useUser();
  const [busy, setBusy] = useState(false);
  

  const onPlayAgain = async () => {
    setBusy(true);
    try {
      localStorage.removeItem(`game_${code}`);

      if (username && gameId) {
        const hub = getGameHub(code, username);
        try { await hub.connection.invoke('LeaveGame', gameId); } catch {}
      }

      if (username) {
        const hub = getGameHub(code, username);
        await hub.stop?.().catch(()=>{});
        await clearGameHubInstance(code, username);
      }

      router.navigate({ to: '/room/$code', params: { code } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="nes-btn is-success" disabled={busy} onClick={onPlayAgain}>
      {busy ? 'Leaving' : 'Play again'}
    </button>
  );
}

export default PlayAgainButton