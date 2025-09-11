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
  const { username, id: localUserId, setUser } = useUser()

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    if (!roomCode || !username) return;

    console.log('🔗 Setting up GameHub for room:', roomCode, 'gameId:', gameId);

    const hub = getGameHub(roomCode, username, {
      onStateUpdated: (s: GameStateResponse) => {
        console.log('📡 State updated received:', s);
        if (s?.gameId) qc.setQueryData(['game', s.gameId], s);
        onUpdateRef.current?.(s);
      },
      onTurnChanged: ({ currentPlayerId }) => {
        console.log('🔄 Turn changed:', currentPlayerId);
        if (!gameId) return;
        const prev = qc.getQueryData<GameStateResponse>(['game', gameId]);
        if (prev) {
          const patched = { ...prev, currentPlayerId };
          qc.setQueryData(['game', gameId], patched);
          onUpdateRef.current?.(patched);
        }

        if (currentPlayerId === Number(localUserId)) {
          console.log('🎯 It\'s your turn!');
        } else {
          console.log(`🎮 Player ${currentPlayerId}'s turn`);
        }
      },
      onHitFeedback: ({ message }) => {
        console.log('🎯 Hit feedback:', message);
      },
      onFinished: (s) => {
        console.log('🏆 Game finished:', s);
      },
      onConn: (state, info) => {
        console.log('hub onConn:', state, info)
        if (info?.userId && (!localUserId || localUserId <= 0)) {
          setUser(Number(info.userId), username) // <-- fija id real
        }
      },
      onPlayerJoined: (username) => {
        console.log(`👋 ${username} joined the room`);
        qc.invalidateQueries({ queryKey: ['room', roomCode] });
      },
      onPlayerLeft: (username) => {
        console.log(`👋 ${username} left the room`);
        qc.invalidateQueries({ queryKey: ['room', roomCode] });
      },
    });

    hub.start().catch(console.error);

    return () => { 
      console.log('🔗 Stopping GameHub');
      hub.stop().catch(console.error);
    };
  }, [roomCode, username, localUserId, qc]); 

  useEffect(() => {
    if (!roomCode || !username || !gameId) return;
    console.log('🎮 Joining game:', gameId);
    const hub = getGameHub(roomCode, username);
    hub.joinGame(gameId).catch(console.error);
  }, [roomCode, username, gameId]);

  return {};
}