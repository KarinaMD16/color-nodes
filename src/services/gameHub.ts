import { GameStateResponse } from '@/models/game';
import * as signalR from '@microsoft/signalr';

const HUB_URL = 'https://localhost:7081/gameHub';

type Handlers = {
  onStateUpdated?: (s: GameStateResponse) => void;
  onHitFeedback?: (p: { message: string }) => void;
  onTurnChanged?: (p: { currentPlayerId: number | null; turnEndsAtUtc: string }) => void;
  onFinished?: (p: { gameId: string; totalMoves: number }) => void;
  onPlayerJoined?: (username: string) => void;
  onPlayerLeft?: (username: string) => void;
  onConn?: (state: 'connected' | 'reconnecting' | 'disconnected') => void;
};

export function createGameHub(roomCode: string, username: string, h: Handlers = {}) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect({ nextRetryDelayInMilliseconds: () => 2000 })
    .build();

  connection.on('stateUpdated', (s: GameStateResponse) => h.onStateUpdated?.(s));
  connection.on('hitFeedback', (p) => h.onHitFeedback?.(p));
  connection.on('turnChanged', (p) => h.onTurnChanged?.(p));
  connection.on('finished', (p) => h.onFinished?.(p));
  connection.on('PlayerJoined', (u: string) => h.onPlayerJoined?.(u));
  connection.on('PlayerLeft', (u: string) => h.onPlayerLeft?.(u));
  connection.onreconnecting(() => h.onConn?.('reconnecting'));

  connection.onreconnected(async () => {
    h.onConn?.('connected');
    await joinRoom(); 
    if (lastJoinedGameId) await joinGame(lastJoinedGameId);
  });  
  connection.onclose(() => h.onConn?.('disconnected'));

  let lastJoinedGameId: string | null = null;

  async function joinRoom() {
    try {
      await connection.invoke('JoinRoom', roomCode, username);
    } catch (error) {
      console.error('❌ Error joining room:', error)
      throw error
    }
  }

  async function joinGame(gameId: string) {
    try {
      lastJoinedGameId = gameId;
      await connection.invoke('JoinGame', gameId);
    } catch (error) {
      console.error('❌ Error joining game:', error)
      throw error
    }
  }

  async function start() {
    try {
      await connection.start();
      h.onConn?.('connected');
      await joinRoom(); 
    } catch (error) {
      h.onConn?.('disconnected')
      throw error
    }
  }

  async function stop() {
    try {
      if (lastJoinedGameId) {
        await connection.invoke('LeaveGame', lastJoinedGameId);
      }
      await connection.stop();
    } catch (error) {
      console.error('❌ Error stopping SignalR:', error)
    }
  }

  return { connection, start, stop, joinGame };
}