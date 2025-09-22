import { Handlers } from '@/types/hubTypes';
import * as signalR from '@microsoft/signalr';

//kary: 26.233.244.31
//elein: 26.48.186.190
//lando: 26.166.216.244

const HUB_BASE_URL = 'http://26.233.244.31:5197';
const instances = new Map<string, ReturnType<typeof build>>();

function build(hubUrl: string, roomCode: string, username: string, initialHandlers: Handlers = {}) {
  let started = false;
  let startPromise: Promise<void> | null = null;
  let lastGameId: string | null = null;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  const handlersMap = new Map<string, Set<Function>>();

  const addHandler = (event: string, handler: Function) => {
    if (!handlersMap.has(event)) handlersMap.set(event, new Set());
    handlersMap.get(event)!.add(handler);
  };
  const removeHandler = (event: string, handler: Function) => {
    handlersMap.get(event)?.delete(handler);
  };
  const callHandlers = (event: string, ...args: any[]) => {
    const hs = handlersMap.get(event);
    if (!hs || hs.size === 0) return;
    hs.forEach(h => {
      try { h(...args); } catch (e) { console.error(`Error in ${event} handler:`, e); }
    });
  };

  const raf = (cb: Function) => (typeof window !== 'undefined' ? requestAnimationFrame(() => cb()) : cb());
  connection.on('StateUpdated', s => raf(() => callHandlers('StateUpdated', s)));
  connection.on('TurnChanged', id => raf(() => callHandlers('TurnChanged', { currentPlayerId: id })));
  connection.on('HitFeedback', (m: string) => callHandlers('HitFeedback', { message: m }));
  connection.on('Finished', s => callHandlers('Finished', s));
  connection.on('PlayerJoined', u => callHandlers('PlayerJoined', u));
  connection.on('PlayerLeft', u => callHandlers('PlayerLeft', u));
  connection.on('ChatMessage', msg => callHandlers('ChatMessage', msg));

  connection.onreconnecting(err => callHandlers('Conn', 'reconnecting', err));
  connection.onreconnected(async id => {
    callHandlers('Conn', 'connected', { connId: id, reconnected: true });
    try {
      await connection.invoke('JoinRoom', roomCode, username);
      if (lastGameId) await connection.invoke('JoinGame', lastGameId);
    } catch (error) {
      console.error('Error re-joining after reconnect:', error);
    }
  });

  connection.onclose(err => {
    started = false; 
    callHandlers('Conn', 'disconnected', err);
  });

  async function start() {
    if (started) return;
    if (startPromise) return startPromise;
    startPromise = (async () => {
      callHandlers('Conn', 'connecting', { hubUrl });
      try {
        await connection.start();
        started = true;
        callHandlers('Conn', 'connected', { connId: connection.connectionId });
        await connection.invoke('JoinRoom', roomCode, username);
        if (lastGameId) await connection.invoke('JoinGame', lastGameId);
      } catch (error) {
        started = false;
        throw error;
      }
    })();
    try { await startPromise; } finally { startPromise = null; }
  }

  async function stop() {
    try { await connection.stop(); }
    finally {
      started = false;
      startPromise = null;
      lastGameId = null; 
      handlersMap.clear();
    }
  }

  async function joinGame(gameId: string) {
    lastGameId = gameId;
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('JoinGame', gameId);
    }
  }

  async function sendChatMessage(roomCode: string, username: string, message: string) {
    if (connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not ready');
    }
    await connection.invoke('SendChatMessage', roomCode, username, message);
  }

  function registerHandlers(newHandlers: Handlers): () => void {
    const cleanup: Array<() => void> = [];
    Object.entries(newHandlers).forEach(([eventName, handler]) => {
      if (!handler) return;
      const mappedEventName = eventName.replace(/^on/, '');
      addHandler(mappedEventName, handler);
      cleanup.push(() => removeHandler(mappedEventName, handler));
    });
    return () => cleanup.forEach(fn => fn());
  }

  if (Object.keys(initialHandlers).length > 0) registerHandlers(initialHandlers);

  return { connection, start, stop, joinGame, sendChatMessage, registerHandlers };
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