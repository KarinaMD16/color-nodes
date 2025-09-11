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
  const { username } = useUser();

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

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
      onConn: (state, info) => console.log('hub', state, info),
      onPlayerJoined: () => {
        qc.invalidateQueries({ queryKey: ['room', roomCode] })
      },
      onPlayerLeft: () => {
        qc.invalidateQueries({ queryKey: ['room', roomCode] })
      },
    });

    hub.start().catch(console.error);

  }, [roomCode, username]);

  useEffect(() => {
    if (!roomCode || !username || !gameId) return;
    const hub = getGameHub(roomCode, username);
    hub.joinGame(gameId).catch(console.error);
  }, [roomCode, username, gameId]);

  return {};
}