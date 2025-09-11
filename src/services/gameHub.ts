import * as signalR from '@microsoft/signalr';
import type { GameStateResponse } from '@/models/game';

type Handlers = {
  onStateUpdated?: (s: GameStateResponse) => void;
  onTurnChanged?: (p: { currentPlayerId: number }) => void;
  onHitFeedback?: (p: { message: string }) => void;
  onFinished?: (s: any) => void;
  onPlayerJoined?: (u: string) => void;
  onPlayerLeft?: (u: string) => void;
  onConn?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected', info?: any) => void;
};

const HUB_BASE_URL = 'http://26.233.244.31:5197';
const instances = new Map<string, ReturnType<typeof build>>();

function build(hubUrl: string, roomCode: string, username: string, handlers: Handlers = {}) {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  // ✅ Usar los nombres correctos que envía el backend (minúsculas)
  conn.on('stateUpdated', (s: GameStateResponse) => {
    console.log('📡 stateUpdated received:', s);
    requestAnimationFrame(() => handlers.onStateUpdated?.(s));
  });

  conn.on('turnChanged', (p: { currentPlayerId: number }) => {
    console.log('🔄 turnChanged received:', p);
    requestAnimationFrame(() => handlers.onTurnChanged?.(p));
  });

  conn.on('hitFeedback', (p: { message: string }) => {
    console.log('🎯 hitFeedback received:', p);
    handlers.onHitFeedback?.(p);
  });

  conn.on('finished', (s) => {
    console.log('🏆 finished received:', s);
    handlers.onFinished?.(s);
  });

  conn.on('PlayerJoined', (u: string) => {
    console.log('👋 PlayerJoined received:', u);
    handlers.onPlayerJoined?.(u);
  });

  conn.on('PlayerLeft', (u: string) => {
    console.log('👋 PlayerLeft received:', u);
    handlers.onPlayerLeft?.(u);
  });

  conn.onreconnecting(err => {
    console.log('🔄 Hub reconnecting...');
    handlers.onConn?.('reconnecting', err);
  });

  conn.onreconnected(async (id) => {
    console.log('✅ Hub reconnected:', id);
    handlers.onConn?.('connected', { connId: id, reconnected: true });
    await conn.invoke('JoinRoom', roomCode, username);
    if (lastGameId) {
      console.log('🎮 Re-joining game after reconnect:', lastGameId);
      await conn.invoke('JoinGame', lastGameId);
    }
  });

  conn.onclose(err => {
    console.log('❌ Hub connection closed');
    handlers.onConn?.('disconnected', err);
  });

  let started = false;
  let startPromise: Promise<void> | null = null;
  let lastGameId: string | null = null;

  async function start() {
    if (started) return;
    if (startPromise) return startPromise;
    startPromise = (async () => {
      console.log('🔗 Starting SignalR connection...');
      handlers.onConn?.('connecting', { hubUrl });
      await conn.start();
      started = true;
      console.log('✅ SignalR connected successfully');
      handlers.onConn?.('connected', { connId: conn.connectionId });
      await conn.invoke('JoinRoom', roomCode, username);
      if (lastGameId) await conn.invoke('JoinGame', lastGameId);
    })();
    try { await startPromise; } finally { startPromise = null; }
  }

  async function stop() {
    console.log('🔌 Stopping SignalR connection...');
    // Mantener el singleton activo para otros consumidores
    // Solo agregar logging pero no cerrar la conexión
  }

  async function joinGame(gameId: string) {
    console.log('🎮 Joining game:', gameId);
    lastGameId = gameId;
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('JoinGame', gameId);
      console.log('✅ Successfully joined game:', gameId);
    } else {
      console.log('⏳ Connection not ready, will join game when connected');
    }
  }

  return { connection: conn, start, stop, joinGame };
}

export function getGameHub(roomCode: string, username: string, handlers?: Handlers) {
  const hubUrl = new URL('/gameHub', HUB_BASE_URL.replace(/\/+$/, '')).toString();
  const key = `${roomCode}::${username}`;
  if (!instances.has(key)) {
    console.log('🆕 Creating new GameHub instance for:', key);
    instances.set(key, build(hubUrl, roomCode, username, handlers));
  } else {
    console.log('♻️ Reusing existing GameHub instance for:', key);
  }
  return instances.get(key)!;
}