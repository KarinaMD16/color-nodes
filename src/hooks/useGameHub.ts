import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { GameStateResponse } from '@/models/game';
import { getGameHub } from '@/services/gameHub';
import { useUser } from '@/context/userContext';

export function useGameHub(
  roomCode: string,
  gameId?: string,
  onUpdate?: (s: GameStateResponse) => void
) {
  const qc = useQueryClient();
  const { username, id: localUserId, setUser } = useUser();

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  // Conectar y suscribirse a la SALA
  useEffect(() => {
    if (!roomCode || !username) return;

    const hub = getGameHub(roomCode, username, {
      onStateUpdated: (s: GameStateResponse) => {
        if (s?.gameId) qc.setQueryData(['game', s.gameId], s);
        onUpdateRef.current?.(s);
      },
      onTurnChanged: ({ currentPlayerId }) => {
        if (!gameId) return;
        const prev = qc.getQueryData<GameStateResponse>(['game', gameId]);
        if (prev) {
          const patched = { ...prev, currentPlayerId };
          qc.setQueryData(['game', gameId], patched);
          onUpdateRef.current?.(patched);
        }
      },
      onHitFeedback: ({ message }) => console.log('hit', message),
      onFinished: (s) => console.log('fin juego', s),

      // 👇 Ajuste: recibe (state, info) y re-suscribe sala
      onConn: async (_state, info) => {
        try { await hub.subscribeRoom(roomCode); } catch { /* no-op */ }
        const u = (info?.user ?? info) as { id?: number; username?: string } | undefined;
        if (u?.id && u?.username && (!localUserId || localUserId <= 0)) {
          setUser(Number(u.id), String(u.username));
        }
      },

      onPlayerJoined: () => qc.invalidateQueries({ queryKey: ['room', roomCode] }),
      onPlayerLeft: () => qc.invalidateQueries({ queryKey: ['room', roomCode] }),
      onChatMessage: () => qc.invalidateQueries({ queryKey: ['chat', roomCode] }),
    });

    hub.start()
      .then(() => hub.subscribeRoom(roomCode))
      .catch(console.error);

    // (Opcional) si quieres cerrar conexión al desmontar este hook:
    // return () => { hub.disconnect?.().catch(() => {}); };

  }, [roomCode, username]); // <- depende sólo de sala/usuario

  // Suscribirse al JUEGO cuando haya gameId y limpiar al salir
  useEffect(() => {
    if (!roomCode || !username || !gameId) return;
    const hub = getGameHub(roomCode, username);

    hub.subscribeGame(gameId).catch(console.error);

    return () => {
      hub.unsubscribeGame(gameId).catch(() => { /* no-op */ });
    };
  }, [roomCode, username, gameId]);

  return {};
}
