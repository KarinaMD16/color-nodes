// useGameHub.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { GameStateResponse } from '@/models/game'
import { getGameHub } from '@/services/gameHub'
import { useUser } from '@/context/userContext'
import type { Handlers } from '@/types/hubTypes'
import { postTick } from '@/services/gameService' // 👈 importa el servicio

type UpdateOrHandlers =
  | ((s: GameStateResponse) => void)
  | Partial<Handlers>
  | undefined;

export function useGameHub(roomCode: string, gameId?: string, onUpdateOrHandlers?: UpdateOrHandlers) {
  const qc = useQueryClient();
  const { username, id: localUserId, setUser } = useUser();

  const handlers: Partial<Handlers> =
    typeof onUpdateOrHandlers === 'function'
      ? { onStateUpdated: onUpdateOrHandlers }
      : (onUpdateOrHandlers ?? {});

  useEffect(() => {
    if (!roomCode || !username) return;

    const hub = getGameHub(roomCode, username);

    const unregister = hub.registerHandlers({
      onStateUpdated: (s) => {
        if (s?.gameId) qc.setQueryData(['game', s.gameId], s);
        handlers.onStateUpdated?.(s);
        qc.invalidateQueries({ queryKey: ['room', roomCode] });
      },

      // 🔧 CAMBIO: en vez de parchar solo currentPlayerId,
      // pedimos al backend el estado fresco (que incluye turnEndsAtUtc reseteado)
      onTurnChanged: async ({ currentPlayerId }) => {
        handlers.onTurnChanged?.({ currentPlayerId });

        if (!gameId) return;
        try {
          const updated = await postTick(gameId); 
          qc.setQueryData(['game', gameId], updated); // refresca turnEndsAtUtc
        } catch {
        }
      },

      onHitFeedback: (m) => handlers.onHitFeedback?.(m),
      onFinished: (s) => handlers.onFinished?.(s),

      onConn: (state, info) => {
        const u = (info?.user ?? info) as { id?: number; username?: string } | undefined;
        if (u?.id && u?.username) {
          if (!localUserId || localUserId <= 0) setUser(Number(u.id), String(u.username));
        }
        handlers.onConn?.(state, info);
      },

      onPlayerJoined: (u) => { qc.invalidateQueries({ queryKey: ['room', roomCode] }); handlers.onPlayerJoined?.(u); },
      onPlayerLeft: (u) => { qc.invalidateQueries({ queryKey: ['room', roomCode] }); handlers.onPlayerLeft?.(u); },
      onChatMessage: (msg) => { qc.invalidateQueries({ queryKey: ['chat', roomCode] }); handlers.onChatMessage?.(msg); },
    });

    hub.start().catch(console.error);
    return () => { unregister?.(); };
  }, [roomCode, username, gameId]);

  useEffect(() => {
    if (!roomCode || !username || !gameId) return;
    const hub = getGameHub(roomCode, username);
    hub.joinGame(gameId).catch(console.error);
  }, [roomCode, username, gameId]);

  return {};
}
