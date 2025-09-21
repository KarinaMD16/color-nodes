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
  onForceRejoin?: (roomCode: string) => void;
};

const HUB_BASE_URL = 'http://26.233.244.31:7081'; // tu backend
const instances = new Map<string, ReturnType<typeof build>>();

function build(hubUrl: string, roomCode: string, username: string, initialHandlers: Handlers = {}) {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  const handlersMap = new Map<string, Set<Function>>();
  const add = (evt: string, h: Function) => { if (!handlersMap.has(evt)) handlersMap.set(evt, new Set()); handlersMap.get(evt)!.add(h); };
  const del = (evt: string, h: Function) => { handlersMap.get(evt)?.delete(h); };
  const fire = (evt: string, ...args: any[]) => handlersMap.get(evt)?.forEach(h => { try { h(...args); } catch (e) { console.error(`Error in ${evt} handler:`, e); } });

  // Server->Client
  conn.on('StateUpdated', s => requestAnimationFrame(() => fire('StateUpdated', s)));
  conn.on('TurnChanged', id => requestAnimationFrame(() => fire('TurnChanged', { currentPlayerId: id })));
  conn.on('HitFeedback', (m: string) => fire('HitFeedback', { message: m }));
  conn.on('Finished', s => fire('Finished', s));
  conn.on('PlayerJoined', u => fire('PlayerJoined', u));
  conn.on('PlayerLeft', u => fire('PlayerLeft', u));
  conn.on('ChatMessage', msg => fire('ChatMessage', msg));

  // Conexión
  let started = false;
  let startPromise: Promise<void> | null = null;
  let lastGameId: string | null = null;
  let lastRoomCode: string | null = roomCode;

  conn.onreconnecting(err => fire('Conn', 'reconnecting', err));
  conn.onreconnected(async id => {
    fire('Conn', 'connected', { connId: id, reconnected: true });
    try {
      if (lastRoomCode) await conn.invoke('SubscribeRoom', lastRoomCode);
      if (lastGameId) await conn.invoke('SubscribeGame', lastGameId);
    } catch (error) {
      console.error('Error re-subscribing after reconnect:', error);
    }
  });
  conn.on('ForceRejoin', (rc: string) => fire('ForceRejoin', rc));
  conn.onclose(err => fire('Conn', 'disconnected', err));

  async function start() {
    if (started) return;
    if (startPromise) return startPromise;

    startPromise = (async () => {
      fire('Conn', 'connecting', { hubUrl });
      try {
        await conn.start();
        started = true;
        fire('Conn', 'connected', { connId: conn.connectionId });

        // Primer alta con “JoinRoom” para avisos de PlayerJoined una sola vez
        await conn.invoke('JoinRoom', roomCode, username);

        if (lastGameId) {
          await conn.invoke('SubscribeGame', lastGameId);
        }
      } catch (error) {
        started = false;
        throw error;
      }
    })();

    try { await startPromise; } finally { startPromise = null; }
  }

  async function stop() {
    if (conn.state !== signalR.HubConnectionState.Disconnected) {
      await conn.stop();
      started = false;
    }
  }

  async function subscribeRoom(rc: string) {
    lastRoomCode = rc;
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('SubscribeRoom', rc);
    }
  }
  async function subscribeGame(gameId: string) {
    lastGameId = gameId;
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('SubscribeGame', gameId);
    }
  }
  async function unsubscribeGame(gameId: string) {
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('UnsubscribeGame', gameId);
    }
    if (lastGameId === gameId) lastGameId = null;
  }

  async function joinGame(gameId: string) { // alias compat
    await subscribeGame(gameId);
  }

  async function sendChatMessage(roomCode: string, username: string, message: string) {
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('SendChatMessage', roomCode, username, message);
    } else {
      throw new Error('SignalR connection is not ready');
    }
  }

  function registerHandlers(newHandlers: Handlers): () => void {
    const cleanup: Array<() => void> = [];
    Object.entries(newHandlers).forEach(([k, h]) => {
      if (!h) return;
      const evt = k.replace('on', ''); // onStateUpdated -> StateUpdated
      add(evt, h);
      cleanup.push(() => del(evt, h));
    });
    return () => cleanup.forEach(fn => fn());
  }

  if (Object.keys(initialHandlers).length > 0) registerHandlers(initialHandlers);

  return {
    connection: conn,
    start,
    stop,
    subscribeRoom,
    subscribeGame,
    unsubscribeGame,
    joinGame,
    sendChatMessage,
    registerHandlers,
  };
}

export function getGameHub(roomCode: string, username: string, handlers?: Handlers) {
  const hubUrl = new URL('/gameHub', HUB_BASE_URL.replace(/\/+$/, '')).toString();
  const key = `${roomCode}::${username}`;
  if (!instances.has(key)) {
    instances.set(key, build(hubUrl, roomCode, username, handlers));
  }
  return instances.get(key)!;
}

export function clearGameHubInstance(roomCode: string, username: string) {
  const key = `${roomCode}::${username}`;
  instances.delete(key);
}
