import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { GameStateResponse } from '@/models/game';
import { getGameHub } from '@/services/gameHub';
import { useUser } from '@/context/userContext';

type Handlers = {
  onUpdate?: (s: GameStateResponse) => void;
  onGameStarted?: (gameId: string) => void;
  onGameFinished?: (gameId: string) => void;
  onPlayerJoined?: () => void;
  onPlayerLeft?: () => void;
  onChatMessage?: () => void;
};

export function useGameHub(roomCode: string, gameId?: string, handlers?: Handlers) {
  const qc = useQueryClient();
  const { username, id: localUserId, setUser } = useUser();
  const handlersRef = useRef(handlers);
  useEffect(() => { handlersRef.current = handlers }, [handlers]);

  useEffect(() => {
    if (!roomCode || !username) return;

    const hub = getGameHub(roomCode, username, {
      onStateUpdated: (s: GameStateResponse) => {
        if (s?.gameId) qc.setQueryData(['game', s.gameId], s);
        handlersRef.current?.onUpdate?.(s);
      },
      onTurnChanged: ({ currentPlayerId }) => {
        if (!gameId) return;
        const prev = qc.getQueryData<GameStateResponse>(['game', gameId]);
        if (prev) {
          const patched = { ...prev, currentPlayerId };
          qc.setQueryData(['game', gameId], patched);
          handlersRef.current?.onUpdate?.(patched);
        }
      },
      onHitFeedback: ({ message }) => console.log('hit', message),
      onFinished: (s) => console.log('fin juego', s),
      onConn: (state, info) => {
        console.log('hub onConn', state, info);
        const u = (info?.user ?? info) as { id?: number; username?: string } | undefined;
        if (u?.id && u?.username) {
          if (!localUserId || localUserId <= 0) {
            setUser(Number(u.id), String(u.username));
          }
        }
      },
      onPlayerJoined: () => {
        qc.invalidateQueries({ queryKey: ['room', roomCode] });
        handlersRef.current?.onPlayerJoined?.();
      },
      onPlayerLeft: () => {
        qc.invalidateQueries({ queryKey: ['room', roomCode] });
        handlersRef.current?.onPlayerLeft?.();
      },
      onChatMessage: () => {
        qc.invalidateQueries({ queryKey: ['chat', roomCode] });
        handlersRef.current?.onChatMessage?.();
      },
      onGameStarted: (gameId) => handlersRef.current?.onGameStarted?.(gameId),
      onGameFinished: (gameId) => handlersRef.current?.onGameFinished?.(gameId),
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