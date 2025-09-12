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

const HUB_BASE_URL = 'http://26.233.244.31:5197';
const instances = new Map<string, ReturnType<typeof build>>();

function build(hubUrl: string, roomCode: string, username: string, handlers: Handlers = {}) {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  conn.on('StateUpdated', s => requestAnimationFrame(() => handlers.onStateUpdated?.(s)))
  conn.on('TurnChanged', id => requestAnimationFrame(() => handlers.onTurnChanged?.({ currentPlayerId: id })))

  conn.on('HitFeedback', (m: string) => handlers.onHitFeedback?.({ message: m }));
  conn.on('Finished', s => handlers.onFinished?.(s));
  conn.on('PlayerJoined', u => handlers.onPlayerJoined?.(u));
  conn.on('PlayerLeft', u => handlers.onPlayerLeft?.(u));

  conn.onreconnecting(err => handlers.onConn?.('reconnecting', err));
  conn.onreconnected(id => {
    handlers.onConn?.('connected', { connId: id, reconnected: true });
    void conn.invoke('JoinRoom', roomCode, username);
  });
  conn.onclose(err => handlers.onConn?.('disconnected', err));

  let started = false;
  let startPromise: Promise<void> | null = null;
  let lastGameId: string | null = null;

  async function start() {
    if (started) return;
    if (startPromise) return startPromise;
    startPromise = (async () => {
      handlers.onConn?.('connecting', { hubUrl });
      await conn.start();
      started = true;
      handlers.onConn?.('connected', { connId: conn.connectionId });
      await conn.invoke('JoinRoom', roomCode, username);
      if (lastGameId) await conn.invoke('JoinGame', lastGameId);
    })();
    try { await startPromise; } finally { startPromise = null; }
  }

  async function stop() {
    // no detengas si hay otros consumidores usando este singleton
    // (dejamos que el singleton viva todo el tiempo de la app; si quieres, agrega un refCount)
  }

  async function joinGame(gameId: string) {
    lastGameId = gameId;
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('JoinGame', gameId);
    }
  }

  return { connection: conn, start, stop, joinGame };
}

export function getGameHub(roomCode: string, username: string, handlers?: Handlers) {
  const hubUrl = new URL('/gameHub', HUB_BASE_URL.replace(/\/+$/, '')).toString();
  const key = `${roomCode}::${username}`;
  if (!instances.has(key)) {
    instances.set(key, build(hubUrl, roomCode, username, handlers));
  } else {
  }
  return instances.get(key)!;
}