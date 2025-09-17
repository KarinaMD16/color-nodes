import * as signalR from '@microsoft/signalr';

type Handlers = {
  onStateUpdated?: (s: any) => void;
  onTurnChanged?: (p: { currentPlayerId: number }) => void;
  onHitFeedback?: (p: { message: string }) => void;
  onFinished?: (s: any) => void;
  onPlayerJoined?: (u: string) => void;
  onPlayerLeft?: (u: string) => void;
  onConn?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected', info?: any) => void;
  onChatMessage?: (msg: any) => void;
};

const HUB_BASE_URL = 'http://26.233.244.31:5197';
const instances = new Map<string, ReturnType<typeof build>>();

function build(hubUrl: string, roomCode: string, username: string, handlers: Handlers = {}) {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

      let currentHandlers = { ...handlers };
  

  conn.on('StateUpdated', s => requestAnimationFrame(() => currentHandlers.onStateUpdated?.(s)))
  conn.on('TurnChanged', id => requestAnimationFrame(() => currentHandlers.onTurnChanged?.({ currentPlayerId: id })))

  conn.on('HitFeedback', (m: string) => currentHandlers.onHitFeedback?.({ message: m }));
  conn.on('Finished', s => currentHandlers.onFinished?.(s));
  conn.on('PlayerJoined', u => currentHandlers.onPlayerJoined?.(u));
  conn.on('PlayerLeft', u => currentHandlers.onPlayerLeft?.(u));
  conn.on('ChatMessage', msg => currentHandlers.onChatMessage?.(msg));

  conn.onreconnecting(err => currentHandlers.onConn?.('reconnecting', err));
  conn.onreconnected(id => {
    currentHandlers.onConn?.('connected', { connId: id, reconnected: true });
    void conn.invoke('JoinRoom', roomCode, username);
  });
  conn.onclose(err => currentHandlers.onConn?.('disconnected', err));

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

    async function sendChatMessage(roomCode: string, username: string, message: string) {
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('SendChatMessage', roomCode, username, message);
    }
  }
    function updateHandlers(newHandlers: Handlers) {
    console.log('🔄 Updating handlers:', Object.keys(newHandlers));
    currentHandlers = { ...currentHandlers, ...newHandlers };
    console.log('🔄 Updated handlers, onChatMessage exists:', !!currentHandlers.onChatMessage);
  }

  return { connection: conn, start, stop, joinGame, sendChatMessage, updateHandlers };
}

export function getGameHub(roomCode: string, username: string, handlers?: Handlers) {
  const hubUrl = new URL('/gameHub', HUB_BASE_URL.replace(/\/+$/, '')).toString();
  const key = `${roomCode}::${username}`;
  if (!instances.has(key)) {
    instances.set(key, build(hubUrl, roomCode, username, handlers));
  } 
   if (handlers) {
      instances.get(key)!.updateHandlers(handlers);
   }
  
  return instances.get(key)!;
}