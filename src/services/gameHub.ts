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

  connection.on('StateUpdated', (s: GameStateResponse) => h.onStateUpdated?.(s));
  connection.on('HitFeedback', (p) => h.onHitFeedback?.(p));
  connection.on('TurnChanged', (p) => h.onTurnChanged?.(p));
  connection.on('GameFinished', (p) => h.onFinished?.(p));

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
    await connection.invoke('JoinRoom', roomCode, username);
  }

  async function joinGame(gameId: string) {
    lastJoinedGameId = gameId;
    await connection.invoke('JoinGame', gameId);
  }

  async function start() {
    await connection.start();
    h.onConn?.('connected');
    await joinRoom(); 
  }

  async function stop() {
    await connection.stop();
  }

  return { connection, start, stop, joinGame };
}
